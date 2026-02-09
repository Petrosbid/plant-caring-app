from django.apps import AppConfig


class GardensConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'gardens'

    def ready(self):
        import gardens.signals  # Import signals if any
