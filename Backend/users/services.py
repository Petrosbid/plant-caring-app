# services.py
import logging
import random
from django.core.mail import send_mail
from sms_ir import SmsIr
from django.conf import settings

from users.utils import to_sms_ir_format

logger = logging.getLogger(__name__)


# ------------------- تابع ارسال ایمیل -------------------
def send_otp_email(email, code):
    """ارسال کد تایید از طریق ایمیل"""
    subject = 'Your verification code'
    message = f'Your verification code is: {code}\nThis code expires in 5 minutes.'
    from_email = settings.DEFAULT_FROM_EMAIL
    recipient_list = [email]
    send_mail(subject, message, from_email, recipient_list)


# ------------------- کلاس سرویس پیامک -------------------
class SmsIrService:
    def __init__(self):
        self.api_key = settings.SMS_IR_API_KEY
        self.line_number = settings.SMS_IR_LINE_NUMBER
        self.sms_ir = SmsIr(self.api_key, self.line_number)

    def send_verification_code(self, mobile_number, template_id, parameters):

        sms_ir_mobile = to_sms_ir_format(mobile_number)
        print(sms_ir_mobile)
        try:
            response = self.sms_ir.send_verify_code(sms_ir_mobile, template_id, parameters)

            if response.status_code == 200:
                data = response.json()
                if data.get('status') == 1:
                    logger.info(f"OTP sent successfully to {mobile_number}")
                    return data
                else:
                    error_msg = data.get('message', 'Unknown error')
                    raise Exception(f"SMS sending failed: {error_msg}")
            else:
                raise Exception(f"HTTP error {response.status_code}")
        except Exception as e:
            logger.exception(f"Exception in sending OTP to {mobile_number}")
            raise e


# ------------------- تابع تولید کد تصادفی -------------------
def generate_otp_code():
    return str(random.randint(100000, 999999))