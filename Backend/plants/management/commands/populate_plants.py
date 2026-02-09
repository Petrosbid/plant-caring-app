from django.core.management.base import BaseCommand
from plants.models import Plant
from diseases.models import Disease

class Command(BaseCommand):
    help = 'Populate the database with sample plant data'

    def handle(self, *args, **options):
        # Sample plants data
        plants_data = [
            {
                'farsi_name': 'Rose',
                'scientific_name': 'Rosa damascena',
                'description': 'Beautiful fragrant flower',
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
                'farsi_name': 'Rubber Plant',
                'scientific_name': 'Ficus elastica',
                'description': 'Popular ornamental plant',
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
                'description': 'Hardy and low-maintenance plant',
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

        for plant_data in plants_data:
            plant, created = Plant.objects.get_or_create(
                farsi_name=plant_data['farsi_name'],
                defaults=plant_data
            )
            if created:
                self.stdout.write(
                    self.style.SUCCESS(f'Added plant: {plant.farsi_name}')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'Plant already exists: {plant.farsi_name}')
                )

        # Link some diseases to plants
        try:
            rose = Plant.objects.get(farsi_name='Rose')
            rubber_plant = Plant.objects.get(farsi_name='Rubber Plant')
            snake_plant = Plant.objects.get(farsi_name='Snake Plant')

            fusarium_wilt = Disease.objects.get(name='Fusarium Wilt')
            leaf_spot = Disease.objects.get(name='Leaf Spot Disease')

            # Associate diseases with plants
            rose.diseases.add(fusarium_wilt, leaf_spot)
            rubber_plant.diseases.add(fusarium_wilt)
            snake_plant.diseases.add(leaf_spot)

            self.stdout.write(
                self.style.SUCCESS('Successfully linked diseases to plants')
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error linking diseases to plants: {e}')
            )

        self.stdout.write(
            self.style.SUCCESS('Plant data populated successfully!')
        )