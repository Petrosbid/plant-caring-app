// src/constants/filters.ts

export const PLANT_FILTERS = {
  watering_frequency: {
    labelEn: 'Watering',
    labelFa: 'میزان آب',
    values: [
      { en: 'Very Low', fa: 'خیلی کم', query: 'very low' },
      { en: 'Low', fa: 'کم', query: 'low' },
      { en: 'Medium', fa: 'متوسط', query: 'medium' },
      { en: 'High', fa: 'زیاد', query: 'high' },
      { en: 'Very High', fa: 'خیلی زیاد', query: 'very high' },
    ],
  },
  fertilizer_schedule: {
    labelEn: 'Fertilizer',
    labelFa: 'کوددهی',
    values: [
      { en: 'Never', fa: 'هرگز', query: 'never' },
      { en: 'Once a year', fa: 'سالی یکبار', query: 'once a year' },
      { en: 'Every 3 months', fa: 'هر ۳ ماه', query: 'every 3 months' },
      { en: 'Monthly', fa: 'ماهانه', query: 'monthly' },
      { en: 'Every 2 weeks', fa: 'هر ۲ هفته', query: 'every 2 weeks' },
      { en: 'Weekly', fa: 'هفتگی', query: 'weekly' },
    ],
  },
  light_requirements: {
    labelEn: 'Light',
    labelFa: 'نور',
    values: [
      { en: 'Low Light', fa: 'نور کم', query: 'low light' },
      { en: 'Medium Indirect', fa: 'نور غیرمستقیم متوسط', query: 'medium indirect light' },
      { en: 'Bright Indirect', fa: 'نور غیرمستقیم زیاد', query: 'bright indirect light' },
      { en: 'Direct Sun', fa: 'نور مستقیم', query: 'direct sun' },
      { en: 'Full/Partial Sun', fa: 'آفتاب کامل تا نیمه‌سایه', query: 'full sun to partial shade' },
    ],
  },
  care_difficulty: {
    labelEn: 'Difficulty',
    labelFa: 'سختی',
    values: [
      { en: 'Easy', fa: 'آسان', query: 'easy' },
      { en: 'Medium', fa: 'متوسط', query: 'medium' },
      { en: 'Hard', fa: 'سخت', query: 'hard' },
    ],
  },
  humidity_level: {
    labelEn: 'Humidity',
    labelFa: 'رطوبت',
    values: [
      { en: 'Low', fa: 'کم', query: 'low' },
      { en: 'Moderate', fa: 'متوسط', query: 'moderate' },
      { en: 'High', fa: 'زیاد', query: 'high' },
      { en: 'Very High', fa: 'خیلی زیاد', query: 'very high' },
    ],
  },
  temperature_range: {
    labelEn: 'Temperature',
    labelFa: 'دما',
    values: [
      { en: '10-15°C', fa: '۱۰-۱۵ درجه', query: '10-15°C' },
      { en: '15-20°C', fa: '۱۵-۲۰ درجه', query: '15-20°C' },
      { en: '18-24°C', fa: '۱۸-۲۴ درجه', query: '18-24°C' },
      { en: '20-30°C', fa: '۲۰-۳۰ درجه', query: '20-30°C' },
      { en: 'Above 15°C', fa: 'بالای ۱۵ درجه', query: 'above 15°C' },
      { en: 'Above 20°C', fa: 'بالای ۲۰ درجه', query: 'above 20°C' },
    ],
  },
  soil_type: {
    labelEn: 'Soil',
    labelFa: 'خاک',
    values: [
      { en: 'Cactus Mix', fa: 'خاک کاکتوس', query: 'cactus mix' },
      { en: 'Succulent Mix', fa: 'خاک ساکولنت', query: 'succulent mix' },
      { en: 'Standard Potting', fa: 'خاک گلدان استاندارد', query: 'standard potting mix' },
      { en: 'Peat-based', fa: 'خاک پیت', query: 'peat-based mix' },
      { en: 'Loamy Soil', fa: 'خاک لومی', query: 'loamy soil' },
      { en: 'Orchid Bark', fa: 'پوست درخت ارکیده', query: 'orchid bark mix' },
    ],
  },
  is_toxic: {
    labelEn: 'Toxicity',
    labelFa: 'سمی بودن',
    values: [
      { en: 'Toxic', fa: 'سمی', query: 'true' },
      { en: 'Non-toxic', fa: 'غیرسمی', query: 'false' },
    ],
  },
  pruning_info: {
    labelEn: 'Pruning',
    labelFa: 'هرس',
    values: [
      { en: 'Minimal', fa: 'حداقل', query: 'minimal' },
      { en: 'Light', fa: 'سبک', query: 'light pruning' },
      { en: 'Regular', fa: 'معمولی', query: 'regular pruning' },
      { en: 'Heavy', fa: 'سنگین', query: 'heavy pruning' },
    ],
  },
  propagation_methods: {
    labelEn: 'Propagation',
    labelFa: 'تکثیر',
    values: [
      { en: 'Stem Cuttings', fa: 'قلمه ساقه', query: 'stem cuttings' },
      { en: 'Leaf Cuttings', fa: 'قلمه برگ', query: 'leaf cuttings' },
      { en: 'Root Division', fa: 'تقسیم ریشه', query: 'root division' },
      { en: 'Seeds', fa: 'بذر', query: 'seeds' },
      { en: 'Air Layering', fa: 'خوابانیدن هوایی', query: 'air layering' },
      { en: 'Offsets / Pups', fa: 'پاجوش', query: 'offsets / pups' },
    ],
  },
};

