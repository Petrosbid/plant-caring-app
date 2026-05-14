# utils.py
import re

def normalize_phone_number(phone: str) -> str:
    """تبدیل شماره به فرمت بین‌المللی +98... (برای ذخیره در دیتابیس و مقایسه)"""
    phone = re.sub(r'\D', '', phone)

    if phone.startswith('0098'):
        phone = '+' + phone[2:]
    elif phone.startswith('98'):
        phone = '+' + phone
    elif phone.startswith('0'):
        phone = '+98' + phone[1:]
    elif not phone.startswith('+'):
        phone = '+98' + phone

    pattern = re.compile(r'^\+98(9[0-9]{9})$')
    if not pattern.match(phone):
        raise ValueError("شماره تلفن معتبر نیست")
    return phone

def to_sms_ir_format(phone: str) -> str:

    normalized = normalize_phone_number(phone)
    if normalized.startswith('+98'):
        return normalized[3:]
    if normalized.startswith('0'):
        return normalized[1:]
    return normalized