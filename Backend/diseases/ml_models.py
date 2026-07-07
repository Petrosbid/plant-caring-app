import os
import re
import json
import tempfile
import logging
import base64
import time
from django.conf import settings
from django.db.models import Q

logger = logging.getLogger(__name__)

# =====================================================================
# CONFIGURATION & SWITCH
# =====================================================================
USE_GEMINI = True

VISION_MODEL = "gemini-3.5-flash" if USE_GEMINI else "gemma-4-31b-it"

# =====================================================================
# IMPORTS & CLIENT INITIALIZATION
# =====================================================================
if USE_GEMINI:
    from google import genai
    from google.genai import types
    from google.genai.errors import APIError

    GEMINI_API_KEY = getattr(settings, 'GEMINI_API_KEY', None)
    client = genai.Client(api_key=GEMINI_API_KEY)
else:
    from openai import OpenAI, APIConnectionError, APITimeoutError

    AVALAI_API_KEY = getattr(settings, 'AVALAI_API_KEY', None)

SYSTEM_PROMPT = """You are an expert plant pathologist. Your task is to analyze the provided image, identify if the plant has a disease, and name the specific disease.

Follow these rules strictly:
1. Identify the specific plant disease visible in the image.
2. Provide the exact English standard name of the disease (e.g., "Powdery Mildew", "Late Blight", "Black Rot").
3. Provide a confidence percentage (0-100) based on how clear the symptoms are.
4. Output **only** valid JSON. Do not include markdown code fences (like ```json), no extra text, and no commentary.

Output format:
{
  "disease_name": "Standard English Disease Name",
  "confidence": 92
}

If no disease is detected or the image doesn't contain a plant leaf/part, return:
{
  "disease_name": "Healthy",
  "confidence": 100
}
"""


def encode_image_to_base64(image_path):
    try:
        with open(image_path, "rb") as image_file:
            return base64.b64encode(image_file.read()).decode('utf-8')
    except Exception as e:
        logger.error(f"Error encoding image to base64: {e}")
        return None


