# services.py
import logging
import random

from django.conf import settings
from django.core.mail import send_mail
from sms_ir import SmsIr
from users.utils import to_sms_ir_format

logger = logging.getLogger(__name__)


def send_otp_email(email, code):
    subject = "Your verification code"
    message = f"Your verification code is: {code}\nThis code expires in 5 minutes."
    from_email = settings.DEFAULT_FROM_EMAIL
    recipient_list = [email]
    send_mail(subject, message, from_email, recipient_list)


def send_or_simulate_otp_email(email, code):
    if settings.OTP_SIMULATION_MODE:
        logger.info(f"[SIMULATED EMAIL OTP] {email}: {code}")
        return {
            "simulated": True,
            "channel": "email",
            "recipient": email,
            "otp_code": code,
        }

    send_otp_email(email, code)
    return {"simulated": False, "channel": "email", "recipient": email}


class SmsIrService:
    def __init__(self):
        self.api_key = settings.SMS_IR_API_KEY
        self.line_number = settings.SMS_IR_LINE_NUMBER
        self.sms_ir = SmsIr(self.api_key, self.line_number)

    def send_verification_code(self, mobile_number, template_id, parameters):

        sms_ir_mobile = to_sms_ir_format(mobile_number)
        print(sms_ir_mobile)
        try:
            response = self.sms_ir.send_verify_code(
                sms_ir_mobile, template_id, parameters
            )

            if response.status_code == 200:
                data = response.json()
                if data.get("status") == 1:
                    logger.info(f"OTP sent successfully to {mobile_number}")
                    return data
                else:
                    error_msg = data.get("message", "Unknown error")
                    raise Exception(f"SMS sending failed: {error_msg}")
            else:
                raise Exception(f"HTTP error {response.status_code}")
        except Exception as e:
            logger.exception(f"Exception in sending OTP to {mobile_number}")
            raise e


def generate_otp_code():
    return str(random.randint(100000, 999999))


def send_or_simulate_phone_otp(mobile_number, code, sms_service=None):
    if settings.OTP_SIMULATION_MODE:
        logger.info(f"[SIMULATED SMS OTP] {mobile_number}: {code}")
        return {
            "simulated": True,
            "channel": "phone",
            "recipient": mobile_number,
            "otp_code": code,
        }

    service = sms_service or SmsIrService()
    service.send_verification_code(
        mobile_number,
        settings.SMS_IR_OTP_TEMPLATE_ID,
        [{"name": "CODE", "value": code}],
    )
    return {"simulated": False, "channel": "phone", "recipient": mobile_number}
