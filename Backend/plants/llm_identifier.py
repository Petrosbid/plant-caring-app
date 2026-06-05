import requests
import json
import re
from django.conf import settings
from .models import Plant

OPENROUTER_API_KEY = getattr(settings, 'OPENROUTER_API_KEY', None)


def get_plant_info_from_llm(plant_name):
    system_prompt = """
You are an expert botanist with deep knowledge of horticulture and indoor/outdoor plant care.  
I will give you the name of a plant (in any language).  

Return a **raw JSON object** (no markdown, no ```json fences, no commentary)  
that follows the structure below.

**RULES FOR DESCRIPTION FIELDS** - **`description` (Persian)**:  
  ابتدا یک یا دو پاراگراف معرفی (بدون هیچ تگ HTML) بنویسید که شامل: ظاهر گیاه، قیمت تقریبی در ایران، زیستگاه اصلی، حقایق جالب و هر اطلاعات عمومی دیگر باشد.  
  سپس بلافاصله `<h2>راهنمای مراقبت</h2>` اضافه کنید.  
  بعد از آن، برای هر یک از موارد مراقبت به ترتیب زیر، یک `<h3>` و یک `<p>` بنویسید:  
  آبیاری (با جزئیات زمان‌ها، روش بررسی رطوبت خاک، تغییرات فصلی)، کوددهی، نور، رطوبت، دما، خاک، هرس، تکثیر.  
  هیچ پاراگراف اضافه‌ای بعد از بخش تکثیر ننویسید.  

- **`description_en` (English)**:  
  Same logic: one or two intro paragraphs (no tags) covering appearance, approximate price (in USD or general), native habitat, interesting facts.  
  Then `<h2>Care Guide</h2>`.  
  Then `<h3>` and `<p>` for each aspect in this order: watering (with details on frequency, how to check soil moisture, seasonal changes), fertilizing, light, humidity, temperature, soil, pruning, propagation.  
  No extra paragraph after propagation.

**ALL OTHER FIELDS** must use **only the allowed values** listed below (for filtering).  

---

### Allowed values for filtering fields

**watering_frequency / watering_frequency_en** "very low", "low", "medium", "high", "very high"

**fertilizer_schedule / fertilizer_schedule_en** "never", "once a year", "every 3 months", "monthly", "every 2 weeks", "weekly"

**light_requirements / light_requirements_en** "low light", "medium indirect light", "bright indirect light", "direct sun", "full sun to partial shade"

**humidity_level / humidity_level_en** "low", "moderate", "high", "very high"

**temperature_range / temperature_range_en** "10-15°C", "15-20°C", "18-24°C", "20-30°C", "above 15°C", "above 20°C"

**soil_type / soil_type_en** "cactus mix", "succulent mix", "standard potting mix", "peat-based mix", "loamy soil", "orchid bark mix"

**pruning_info / pruning_info_en** "minimal", "light pruning", "regular pruning", "heavy pruning"

**propagation_methods / propagation_methods_en** One or two from: "stem cuttings", "leaf cuttings", "root division", "seeds", "air layering", "offsets / pups"

**care_difficulty** "easy", "medium", "hard"

**is_toxic** true or false (must be lowercase json booleans)
---

### JSON structure (all fields required)

{
    "farsi_name": "نام رایج گیاه به فارسی",
    "english_name": "Common name in English",
    "scientific_name": "Scientific name (Genus species)",
    "description": "متن HTML مطابق قالب بالا - ابتدا معرفی (بدون تگ)، سپس <h2>راهنمای مراقبت</h2> و بعد <h3> و <p> برای هر بخش - به فارسی",
    "description_en": "HTML description with intro paragraphs (no tags), then <h2>Care Guide</h2>, then <h3> and <p> for each care aspect - in English",
    "watering_frequency": "مقدار مجاز به فارسی",
    "watering_frequency_en": "allowed value in English",
    "fertilizer_schedule": "مقدار مجاز به فارسی",
    "fertilizer_schedule_en": "allowed value in English",
    "light_requirements": "مقدار مجاز به فارسی",
    "light_requirements_en": "allowed value in English",
    "humidity_level": "مقدار مجاز به فارسی",
    "humidity_level_en": "allowed value in English",
    "temperature_range": "بازه دما به فارسی مثل '۱۸-۲۴ درجه'",
    "temperature_range_en": "e.g. '18-24°C'",
    "soil_type": "مقدار مجاز به فارسی",
    "soil_type_en": "allowed value in English",
    "pruning_info": "مقدار مجاز به فارسی",
    "pruning_info_en": "allowed value in English",
    "propagation_methods": "مقدار مجاز به فارسی",
    "propagation_methods_en": "allowed value in English",
    "care_difficulty": "easy/medium/hard",
    "is_toxic": True/False
}

Return ONLY the raw JSON object.
"""

    try:  # Outer try block starts here
        response = requests.post(
            url="https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                "Content-Type": "application/json",
                "HTTP-Referer": "https://your-plant-app.com",
                "X-Title": "Plant Care App",
            },
            json={
                "model": "openrouter/owl-alpha",
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"Plant name: {plant_name}"}
                ],
                "timeout": 50
            }
        )

        if response.status_code == 200:
            content = response.json()["choices"][0]["message"]["content"].strip()

            # 1. Clean markdown code fences if present
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0].strip()
            elif "```" in content:
                content = content.split("```")[1].split("```")[0].strip()

            # 2. Extract anything between the first '{' and last '}' to isolate the object
            start_idx = content.find('{')
            end_idx = content.rfind('}')
            if start_idx != -1 and end_idx != -1:
                content = content[start_idx:end_idx + 1]

            # 3. Quick-fix Python booleans commonly hallucinated by LLMs
            content = re.sub(r':\s*True\b', ': true', content)
            content = re.sub(r':\s*False\b', ': false', content)

            try:
                care_data = json.loads(content)
                return care_data
            except json.JSONDecodeError as e:
                # If it's still broken (e.g. truncated), try a primitive fallback regex to capture what we can
                print("Error Parsing JSON, attempting recovery. Raw:", repr(content))

                # Loose regex recovery to salvage field data if truncated mid-stream
                salvaged_data = {}
                matches = re.findall(r'"(\w+)":\s*"(.*?)"', content)
                for key, val in matches:
                    salvaged_data[key] = val

                if salvaged_data:
                    # Explicitly convert boolean keys if caught by regex
                    if 'is_toxic' in content:
                        salvaged_data['is_toxic'] = 'false' not in content.lower()
                    return salvaged_data

                return None

        # If status code is not 200
        return None

    except Exception as e:  # <--- Added this to close the outer try block safely!
        print(f"Network request or unexpected error occurred: {repr(e)}")
        return None


