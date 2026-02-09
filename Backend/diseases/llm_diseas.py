import requests
import json
from django.conf import settings

# تنظیمات اولیه (از همان تنظیمات قبلی استفاده می‌کند)
OPENROUTER_API_KEY = getattr(settings, 'OPENROUTER_API_KEY', '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')


def get_disease_details_from_llm(disease_name, plant_name=None):
    """
    Get detailed disease information and treatment steps from LLM.

    Args:
        disease_name (str): Name of the disease (e.g., "Powdery Mildew" or "سفیدک سطحی")
        plant_name (str, optional): Name of the specific plant affected (helps context)

    Returns:
        dict: Dictionary containing disease description and list of solutions.
    """

    # اگر نام گیاه داده شده باشد، در پرامپت لحاظ می‌شود تا راهکار دقیق‌تر باشد
    context_str = f"for the plant '{plant_name}'" if plant_name else "for plants"

    # 1. پرامپت تخصصی برای بیماری‌شناسی
    system_prompt = f"""
You are an expert plant pathologist and botanist. I will give you a plant disease name {context_str}.
You must provide a diagnosis, explanation, and a step-by-step treatment plan in Persian (Farsi).

Return ONLY a raw JSON object (no markdown formatting like ```json).
The JSON must strictly follow this structure:
{{
    "disease_name_fa": "نام علمی و رایج بیماری به فارسی",
    "description": "توضیح کامل درباره چیستی بیماری، علائم ظاهری و علت به وجود آمدن آن (در یک پاراگراف)",
    "severity": "میزان خطر (کم/متوسط/کشنده)",
    "is_infectious": "آیا به گیاهان دیگر سرایت میکند؟ (بله/خیر)",
    "treatment_steps": [
        "راهکار اول (مثلا: جدا کردن برگ‌های بیمار)",
        "راهکار دوم (مثلا: نحوه آبیاری صحیح)",
        "راهکار سوم (مثلا: نام سم یا قارچ‌کش مناسب خانگی یا شیمیایی)"
    ],
    "prevention": "یک توصیه کوتاه برای پیشگیری از ابتلای مجدد"
}}
IMPORTANT: 'treatment_steps' MUST be a JSON Array (List) of strings.
"""

    try:
        # 2. ارسال درخواست
        response = requests.post(
            url="https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                "Content-Type": "application/json",
                "HTTP-Referer": "https://your-plant-app.com",
                "X-Title": "Plant Doctor App",
            },
            json={
                "model": "tngtech/deepseek-r1t2-chimera:free",  # یا هر مدل دلخواه دیگر
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"Disease name: {disease_name}"}
                ],
                "response_format": {"type": "json_object"}
            },
            timeout=60  # زمان کمی بیشتر برای تولید لیست راهکارها
        )

        # 3. دریافت و پردازش
        if response.status_code == 200:
            content = response.json()["choices"][0]["message"]["content"]

            # تمیزکاری (همانند کد شما)
            if content.startswith("```json"):
                content = content.replace("```json", "").replace("```", "")
            elif content.startswith("```"):
                content = content.replace("```", "")

            try:
                disease_data = json.loads(content)

                # یک چک نهایی برای اطمینان از اینکه treatment_steps حتما لیست است
                if not isinstance(disease_data.get('treatment_steps'), list):
                    # اگر اشتباها رشته فرستاد، تبدیل به لیست تک‌آیتمی کن
                    disease_data['treatment_steps'] = [str(disease_data.get('treatment_steps'))]

                return disease_data

            except json.JSONDecodeError:
                print("Error Parsing Disease JSON:", repr(content))
                return None
        else:
            print("Error API:", response.status_code, repr(response.text))
            return None

    except Exception as e:
        print(f"Error calling LLM API for Disease: {repr(e)}")
        return None


# ==========================================
# نحوه استفاده (مثال)
# ==========================================
if __name__ == "__main__":
    # سناریو: مدل تشخیص تصویر گفته بیماری "Root Rot" (پوسیدگی ریشه) است
    disease_info = get_disease_details_from_llm("Root Rot", plant_name="Sansevieria")

    if disease_info:
        print("\nنام بیماری:", disease_info['disease_name_fa'])
        print("\nتوضیحات:", disease_info['description'])
        print("\nمیزان خطر:", disease_info['severity'])

        print("\n--- راهکارهای درمانی ---")
        for step in disease_info['treatment_steps']:
            print(f"✅ {step}")

        print("\nپیشگیری:", disease_info['prevention'])