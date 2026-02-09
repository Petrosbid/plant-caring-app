#!/usr/bin/env python
"""
Test script to verify that models can be loaded from local paths
"""

import os
import sys
import django
from django.conf import settings

# Add the parent directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Configure Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'plant_project.settings')
django.setup()

from diseases.ml_models import load_model as load_disease_model
from plants.ml_models import load_model as load_plant_model

def test_disease_model():
    """Test loading the disease model from local path"""
    print("Testing disease model loading...")
    try:
        load_disease_model()
        print("[OK] Disease model loaded successfully from local path")
        return True
    except Exception as e:
        print(f"[ERROR] Error loading disease model: {e}")
        return False

def test_plant_model():
    """Test loading the plant model from local path"""
    print("Testing plant model loading...")
    try:
        load_plant_model()
        print("[OK] Plant model loaded successfully from local path")
        return True
    except Exception as e:
        print(f"[ERROR] Error loading plant model: {e}")
        return False

if __name__ == "__main__":
    print("Testing local model loading...")
    
    disease_success = test_disease_model()
    print()  # Empty line for readability
    plant_success = test_plant_model()
    
    print("\nSummary:")
    if disease_success:
        print("- Disease model: OK")
    else:
        print("- Disease model: FAILED")

    if plant_success:
        print("- Plant model: OK")
    else:
        print("- Plant model: FAILED")

    if disease_success and plant_success:
        print("\n[SUCCESS] All models loaded successfully from local paths!")
    else:
        print("\n[FAILURE] Some models failed to load from local paths.")
        sys.exit(1)