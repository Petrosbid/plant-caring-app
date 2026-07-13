import json
from django.conf import settings
from .models import Disease

# =====================================================================
# CONFIGURATION & SWITCH
# =====================================================================
USE_GEMINI = True

DISEASE_MODEL = "gemini-3.5-flash" if USE_GEMINI else "gemma-4-31b-it"

# =====================================================================
# IMPORTS & CLIENT INITIALIZATION
# =====================================================================
from google import genai
from google.genai import types
from google.genai.errors import APIError

GEMINI_API_KEY = getattr(settings, 'GEMINI_API_KEY', None)
client = genai.Client(api_key=GEMINI_API_KEY)

from openai import OpenAI, APIConnectionError, APITimeoutError
AVALAI_API_KEY = getattr(settings, 'AVALAI_API_KEY', None)


def get_disease_details_from_llm(disease_name, plant_name=None):
    if USE_GEMINI:
        if not GEMINI_API_KEY:
            print("Gemini API key is missing.")
            return None
    else:
        if not AVALAI_API_KEY:
            print("AvalAI API key is missing in settings.")
            return None

    context_plant = f" on the plant '{plant_name}'" if plant_name else " on plants"

    system_prompt = f"""
You are an expert plant pathologist with deep knowledge of plant diseases, their symptoms, etiology, epidemiology, and integrated pest management.

I will give you the name of a plant disease{context_plant}.  
You must provide a COMPLETE, SCIENTIFICALLY ACCURATE, and PRACTICAL diagnosis and treatment plan in **BOTH English and Persian (Farsi)**.

Return ONLY a valid JSON object (no markdown, no extra text). The JSON must strictly follow the structure below.

---

### JSON STRUCTURE (all fields required)

{{
    "disease_name_fa": "نام کامل بیماری به فارسی (مثلاً سفیدک سطحی خیار)",
    "disease_name_en": "Full disease name in English (e.g., Powdery Mildew of Cucurbits)",
    "description_fa": "توضیح کامل بیماری به فارسی: شامل عوامل بیماری‌زا (قارچ، باکتری، ویروس)، نحوه آلودگی، چرخه زندگی، شرایط مساعد برای بروز، و علائم اصلی (حداقل ۳ خط).",
    "description_en": "Full description in English: causal agent (fungus, bacterium, virus), infection process, life cycle, favorable conditions, and key symptoms (at least 3 lines).",
    "symptoms_fa": "علائم دقیق به فارسی: ظاهر لکه‌ها، تغییر رنگ، پژمردگی، تغییر شکل، رشد قارچی و ... (لیست یا پاراگراف).",
    "symptoms_en": "Detailed symptoms in English: spot appearance, discoloration, wilting, deformation, fungal growth, etc.",
    "severity": "one of: low, medium, high, critical",
    "spread_rate": "one of: slow, moderate, fast",
    "is_infectious": "yes/no (in Persian: بله/خیر)",
    "is_infectious_en": "yes/no",
    "treatment_steps_fa": [
        "گام اول درمان: حذف برگ‌های آلوده و قرنطینه گیاه",
        "گام دوم: استفاده از قارچ‌کش سیستمیک مانند ...",
        "گام سوم: بهبود تهویه و کاهش رطوبت",
        "حداقل ۳ و حداکثر ۶ گام واقعی و عملی"
    ],
    "treatment_steps_en": [
        "Step 1: Remove infected leaves and isolate the plant",
        "Step 2: Apply systemic fungicide (e.g., ...)",
        "Step 3: Improve air circulation and reduce humidity",
        "At least 3, up to 6 actionable steps"
    ],
    "prevention_fa": "روش‌های پیشگیری به فارسی: فاصله کاشت مناسب، آبیاری قطره‌ای، استفاده از ارقام مقاوم، ضدعفونی ابزار، کنترل علف‌های هرز و ...",
    "prevention_en": "Prevention methods in English: proper spacing, drip irrigation, resistant varieties, tool disinfection, weed control, etc.",
    "organic_treatment_fa": "درمان ارگانیک/طبیعی به فارسی (مثلاً مخلوط جوش شیرین و روغن، عصاره سیر، یا معرفی دشمنان طبیعی). اگر وجود ندارد بنویسید 'درمان ارگانیک شناخته شده‌ای نیست'.",
    "organic_treatment_en": "Organic/natural treatment in English (e.g., baking soda and oil spray, garlic extract, beneficial insects). If none, write 'No known organic treatment'."
    "image_url": a high quality of disease and landscape image URL
}}

---

### IMPORTANT RULES

1. **Accuracy**: Use real, scientifically verified information. Do not guess.
2. **Completeness**: Every field must be filled. No empty strings.
3. **Practicality**: Treatment steps must be actionable by a home gardener or farmer.
4. **Language**: Persian text must be natural, fluent, and correctly spelled.
5. **Severity & Spread**: Choose appropriately based on real disease characteristics.
6. **Organic treatment**: Provide a real organic option if available; otherwise state clearly that none exists.

Now, generate the JSON for disease: **{disease_name}**
"""

    content = ""
    if USE_GEMINI:
        try:
            response = client.models.generate_content(
                model=DISEASE_MODEL,
                contents=system_prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=0.2,
                )
            )
            content = response.text.strip()
        except Exception as e:
            print(f"Gemini API error in disease generation: {repr(e)}")
            return None
    else:
        try:
            openai_client = OpenAI(
                base_url="[https://api.avalai.ir/v1](https://api.avalai.ir/v1)",
                api_key=AVALAI_API_KEY
            )

            response = openai_client.chat.completions.create(
                model=DISEASE_MODEL,
                messages=[
                    {"role": "system", "content": "You are a professional plant pathologist. Respond only with valid JSON as instructed."},
                    {"role": "user", "content": system_prompt}
                ],
                response_format={"type": "json_object"},
                temperature=0.2,
                max_tokens=2000,
                timeout=90
            )
            content = response.choices[0].message.content.strip()
        except Exception as e:
            print(f"OpenAI API error in disease generation: {repr(e)}")
            return None

    if not content:
        return None

    try:
        if content.startswith("```json"):
            content = content.replace("```json", "").replace("```", "").strip()
        elif content.startswith("```"):
            content = content.replace("```", "").strip()

        disease_data = json.loads(content)

        for lang in ['fa', 'en']:
            key = f'treatment_steps_{lang}'
            if not isinstance(disease_data.get(key), list):
                disease_data[key] = [str(disease_data.get(key, ''))]
            else:
                disease_data[key] = [str(step) for step in disease_data[key]]

        return disease_data

    except json.JSONDecodeError as json_err:
        print(f"JSON decode error from disease model response: {repr(json_err)}")
        return None



