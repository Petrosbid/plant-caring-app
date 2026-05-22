import os
import re
import json
import tempfile
import logging
import random
from PIL import Image
from django.conf import settings
from django.db.models import Q
import torch
from transformers import AutoProcessor, AutoModelForCausalLM

logger = logging.getLogger(__name__)

# Global variables for model and processor
model = None
processor = None

# Professional prompt for plant identification
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
def load_model():
    """Load Gemma 4 multimodal model and processor."""
    global model, processor
    if model is not None and processor is not None:
        return

    try:
        logger.info("Loading Gemma 4 model for plant identification...")
        model_name = "google/gemma-4-E4B-it"

        # Set cache directory
        cache_dir = os.path.join(settings.BASE_DIR, 'models', 'huggingface', 'hub')

        processor = AutoProcessor.from_pretrained(
            model_name,
            cache_dir=cache_dir,
            trust_remote_code=True
        )
        model = AutoModelForCausalLM.from_pretrained(
            model_name,
            cache_dir=cache_dir,
            torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32,
            device_map="auto" if torch.cuda.is_available() else None,
            trust_remote_code=True
        )
        logger.info("Gemma 4 model loaded successfully")
    except Exception as e:
        logger.error(f"Error loading Gemma 4 model: {e}", exc_info=True)
        model = None
        processor = None


def predict_plant(image_data):
    from .models import Plant

    load_model()
    model_loaded = (model is not None and processor is not None)

    if hasattr(image_data, 'name') and image_data.name:
        ext = os.path.splitext(image_data.name)[1]
    elif isinstance(image_data, str) and image_data.strip():
        if image_data.startswith('data:'):
            import base64
            match = re.match(r'data:image/(\w+)', image_data)
            ext = '.' + match.group(1) if match else '.jpg'
        else:
            ext = os.path.splitext(image_data)[1]
    else:
        ext = '.jpg'

    tmp_path = None
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp_file:
            tmp_path = tmp_file.name
            if hasattr(image_data, 'chunks'):
                for chunk in image_data.chunks():
                    tmp_file.write(chunk)
            elif isinstance(image_data, str) and image_data.strip():
                if image_data.startswith('data:'):
                    import base64
                    header, encoded = image_data.split(',', 1)
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

    # --- Step 2: If model not loaded, fallback to random plant or return None ---
    if not model_loaded:
        logger.warning("Model not loaded, using fallback (random plant)")
        plant_ids = list(Plant.objects.values_list('id', flat=True))
        if plant_ids:
            return {'id': random.choice(plant_ids), 'name': None, 'error': 'Model unavailable, random fallback'}
        else:
            return {'id': None, 'name': None, 'error': 'Model not loaded and no plants in DB'}

    # --- Step 3: Run inference with Gemma 4 ---
    try:
        image = Image.open(tmp_path).convert('RGB')

        messages = [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": [
                {"type": "text", "text": "Analyze this image and return JSON as instructed."},
                {"type": "image", "image": image}
            ]}
        ]

        prompt = processor.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)

        inputs = processor(
            text=prompt,
            images=image,
            return_tensors="pt",
            padding=True
        )

        device = next(model.parameters()).device
        inputs = {k: v.to(device) for k, v in inputs.items()}

        with torch.no_grad():
            outputs = model.generate(
                **inputs,
                max_new_tokens=200,
                temperature=0.2,
                do_sample=False,
                pad_token_id=processor.tokenizer.eos_token_id
            )

        response = processor.decode(outputs[0], skip_special_tokens=True)

        json_match = re.search(r'\{.*\}', response, re.DOTALL)
        if not json_match:
            logger.warning(f"No JSON found in model response: {response}")
            return {'id': None, 'name': None, 'error': 'Model response format invalid'}

        result = json.loads(json_match.group())

        # --- Step 4: Map result to Plant database ---
        if result.get('is_plant') == True:
            scientific_name = result.get('scientific_name', '')
            common_name = result.get('common_name', '')

            # Try to find matching plant in DB
            detected_plant = Plant.objects.filter(
                Q(scientific_name__icontains=scientific_name) |
                Q(farsi_name__icontains=common_name) |
                Q(common_name__icontains=common_name)
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
        if tmp_path and os.path.exists(tmp_path):
            try:
                os.unlink(tmp_path)
            except:
                pass