from django.core.management.base import BaseCommand
from diseases.models import Disease

class Command(BaseCommand):
    help = 'Populate the database with sample disease data'

    def handle(self, *args, **options):
        # Sample diseases data
        sample_diseases = [
            {
                'name': 'Fusarium Wilt',
                'description': 'A fungal disease that causes wilting of the plant.',
                'symptoms': 'Wilting leaves, softening of stem, discoloration of roots',
                'solution': 'Use appropriate fungicide, reduce watering, relocate plant',
                'severity_level': 'high',
                'prevention_methods': 'Use sterile soil, isolate infected plants',
                'treatment_duration': '2-4 weeks',
                'spread_rate': 'moderate'
            },
            {
                'name': 'Leaf Spot Disease',
                'description': 'A fungal disease that creates various spots on leaves.',
                'symptoms': 'Brown or white spots on leaves, yellowing of leaves',
                'solution': 'Remove infected leaves, use fungicide',
                'severity_level': 'medium',
                'prevention_methods': 'Proper ventilation, avoid wetting leaves',
                'treatment_duration': '1-2 weeks',
                'spread_rate': 'slow'
            },
            {
                'name': 'Whitefly Pest',
                'description': 'A pest that feeds on plant leaves.',
                'symptoms': 'Moving white spots on leaves, yellowing of leaves',
                'solution': 'Use insecticidal sprays, wash leaves',
                'severity_level': 'medium',
                'prevention_methods': 'Regular inspection of plants, maintain cleanliness',
                'treatment_duration': '1-2 weeks',
                'spread_rate': 'fast'
            },
            {
                'name': 'Spider Mites',
                'description': 'Small mites that create web-like structures on plants.',
                'symptoms': 'Webbing on plant, small spots on leaves',
                'solution': 'Increase humidity, use miticide',
                'severity_level': 'medium',
                'prevention_methods': 'Maintain proper humidity, isolate infected plants',
                'treatment_duration': '1-2 weeks',
                'spread_rate': 'moderate'
            }
        ]

        # Add sample diseases to the database
        for disease_data in sample_diseases:
            disease, created = Disease.objects.get_or_create(
                name=disease_data['name'],
                defaults=disease_data
            )
            if created:
                self.stdout.write(
                    self.style.SUCCESS(f'Added disease: {disease.name}')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'Disease already exists: {disease.name}')
                )

        self.stdout.write(
            self.style.SUCCESS('Disease data populated successfully!')
        )