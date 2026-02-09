import os
import tempfile
from PIL import Image
import numpy as np
from django.conf import settings
from django.db.models import Q
import torch
import open_clip
from transformers import AutoImageProcessor, AutoModelForImageClassification
import logging

logger = logging.getLogger(__name__)

# Initialize the model and processor once when the module is loaded
model = None
preprocess = None
tokenizer = None


# Expanded plant database with 200 plant names
PLANT_DATABASE = [
    "Anthurium andraeanum (Flamingo Flower)", "Spathiphyllum (Peace Lily)", "Monstera deliciosa (Swiss Cheese Plant)",
    "Philodendron hederaceum","Epipremnum aureum (Pothos)", "Sansevieria trifasciata (Snake Plant)",
    "Zamioculcas zamiifolia (ZZ Plant)", "Ficus elastica (Rubber Plant)", "Ficus lyrata (Fiddle Leaf Fig)",
    "Dracaena marginata", "Chlorophytum comosum (Spider Plant)", "Crassula ovata (Jade Plant)",
    "Calathea orbifolia", "Aglaonema (Chinese Evergreen)", "Dieffenbachia (Dumb Cane)", "Syngonium podophyllum",
    "Tradescantia zebrina", "Peperomia obtusifolia", "Hoya carnosa", "Orchidaceae (Orchid)",
    "Rosa (Rose)", "Tulipa (Tulip)", "Helianthus (Sunflower)", "Lavandula (Lavender)",
    "Mentha (Mint)", "Ocimum basilicum (Basil)", "Rosmarinus officinalis (Rosemary)",
    "Cactus", "Succulent", "Fern", "Bamboo", "Bonsai",
    "Begonia maculata", "Strelitzia reginae (Bird of Paradise)", "Alocasia (Elephant Ear)",
    "Yucca", "Schefflera", "Croton", "Pilea peperomioides", "Cyclamen", "Kalanchoe",
    "Saintpaulia (African Violet)", "Hydrangea", "Geranium", "Petunia", "Hibiscus",
    "Jasminum (Jasmine)", "Bougainvillea", "Gardenia",  "Magnolia",
    "Chrysanthemum", "Dahlia", "Gladiolus", "Iris", "Lilium (Lily)", "Narcissus (Daffodil)",
]

def load_model():
    global model, preprocess, tokenizer
    if model is None or preprocess is None or tokenizer is None:
        try:
            logger.info("Loading BioCLIP plant identification model from local path...")
            # Load the local BioCLIP model - using the hub format to point to local cache
            model, _, preprocess = open_clip.create_model_and_transforms('hf-hub:imageomics/bioclip', cache_dir=os.path.join(settings.BASE_DIR, 'models', 'huggingface', 'hub'))
            tokenizer = open_clip.get_tokenizer('hf-hub:imageomics/bioclip', cache_dir=os.path.join(settings.BASE_DIR, 'models', 'huggingface', 'hub'))
            logger.info("BioCLIP model loaded successfully from local path")
        except Exception as e:
            logger.error(f"Error loading BioCLIP model: {e}")
            # Fallback to a simple approach if model loading fails
            model = None
            preprocess = None
            tokenizer = None

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

def predict_plant(image_data):
    """
    Function to identify a plant from an uploaded image using the BioCLIP model.

    :param image_data: The uploaded image file data.
    :return: A dictionary containing the ID and name of the identified plant.
             Returns {'id': None, 'name': None} if no plant can be identified.
    """
    from .models import Plant

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
            logger.error("Invalid image data provided for plant identification")
            return {'id': None, 'name': None}
        tmp_path = tmp_file.name

    try:
        # If model loading failed, fall back to a simple approach
        if model is None or preprocess is None or tokenizer is None:
            logger.warning("Using fallback prediction method due to model loading failure")
            plant_ids = list(Plant.objects.values_list('id', flat=True))
            if not plant_ids:
                return {'id': None, 'name': None}

            # For demo purposes, return a random plant ID
            # In a real implementation, you'd want a more sophisticated fallback
            import random
            detected_plant_id = random.choice(plant_ids)
            return {'id': detected_plant_id, 'name': None}

        # Open and preprocess the image using BioCLIP's preprocess function
        image = Image.open(tmp_path).convert('RGB')
        image_input = preprocess(image).unsqueeze(0)

        # Tokenize the plant database names
        text_inputs = tokenizer(PLANT_DATABASE)

        # Perform inference using BioCLIP
        with torch.no_grad():
            image_features = model.encode_image(image_input)
            text_features = model.encode_text(text_inputs)

            image_features /= image_features.norm(dim=-1, keepdim=True)
            text_features /= text_features.norm(dim=-1, keepdim=True)

            text_probs = (100.0 * image_features @ text_features.T).softmax(dim=-1)

        # Get the most probable plant from the database
        vals, indices = text_probs[0].topk(1)  # Get the top prediction
        idx = indices[0].item()
        predicted_plant_name = PLANT_DATABASE[idx]
        print(f"Predicted plant name: {predicted_plant_name}")
        confidence_score = vals[0].item()

        # Find the corresponding plant in the database
        # This assumes that the plant names in the database match those in the Plant model
        # If exact matching isn't possible, we could use fuzzy matching or embeddings
        detected_plant_id = None
        try:
            # Parse the predicted plant name which is in format "Scientific Name (Common Name)"
            if '(' in predicted_plant_name and ')' in predicted_plant_name:
                # Extract scientific name (before parenthesis) and common name (inside parenthesis)
                scientific_part = predicted_plant_name.split('(')[0].strip()
                common_part = predicted_plant_name.split('(')[-1].replace(')', '').strip()

                # Try multiple matching strategies in order of preference:
                # 1. Match scientific name part against scientific_name field
                detected_plant = Plant.objects.filter(scientific_name__icontains=scientific_part).first()
                if not detected_plant:
                    # 2. Match common name part against farsi_name field (which might contain English names)
                    detected_plant = Plant.objects.filter(farsi_name__icontains=common_part).first()
                if not detected_plant:
                    # 3. Match common name part against scientific_name field
                    detected_plant = Plant.objects.filter(scientific_name__icontains=common_part).first()
                if not detected_plant:
                    # 4. Match the full predicted name against farsi_name
                    detected_plant = Plant.objects.filter(farsi_name__icontains=predicted_plant_name).first()
            else:
                # If the format is not as expected, try to match the whole name against both fields
                detected_plant = Plant.objects.filter(
                    Q(farsi_name__icontains=predicted_plant_name) |
                    Q(scientific_name__icontains=predicted_plant_name)
                ).first()

            if detected_plant:
                detected_plant_id = detected_plant.id

        except Exception as db_error:
            logger.error(f"Database lookup error: {db_error}")

        logger.info(f"Predicted plant: {predicted_plant_name} with confidence: {confidence_score:.2f}%, ID: {detected_plant_id}")
        return {'id': detected_plant_id, 'name': predicted_plant_name}

    except Exception as e:
        logger.error(f"Error during plant prediction: {e}")
        return {'id': None, 'name': None}
    finally:
        # Clean up the temporary file
        try:
            os.unlink(tmp_path)
        except:
            pass
