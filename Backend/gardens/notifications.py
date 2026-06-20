import requests
import logging

logger = logging.getLogger(__name__)

def send_push_notification(push_token, title, body, data=None):
    """
    Sends a push notification to an Expo push token.
    """
    if not push_token or not push_token.startswith("ExponentPushToken"):
        logger.warning(f"Invalid or empty push token '{push_token}', skipping notification.")
        return False
        
    url = "https://exp.host/--/api/v2/push/send"
    headers = {
        "Content-Type": "application/json",
        "accept": "application/json",
        "accept-encoding": "gzip, deflate",
    }
    
    payload = {
        "to": push_token,
        "title": title,
        "body": body,
        "sound": "default",
    }
    
    if data:
        payload["data"] = data
        
    try:
        response = requests.post(url, headers=headers, json=payload, timeout=10)
        response_data = response.json()
        if response.status_code == 200:
            logger.info(f"Notification sent successfully to {push_token}: {response_data}")
            return True
        else:
            logger.error(f"Failed to send notification. Status: {response.status_code}, Response: {response_data}")
            return False
    except Exception as e:
        logger.exception(f"Exception occurred while sending push notification: {e}")
        return False