def predict_disease(image_data):
    from .models import Disease

    if USE_GEMINI:
        if not GEMINI_API_KEY:
            logger.error("Gemini API key is missing.")
            return {'id': None, 'details': None, 'error': 'API key configuration error'}
    else:
        if not AVALAI_API_KEY:
            logger.error("AvalAI API key is missing in settings.")
            return {'id': None, 'details': None, 'error': 'API key configuration error'}

    if hasattr(image_data, 'name') and image_data.name:
        file_extension = os.path.splitext(image_data.name)[1]
    elif isinstance(image_data, str) and image_data.strip():
        if image_data.startswith('data:'):
            match = re.match(r'data:image/(\w+)', image_data)
            file_extension = '.' + match.group(1) if match else '.jpg'
        else:
            file_extension = os.path.splitext(image_data)[1]
    else:
        file_extension = '.jpg'

    tmp_path = None
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=file_extension) as tmp_file:
            tmp_path = tmp_file.name
            if hasattr(image_data, 'chunks'):
                for chunk in image_data.chunks():
                    tmp_file.write(chunk)
            elif isinstance(image_data, str) and image_data.strip():
                if image_data.startswith('data:'):
                    header, encoded = image_data.split(',', 1)
                    img_data = base64.b64decode(encoded)
                    tmp_file.write(img_data)
                else:
                    with open(image_data, 'rb') as f:
                        tmp_file.write(f.read())
            else:
                logger.error("Invalid image data provided for disease detection")
                return {'id': None, 'details': None}
    except Exception as e:
        logger.error(f"Failed to create or write temporary image file: {e}")
        return {'id': None, 'details': None}

    try:
        mime_type = f"image/{file_extension.replace('.', '')}"
        if mime_type in ["image/jpg", "image/jpeg"]:
            mime_type = "image/jpeg"

        content = ""

        # ---- 1. GEMINI VISION FLOW ----
        if USE_GEMINI:
            try:
                with open(tmp_path, "rb") as f:
                    image_bytes = f.read()

                response = client.models.generate_content(
                    model=VISION_MODEL,
                    contents=[
                        types.Part.from_bytes(data=image_bytes, mime_type=mime_type),
                        f"{SYSTEM_PROMPT}\n\nAnalyze this plant image and return the output format strictly."
                    ],
                    config=types.GenerateContentConfig(
                        response_mime_type="application/json",
                        temperature=0.2,
                    )
                )
                content = response.text.strip()
            except APIError as api_err:
                logger.error(f"Google GenAI Disease Vision API Error: {repr(api_err)}")
                return {'id': None, 'details': None, 'error': 'API connection error'}

        # ---- 2. OPENAI / AVALAI VISION FLOW ----
        else:
            base64_image = encode_image_to_base64(tmp_path)
            if not base64_image:
                return {'id': None, 'details': None, 'error': 'Failed to process image bytes'}

            openai_client = OpenAI(
                base_url="[https://api.avalai.ir/v1](https://api.avalai.ir/v1)",
                api_key=AVALAI_API_KEY
            )

            logger.info("Sending image to AvalAI Vision API for disease detection...")
            openai_response = openai_client.chat.completions.create(
                model=VISION_MODEL,
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": f"{SYSTEM_PROMPT}\n\nAnalyze this plant image and return the output format strictly."
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
                timeout=50
            )
            content = openai_response.choices[0].message.content.strip()

        # ---- PARSING LOGIC ----
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        elif "```" in content:
            content = content.split("```")[1].split("```")[0].strip()

        json_match = re.search(r'\{.*\}', content, re.DOTALL)
        if not json_match:
            logger.warning(f"No JSON found in response: {content}")
            return {'id': None, 'details': None}

        result = json.loads(json_match.group())
        predicted_disease_label = result.get("disease_name", "Healthy")
        confidence_score = result.get("confidence", 0)

        if predicted_disease_label.lower() == "healthy":
            logger.info("Plant is diagnosed as healthy.")
            return {'id': None, 'name': 'Healthy', 'details': None, 'confidence': confidence_score}

        disease_details = None
        try:
            import importlib.util
            diseases_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'diseases')
            llm_diseas_path = os.path.join(diseases_dir, 'llm_diseas.py')

            spec = importlib.util.spec_from_file_location("llm_diseas", llm_diseas_path)
            llm_diseas_module = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(llm_diseas_module)

            disease_details = llm_diseas_module.get_disease_details_from_llm(predicted_disease_label)
        except Exception as e:
            logger.error(f"Failed to import or execute llm_diseas module: {e}")

        detected_disease_id = None
        try:
            predicted_lower = predicted_disease_label.lower()
            detected_disease = Disease.objects.filter(
                Q(name__iexact=predicted_disease_label) |
                Q(name_fa__icontains=predicted_disease_label)
            ).first()

            if not detected_disease:
                diseases = Disease.objects.all()
                for d in diseases:
                    if d.name.lower() in predicted_lower or predicted_lower in d.name.lower():
                        detected_disease = d
                        break

            if detected_disease:
                detected_disease_id = detected_disease.id
            else:
                logger.warning(f"No matching disease found in DB for: '{predicted_disease_label}'")

        except Exception as db_error:
            logger.error(f"Database lookup error: {db_error}")

        logger.info(
            f"Vision Prediction: {predicted_disease_label} ({confidence_score:.2f}%), ID: {detected_disease_id}")

        return {
            'id': detected_disease_id,
            'name': predicted_disease_label,
            'details': disease_details,
            'confidence': confidence_score
        }

    except Exception as e:
        logger.error(f"Error during disease vision prediction flow: {e}")
        return {'id': None, 'details': None, 'error': str(e)}

    finally:
        if tmp_path and os.path.exists(tmp_path):
            try:
                os.unlink(tmp_path)
            except Exception:
                pass