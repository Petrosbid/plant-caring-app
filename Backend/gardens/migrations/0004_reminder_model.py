# Generated manually for the Reminder model
from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('gardens', '0003_userplant_fertilizing_interval_days_and_more'),
        ('plants', '0002_remove_plant_care_guide_plant_care_difficulty_and_more'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Reminder',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=200)),
                ('description', models.TextField(blank=True)),
                ('care_type', models.CharField(choices=[('watering', 'Watering'), ('fertilizing', 'Fertilizing'), ('pruning', 'Pruning'), ('pest_control', 'Pest Control'), ('repotting', 'Repotting'), ('other', 'Other')], default='watering', max_length=20)),
                ('scheduled_date', models.DateTimeField()),
                ('is_completed', models.BooleanField(default=False)),
                ('is_recurring', models.BooleanField(default=False)),
                ('recurrence_interval', models.IntegerField(blank=True, help_text='Interval in days for recurring reminders', null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='reminders', to=settings.AUTH_USER_MODEL)),
                ('user_plant', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='reminders', to='gardens.userplant')),
            ],
            options={
                'ordering': ['-scheduled_date'],
            },
        ),
    ]