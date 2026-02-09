#!/usr/bin/env python
"""
Test script to verify the plant matching logic works correctly.
"""
import os
import sys
import django

# Add the project directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set the Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'plant_project.settings')

# Setup Django
django.setup()

from plants.ml_models import predict_plant
from plants.models import Plant
from django.db.models import Q

def test_matching_logic():
    """
    Test the plant matching logic by checking existing plants in the database
    and verifying that the matching algorithm works correctly.
    """
    print("Testing plant matching logic...")
    
    # Show existing plants in the database
    existing_plants = Plant.objects.all()
    print(f"\nFound {existing_plants.count()} plants in the database:")
    for i, plant in enumerate(existing_plants):
        print(f"  - Plant {i+1}: ID={plant.id}, Scientific='{plant.scientific_name}', Farsi length={len(plant.farsi_name)} chars")
    
    # Test cases for predicted names that might match our existing plants
    test_cases = [
        "Rosa damascena (Rose)",  # Should match Rose
        "Ficus elastica (Rubber Tree)",  # Should match Rubber Tree
        "Sansevieria trifasciata (Snake Plant)",  # Should match Snake Plant
        "Narcissus pseudonarcissus (Daffodil)",  # Might not match anything
    ]
    
    print("\nTesting plant matching:")
    for predicted_name in test_cases:
        print(f"\nTesting predicted name: '{predicted_name}'")
        
        # Simulate the matching logic from the updated predict_plant function
        detected_plant = None
        if '(' in predicted_name and ')' in predicted_name:
            scientific_part = predicted_name.split('(')[0].strip()
            common_part = predicted_name.split('(')[-1].replace(')', '').strip()
            
            # Try multiple matching strategies in order of preference:
            # 1. Match scientific name part against scientific_name field
            detected_plant = Plant.objects.filter(scientific_name__icontains=scientific_part).first()
            if not detected_plant:
                # 2. Match common name part against farsi_name field (which might contain English names)
                detected_plant = Plant.objects.filter(farsi_name__icontains=common_part).first()
            if not detected_plant:
                # 3. Match common name part against scientific_name field
                detected_plant = Plant.objects.filter(scientific_name__icontains=common_part).first()
            if not detected_plant:
                # 4. Match the full predicted name against farsi_name
                detected_plant = Plant.objects.filter(farsi_name__icontains=predicted_name).first()
        else:
            # If the format is not as expected, try to match the whole name against both fields
            detected_plant = Plant.objects.filter(
                Q(farsi_name__icontains=predicted_name) | 
                Q(scientific_name__icontains=predicted_name)
            ).first()
        
        if detected_plant:
            print(f"  [SUCCESS] Found matching plant: ID={detected_plant.id}, Scientific='{detected_plant.scientific_name}', Farsi length={len(detected_plant.farsi_name)} chars")
            print(f"    Matched with ID: {detected_plant.id}")
        else:
            print(f"  [FAILED] No matching plant found for: {predicted_name}")
    
    print("\nTest completed!")

if __name__ == "__main__":
    test_matching_logic()