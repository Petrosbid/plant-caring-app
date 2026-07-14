from django.contrib.auth import get_user_model
from django.urls import reverse
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework import status
from rest_framework.test import APITestCase
from unittest.mock import patch

User = get_user_model()

class ConfidenceThresholdTests(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(username="testuser", password="testpassword", email="test@test.com")
        self.identify_url = reverse('plant-identify')
        self.diagnose_url = reverse('disease-diagnose')
        self.image = SimpleUploadedFile("test_leaf.jpg", b"file_content", content_type="image/jpeg")

    @patch('plants.views.predict_plant')
    def test_plant_identify_low_confidence_en(self, mock_predict):
        # Setup mock for predict_plant returning low confidence (50%)
        mock_predict.return_value = {
            'id': None,
            'name': 'Test Plant',
            'common_name': 'Test Plant',
            'scientific_name': 'Testus plantus',
            'confidence': 50.0,
            'error': None
        }
        self.client.force_authenticate(user=self.user)
        response = self.client.post(self.identify_url + '?lang=en', {'image': self.image}, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Your photo is not good enough", response.data['error'])

    @patch('plants.views.predict_plant')
    def test_plant_identify_low_confidence_fa(self, mock_predict):
        # Setup mock for predict_plant returning low confidence (50%)
        mock_predict.return_value = {
            'id': None,
            'name': 'Test Plant',
            'common_name': 'Test Plant',
            'scientific_name': 'Testus plantus',
            'confidence': 50.0,
            'error': None
        }
        self.client.force_authenticate(user=self.user)
        response = self.client.post(self.identify_url + '?lang=fa', {'image': self.image}, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("کیفیت عکس شما مناسب نیست", response.data['error'])

    @patch('diseases.views.predict_disease')
    def test_disease_diagnose_low_confidence_en(self, mock_predict):
        # Setup mock for predict_disease returning low confidence (40%)
        mock_predict.return_value = {
            'id': None,
            'name': 'Powdery Mildew',
            'details': None,
            'confidence': 40.0
        }
        response = self.client.post(self.diagnose_url + '?lang=en', {'image': self.image}, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Your photo is not good enough", response.data['error'])

    @patch('diseases.views.predict_disease')
    def test_disease_diagnose_low_confidence_fa(self, mock_predict):
        # Setup mock for predict_disease returning low confidence (40%)
        mock_predict.return_value = {
            'id': None,
            'name': 'Powdery Mildew',
            'details': None,
            'confidence': 40.0
        }
        response = self.client.post(self.diagnose_url + '?lang=fa', {'image': self.image}, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("کیفیت عکس شما مناسب نیست", response.data['error'])
