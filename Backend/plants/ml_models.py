import os
import re
import json
import tempfile
import logging
import base64
import time
from django.conf import settings
from django.db.models import Q
from openai import OpenAI, APIConnectionError, APITimeoutError

logger = logging.getLogger(__name__)

# دریافت کلید از تنظیمات جنگو
AVALAI_API_KEY = getattr(settings, 'AVALAI_API_KEY', None)
YOUR_GAPGPT_API_KEY=  getattr(settings, 'YOUR_GAPGPT_API_KEY', None)
# استفاده از یک مدل بینایی استاندارد و قدرتمند سازگار با مستندات AvalAI
VISION_MODEL = "gemma-3-27b-it"

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
    if not AVALAI_API_KEY:
        logger.error("AvalAI API key is missing in settings.")
        return {'id': None, 'name': None, 'error': 'API key configuration error'}

    # تشخیص پسوند فایل و استانداردسازی به حروف کوچک برای جلوگیری از مشکلات mime-type
    if hasattr(image_data, 'name') and image_data.name:
        ext = os.path.splitext(image_data.name)[1].lower()
    elif isinstance(image_data, str) and image_data.strip():
        if image_data.startswith('data:'):
            match = re.match(r'data:image/(\w+)', image_data)
            ext = '.' + match.group(1).lower() if match else '.jpg'
        else:
            ext = os.path.splitext(image_data)[1].lower()
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

        # تعیین Content-Type تصویر بر اساس پسوند اصلاح شده
        mime_type = f"image/{ext.replace('.', '')}"
        if mime_type in ["image/jpg", "image/jpeg"]:
            mime_type = "image/jpeg"
        elif mime_type not in ["image/png", "image/webp", "image/gif"]:
            # فرمت پیش‌فرض در صورت نامعتبر بودن فرمت‌های ورودی
            mime_type = "image/jpeg"

        # مقداردهی کلاینت AvalAI با ساختار OpenAI SDK
        client = OpenAI(
            base_url="https://api.gapgpt.app/v1",
            api_key=YOUR_GAPGPT_API_KEY,
            timeout=100.0,
        )

        # پیاده‌سازی حلقه Retry برای مقابله با خطاهای شبکه با خطایابی پکیج رسمی
        max_retries = 3
        retry_delay = 2
        response = None
        print(f"data:{mime_type};base64,{base64_image}")
        for attempt in range(max_retries):
            try:
                logger.info(f"Sending request to AvalAI (Attempt {attempt + 1}/{max_retries})...")

                # ارسال درخواست مالتی‌مدیال ویژن به مدل معتبر با فرمت استاندارد Base64
                response = client.chat.completions.create(
                    model=VISION_MODEL,
                    messages=[
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
                    temperature=0.2,
                    timeout=100
                )

                break
            except (APIConnectionError, APITimeoutError) as net_err:
                logger.warning(f"Network issue encountered on attempt {attempt + 1}: {net_err}")
                if attempt < max_retries - 1:
                    logger.info(f"Waiting {retry_delay} seconds before retrying...")
                    time.sleep(retry_delay)
                else:
                    raise net_err

        if not response:
            return {'id': None, 'name': None, 'error': 'Failed to establish connection to API'}

        # دریافت متن مستقیم از ساختار پاسخ کلاینت رسمی
        content = response.choices[0].message.content.strip()

        # پاک‌سازی تگ‌های مارک‌داون احتمالی در پاسخ متنی
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
                Q(english_name__icontains=common_name) |
                Q(other_names__icontains=common_name) |
                Q(other_names_en__icontains=common_name)
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