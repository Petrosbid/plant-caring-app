import json
from django.conf import settings

# =====================================================================
# CONFIGURATION & SWITCH
# =====================================================================
USE_GEMINI = True

CHAT_MODEL = "gemini-3.5-flash" if USE_GEMINI else "gemma-4-31b-it"

# =====================================================================
# IMPORTS & CLIENT INITIALIZATION
# =====================================================================
if USE_GEMINI:
    from google import genai
    from google.genai import types
    from google.genai.errors import APIError

    GEMINI_API_KEY = getattr(settings, 'GEMINI_API_KEY', "AQ.Ab8RN6KI05T4Tw6pydyIqo4v_hPHDu6ScI5M_eAtCqtIG_8flA")
    client = genai.Client(api_key=GEMINI_API_KEY)
else:
    from openai import OpenAI, APIConnectionError, APITimeoutError

    AVALAI_API_KEY = getattr(settings, 'AVALAI_API_KEY', None)


def get_plant_chat_response(user_plant, user_question, chat_history=None):
    if USE_GEMINI:
        if not GEMINI_API_KEY:
            return "متاسفانه کلید سرویس هوش مصنوعی گوگل تنظیم نشده است."
    else:
        if not AVALAI_API_KEY:
            return "متاسفانه سرویس هوش مصنوعی در دسترس نیست. لطفاً بعداً تلاش کنید."

    plant = user_plant.plant

    health_status_display = user_plant.get_health_status_display() or 'نامشخص'
    pot_size_display = user_plant.get_pot_size_display() or 'نامشخص'
    care_difficulty_display = plant.get_care_difficulty_display() if plant.care_difficulty else 'نامشخص'

    plant_context = f"""
        === اطلاعات پایه گیاه ===
        نام فارسی: {plant.farsi_name or 'نامشخص'}
        نام انگلیسی: {plant.english_name or 'نامشخص'}
        نام علمی: {plant.scientific_name or 'نامشخص'}
        سختی مراقبت: {care_difficulty_display}
        سمی بودن: {'بله' if plant.is_toxic else 'خیر'}
        توضیحات کلی: {plant.description[:300] if plant.description else 'ندارد'}

        === نیازهای مراقبتی (مقادیر مرجع) ===
        آبیاری: {plant.watering_frequency or 'نامشخص'} (انگلیسی: {plant.watering_frequency_en or '-'})
        کوددهی: {plant.fertilizer_schedule or 'نامشخص'} (انگلیسی: {plant.fertilizer_schedule_en or '-'})
        نور: {plant.light_requirements or 'نامشخص'} (انگلیسی: {plant.light_requirements_en or '-'})
        رطوبت: {plant.humidity_level or 'نامشخص'} (انگلیسی: {plant.humidity_level_en or '-'})
        دمای مناسب: {plant.temperature_range or 'نامشخص'} (انگلیسی: {plant.temperature_range_en or '-'})
        خاک مناسب: {plant.soil_type or 'نامشخص'} (انگلیسی: {plant.soil_type_en or '-'})
        هرس: {plant.pruning_info or 'نامشخص'} (انگلیسی: {plant.pruning_info_en or '-'})
        تکثیر: {plant.propagation_methods or 'نامشخص'} (انگلیسی: {plant.propagation_methods_en or '-'})

        === اطلاعات شخصی‌سازی شده برای این گیاه در باغچه کاربر ===
        نام‌خودمانی: {user_plant.nickname or 'ندارد'}
        وضعیت سلامت: {health_status_display}
        سایز گلدان: {pot_size_display}
        یادداشت کاربر: {user_plant.notes or 'ندارد'}
        آخرین آبیاری: {user_plant.last_watered.strftime('%Y/%m/%d') if user_plant.last_watered else 'ثبت نشده'}
        آبیاری بعدی: {user_plant.next_watering_date.strftime('%Y/%m/%d') if user_plant.next_watering_date else 'محاسبه نشده'}
        فاصله آبیاری (روز): {user_plant.watering_interval_days}
        آخرین کوددهی: {user_plant.last_fertilized.strftime('%Y/%m/%d') if user_plant.last_fertilized else 'ثبت نشده'}
        کوددهی بعدی: {user_plant.next_fertilizing_date.strftime('%Y/%m/%d') if user_plant.next_fertilizing_date else 'محاسبه نشده'}
        آخرین هرس: {user_plant.last_pruned.strftime('%Y/%m/%d') if user_plant.last_pruned else 'ثبت نشده'}
        هرس بعدی: {user_plant.next_pruning_date.strftime('%Y/%m/%d') if user_plant.next_pruning_date else 'محاسبه نشده'}
    """

    system_prompt = f"""
        You are a friendly expert assistant specialized in indoor and garden plant care.  
        Your goal is to help the user improve the health and happiness of their plants.  
        Below is the information about a specific plant that belongs to the user:

        {plant_context}

        Response rules:
        1. Only answer questions related to plants, their care, common issues, pests, watering, light, soil, fertilizing, pruning, propagation, and similar topics.
        2. If the user's question is completely unrelated to plants (e.g., politics, sports, math, irrelevant jokes, etc.), politely say you cannot answer that and guide them back to plant-related questions.
        3. If the user's question is vague, meaningless, or too short (less than 3 words with no clear meaning), politely ask them to clarify their question.
        4. Use the actual information from "Basic plant information" and "Personalized information" to give accurate and personalized answers.
        5. Responses should be friendly and fluent. Maximum length 400 words.
        6. If the user has asked a similar question before (chat history will be provided below), you may refer to it and avoid unnecessary repetition.
        7. Never provide medical or legal advice. Only talk about plants.
        8. If the user asks about a visual problem (e.g., leaf discoloration) but hasn't sent a photo, explain that you cannot give a precise diagnosis without seeing the plant, but you can suggest a few common possibilities.

        Language rule:  
        - If the user writes in Persian (Farsi), you MUST reply in Persian.  
        - If the user writes in English, you MUST reply in English.  
        - Do not mix languages. Always match the user's language.

        Now the conversation history (last 10 messages at most) will be provided, followed by the user's new question.
    """

    # ---- 1. GEMINI EXECUTION BLOCK ----
    if USE_GEMINI:
        try:
            gemini_history = []
            if chat_history:
                for msg in chat_history[-10:]:
                    # Map role from 'assistant' to Gemini's expected 'model'
                    role = 'model' if msg['role'] in ['assistant', 'model'] else 'user'
                    gemini_history.append(
                        types.Content(role=role, parts=[types.Part.from_text(text=msg['content'])])
                    )

            chat = client.chats.create(
                model=CHAT_MODEL,
                config=types.GenerateContentConfig(
                    system_instruction=system_prompt,
                    temperature=0.7,
                    max_output_tokens=600,
                ),
                history=gemini_history
            )

            response = chat.send_message(user_question)
            return response.text.strip()

        except APIError as api_err:
            print(f"Google GenAI Chat Error: {repr(api_err)}")
            return "خطایی در دریافت پاسخ از سرور گوگل رخ داد. لطفاً دوباره تلاش کنید."
        except Exception as e:
            print(f"Unexpected Gemini Chat Error: {repr(e)}")
            return "خطای غیرمنتظره‌ای در سیستم چت رخ داده است."

    # ---- 2. OPENAI / AVALAI EXECUTION BLOCK ----
    else:
        messages = [{"role": "system", "content": system_prompt}]
        if chat_history:
            for msg in chat_history[-10:]:
                messages.append(msg)
        messages.append({"role": "user", "content": user_question})

        try:
            openai_client = OpenAI(
                base_url="https://api.avalai.ir/v1",
                api_key=AVALAI_API_KEY
            )

            response = openai_client.chat.completions.create(
                model=CHAT_MODEL,
                messages=messages,
                temperature=0.7,
                max_tokens=600,
                timeout=45
            )
            return response.choices[0].message.content.strip()

        except (APIConnectionError, APITimeoutError) as net_err:
            print(f"Network error with AvalAI client: {repr(net_err)}")
            return "خطایی در ارتباط با سرور هوش مصنوعی رخ داد. لطفاً بعداً تلاش کنید."
        except Exception as e:
            print(f"Exception in get_plant_chat_response: {repr(e)}")
            return "متاسفانه در حال حاضر سرویس هوش مصنوعی دچار مشکل شده است. لطفاً چند دقیقه دیگر تلاش کنید."