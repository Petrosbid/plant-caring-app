from django.contrib import admin
from django.utils.html import format_html
from .models import Plant, PlantImage, PlantComment, PlantFavourite


class PlantImageInline(admin.TabularInline):
    model = PlantImage
    extra = 1  # تعداد فیلدهای خالی برای افزودن تصویر جدید
    fields = ('image', 'caption', 'is_primary', 'created_at', 'image_preview')
    readonly_fields = ('created_at', 'image_preview')
    ordering = ('-is_primary', 'created_at')

    def image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="width: 80px; height: auto;" />', obj.image.url)
        return "بدون تصویر"
    image_preview.short_description = "پیش‌نمایش"


class PlantCommentInline(admin.TabularInline):
    model = PlantComment
    extra = 0
    fields = ('user', 'content', 'is_approved', 'created_at', 'parent')
    readonly_fields = ('created_at',)
    raw_id_fields = ('user', 'parent')
    show_change_link = True


@admin.register(Plant)
class PlantAdmin(admin.ModelAdmin):
    list_display = ('farsi_name', 'english_name', 'scientific_name', 'is_toxic',
                    'care_difficulty', 'favourite_count', 'comment_count', 'view_count')
    search_fields = ('farsi_name', 'english_name', 'other_names', 'other_names_en', 'scientific_name', 'description', 'description_en')
    list_filter = ('is_toxic', 'care_difficulty', 'created_at')
    prepopulated_fields = {}
    readonly_fields = ('view_count', 'garden_count', 'favourite_count', 'comment_count',
                       'created_at', 'updated_at')
    fieldsets = (
        ('اطلاعات اصلی', {
            'fields': ('farsi_name', 'english_name', 'other_names', 'other_names_en', 'scientific_name', 'description', 'description_en', 'is_toxic')
        }),
        ('راهنمای نگهداری (فارسی)', {
            'fields': ('watering_frequency', 'light_requirements', 'fertilizer_schedule',
                       'temperature_range', 'humidity_level', 'soil_type', 'pruning_info')
        }),
        ('راهنمای نگهداری (انگلیسی)', {
            'fields': ('watering_frequency_en', 'light_requirements_en', 'fertilizer_schedule_en',
                       'temperature_range_en', 'humidity_level_en', 'soil_type_en', 'pruning_info_en')
        }),
        ('تکثیر', {
            'fields': ('propagation_methods', 'propagation_methods_en')
        }),
        ('سختی مراقبت و آمار', {
            'fields': ('care_difficulty', 'view_count', 'garden_count', 'favourite_count', 'comment_count')
        }),
        ('زمان‌ها', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    inlines = [PlantImageInline, PlantCommentInline]


@admin.register(PlantImage)
class PlantImageAdmin(admin.ModelAdmin):
    list_display = ('id', 'plant', 'image_preview', 'caption', 'is_primary', 'created_at')
    list_filter = ('is_primary', 'created_at', 'plant')
    search_fields = ('caption', 'plant__farsi_name', 'plant__english_name')
    raw_id_fields = ('plant',)
    readonly_fields = ('created_at', 'image_preview')
    fields = ('plant', 'image', 'caption', 'is_primary', 'created_at', 'image_preview')

    def image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="width: 100px; height: auto;" />', obj.image.url)
        return "بدون تصویر"
    image_preview.short_description = "پیش‌نمایش"


@admin.register(PlantComment)
class PlantCommentAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'plant', 'short_content', 'is_approved', 'parent', 'created_at')
    list_filter = ('is_approved', 'created_at', 'plant')
    search_fields = ('content', 'user__username', 'plant__farsi_name')
    raw_id_fields = ('user', 'plant', 'parent')
    actions = ['approve_comments', 'reject_comments']

    def short_content(self, obj):
        return obj.content[:50] + "..." if len(obj.content) > 50 else obj.content
    short_content.short_description = "متن کامنت"

    def approve_comments(self, request, queryset):
        queryset.update(is_approved=True)
    approve_comments.short_description = "تأیید کامنت‌های انتخاب شده"

    def reject_comments(self, request, queryset):
        queryset.update(is_approved=False)
    reject_comments.short_description = "عدم تأیید کامنت‌های انتخاب شده"


@admin.register(PlantFavourite)
class PlantFavouriteAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'plant', 'created_at')
    search_fields = ('user__username', 'plant__farsi_name')
    raw_id_fields = ('user', 'plant')
    list_filter = ('created_at',)