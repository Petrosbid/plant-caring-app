import json
from django.conf import settings

# =====================================================================
# CONFIGURATION & SWITCH
# =====================================================================
USE_GEMINI = True

RECOMMENDATION_MODEL = "gemini-3.5-flash" if USE_GEMINI else "gpt-4o-mini"

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
    from openai import OpenAI, APIConnectionError, APITimeoutError, RateLimitError

    AVALAI_API_KEY = getattr(settings, 'AVALAI_API_KEY', None)


def get_plant_recommendation_from_llm(answers: dict, language: str, additional_notes: str = ""):
    if USE_GEMINI:
        if not GEMINI_API_KEY:
            print("Error: Gemini API key is missing.")
            return None
    else:
        if not AVALAI_API_KEY:
            print("Error: AvalAI API key is missing in django settings.")
            return None

    if language == 'fa':
        system_prompt = """
            تو یک متخصص گیاهان آپارتمانی حرفه‌ای هستی با دانش عمیق از شرایط نگهداری، سازگاری با محیط‌های مختلف، نیازهای نوری، آبیاری، رطوبت، دما، خاک و سمیت برای حیوانات.
            بر اساس اطلاعات زیر که کاربر در مورد خانه، سبک زندگی، محدودیت‌ها و سلیقه خود داده است، بهترین گیاه را پیشنهاد بده. فقط و فقط یک گیاه پیشنهاد بده.

            اطلاعات کاربر:
        """
    else:
        system_prompt = """
            You are a professional houseplant expert with deep knowledge of plant care, environmental adaptability, light needs, watering, and pet safety.
            Based on the following user information, recommend the single best plant. Recommend only one plant.
            User information:
        """

    answers_text = ""
    for key, value in answers.items():
        answers_text += f"- {key}: {value}\n"

    if language == 'fa':
        user_prompt = f"""
{answers_text}
Additional notes: {additional_notes}

لطفاً پاسخ را دقیقاً در قالب JSON زیر برگردان:

{{
    "plant_name_fa": "نام فارسی گیاه پیشنهادی",
    "plant_name_en": "نام انگلیسی گیاه پیشنهادی",
    "scientific_name": "نام علمی گیاه پیشنهادی",
    "reason_fa": "دلیل انتخاب این گیاه به زبان فارسی (حداقل ۲ خط)",
    "reason_en": "Reason for recommending this plant in English (at least 2 lines)"
}}

مهم: گیاه باید کاملاً با تمام شرایط و محدودیت‌های ذکر شده سازگار باشد.
"""
    else:
        user_prompt = f"""
{answers_text}
Additional notes: {additional_notes}

Please return the response EXACTLY in the following JSON format:

{{
    "plant_name_fa": "نام فارسی گیاه پیشنهادی",
    "plant_name_en": "نام انگلیسی گیاه پیشنهادی",
    "scientific_name": "نام علمی گیاه پیشنهادی",
    "reason_fa": "دلیل انتخاب این گیاه به زبان فارسی (حداقل ۲ خط)",
    "reason_en": "Reason for recommending this plant in English (at least 2 lines)"
}}

Important: The plant must be fully compatible with all restrictions mentioned.
"""

    # =====================================================================
    # EXECUTION BLOCK (SWITCHABLE)
    # =====================================================================

    # ---- 1. GEMINI (GOOGLE GENAI) SECTION ----
    if USE_GEMINI:
        try:
            response = client.models.generate_content(
                model=RECOMMENDATION_MODEL,
                contents=user_prompt,
                config=types.GenerateContentConfig(
                    system_instruction=system_prompt,
                    response_mime_type="application/json",
                ),
            )
            print(response)
            content = response.text.strip()
            recommendation = json.loads(content)
            return recommendation

        except APIError as api_err:
            print(f"Google GenAI API Error: {repr(api_err)}")
            return None
        except json.JSONDecodeError as json_err:
            print(f"JSON decode error from Gemini. Raw response was: {response.text} | Error: {repr(json_err)}")
            return None
        except Exception as e:
            print(f"Unexpected error calling Gemini: {repr(e)}")
            return None

    else:
        try:
            openai_client = OpenAI(
                base_url="https://api.avalai.ir/v1/",
                api_key=AVALAI_API_KEY
            )

            response = openai_client.chat.completions.create(
                model=RECOMMENDATION_MODEL,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                timeout=600.0
            )

            content = response.choices[0].message.content.strip()

            if content.startswith("```"):
                lines = content.splitlines()
                if lines[0].startswith("```"):
                    lines = lines[1:]
                if lines[-1].startswith("```"):
                    lines = lines[:-1]
                content = "\n".join(lines).strip()

            recommendation = json.loads(content)
            return recommendation

        except RateLimitError as rate_err:
            print(f"AvalAI Rate Limit hit: {repr(rate_err)}. Please verify your account tier or balance.")
            return None
        except (APIConnectionError, APITimeoutError) as net_err:
            print(f"Network error calling AvalAI: {repr(net_err)}")
            return None
        except json.JSONDecodeError as json_err:
            print(f"JSON decode error from OpenAI. Raw response was: {content} | Error: {repr(json_err)}")
            return None
        except Exception as e:
            print(f"Unexpected error calling OpenAI for recommendation: {repr(e)}")
            return None