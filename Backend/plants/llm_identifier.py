import requests
import json
from django.conf import settings
from .models import Plant

# 1. تنظیمات اولیه
OPENROUTER_API_KEY = getattr(settings, 'OPENROUTER_API_KEY', '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')

def get_plant_info_from_llm(plant_name):
    """
    Get detailed plant information from LLM based on the plant name.

    Args:
        plant_name (str): The name of the plant to get information for

    Returns:
        dict: Dictionary containing plant information or None if failed
    """
    # 2. پرامپت (بدون تغییر، همان پرامپت دقیق قبلی)
    system_prompt = """
You are an expert botanist. I will give you a plant name.
You must provide care instructions for this plant in Persian (Farsi).

Return ONLY a raw JSON object (no markdown formatting like ```json).
The JSON must strictly follow this structure:
{
    "farsi_name": "نام رایج فارسی",
    "scientific_name": "Scientific Name",
    "watering_frequency": "مدت زمان مورد نیاز آبیاری (فقط هر چند روز)",
    "fertilizer_schedule": "زمان کوددهی(فقط هر چه مدت)",
    "care_difficulty": "میزان سختی نگهداری (آسان/متوسط/سخت)",
    "is_toxic": "سمی و خطرناک بودن گیاه برای انسان (True/False)",
    "light_requirements" : "نور مورد نیاز",
    "humidity_level": "رطوبت مورد نیاز",
    "temperature_range": "دمای اید آل(فقط بازه ایده آل)",
    "soil_type": "خاک ایده آل",
    "propagation_methods": "روش های تکثیر کردن",
    "description": "توصیف کلی و توضیح کلی گیاه و توضیحات کلی مورد نیاز دیگر "
}
"""

    try:
        # 3. ارسال درخواست (دقیقاً با فرمت درخواستی شما)
        response = requests.post(
            url="https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                "Content-Type": "application/json",
                "HTTP-Referer": "https://your-plant-app.com",
                "X-Title": "Plant Care App",
            },
            json={
                "model": "tngtech/deepseek-r1t2-chimera:free",  # مدل پیشنهادی (سریع و ارزان)
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"Plant name: {plant_name}"}
                ],
                "response_format": {"type": "json_object"}  # تضمین خروجی جیسون
            },
            timeout=50
        )

        # 4. دریافت و پردازش خروجی
        if response.status_code == 200:
            content = response.json()["choices"][0]["message"]["content"]

            # تمیزکاری احتمالی (اگر مدل کد را در ```json گذاشت حذف کند)
            if content.startswith("```json"):
                content = content.replace("```json", "").replace("```", "")
            elif content.startswith("```"):
                content = content.replace("```", "")

            try:
                # تبدیل متن به دیکشنری پایتون
                care_data = json.loads(content)
                return care_data
            except json.JSONDecodeError:
                # Using repr to handle encoding issues
                print("Error Parsing JSON:", repr(content))
                return None
        else:
            # Using repr to handle encoding issues
            print("Error:", response.status_code, repr(response.text))
            return None

    except Exception as e:
        # Using repr to handle encoding issues
        print(f"Error calling LLM API: {repr(e)}")
        return None


def create_or_update_plant_from_llm(plant_name):
    """
    Create or update a plant record in the database using information from LLM.

    Args:
        plant_name (str): The name of the plant to create/update

    Returns:
        Plant: The created or updated Plant object, or None if failed
    """
    # Get plant info from LLM
    plant_info = get_plant_info_from_llm(plant_name)

    if not plant_info:
        return None

    # Helper function to convert text values to boolean
    def text_to_bool(value):
        if isinstance(value, bool):
            return value
        if isinstance(value, str):
            # Convert Persian/Farsi text to boolean
            value_lower = value.lower().strip()
            if any(word in value_lower for word in ['true', 'yes', 'yes', 'correct', 'valid', '1', 'active', 'positive', 'سمی', 'بله', 'دارد', 'yes']):
                return True
            if any(word in value_lower for word in ['false', 'no', 'no', 'incorrect', 'invalid', '0', 'inactive', 'negative', 'غیر', 'خیر', 'ندارد', 'no']):
                return False
        return bool(value) if value is not None else False

    # Validate care_difficulty value
    def validate_care_difficulty(difficulty):
        valid_difficulties = ['easy', 'medium', 'hard']
        if difficulty in valid_difficulties:
            return difficulty
        # Try to map common Persian terms
        difficulty_lower = difficulty.lower()
        if any(word in difficulty_lower for word in ['آسان', 'ساده', 'light', 'easy']):
            return 'easy'
        elif any(word in difficulty_lower for word in ['متوسط', 'moderate', 'medium']):
            return 'medium'
        elif any(word in difficulty_lower for word in ['سخت', 'difficult', 'hard']):
            return 'hard'
        else:
            return 'medium'  # default

    # Map LLM response to model fields
    try:
        # Extract and validate values
        is_toxic_value = text_to_bool(plant_info.get('is_toxic', False))
        care_difficulty_value = validate_care_difficulty(plant_info.get('care_difficulty', 'medium'))

        # Try to find existing plant by farsi_name or scientific_name
        plant, created = Plant.objects.get_or_create(
            farsi_name=plant_info.get('farsi_name', plant_name),
            defaults={
                'scientific_name': plant_info.get('scientific_name', ''),
                'description': plant_info.get('description', ''),
                'watering_frequency': plant_info.get('watering_frequency', ''),
                'fertilizer_schedule': plant_info.get('fertilizer_schedule', ''),
                'care_difficulty': care_difficulty_value,
                'is_toxic': is_toxic_value,
                'light_requirements': plant_info.get('light_requirements', ''),
                'humidity_level': plant_info.get('humidity_level', ''),
                'temperature_range': plant_info.get('temperature_range', ''),
                'soil_type': plant_info.get('soil_type', ''),
                'propagation_methods': plant_info.get('propagation_methods', ''),
            }
        )
        print(plant_info)

        # If plant already existed, update its fields
        if not created:
            plant.scientific_name = plant_info.get('scientific_name', plant.scientific_name)
            plant.description = plant_info.get('description', plant.description)
            plant.watering_frequency = plant_info.get('watering_frequency', plant.watering_frequency)
            plant.fertilizer_schedule = plant_info.get('fertilizer_schedule', plant.fertilizer_schedule)
            plant.care_difficulty = validate_care_difficulty(plant_info.get('care_difficulty', plant.care_difficulty))
            plant.is_toxic = text_to_bool(plant_info.get('is_toxic', plant.is_toxic))
            plant.light_requirements = plant_info.get('light_requirements', plant.light_requirements)
            plant.humidity_level = plant_info.get('humidity_level', plant.humidity_level)
            plant.temperature_range = plant_info.get('temperature_range', plant.temperature_range)
            plant.soil_type = plant_info.get('soil_type', plant.soil_type)
            plant.propagation_methods = plant_info.get('propagation_methods', plant.propagation_methods)
            plant.save()

        return plant
    except Exception as e:
        # Using repr to handle encoding issues
        print(f"Error creating/updating plant in database: {repr(e)}")
        return None