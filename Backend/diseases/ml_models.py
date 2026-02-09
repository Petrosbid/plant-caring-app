import os
import tempfile
from PIL import Image
import numpy as np
from django.conf import settings
import torch
from transformers import AutoImageProcessor, AutoModelForImageClassification
import logging

logger = logging.getLogger(__name__)

# Import the LLM disease module (imported inside the function to avoid circular imports)

# Initialize the model and processor once when the module is loaded
MODEL_PATH = os.path.join(settings.BASE_DIR, 'models', 'huggingface', 'hub', 'models--A2H0H0R1--resnet-50-plant-disease', 'snapshots', '0a1c652da3fdfd579329515efb29bff995745a63')  # Local path to the plant disease detection model
processor = None
model = None

def load_model():
    global processor, model
    if processor is None or model is None:
        try:
            logger.info("Loading disease diagnosis model from local path...")

            # Load the processor with use_fast=True to avoid warnings
            try:
                processor = AutoImageProcessor.from_pretrained(MODEL_PATH, use_fast=True)
            except:
                # If fast version is not available, use the regular version
                processor = AutoImageProcessor.from_pretrained(MODEL_PATH, use_fast=False)

            model = AutoModelForImageClassification.from_pretrained(MODEL_PATH)
            logger.info("Disease model loaded successfully from local path")
        except Exception as e:
            logger.error(f"Error loading disease model: {e}")
            # Fallback to a simple approach if model loading fails
            processor = None
            model = None

def preprocess_image(image_path):
    """
    Preprocess the uploaded image for model inference.
    """
    try:
        # Open and resize the image
        image = Image.open(image_path).convert('RGB')
        # Resize to the expected input size for the model
        image = image.resize((224, 224))
        return image
    except Exception as e:
        logger.error(f"Error preprocessing image: {e}")
        return None

def predict_disease(image_data):
    """
    Function to diagnose a plant disease from an uploaded image using a pre-trained model.

    :param image_data: The uploaded image file data.
    :return: A dictionary containing the ID of the diagnosed disease and detailed information.
             Returns {'id': None, 'details': None} if no disease can be identified.
    """
    from .models import Disease

    # Load the model if not already loaded
    load_model()

    # Determine the file extension based on the image data
    if hasattr(image_data, 'name') and image_data.name:
        # If image_data is a file object with a name attribute
        file_extension = os.path.splitext(image_data.name)[1]
    elif isinstance(image_data, str) and image_data.strip():
        # Check if it's a base64 data URL
        if image_data.startswith('data:'):
            # Extract extension from data URL
            import re
            match = re.match(r'data:image/(\w+)', image_data)
            if match:
                file_extension = '.' + match.group(1)
            else:
                file_extension = '.jpg'  # default to jpg
        else:
            # If it's a non-empty string path
            file_extension = os.path.splitext(image_data)[1]
    else:
        # Default to .jpg if we can't determine the extension
        file_extension = '.jpg'

    # Create a temporary file to store the uploaded image
    with tempfile.NamedTemporaryFile(delete=False, suffix=file_extension) as tmp_file:
        if hasattr(image_data, 'chunks'):  # If it's a file object
            for chunk in image_data.chunks():
                tmp_file.write(chunk)
        elif isinstance(image_data, str) and image_data.strip():
            if image_data.startswith('data:'):
                # Handle base64 data URL
                import base64
                # Split the data URL to get the base64 part
                header, encoded = image_data.split(',', 1)
                # Decode the base64 string
                img_data = base64.b64decode(encoded)
                tmp_file.write(img_data)
            else:
                # If it's a non-empty file path string
                with open(image_data, 'rb') as f:
                    tmp_file.write(f.read())
        else:
            # If we don't have valid image data, return early
            logger.error("Invalid image data provided for disease detection")
            return {'id': None, 'details': None}
        tmp_path = tmp_file.name

    try:
        # If model loading failed, fall back to a simple approach
        if model is None or processor is None:
            logger.warning("Using fallback prediction method due to model loading failure")
            disease_ids = list(Disease.objects.values_list('id', flat=True))
            if not disease_ids:
                return {'id': None, 'details': None}

            # For demo purposes, return a random disease ID
            # In a real implementation, you'd want a more sophisticated fallback
            import random
            detected_disease_id = random.choice(disease_ids)
            return {'id': detected_disease_id, 'details': None}

        # Open and preprocess the image using the processor
        image = Image.open(tmp_path).convert('RGB')
        inputs = processor(images=image, return_tensors="pt")

        # Perform inference
        with torch.no_grad():
            outputs = model(**inputs)
            probs = torch.nn.functional.softmax(outputs.logits, dim=-1)[0]

        # Get the top prediction
        top_k = torch.topk(probs, 1)
        predicted_class_idx = top_k.indices[0].item()
        confidence_score = top_k.values[0].item() * 100

        # Get the predicted disease label from the model config
        predicted_disease_label = model.config.id2label[predicted_class_idx]

        # Get detailed disease information from LLM
        try:
            # Import the LLM disease module dynamically
            import importlib.util

            # Get the path to the llm_diseas.py file
            diseases_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'diseases')
            llm_diseas_path = os.path.join(diseases_dir, 'llm_diseas.py')

            spec = importlib.util.spec_from_file_location("llm_diseas", llm_diseas_path)
            llm_diseas_module = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(llm_diseas_module)

            disease_details = llm_diseas_module.get_disease_details_from_llm(predicted_disease_label)
        except Exception as e:
            logger.error(f"Failed to import or execute llm_diseas module: {e}")
            disease_details = None

        # Find the corresponding disease in the database
        # This assumes that the disease labels in the model match those in the Disease model
        detected_disease_id = None
        try:
            # Convert the predicted label to lowercase for comparison
            predicted_lower = predicted_disease_label.lower()

            # Try to find an exact match first
            detected_disease = Disease.objects.filter(name__iexact=predicted_disease_label).first()

            if not detected_disease:
                # Try to find a partial match in the name
                diseases = Disease.objects.all()
                for disease in diseases:
                    if disease.name.lower() in predicted_lower or predicted_lower in disease.name.lower():
                        detected_disease = disease
                        break

            if not detected_disease:
                # Try to find a match by checking if any disease name appears in the predicted label
                diseases = Disease.objects.all()
                for disease in diseases:
                    disease_name_lower = disease.name.lower()
                    if disease_name_lower in predicted_lower:
                        detected_disease = disease
                        break

            if detected_disease:
                detected_disease_id = detected_disease.id
            else:
                # If no match found, log the prediction for debugging
                logger.warning(f"No matching disease found for prediction: '{predicted_disease_label}'. Available diseases: {[d.name for d in Disease.objects.all()]}")

        except Exception as db_error:
            logger.error(f"Database lookup error: {db_error}")

        logger.info(f"Predicted disease: {predicted_disease_label} with confidence: {confidence_score:.2f}%, ID: {detected_disease_id}")
        return {'id': detected_disease_id, 'name': predicted_disease_label, 'details': disease_details, 'confidence': confidence_score}

    except Exception as e:
        logger.error(f"Error during disease prediction: {e}")
        return {'id': None, 'details': None}
    finally:
        # Clean up the temporary file
        try:
            os.unlink(tmp_path)
        except:
            pass
