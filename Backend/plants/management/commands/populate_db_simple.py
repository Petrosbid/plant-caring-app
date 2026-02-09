from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from Backend.plants.models import Plant
from Backend.diseases.models import Disease
from Backend.gardens.models import UserPlant
from django.db import transaction

class Command(BaseCommand):
    help = 'Populate the database with sample plant and disease data'

    def handle(self, *args, **options):
        User = get_user_model()
        
        with transaction.atomic():
            # Create a sample user if one doesn't exist
            sample_user, created = User.objects.get_or_create(
                username='sample_user',
                defaults={
                    'email': 'sample@example.com',
                    'first_name': 'Sample',
                    'last_name': 'User'
                }
            )
            if created:
                sample_user.set_password('sample_password')
                sample_user.save()
                print('Created sample user')
            else:
                print('Sample user already exists')
            
            # Sample plants data
            sample_plants = [
                {
                    'farsi_name': 'Rose',
                    'scientific_name': 'Rosa damascena',
                    'description': 'A beautiful fragrant flower.',
                    'is_toxic': False,
                    'watering_frequency': 'weekly',
                    'light_requirements': 'Full sun to partial shade',
                    'fertilizer_schedule': 'Monthly during growing season',
                    'temperature_range': '15-25°C',
                    'humidity_level': '40-60%',
                    'soil_type': 'Well-draining loamy soil',
                    'pruning_info': 'Prune dead or weak stems in late winter or early spring.',
                    'propagation_methods': 'Can be propagated through cuttings or grafting.',
                    'care_difficulty': 'medium'
                },
                {
                    'farsi_name': 'Rubber Tree',
                    'scientific_name': 'Ficus elastica',
                    'description': 'Popular decorative plant.',
                    'is_toxic': True,
                    'watering_frequency': 'every 2 weeks',
                    'light_requirements': 'Bright indirect light',
                    'fertilizer_schedule': 'Every 2 months during growing season',
                    'temperature_range': '18-24°C',
                    'humidity_level': '50-70%',
                    'soil_type': 'Well-draining potting mix',
                    'pruning_info': 'Prune to maintain shape and encourage bushiness.',
                    'propagation_methods': 'Propagation through stem cuttings.',
                    'care_difficulty': 'easy'
                },
                {
                    'farsi_name': 'Snake Plant',
                    'scientific_name': 'Sansevieria trifasciata',
                    'description': 'Hardy low-maintenance plant.',
                    'is_toxic': True,
                    'watering_frequency': 'every 3 weeks',
                    'light_requirements': 'Low to bright indirect light',
                    'fertilizer_schedule': 'Once every 3-4 months',
                    'temperature_range': '15-25°C',
                    'humidity_level': '30-50%',
                    'soil_type': 'Sandy, well-draining soil',
                    'pruning_info': 'Remove damaged leaves at the base.',
                    'propagation_methods': 'Division or leaf cuttings.',
                    'care_difficulty': 'easy'
                }
            ]
            
            # Add sample plants to the database
            for plant_data in sample_plants:
                # Remove the old image field from the data if it exists
                plant_data_copy = plant_data.copy()
                if 'image' in plant_data_copy:
                    plant_data_copy.pop('image')

                plant, created = Plant.objects.get_or_create(
                    farsi_name=plant_data_copy['farsi_name'],
                    defaults=plant_data_copy
                )
                if created:
                    print(f'Added plant: {plant.farsi_name}')
                else:
                    print(f'Plant already exists: {plant.farsi_name}')
            
            # Sample diseases data
            sample_diseases = [
                {
                    'name': 'Fusarium Wilt',
                    'description': 'Fungal disease causing wilting.',
                    'symptoms': 'Wilting leaves, softening stem, discoloration of roots',
                    'solution': 'Use appropriate fungicide, reduce watering, relocate plant',
                    'severity_level': 'high',
                    'prevention_methods': 'Use sterile soil, isolate infected plants',
                    'treatment_duration': '2-4 weeks',
                    'spread_rate': 'moderate'
                },
                {
                    'name': 'Leaf Spot Disease',
                    'description': 'Fungal disease creating spots on leaves.',
                    'symptoms': 'Brown or white spots on leaves, yellowing of leaves',
                    'solution': 'Remove affected leaves, use fungicide',
                    'severity_level': 'medium',
                    'prevention_methods': 'Proper ventilation, avoid wetting leaves',
                    'treatment_duration': '1-2 weeks',
                    'spread_rate': 'slow'
                }
            ]
            
            # Add sample diseases to the database
            for disease_data in sample_diseases:
                disease, created = Disease.objects.get_or_create(
                    name=disease_data['name'],
                    defaults=disease_data
                )
                if created:
                    print(f'Added disease: {disease.name}')
                else:
                    print(f'Disease already exists: {disease.name}')
            
            # Link some diseases to plants
            try:
                rose = Plant.objects.get(farsi_name='Rose')
                rubber_tree = Plant.objects.get(farsi_name='Rubber Tree')
                snake_plant = Plant.objects.get(farsi_name='Snake Plant')
                
                fusarium_wilt = Disease.objects.get(name='Fusarium Wilt')
                leaf_spot = Disease.objects.get(name='Leaf Spot Disease')
                
                # Associate diseases with plants
                rose.diseases.add(fusarium_wilt, leaf_spot)
                rubber_tree.diseases.add(fusarium_wilt)
                snake_plant.diseases.add(leaf_spot)
                
                print('Successfully linked diseases to plants')
            except Plant.DoesNotExist:
                print('Some plants were not found to link diseases')
            except Disease.DoesNotExist:
                print('Some diseases were not found to link to plants')
        
        print('Database populated with sample data successfully!')