export const PLANT_SORT_OPTIONS = [
  { key: '-created_at', labelEn: 'Newest', labelFa: 'جدیدترین' },
  { key: '-view_count', labelEn: 'Most Viewed', labelFa: 'پربازدیدترین' },
  { key: '-favourite_count', labelEn: 'Most Favorited', labelFa: 'محبوب‌ترین' },
  { key: '-garden_count', labelEn: 'Most in Garden', labelFa: 'بیشترین در باغچه' },
];

export const DISEASE_FILTERS = {
  severity_level: {
    labelEn: 'Severity',
    labelFa: 'شدت بیماری',
    values: [
      { en: 'Low', fa: 'کم', query: 'low' },
      { en: 'Medium', fa: 'متوسط', query: 'medium' },
      { en: 'High', fa: 'زیاد', query: 'high' },
      { en: 'Critical', fa: 'بحرانی', query: 'critical' },
    ],
  },
  spread_rate: {
    labelEn: 'Spread Rate',
    labelFa: 'سرعت انتشار',
    values: [
      { en: 'Slow', fa: 'کند', query: 'slow' },
      { en: 'Moderate', fa: 'متوسط', query: 'moderate' },
      { en: 'Fast', fa: 'سریع', query: 'fast' },
    ],
  },
};

export const DISEASE_SORT_OPTIONS = [
  { key: '-created_at', labelEn: 'Newest', labelFa: 'جدیدترین' },
  { key: '-view_count', labelEn: 'Most Viewed', labelFa: 'پربازدیدترین' },
  { key: '-comment_count', labelEn: 'Most Discussed', labelFa: 'پرمبحث‌ترین' },
  { key: 'name', labelEn: 'Name A-Z', labelFa: 'نام الفبایی' },
];

export const BLOG_SORT_OPTIONS = [
  { key: '-publish', labelEn: 'Newest', labelFa: 'جدیدترین' },
  { key: '-view_count', labelEn: 'Most Viewed', labelFa: 'پربازدیدترین' },
  { key: 'title', labelEn: 'Title A-Z', labelFa: 'عنوان الفبایی' },
];

export const REMINDER_FILTERS = {
  care_type: {
    labelEn: 'Care Type',
    labelFa: 'نوع مراقبت',
    values: [
      { en: 'Watering', fa: 'آبیاری', query: 'watering' },
      { en: 'Fertilizing', fa: 'کوددهی', query: 'fertilizing' },
      { en: 'Pruning', fa: 'هرس', query: 'pruning' },
      { en: 'Repotting', fa: 'تعویض گلدان', query: 'repotting' },
    ],
  },
  status: {
    labelEn: 'Status',
    labelFa: 'وضعیت',
    values: [
      { en: 'Pending', fa: 'در انتظار', query: 'pending' },
      { en: 'Completed', fa: 'انجام شده', query: 'completed' },
    ],
  },
};

export const REMINDER_SORT_OPTIONS = [
  { key: 'scheduled_date', labelEn: 'Oldest First', labelFa: 'قدیمی‌ترین' },
  { key: '-scheduled_date', labelEn: 'Soonest First', labelFa: 'نزدیک‌ترین زمان' },
  { key: 'title', labelEn: 'Alphabetical', labelFa: 'الفبایی' },
];

export const GARDEN_SORT_OPTIONS = [
  { key: '-created_at', labelEn: 'Recently Added', labelFa: 'اخیراً اضافه شده' },
  { key: 'plant__english_name', labelEn: 'Name A-Z', labelFa: 'نام الفبایی' },
  { key: '-health_status', labelEn: 'Health Status', labelFa: 'وضعیت سلامت' },
];
