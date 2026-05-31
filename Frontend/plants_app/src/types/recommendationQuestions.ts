// src/data/recommendationQuestions.ts

export interface QuestionOption {
  value: string;
  labelEn: string;
  labelFa: string;
}

export interface Question {
  id: string;
  section: number;
  labelEn: string;
  labelFa: string;
  type: 'radio' | 'checkbox' | 'select' | 'text' | 'boolean';
  required: boolean;
  options?: QuestionOption[];
  placeholderEn?: string;
  placeholderFa?: string;
}

export interface Section {
  id: number;
  titleEn: string;
  titleFa: string;
  descriptionEn: string;
  descriptionFa: string;
}

export const SECTIONS: Section[] = [
  {
    id: 1,
    titleEn: '🏠 Home Environment',
    titleFa: '🏠 شرایط محیطی خانه',
    descriptionEn: 'Tell us about your living space and environmental conditions',
    descriptionFa: 'درباره فضای زندگی و شرایط محیطی خود به ما بگویید',
  },
  {
    id: 2,
    titleEn: '👤 Lifestyle & Care Habits',
    titleFa: '👥 سبک زندگی و عادت‌های مراقبت',
    descriptionEn: 'How do you usually care for plants?',
    descriptionFa: 'معمولاً چگونه از گیاهان مراقبت می‌کنید؟',
  },
  {
    id: 3,
    titleEn: '🛡️ Safety & Sensitivities',
    titleFa: '🛡️ محدودیت‌ها، ایمنی و حساسیت‌ها',
    descriptionEn: 'Pets, children, allergies, and other restrictions',
    descriptionFa: 'حیوانات خانگی، کودکان، آلرژی و سایر محدودیت‌ها',
  },
  {
    id: 4,
    titleEn: '🎨 Aesthetic & Decor',
    titleFa: '🎨 سلیقه بصری، دکوراسیون و هدف',
    descriptionEn: 'Your visual preferences and interior style',
    descriptionFa: 'سلیقه بصری و سبک دکوراسیون شما',
  },
  {
    id: 5,
    titleEn: '🧠 Experience & Learning',
    titleFa: '🧠 دانش، تجربه و میل به یادگیری',
    descriptionEn: 'Your plant care experience and willingness to learn',
    descriptionFa: 'تجربه نگهداری و تمایل به یادگیری شما',
  },
];

