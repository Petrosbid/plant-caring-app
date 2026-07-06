import React from 'react';
import {m} from 'framer-motion';
import { useLanguageTheme } from '../contexts/LanguageThemeContext';
import Card from '../components/ui/Card';

const AboutUs: React.FC = () => {
  const { language } = useLanguageTheme();
  const isEn = language === 'en';

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring' as const,
        stiffness: 100,
        damping: 15,
      },
    },
  };

  const team = [
    {
      nameEn: 'Dr. Sarah Carter',
      nameFa: 'حمیدرضا پوریان',
      roleEn: 'Chief Horticulturist',
      roleFa: 'مدیر ارشد گیاه‌شناسی',
      bioEn: 'Over 15 years of experience in botanical research and plant pathology.',
      bioFa: 'بیش از ۱۵ سال تجربه در تحقیقات گیاه‌شناسی و آسیب‌شناسی گیاهان.',
      avatar: 'https://sae.razi.ac.ir/documents/584137/643061/poryan.jpg/2e0abbab-b56e-35a0-9c96-0a3e600191b2?t=1754710396319&download=true',
      icon: '🌿'
    },
    {
      nameEn: 'Amir Rezaei',
      nameFa: 'امیر رضایی',
      roleEn: 'Head of AI Research',
      roleFa: 'مدیر تحقیقات هوش مصنوعی',
      bioEn: 'Specializes in computer vision and deep learning models for nature preservation.',
      bioFa: 'متخصص بینایی ماشین و مدل‌های یادگیری عمیق برای حفاظت از طبیعت.',
      avatar: 'https://api2.zoomit.ir/media/mustafa-soleyman-microsoft-ai-leader-face-65f9d20967794fc357b00cfa?w=1920&q=80',
      icon: '🤖'
    },
    {
      nameEn: 'Elena Rostova',
      nameFa: 'شاهین رضایی',
      roleEn: 'Lead UX Designer',
      roleFa: 'طراح ارشد تجربه کاربری',
      bioEn: 'Dedicated to making nature interaction accessible and delightful for everyone.',
      bioFa: 'متعهد به ساده‌سازی و دلپذیر کردن تعامل انسان با طبیعت برای همه.',
      avatar: 'https://avatars.githubusercontent.com/u/159718?v=4',
      icon: '🎨'
    }
  ];

  const pillars = [
    {
      icon: '🧠',
      titleEn: 'Advanced AI Technology',
      titleFa: 'فناوری پیشرفته هوش مصنوعی',
      descEn: 'We leverage state-of-the-art computer vision to identify plants and detect diseases within seconds with over 98% accuracy.',
      descFa: 'ما از پیشرفته‌ترین مدل‌های بینایی ماشین برای شناسایی گیاهان و تشخیص بیماری‌ها در چند ثانیه با دقت بالای ۹۸٪ استفاده می‌کنیم.'
    },
    {
      icon: '📚',
      titleEn: 'Horticultural Wisdom',
      titleFa: 'دانش عمیق گیاه‌شناسی',
      descEn: 'Our databases are built in collaboration with leading botanists, ensuring reliable care guides and effective disease treatments.',
      descFa: 'پایگاه داده ما با همکاری گیاه‌شناسان برجسته ساخته شده است و راهنماهای مراقبت معتبر و درمان‌های مؤثر بیماری‌ها را تضمین می‌کند.'
    },
    {
      icon: '🌱',
      titleEn: 'Eco-conscious Mission',
      titleFa: 'ماموریت متعهد به محیط‌زیست',
      descEn: 'We believe that healthier house plants lead to greener minds and a more sustainable connection to the planet.',
      descFa: 'ما معتقدیم گیاهان خانگی سالم‌تر به ذهن‌های شاداب‌تر و ارتباطی پایدارتر با سیاره زمین منجر می‌شوند.'
    }
  ];

  return (
    <m.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-surface-light dark:bg-surface-dark text-slate-800 dark:text-slate-100 py-12 lg:py-20 overflow-hidden"
      dir={language === 'fa' ? 'rtl' : 'ltr'}
    >
      {/* Decorative Glow Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-brand-500/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl -z-10" />

      <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
        {/* Hero Section */}
        <m.div variants={itemVariants} className="text-center mb-16 lg:mb-24">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-500/10 dark:bg-brand-500/20 text-brand-800 dark:text-brand-400 text-sm font-medium mb-4">
            ✨ {isEn ? 'Get to Know Us' : 'درباره ما بیشتر بدانید'}
          </span>
          <h1 className="font-display text-4xl lg:text-6xl font-bold tracking-tight text-slate-900 dark:text-white mb-6">
            {isEn ? 'Rooted in Innovation, Growing for You' : 'ریشه در نوآوری، رویش برای شما'}
          </h1>
          <p className="text-lg lg:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
            {isEn
              ? 'Verna is your digital companion in plant caring, bridging ancient heritage with next-generation artificial intelligence to help your garden thrive.'
              : 'ورنا همدم دیجیتال شما در نگهداری از گیاهان است؛ پیوندی میان اصالت گذشته و هوش مصنوعی نسل جدید برای رشد و شادابی باغچه و گلدان‌های شما.'}
          </p>
        </m.div>

        {/* The Story of Verna (Origin Story) */}
        <m.section variants={itemVariants} className="mb-20 lg:mb-28">
          <div className="relative group p-8 lg:p-12 rounded-3xl border border-slate-200/60 dark:border-slate-700/50 bg-white/70 dark:bg-slate-800/40 backdrop-blur-md shadow-card hover:shadow-card-hover transition-all duration-500 overflow-hidden">
            <div className="absolute -inset-4 bg-gradient-to-tr from-brand-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div>
                <h2 className="font-display text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white mb-4">
                  {isEn ? 'The Story Behind Verna' : 'داستان پشت نام ورنا'}
                </h2>
                <div className="h-1 w-20 bg-brand-500 rounded-full mb-6" />
                
                <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                  {isEn
                    ? 'In Persian culture, the word Verna represents youth, freshness, and the vibrant force of nature. Simultaneously, in English etymology, it shares roots with "Vernal", signifying the spring season, growth, and the beautiful rebirth of plants.'
                    : 'در فرهنگ و زبان فارسی باستان، واژه ورنا نمایانگر جوانی، شادابی و نیروی سرزنده طبیعت است. هم‌زمان، در ریشه‌شناسی غربی، این واژه هم‌خانواده واژه "Vernal" به معنای بهاری، مرتبط با رویش و نوزایی زیبای گیاهان در آغاز فصل بهار است.'}
                </p>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  {isEn
                    ? 'This unique linguistic alignment inspired us to build Verna: a perfect harmony that bridges cultural roots with the future of AI-powered horticultural care. Our goal is to bring the joy and confidence of green companionship back into modern urban living.'
                    : 'این هم‌راستایی معنایی بی‌نظیر الهام‌بخش ما برای ساخت ورنا شد: پیوندی هماهنگ که اصالت‌های فرهنگی را به آیندهٔ مراقبت هوشمند از گیاهان متصل می‌کند. هدف ما بازگرداندن لذت و آرامش همدمی با گیاهان به زندگی مدرن شهری است.'}
                </p>
              </div>

              <div className="relative flex justify-center">
                <div className="absolute -inset-2 bg-gradient-to-tr from-brand-500/20 to-emerald-500/20 rounded-3xl blur-xl opacity-60" />
                <img 
                  src="https://images.unsplash.com/photo-1545241047-6083a3684587?q=80&w=600&auto=format&fit=crop" 
                  alt="Lush green plant representing Verna" 
                  className="rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-2xl object-cover aspect-[4/3] w-full max-w-md z-10 transition-transform duration-500 hover:scale-[1.02]"
                />
              </div>
            </div>
          </div>
        </m.section>

        {/* Pillars / Values Section */}
        <m.section variants={itemVariants} className="mb-20 lg:mb-28">
          <div className="text-center mb-12">
            <h2 className="font-display text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white mb-4">
              {isEn ? 'Our Core Pillars' : 'ستون‌های اصلی ما'}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              {isEn
                ? 'We stand on three core values to deliver the ultimate plant-caring experience.'
                : 'ما بر سه ارزش کلیدی تکیه داریم تا بهترین تجربه مراقبت از گیاهان را ارائه دهیم.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pillars.map((p, idx) => (
              <Card key={idx} className="h-full flex flex-col items-center text-center p-6 bg-white dark:bg-slate-800/60 hover:border-brand-500/40 transition-colors">
                <div className="w-16 h-16 rounded-2xl bg-brand-500/10 dark:bg-brand-500/20 flex items-center justify-center text-3xl mb-6 shadow-sm">
                  {p.icon}
                </div>
                <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white mb-3">
                  {isEn ? p.titleEn : p.titleFa}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-350 leading-relaxed">
                  {isEn ? p.descEn : p.descFa}
                </p>
              </Card>
            ))}
          </div>
        </m.section>

        {/* Team Section */}
        <m.section variants={itemVariants} className="mb-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white mb-4">
              {isEn ? 'Meet Our Expert Team' : 'تیم کارشناسان ما'}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              {isEn
                ? 'Dedicated professionals working together to bring you the best in plant science and technology.'
                : 'متخصصان متعهدی که در کنار هم تلاش می‌کنند تا بهترین‌های علم گیاه‌شناسی و فناوری را به شما ارائه دهند.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, idx) => (
              <m.div
                key={idx}
                whileHover={{ y: -5 }}
                className="group p-6 rounded-2xl border border-slate-200/60 dark:border-slate-700/50 bg-white/70 dark:bg-slate-800/40 backdrop-blur-md text-center shadow-card hover:shadow-card-hover transition-all duration-300"
              >
                <div className="relative w-24 h-24 mx-auto mb-6">
                  <div className="absolute inset-0 bg-brand-500/20 rounded-full scale-105 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <img
                    src={member.avatar}
                    alt={isEn ? member.nameEn : member.nameFa}
                    className="relative rounded-full border-2 border-brand-500 p-1 w-full h-full object-cover bg-white dark:bg-slate-700"
                  />
                  <span className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-brand-500 text-white flex items-center justify-center shadow-md text-sm border-2 border-white dark:border-slate-800">
                    {member.icon}
                  </span>
                </div>
                <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white mb-1 group-hover:text-brand-500 transition-colors">
                  {isEn ? member.nameEn : member.nameFa}
                </h3>
                <span className="text-sm font-medium text-brand-600 dark:text-brand-400 block mb-3">
                  {isEn ? member.roleEn : member.roleFa}
                </span>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {isEn ? member.bioEn : member.bioFa}
                </p>
              </m.div>
            ))}
          </div>
        </m.section>
      </div>
    </m.div>
  );
};

export default AboutUs;
