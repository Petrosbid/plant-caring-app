import os
import re
import json
import tempfile
import logging
import base64
import time
import requests
from django.conf import settings
from django.db.models import Q
from requests.exceptions import SSLError, ConnectionError, Timeout

logger = logging.getLogger(__name__)

session = requests.Session()
session.verify = True

OPENROUTER_API_KEY = getattr(settings, 'OPENROUTER_API_KEY', None)
VISION_MODEL = "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free"

SYSTEM_PROMPT = """You are an expert botanist and plant identification specialist. Your task is to analyze the provided image and determine whether it contains a plant.

Follow these rules strictly:

1. If the image contains one or more plants, identify the most prominent one.
2. Provide:
   - Common English name
   - Scientific name (genus and species)
   - Confidence percentage (0-100)
3. Output **only** valid JSON. Do not include any extra text, explanations, or markdown.

Output format when plant is detected:
{
  "is_plant": true,
  "common_name": "English common name",
  "scientific_name": "Scientific name",
  "confidence": 95
}

4. If the image does not contain any plant (e.g., animal, person, landscape without visible plant, object, text, food without plant parts), output:
{
  "is_plant": false,
  "error": "No plant detected in the image. Please upload a clear photo of a leaf, flower, stem, or the whole plant."
}

Guidelines:
- If multiple plants exist, focus on the central or largest one.
- If unsure, reduce confidence accordingly.
- Do not guess if the image is blurry or ambiguous; return is_plant=false in that case."""


def encode_image_to_base64(image_path):
    """تبدیل تصویر به فرمت Base64 برای ارسال به API"""
    try:
        with open(image_path, "rb") as image_file:
            return base64.b64encode(image_file.read()).decode('utf-8')
    except Exception as e:
        logger.error(f"Error encoding image to base64: {e}")
        return None