export const QUESTIONS: Question[] = [
  // ========== بخش 1: شرایط محیطی ==========
  {
    id: 'natural_light',
    section: 1,
    labelEn: 'Natural light intensity and type?',
    labelFa: 'میزان و نوع نور طبیعی؟',
    type: 'radio',
    required: true,
    options: [
      { value: 'direct_intense', labelEn: 'Direct intense (south window, >4h direct sun)', labelFa: 'نور مستقیم و شدید (بیش از ۴ ساعت آفتاب تند)' },
      { value: 'direct_mild', labelEn: 'Direct mild (east window, morning sun)', labelFa: 'نور مستقیم ملایم (پنجره شرقی، فقط صبح‌ها)' },
      { value: 'bright_indirect', labelEn: 'Bright indirect (sheer curtain, west window)', labelFa: 'نور غیرمستقیم روشن (پشت پرده توری، پنجره غربی)' },
      { value: 'medium', labelEn: 'Medium light (1-3m from bright window)', labelFa: 'نور متوسط (فاصله ۱ تا ۳ متری از پنجره پرنور)' },
      { value: 'low', labelEn: 'Low light (corner, hallway, only lamp)', labelFa: 'نور کم (گوشه اتاق، راهرو، فقط نور لامپ)' },
      { value: 'artificial_only', labelEn: 'Only artificial light', labelFa: 'بدون نور طبیعی، فقط نور مصنوعی' },
    ],
  },
  {
    id: 'artificial_grow_light',
    section: 1,
    labelEn: 'Would you buy a grow light if needed?',
    labelFa: 'آیا حاضر به خرید لامپ رشد هستید؟',
    type: 'boolean',
    required: false,
  },
  {
    id: 'seasonal_light_change',
    section: 1,
    labelEn: 'Seasonal light change?',
    labelFa: 'تغییر نور در طول سال؟',
    type: 'radio',
    required: true,
    options: [
      { value: 'severe', labelEn: 'Severe (very hot summer, very dark winter)', labelFa: 'شدیداً زیاد می‌شود / زمستان نور کم' },
      { value: 'significant', labelEn: 'Significant change', labelFa: 'تغییر محسوس، زمستان نور کم' },
      { value: 'constant', labelEn: 'Almost constant (north window or artificial)', labelFa: 'تقریباً ثابت (نور مصنوعی یا پنجره شمالی)' },
    ],
  },
  {
    id: 'temperature_winter',
    section: 1,
    labelEn: 'Winter temperature condition?',
    labelFa: 'دمای محیط در زمستان؟',
    type: 'radio',
    required: true,
    options: [
      { value: 'cold_below15', labelEn: 'Cold (below 15°C near single-glazed window)', labelFa: 'سرد (زیر ۱۵ درجه، نزدیک پنجره تک‌جداره)' },
      { value: 'warm_dry', labelEn: 'Warm with dry radiator/heater', labelFa: 'گرم با شوفاژ/بخاری (هوای خشک و گرم)' },
      { value: 'cool_ac', labelEn: 'Cool with AC in summer', labelFa: 'تابستان خنک با کولر' },
      { value: 'hot_summer', labelEn: 'Very hot summer (above 35°C near window)', labelFa: 'تابستان خیلی گرم (بیشتر از ۳۵ درجه پشت پنجره)' },
      { value: 'balanced', labelEn: 'Balanced year-round (18-25°C, floor heating)', labelFa: 'دمای متعادل همیشگی (۱۸ تا ۲۵ درجه)' },
    ],
  },
  {
    id: 'airflow',
    section: 1,
    labelEn: 'Airflow and pot placement?',
    labelFa: 'جریان هوا و موقعیت گلدان؟',
    type: 'radio',
    required: true,
    options: [
      { value: 'open_window', labelEn: 'Near frequently opened window', labelFa: 'نزدیک پنجره‌ای که مدام باز می‌شود' },
      { value: 'drafty_hallway', labelEn: 'Near entrance or hallway (drafty)', labelFa: 'نزدیک در ورودی یا راهرو (کوران)' },
      { value: 'near_hvac', labelEn: 'Facing AC, heater, or vent', labelFa: 'روبروی کولر، بخاری یا دریچه تهویه' },
      { value: 'calm_corner', labelEn: 'Calm corner without strong drafts', labelFa: 'گوشه دنج بدون جریان هوای تند' },
      { value: 'covered_balcony', labelEn: 'Covered balcony/terrace (partially outdoor)', labelFa: 'تراس/بالکن سرپوشیده' },
    ],
  },
  {
    id: 'humidity',
    section: 1,
    labelEn: 'Average humidity level?',
    labelFa: 'رطوبت نسبی هوا؟',
    type: 'radio',
    required: true,
    options: [
      { value: 'high', labelEn: 'High (kitchen, bathroom, greenhouse, humid climate)', labelFa: 'بالا (آشپزخانه، حمام، گلخانه، شمال کشور)' },
      { value: 'moderate', labelEn: 'Moderate (typical home without humidifier)', labelFa: 'متوسط (خانه معمولی بدون دستگاه بخور)' },
      { value: 'very_dry', labelEn: 'Very dry (radiator in winter, desert areas)', labelFa: 'خیلی خشک (شوفاژ و بخاری در زمستان، مناطق کویری)' },
    ],
  },
  {
    id: 'willing_humidity_tools',
    section: 1,
    labelEn: 'Willing to use humidifier, pebble tray, or misting?',
    labelFa: 'آیا حاضرید از دستگاه بخور، جزیره سنگریزه، یا اسپری روزانه استفاده کنید؟',
    type: 'boolean',
    required: false,
  },

  // ========== بخش 2: سبک زندگی ==========
  {
    id: 'watering_habits',
    section: 2,
    labelEn: 'Realistic watering habit?',
    labelFa: 'الگوی واقعی آبیاری؟',
    type: 'radio',
    required: true,
    options: [
      { value: 'check_regularly', labelEn: 'Check soil every few days', labelFa: 'هر چند روز یک بار گیاه را چک می‌کنم' },
      { value: 'weekly_regular', labelEn: 'Only weekends (once a week)', labelFa: 'فقط آخر هفته‌ها (هفته‌ای یک‌بار منظم)' },
      { value: 'forgetful', labelEn: 'Forgetful (sometimes 2-3 weeks)', labelFa: 'فراموشکار (گاهی ۲-۳ هفته یادم می‌رود)' },
      { value: 'daily_care', labelEn: 'Love daily care (misting, checking)', labelFa: 'علاقه به مراقبت روزانه (مه‌پاشی، چک کردن خاک)' },
      { value: 'overwater', labelEn: 'Overwater (anxious plant will dry)', labelFa: 'زیاد آب می‌دهم (وسواس آبیاری دارم)' },
    ],
  },
  {
    id: 'watering_technique',
    section: 2,
    labelEn: 'Preferred watering technique?',
    labelFa: 'سبک و تکنیک آبیاری؟',
    type: 'checkbox',
    required: false,
    options: [
      { value: 'bottom_watering', labelEn: 'Bottom watering (tray absorption)', labelFa: 'آبیاری از زیر (زیرگلدانی خیس)' },
      { value: 'top_watering', labelEn: 'Only top watering', labelFa: 'فقط از بالا آب می‌ریزم' },
      { value: 'fixed_schedule', labelEn: 'Fixed schedule regardless of soil', labelFa: 'برنامه ثابت (مثلاً هر شنبه)' },
      { value: 'touch_soil', labelEn: 'Touch soil before watering', labelFa: 'خاک را لمس می‌کنم' },
      { value: 'self_watering', labelEn: 'Use self-watering pots/bulbs', labelFa: 'گلدان خودآبیاری' },
    ],
  },
  {
    id: 'fertilizing_habit',
    section: 2,
    labelEn: 'Fertilizing habit?',
    labelFa: 'عادت کوددهی؟',
    type: 'radio',
    required: true,
    options: [
      { value: 'monthly_biweekly', labelEn: 'Monthly or every 2 weeks (liquid)', labelFa: 'ماهی یکبار یا هر دو هفته کود مایع' },
      { value: 'yearly_topsoil', labelEn: 'Only change topsoil annually', labelFa: 'فقط سالی یکبار خاک سطحی را عوض می‌کنم' },
      { value: 'never', labelEn: 'Never fertilize', labelFa: 'اصلاً کود نمی‌دهم' },
      { value: 'willing_prune_clean', labelEn: 'Fine with pruning and leaf cleaning', labelFa: 'مشکلی با هرس و تمیز کردن برگ ندارم' },
    ],
  },
  {
    id: 'remove_dead_leaves',
    section: 2,
    labelEn: 'Do you regularly remove dead leaves/flowers?',
    labelFa: 'برگ‌های ریخته یا گل‌های خشک را مرتب حذف می‌کنید؟',
    type: 'boolean',
    required: false,
  },
  {
    id: 'travel_frequency',
    section: 2,
    labelEn: 'Travel frequency?',
    labelFa: 'سفر و دوره‌های غیبت؟',
    type: 'radio',
    required: true,
    options: [
      { value: 'always_home', labelEn: 'Always home', labelFa: 'همیشه در خانه هستم' },
      { value: 'few_days_monthly', labelEn: 'Few days trip once or twice a month', labelFa: 'ماهی یکی‌دوبار چند روز مسافرت' },
      { value: 'long_trips', labelEn: '10+ days trip once or twice a year', labelFa: 'سالی یکی‌دوبار ۱۰ روز یا بیشتر خانه خالی' },
    ],
  },
  {
    id: 'plant_sitter',
    section: 2,
    labelEn: 'Is there someone to care for plants while away?',
    labelFa: 'در غیابم کسی هست که به گیاهان سر بزند؟',
    type: 'boolean',
    required: false,
  },
  {
    id: 'repotting_willingness',
    section: 2,
    labelEn: 'Willing to repot every 1-2 years?',
    labelFa: 'حاضرم هر ۱-۲ سال گلدان را بزرگ‌تر کنم؟',
    type: 'boolean',
    required: false,
  },
  {
    id: 'space_for_climbing',
    section: 2,
    labelEn: 'Space for climbing/trailing plants with trellis?',
    labelFa: 'فضای کافی برای گیاهان رونده با قیم یا نخ دارم؟',
    type: 'boolean',
    required: false,
  },
  {
    id: 'space_limit',
    section: 2,
    labelEn: 'Space limitation?',
    labelFa: 'محدودیت فضا؟',
    type: 'radio',
    required: true,
    options: [
      { value: 'small_shelf', labelEn: 'Only a small shelf or windowsill', labelFa: 'فقط یک سطح میز یا طاقچه کوچک' },
      { value: 'some_floor_space', labelEn: 'Some floor space available', labelFa: 'فضای متوسط روی زمین دارم' },
      { value: 'plenty_room', labelEn: 'Plenty of room for large plants', labelFa: 'فضای کافی برای گیاهان بزرگ دارم' },
    ],
  },

  // ========== بخش 3: ایمنی و حساسیت ==========
  {
    id: 'pets',
    section: 3,
    labelEn: 'Do you have pets?',
    labelFa: 'حیوان خانگی دارید؟',
    type: 'checkbox',
    required: false,
    options: [
      { value: 'dog', labelEn: 'Dog', labelFa: 'سگ' },
      { value: 'cat', labelEn: 'Cat', labelFa: 'گربه' },
      { value: 'cat_chews', labelEn: 'Cat chews leaves/digs soil', labelFa: 'گربه برگ می‌جود یا خاک می‌کند' },
      { value: 'no_pets', labelEn: 'No pets', labelFa: 'حیوانی ندارم' },
    ],
  },
  {
    id: 'children',
    section: 3,
    labelEn: 'Children under 4 years old?',
    labelFa: 'کودک زیر ۴ سال دارید؟',
    type: 'boolean',
    required: false,
  },
  {
    id: 'toxic_plant_placement',
    section: 3,
    labelEn: 'Can you place toxic plants out of reach (hanging, high shelf)?',
    labelFa: 'اگر گیاه سمی باشد، می‌توانید دور از دسترس نگه دارید؟',
    type: 'boolean',
    required: false,
  },
  {
    id: 'allergies',
    section: 3,
    labelEn: 'Any allergies or sensitivities?',
    labelFa: 'آلرژی یا حساسیت خاصی دارید؟',
    type: 'checkbox',
    required: false,
    options: [
      { value: 'pollen', labelEn: 'Pollen allergy (sneezing, itching)', labelFa: 'حساسیت به گرده گل' },
      { value: 'latex', labelEn: 'Latex/sap sensitivity (Ficus family)', labelFa: 'حساسیت به شیره گیاه (مثل فیکوس)' },
      { value: 'mold', labelEn: 'Mold or wet soil smell', labelFa: 'حساسیت به کپک یا بوی خاک مرطوب' },
      { value: 'fragrance', labelEn: 'Fragrant flowers cause headache', labelFa: 'گیاهان معطر باعث سردرد می‌شوند' },
      { value: 'none', labelEn: 'No allergies', labelFa: 'مشکل خاصی نداریم' },
    ],
  },
  {
    id: 'sensory_preferences',
    section: 3,
    labelEn: 'Sensory and psychological preferences?',
    labelFa: 'ترجیحات حسی و روانی؟',
    type: 'checkbox',
    required: false,
    options: [
      { value: 'hates_wet_soil_smell', labelEn: 'Wet soil / plant smell bothers me', labelFa: 'بوی خاک یا گیاه خیس آزارم می‌دهد' },
      { value: 'loves_floral_fragrance', labelEn: 'Love floral fragrance (jasmine, gardenia)', labelFa: 'عطر خوش گل‌ها را دوست دارم' },
      { value: 'night_oxygen', labelEn: 'Want night oxygen in bedroom (Sansevieria)', labelFa: 'به دنبال گیاهی برای اکسیژن شب هستم' },
      { value: 'messy_leaves_anxiety', labelEn: 'Busy or holey leaves cause anxiety', labelFa: 'برگ‌های شلوغ یا سوراخ‌دار من را مضطرب می‌کند' },
    ],
  },
  {
    id: 'budget',
    section: 3,
    labelEn: 'Budget and willingness to spend?',
    labelFa: 'بودجه و هزینه پنهان؟',
    type: 'radio',
    required: true,
    options: [
      { value: 'only_initial', labelEn: 'Only initial plant & pot cost', labelFa: 'فقط هزینه خرید اولیه مهم است' },
      { value: 'willing_invest', labelEn: 'Willing to invest in premium pots, soil, humidifier', labelFa: 'هزینه برای گلدان لوکس، خاک مخصوص، بخور' },
      { value: 'budget_limited', labelEn: 'Limited budget (cheap, common plants)', labelFa: 'محدودیت مالی (گیاه ارزان و همیشه‌دردسترس)' },
      { value: 'collector_unlimited', labelEn: 'Collector, budget is not an issue', labelFa: 'کلکسیونر، بودجه محدودیتی ندارد' },
    ],
  },

  // ========== بخش 4: سلیقه بصری ==========
  {
    id: 'leaf_shape',
    section: 4,
    labelEn: 'Preferred leaf shape/texture?',
    labelFa: 'شکل و بافت برگ مورد علاقه؟',
    type: 'checkbox',
    required: false,
    options: [
      { value: 'broad_glossy', labelEn: 'Broad and glossy (Ficus lyrata)', labelFa: 'برگ‌های پهن و براق' },
      { value: 'small_dense', labelEn: 'Small and dense (ferns)', labelFa: 'برگ‌های ریز و زیاد' },
      { value: 'spiky', labelEn: 'Spiky and sharp (architectural, modern)', labelFa: 'برگ‌های تیغ‌دار و نوک‌تیز' },
      { value: 'trailing', labelEn: 'Trailing and soft (string of pearls, pothos)', labelFa: 'برگ‌های آویزان و رونده' },
      { value: 'succulent', labelEn: 'Succulent and fleshy', labelFa: 'برگ‌های ساکولنتی و گوشتی' },
      { value: 'colorful_patterned', labelEn: 'Colorful and patterned (Calathea, Aglaonema)', labelFa: 'برگ‌های رنگارنگ و طرح‌دار' },
      { value: 'air_plant', labelEn: 'Air plants (Tillandsia, no soil)', labelFa: 'گیاهان هوازی بدون خاک' },
    ],
  },
  {
    id: 'color_preference',
    section: 4,
    labelEn: 'Color preference?',
    labelFa: 'رنگ مورد علاقه در گیاه؟',
    type: 'checkbox',
    required: false,
    options: [
      { value: 'classic_green', labelEn: 'Classic green only', labelFa: 'فقط سبزی کلاسیک' },
      { value: 'variegated', labelEn: 'Green with white/cream (variegated)', labelFa: 'سبز با سفید/کرم (ابلق)' },
      { value: 'red_pink_purple', labelEn: 'Red, pink, or purple leaves', labelFa: 'قرمز، صورتی یا بنفش در برگ' },
      { value: 'silver_gray', labelEn: 'Silver and gray (ZZ raven, Peperomia)', labelFa: 'نقره‌ای و طوسی' },
      { value: 'colorful_flowers', labelEn: 'Colorful flowers (red, pink, purple, white)', labelFa: 'گل‌های رنگی' },
      { value: 'no_flowers', labelEn: 'Flowers not important, foliage is enough', labelFa: 'گلدهی اهمیت ندارد، برگ زینتی مهم است' },
    ],
  },
  {
    id: 'growth_form',
    section: 4,
    labelEn: 'Preferred growth form?',
    labelFa: 'فرم کلی و اندازه گیاه؟',
    type: 'checkbox',
    required: false,
    options: [
      { value: 'upright', labelEn: 'Upright and tall (Sansevieria)', labelFa: 'ایستاده و رو به بالا (ستونی)' },
      { value: 'bushy', labelEn: 'Bushy and full (Ficus benjamina, Schefflera)', labelFa: 'بوته‌ای و پرپشت' },
      { value: 'cascading', labelEn: 'Cascading / hanging (for macrame)', labelFa: 'آبشاری و آویز' },
      { value: 'climbing', labelEn: 'Climbing on moss pole (Monstera)', labelFa: 'بالا رونده دور قیم خزه' },
      { value: 'tiny', labelEn: 'Tiny (6-9cm pot, desktop)', labelFa: 'خیلی کوچک (گلدان ۶-۹ سانت رومیزی)' },
      { value: 'medium_floor', labelEn: 'Medium floor plant (next to sofa)', labelFa: 'متوسط (قابل گذاشتن روی زمین کنار مبلمان)' },
      { value: 'large_statement', labelEn: 'Large statement tree (reaches ceiling)', labelFa: 'درختچه بزرگ گوشه‌ای (تا سقف برسد)' },
    ],
  },
  {
    id: 'decor_style',
    section: 4,
    labelEn: 'Home decor style?',
    labelFa: 'سبک دکوراسیون خانه؟',
    type: 'radio',
    required: true,
    options: [
      { value: 'minimalist', labelEn: 'Minimalist & modern (clean lines, concrete pots, sculptural plants)', labelFa: 'مینیمال و مدرن' },
      { value: 'boho_tropical', labelEn: 'Bohemian / tropical (lush, broad leaves like Monstera)', labelFa: 'بوهمی یا گرمسیری' },
      { value: 'classic', labelEn: 'Classic & traditional (African violet, geraniums)', labelFa: 'کلاسیک و سنتی' },
      { value: 'industrial', labelEn: 'Industrial (metal pots, large cacti)', labelFa: 'صنعتی' },
      { value: 'japanese_zen', labelEn: 'Japanese / Zen (bonsai, lucky bamboo, air plants)', labelFa: 'ژاپنی/ذن' },
    ],
  },
  {
    id: 'primary_goal',
    section: 4,
    labelEn: 'Primary goal for this plant?',
    labelFa: 'هدف اصلی از خرید؟',
    type: 'radio',
    required: true,
    options: [
      { value: 'decorative', labelEn: 'Fill an empty corner (decorative)', labelFa: 'پر کردن گوشه خالی (دکوراتیو)' },
      { value: 'air_purification', labelEn: 'Air purification & better sleep (NASA plants)', labelFa: 'تصفیه هوا و بهبود کیفیت خواب' },
      { value: 'gift_beginners', labelEn: 'Gift for a beginner', labelFa: 'هدیه برای مبتدی‌ترین فرد' },
      { value: 'gift_collector', labelEn: 'Gift for a professional collector', labelFa: 'هدیه برای یک کلکسیونر حرفه‌ای' },
      { value: 'new_hobby', labelEn: 'Start a new challenging hobby', labelFa: 'شروع یک سرگرمی جدید و چالش‌انگیز' },
      { value: 'positive_energy', labelEn: 'Positive energy / feng shui (Crassula, bamboo)', labelFa: 'جذب انرژی مثبت و خوش‌یمنی' },
      { value: 'memory', labelEn: 'Reminder of a trip (rare tropicals)', labelFa: 'یادآوری سفر' },
    ],
  },

  // ========== بخش 5: تجربه و یادگیری ==========
  {
    id: 'experience_level',
    section: 5,
    labelEn: 'Describe your plant care experience',
    labelFa: 'سطح تجربه شما در نگهداری گیاهان',
    type: 'radio',
    required: true,
    options: [
      { value: 'killed_plants_unknowing', labelEn: 'Killed plants before, not sure why', labelFa: 'قبلاً گیاهان خشک شده، دلیل آن را نمی‌دانم' },
      { value: 'killed_plants_know_reason', labelEn: 'Killed plants before, I know the reason', labelFa: 'قبلاً گیاهان خشک شده، دلیل آن را می‌دانم' },
      { value: 'maintain_basic', labelEn: 'Keep basic plants alive (pothos, snake plant)', labelFa: 'چند گیاه معمولی (پوتوس، سانسوریا) دارم' },
      { value: 'successful_sensitive', labelEn: 'Success with sensitive plants (Ficus lyrata, Calathea)', labelFa: 'گیاهان حساس را با موفقیت نگه داشته‌ام' },
      { value: 'beginner', labelEn: 'Complete beginner, want an "un-killable" plant', labelFa: 'کاملاً مبتدی، دنبال گیاه ناجور نشدنی' },
      { value: 'professional', labelEn: 'Professional, looking for rare/challenging plants', labelFa: 'حرفه‌ای، دنبال چالش جدید یا گیاهان خاص' },
    ],
  },
  {
    id: 'willing_to_learn',
    section: 5,
    labelEn: 'Willingness to learn and follow care guides?',
    labelFa: 'تمایل به مطالعه و یادگیری؟',
    type: 'checkbox',
    required: false,
    options: [
      { value: 'read_guide', labelEn: 'Willing to read full care guide before buying', labelFa: 'حاضرم قبل از خرید راهنمای کامل را بخوانم' },
      { value: 'follow_pruning', labelEn: 'Will prune, propagate, adjust humidity if needed', labelFa: 'اگر لازم باشد هرس، تکثیر، تنظیم رطوبت انجام می‌دهم' },
      { value: 'plant_adapt', labelEn: 'Prefer plant adapts to me, not vice versa', labelFa: 'ترجیح می‌دهم گیاه خودش با من وفق پیدا کند' },
      { value: 'know_pesticide', labelEn: 'Know how to treat pests and quarantine', labelFa: 'آفت‌کش بزنم و قرنطینه کنم' },
    ],
  },
  {
    id: 'pot_and_soil_preference',
    section: 5,
    labelEn: 'Pot and soil preference?',
    labelFa: 'نوع گلدان و خاک؟',
    type: 'checkbox',
    required: false,
    options: [
      { value: 'plastic_decorative', labelEn: 'Plastic inside decorative pot', labelFa: 'گلدان پلاستیکی ساده داخل گلدان تزئینی' },
      { value: 'ceramic_clay', labelEn: 'Ceramic or terracotta (breathable)', labelFa: 'گلدان سرامیکی یا سفالی (قابل تنفس)' },
      { value: 'hydroponic', labelEn: 'Hydroponic (water only, no soil)', labelFa: 'هیدروپونیک (در آب، بدون خاک)' },
      { value: 'air_plant_no_soil', labelEn: 'Air plants (Tillandsia, no soil at all)', labelFa: 'گیاهان هوازی بدون خاک' },
      { value: 'garden_soil', labelEn: 'Use garden soil (not specialized)', labelFa: 'از خاک معمولی باغچه استفاده می‌کنم' },
      { value: 'buy_special_mix', labelEn: 'Willing to buy special potting mix', labelFa: 'حاضرم خاک مخصوص گیاه را بخرم' },
    ],
  },
];