def create_or_update_plant_from_llm(plant_name):
    plant_info = get_plant_info_from_llm(plant_name)
    if not plant_info:
        return None

    def text_to_bool(value):
        if isinstance(value, bool):
            return value
        if isinstance(value, str):
            v = value.lower().strip()
            if v in ['true', 'yes', '1', 'correct', 'positive', 'سمی', 'بله', 'دارد']:
                return True
            if v in ['false', 'no', '0', 'incorrect', 'negative', 'غیر', 'خیر', 'ندارد']:
                return False
        return bool(value) if value is not None else False

    def validate_care_difficulty(difficulty):
        valid = {'easy', 'medium', 'hard'}
        diff_lower = difficulty.lower().strip()
        if diff_lower in valid:
            return diff_lower
        if any(w in diff_lower for w in ['آسان', 'ساده', 'easy']):
            return 'easy'
        if any(w in diff_lower for w in ['متوسط', 'moderate', 'medium']):
            return 'medium'
        if any(w in diff_lower for w in ['سخت', 'difficult', 'hard']):
            return 'hard'
        return 'medium'

    try:
        is_toxic = text_to_bool(plant_info.get('is_toxic', False))
        care_diff = validate_care_difficulty(plant_info.get('care_difficulty', 'medium'))

        plant, created = Plant.objects.get_or_create(
            farsi_name=plant_info.get('farsi_name', plant_name),
            defaults={
                'english_name': plant_info.get('english_name', ''),
                'scientific_name': plant_info.get('scientific_name', ''),
                'description': plant_info.get('description', ''),
                'description_en': plant_info.get('description_en', ''),
                'watering_frequency': plant_info.get('watering_frequency', ''),
                'watering_frequency_en': plant_info.get('watering_frequency_en', ''),
                'fertilizer_schedule': plant_info.get('fertilizer_schedule', ''),
                'fertilizer_schedule_en': plant_info.get('fertilizer_schedule_en', ''),
                'light_requirements': plant_info.get('light_requirements', ''),
                'light_requirements_en': plant_info.get('light_requirements_en', ''),
                'humidity_level': plant_info.get('humidity_level', ''),
                'humidity_level_en': plant_info.get('humidity_level_en', ''),
                'temperature_range': plant_info.get('temperature_range', ''),
                'temperature_range_en': plant_info.get('temperature_range_en', ''),
                'soil_type': plant_info.get('soil_type', ''),
                'soil_type_en': plant_info.get('soil_type_en', ''),
                'pruning_info': plant_info.get('pruning_info', ''),
                'pruning_info_en': plant_info.get('pruning_info_en', ''),
                'propagation_methods': plant_info.get('propagation_methods', ''),
                'propagation_methods_en': plant_info.get('propagation_methods_en', ''),
                'care_difficulty': care_diff,
                'is_toxic': is_toxic,
            }
        )

        if not created:
            plant.english_name = plant_info.get('english_name', plant.english_name)
            plant.scientific_name = plant_info.get('scientific_name', plant.scientific_name)
            plant.description = plant_info.get('description', plant.description)
            plant.description_en = plant_info.get('description_en', plant.description_en)
            plant.watering_frequency = plant_info.get('watering_frequency', plant.watering_frequency)
            plant.watering_frequency_en = plant_info.get('watering_frequency_en', plant.watering_frequency_en)
            plant.fertilizer_schedule = plant_info.get('fertilizer_schedule', plant.fertilizer_schedule)
            plant.fertilizer_schedule_en = plant_info.get('fertilizer_schedule_en', plant.fertilizer_schedule_en)
            plant.light_requirements = plant_info.get('light_requirements', plant.light_requirements)
            plant.light_requirements_en = plant_info.get('light_requirements_en', plant.light_requirements_en)
            plant.humidity_level = plant_info.get('humidity_level', plant.humidity_level)
            plant.humidity_level_en = plant_info.get('humidity_level_en', plant.humidity_level_en)
            plant.temperature_range = plant_info.get('temperature_range', plant.temperature_range)
            plant.temperature_range_en = plant_info.get('temperature_range_en', plant.temperature_range_en)
            plant.soil_type = plant_info.get('soil_type', plant.soil_type)
            plant.soil_type_en = plant_info.get('soil_type_en', plant.soil_type_en)
            plant.pruning_info = plant_info.get('pruning_info', plant.pruning_info)
            plant.pruning_info_en = plant_info.get('pruning_info_en', plant.pruning_info_en)
            plant.propagation_methods = plant_info.get('propagation_methods', plant.propagation_methods)
            plant.propagation_methods_en = plant_info.get('propagation_methods_en', plant.propagation_methods_en)
            plant.care_difficulty = validate_care_difficulty(plant_info.get('care_difficulty', plant.care_difficulty))
            plant.is_toxic = text_to_bool(plant_info.get('is_toxic', plant.is_toxic))
            plant.save()

        return plant

    except Exception as e:
        print(f"Error creating/updating plant in database: {repr(e)}")
        return None