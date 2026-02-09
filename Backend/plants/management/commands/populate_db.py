from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from plants.models import Plant
from diseases.models import Disease
from gardens.models import UserPlant
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
                self.stdout.write(
                    self.style.SUCCESS('Created sample user')
                )
            else:
                self.stdout.write(
                    self.style.WARNING('Sample user already exists')
                )
            
            # Sample plants data
            sample_plants = [
                {
                    'farsi_name': 'گل رز',
                    'scientific_name': 'Rosa damascena',
                    'description': 'گل رز یکی از زیباترین گل‌های دنیا است که علاوه بر زیبایی، معطر نیز می‌باشد.',
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
                    'farsi_name': 'درخت چوب بخور',
                    'scientific_name': 'Ficus elastica',
                    'description': 'درخت چوب بخور یا فیکوس الاستیکا یکی از گیاهان دکوراسیونی محبوب است.',
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
                    'farsi_name': 'صداوک',
                    'scientific_name': 'Sansevieria trifasciata',
                    'description': 'صداوک یا مار زمینی یک گیاه مقاوم و کم‌نیاز است که برای تازه کارها مناسب است.',
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
                },
                {
                    'farsi_name': 'گل داوودی',
                    'scientific_name': 'Narcissus pseudonarcissus',
                    'description': 'گل داوودی یکی از گل‌های بهاره و معطر است که اغلب در باغ‌ها کاشته می‌شود.',
                    'is_toxic': True,
                    'watering_frequency': 'when soil is dry',
                    'light_requirements': 'Full sun',
                    'fertilizer_schedule': 'At planting time and in early spring',
                    'temperature_range': '10-20°C',
                    'humidity_level': '40-60%',
                    'soil_type': 'Well-draining fertile soil',
                    'pruning_info': 'Remove spent flowers to prevent seed formation.',
                    'propagation_methods': 'Bulb division after foliage dies back.',
                    'care_difficulty': 'easy'
                },
                {
                    'farsi_name': 'گل افرا',
                    'scientific_name': 'Magnolia grandiflora',
                    'description': 'گل افرا یک درخت زیبا با گل‌های بزرگ و معطر است که در مناطق گرم مناسب است.',
                    'is_toxic': False,
                    'watering_frequency': 'weekly during dry periods',
                    'light_requirements': 'Full sun to partial shade',
                    'fertilizer_schedule': 'Twice a year in spring and fall',
                    'temperature_range': '10-25°C',
                    'humidity_level': '50-70%',
                    'soil_type': 'Acidic, well-draining soil',
                    'pruning_info': 'Prune immediately after flowering.',
                    'propagation_methods': 'Seed propagation or air layering.',
                    'care_difficulty': 'hard'
                }
            ]
            
            # Add sample plants to the database
            for plant_data in sample_plants:
                # Remove the old image field from the data if it exists
                plant_data_copy = plant_data.copy()
                if 'image' in plant_data_copy:
                    plant_data_copy.pop('image')

                # Only use farsi_name as the unique field for get_or_create
                plant, created = Plant.objects.get_or_create(
                    farsi_name=plant_data_copy['farsi_name'],
                    defaults=plant_data_copy
                )
                if created:
                    self.stdout.write(
                        self.style.SUCCESS(f'Added plant: {plant.farsi_name}')
                    )
                else:
                    self.stdout.write(
                        self.style.WARNING(f'Plant already exists: {plant.farsi_name}')
                    )
            
            # Sample diseases data
            sample_diseases = [
                {
                    'name': 'پژمردگی فوزاریوم',
                    'description': 'بیماری قارچی که باعث پژمردن گیاه می‌شود.',
                    'symptoms': 'پژمردن برگ‌ها، نرم شدن ساقه، تغییر رنگ ریشه‌ها',
                    'solution': 'استفاده از قارچ‌کش مناسب، کاهش آبیاری، جابجایی گیاه',
                    'severity_level': 'high',
                    'prevention_methods': 'استفاده از خاک استریل، دوره از هم گیاهان آلوده',
                    'treatment_duration': '2-4 weeks',
                    'spread_rate': 'moderate'
                },
                {
                    'name': 'لکه‌های قارچی برگ',
                    'description': 'بیماری قارچی که لکه‌های مختلفی روی برگ ایجاد می‌کند.',
                    'symptoms': 'لکه‌های قهوه‌ای یا سفید روی برگ‌ها، زرد شدن برگ‌ها',
                    'solution': 'حذف برگ‌های آلوده، استفاده از قارچ‌کش',
                    'severity_level': 'medium',
                    'prevention_methods': 'تهویه مناسب، جلوگیری از خیس شدن برگ‌ها',
                    'treatment_duration': '1-2 weeks',
                    'spread_rate': 'slow'
                },
                {
                    'name': 'سوسک سفید',
                    'description': 'آفتی که بر روی برگ‌های گیاه تغذیه می‌کند.',
                    'symptoms': 'نقطه‌های سفید حرکت‌کننده روی برگ، زرد شدن برگ‌ها',
                    'solution': 'استفاده از مواد کشنده آفات، شستشوی برگ‌ها',
                    'severity_level': 'medium',
                    'prevention_methods': 'بررسی منظم گیاهان، حفظ تمیزی محیط',
                    'treatment_duration': '1-2 weeks',
                    'spread_rate': 'fast'
                },
                {
                    'name': 'کنه تارعنکبوتی',
                    'description': 'کنه‌های کوچکی که شبکه‌های تاری روی گیاه ایجاد می‌کنند.',
                    'symptoms': 'شبکه تار روی گیاه، نقاط کوچک روی برگ‌ها',
                    'solution': 'افزایش رطوبت، استفاده از کنه‌کش',
                    'severity_level': 'medium',
                    'prevention_methods': 'حفظ رطوبت مناسب، دوره از هم گیاهان آلوده',
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
            
            # Link some diseases to plants
            try:
                rose = Plant.objects.get(farsi_name='گل رز')
                ficus = Plant.objects.get(farsi_name='درخت چوب بخور')
                snake_plant = Plant.objects.get(farsi_name='صداوک')
                
                fusarium_wilt = Disease.objects.get(name='پژمردگی فوزاریوم')
                leaf_spot = Disease.objects.get(name='لکه‌های قارچی برگ')
                
                # Associate diseases with plants
                rose.diseases.add(fusarium_wilt, leaf_spot)
                ficus.diseases.add(fusarium_wilt)
                snake_plant.diseases.add(leaf_spot)
                
                self.stdout.write(
                    self.style.SUCCESS('Successfully linked diseases to plants')
                )
            except Plant.DoesNotExist:
                self.stdout.write(
                    self.style.ERROR('Some plants were not found to link diseases')
                )
            except Disease.DoesNotExist:
                self.stdout.write(
                    self.style.ERROR('Some diseases were not found to link to plants')
                )
        
        self.stdout.write(
            self.style.SUCCESS('Database populated with sample data successfully!')
        )