def create_or_update_disease_from_llm(disease_name):
    info = get_disease_details_from_llm(disease_name)
    if not info:
        return None

    try:
        name_en = info.get('disease_name_en', disease_name)
        name_fa = info.get('disease_name_fa', '')
        description_en = info.get('description_en', '')
        description_fa = info.get('description_fa', '')
        symptoms_en = info.get('symptoms_en', '')
        symptoms_fa = info.get('symptoms_fa', '')
        prevention_en = info.get('prevention_en', '')
        prevention_fa = info.get('prevention_fa', '')
        severity = info.get('severity', 'medium')

        if severity not in ['low', 'medium', 'high', 'critical']:
            severity = 'medium'

        treatment_steps_en = '\n'.join(info.get('treatment_steps_en', []))
        treatment_steps_fa = '\n'.join(info.get('treatment_steps_fa', []))
        organic_en = info.get('organic_treatment_en', '')
        organic_fa = info.get('organic_treatment_fa', '')

        disease = Disease.objects.filter(name_fa=name_fa).first()
        if not disease:
            disease = Disease.objects.filter(name=name_en).first()

        if disease:
            disease.name = name_en
            disease.name_fa = name_fa
            disease.description = description_en
            disease.description_fa = description_fa
            disease.symptoms = symptoms_en
            disease.symptoms_fa = symptoms_fa
            disease.solution = treatment_steps_en + "\n\nOrganic: " + organic_en if organic_en else treatment_steps_en
            disease.solution_fa = treatment_steps_fa + "\n\nارگانیک: " + organic_fa if organic_fa else treatment_steps_fa
            disease.prevention_methods = prevention_en
            disease.prevention_methods_fa = prevention_fa
            disease.severity_level = severity
            disease.spread_rate = info.get('spread_rate', 'moderate')

            disease.save()
        else:
            disease = Disease.objects.create(
                name=name_en,
                name_fa=name_fa,
                description=description_en,
                description_fa=description_fa,
                symptoms=symptoms_en,
                symptoms_fa=symptoms_fa,
                solution=treatment_steps_en,
                solution_fa=treatment_steps_fa,
                prevention_methods=prevention_en,
                prevention_methods_fa=prevention_fa,
                severity_level=severity,
                spread_rate=info.get('spread_rate', 'moderate'),
                image_url=info.get('image_url')
            )



        return disease
    except Exception as e:
        print(f"Error creating/updating disease: {e}")
        return None