def predict_plant(image_data):
    from .models import Plant

    # بررسی وجود روت کلید API
    if not OPENROUTER_API_KEY:
        logger.error("OpenRouter API key is missing in settings.")
        return {'id': None, 'name': None, 'error': 'API key configuration error'}

    # تشخیص پسوند فایل
    if hasattr(image_data, 'name') and image_data.name:
        ext = os.path.splitext(image_data.name)[1]
    elif isinstance(image_data, str) and image_data.strip():
        if image_data.startswith('data:'):
            match = re.match(r'data:image/(\w+)', image_data)
            ext = '.' + match.group(1) if match else '.jpg'
        else:
            ext = os.path.splitext(image_data)[1]
    else:
        ext = '.jpg'

    tmp_path = None
    try:
        # ذخیره موقت فایل جهت استانداردسازی و انکود
        with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp_file:
            tmp_path = tmp_file.name
            if hasattr(image_data, 'chunks'):
                for chunk in image_data.chunks():
                    tmp_file.write(chunk)
            elif isinstance(image_data, str) and image_data.strip():
                if image_data.startswith('data:'):
                    _, encoded = image_data.split(',', 1)
                    img_data = base64.b64decode(encoded)
                    tmp_file.write(img_data)
                else:
                    with open(image_data, 'rb') as f:
                        tmp_file.write(f.read())
            else:
                logger.error("Invalid image data type")
                return {'id': None, 'name': None, 'error': 'Invalid image data'}
    except Exception as e:
        logger.error(f"Failed to save image temporarily: {e}")
        return {'id': None, 'name': None, 'error': 'Image processing failed'}

    try:
        # تبدیل عکس به Base64
        base64_image = encode_image_to_base64(tmp_path)
        if not base64_image:
            return {'id': None, 'name': None, 'error': 'Failed to process image bytes'}

        # تعیین Content-Type تصویر بر اساس پسوند
        mime_type = f"image/{ext.replace('.', '')}"
        if mime_type == "image/jpg":
            mime_type = "image/jpeg"

        # آماده‌سازی بدنه درخواست مالتی‌مدیال بر اساس مستندات OpenRouter
        headers = {
            "Authorization": f"Bearer {OPENROUTER_API_KEY}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://your-plant-app.com",
            "X-Title": "Plant Care App",
        }

        payload = {
            "model": VISION_MODEL,
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": f"{SYSTEM_PROMPT}\n\nAnalyze this image and return JSON as instructed."
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:{mime_type};base64,{base64_image}"
                            }
                        }
                    ]
                }
            ],
            "temperature": 0.2
        }

        # --- راهکار سوم: پیاده‌سازی حلقه Retry برای مقابله با قطعی‌های ناگهانی SSL/Network ---
        max_retries = 3
        retry_delay = 2  # زمان انتظار بین هر تلاش (ثانیه)
        response = None

        for attempt in range(max_retries):
            try:
                logger.info(f"Sending request to OpenRouter (Attempt {attempt + 1}/{max_retries})...")
                response = requests.post(
                    url="https://openrouter.ai/api/v1/chat/completions",
                    headers=headers,
                    json=payload,
                    timeout=40
                )
                # اگر درخواست موفق بود یا ارور سروری غیر از شبکه داد، از حلقه خارج می‌شویم
                break
            except (SSLError, ConnectionError, Timeout) as net_err:
                logger.warning(f"Network issue encountered on attempt {attempt + 1}: {net_err}")
                if attempt < max_retries - 1:
                    logger.info(f"Waiting {retry_delay} seconds before retrying...")
                    time.sleep(retry_delay)
                else:
                    # اگر در آخرین تلاش هم خطا داد، خطا را پرتاب کن تا در بلاکِ نهاییِ Exception هندل شود
                    raise net_err

        if not response:
            return {'id': None, 'name': None, 'error': 'Failed to establish connection to API'}

        if response.status_code != 200:
            logger.error(f"OpenRouter API Error: {response.status_code} - {response.text}")
            return {'id': None, 'name': None, 'error': f'API Error {response.status_code}'}

        content = response.json()["choices"][0]["message"]["content"].strip()

        # پاک‌سازی تگ‌های مارک‌داون احتمالی در پاسخ متنی
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        elif "```" in content:
            content = content.split("```")[1].split("```")[0].strip()

        # استخراج ساختار شیء جی‌سان با رگرسیون مطمئن‌تر
        json_match = re.search(r'\{.*\}', content, re.DOTALL)
        if not json_match:
            logger.warning(f"No JSON found in model response: {content}")
            return {'id': None, 'name': None, 'error': 'Model response format invalid'}

        result = json.loads(json_match.group())

        # --- نگاشت نتیجه با دیتابیس گیاهان ---
        if result.get('is_plant') is True:
            scientific_name = result.get('scientific_name', '')
            common_name = result.get('common_name', '')

            # جستجوی فازی در دیتابیس برای پیدا کردن گیاه
            detected_plant = Plant.objects.filter(
                Q(scientific_name__icontains=scientific_name) |
                Q(farsi_name__icontains=common_name) |
                Q(english_name__icontains=common_name)
            ).first()

            if detected_plant:
                plant_id = detected_plant.id
                plant_name = detected_plant.scientific_name
                logger.info(f"Plant identified: {scientific_name} -> DB id {plant_id}")
            else:
                plant_id = None
                plant_name = scientific_name or common_name
                logger.info(f"Plant identified but not in DB: {plant_name}")

            return {
                'id': plant_id,
                'name': plant_name,
                'common_name': common_name,
                'scientific_name': scientific_name,
                'confidence': result.get('confidence'),
                'error': None
            }
        else:
            error_msg = result.get('error', 'No plant detected')
            logger.info(f"Model returned no plant: {error_msg}")
            return {'id': None, 'name': None, 'error': error_msg}

    except json.JSONDecodeError as e:
        logger.error(f"JSON decode error from model response: {e}")
        return {'id': None, 'name': None, 'error': 'Invalid JSON from model'}
    except Exception as e:
        logger.error(f"Prediction error: {e}", exc_info=True)
        return {'id': None, 'name': None, 'error': f'Prediction failed: {str(e)}'}
    finally:
        # پاک‌سازی فایل موقت
        if tmp_path and os.path.exists(tmp_path):
            try:
                os.unlink(tmp_path)
            except Exception:
                pass