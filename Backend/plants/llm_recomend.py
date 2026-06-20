import json
from django.conf import settings
from openai import OpenAI, APIConnectionError, APITimeoutError

# دریافت کلید از تنظیمات جنگو
AVALAI_API_KEY = getattr(settings, 'AVALAI_API_KEY', None)
RECOMMENDATION_MODEL = "gemma-4-31b-it"


def get_plant_recommendation_from_llm(answers: dict, language: str, additional_notes: str = ""):
    """
    دریافت پاسخ‌های کاربر و بازگرداندن نام گیاه پیشنهادی + دلیل انتخاب
    answers: دیکشنری شامل پاسخ‌های سوالات (keyها همان id سوالات فرانت‌اند)
    language: 'en' یا 'fa'
    additional_notes: توضیحات اضافی کاربر
    """
    # بررسی وجود روت کلید API
    if not AVALAI_API_KEY:
        print("AvalAI API key is missing in settings.")
        return None

    # ساخت پرامپت بر اساس زبان
    if language == 'fa':
        system_prompt = """تو یک متخصص گیاهان آپارتمانی حرفه‌ای هستی با دانش عمیق از شرایط نگهداری، سازگاری با محیط‌های مختلف، نیازهای نوری، آبیاری، رطوبت، دما، خاک، سمیت برای حیوانات و کودکان، و همچنین سلیقه بصری کاربران.

بر اساس اطلاعات زیر که کاربر در مورد خانه، سبک زندگی، محدودیت‌ها و سلیقه خود داده است، **بهترین گیاه** را پیشنهاد بده. فقط یک گیاه پیشنهاد بده.

اطلاعات کاربر:
"""
    else:
        system_prompt = """You are a professional houseplant expert with deep knowledge of plant care, environmental adaptability, light needs, watering, humidity, temperature, soil, pet/child safety, and aesthetic preferences.

Based on the following user information about their home, lifestyle, restrictions, and tastes, recommend the **single best plant**. Recommend only one plant.

User information:
"""

    # ساخت متن پاسخ‌ها
    answers_text = ""
    for key, value in answers.items():
        answers_text += f"- {key}: {value}\n"

    user_prompt = f"""
{answers_text}
Additional notes: {additional_notes}

{("لطفاً پاسخ را در قالب JSON زیر برگردان (هیچ متن اضافی قبل یا بعد ننویس):" if language == 'fa' else "Please return the response in the following JSON format (no extra text before or after):")}

{{
    "plant_name_fa": "نام فارسی گیاه پیشنهادی",
    "plant_name_en": "نام انگلیسی گیاه پیشنهادی",
    "scientific_name": "نام علمی (در صورت امکان)",
    "reason_fa": "دلیل انتخاب این گیاه به زبان فارسی، با اشاره به نکات خاص از اطلاعات کاربر (حداقل 2 خط)",
    "reason_en": "Reason for recommending this plant in English, referring to specific user info (at least 2 lines)"
}}

{("مهم: گیاه باید با توجه به تمام محدودیت‌ها (مثلاً سمیت برای حیوانات، نور کم، فراموشکاری در آبیاری) سازگار باشد." if language == 'fa' else "Important: The plant must be compatible with all restrictions (e.g., pet toxicity, low light, forgetful watering).")}
"""

    try:
        # مقداردهی کلاینت AvalAI با ساختار OpenAI SDK
        client = OpenAI(
            base_url="https://api.avalai.ir/v1",
            api_key=AVALAI_API_KEY
        )

        # فراخوانی متد کامپلیشن
        response = client.chat.completions.create(
            model=RECOMMENDATION_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            # در صورت پشتیبانی مدل از ساختار خروجی JSON، می‌توانید این فلگ را نگه دارید
            response_format={"type": "json_object"},
            timeout=50
        )

        # دریافت متن خروجی مستقیم از کلاینت
        content = response.choices[0].message.content.strip()

        # پاکسازی تگ‌های مارک‌داون احتمالی
        if content.startswith("```json"):
            content = content.replace("```json", "").replace("```", "").strip()
        elif content.startswith("```"):
            content = content.replace("```", "").strip()

        recommendation = json.loads(content)
        return recommendation

    except (APIConnectionError, APITimeoutError) as net_err:
        print(f"Network error calling AvalAI: {repr(net_err)}")
        return None
    except json.JSONDecodeError as json_err:
        print(f"JSON decode error from model response: {repr(json_err)}")
        return None
    except Exception as e:
        print(f"Error calling LLM for recommendation: {repr(e)}")
        return None