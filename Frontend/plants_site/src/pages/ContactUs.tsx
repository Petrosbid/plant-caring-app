import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { toast, Toaster } from 'react-hot-toast';
import { useLanguageTheme } from '../contexts/LanguageThemeContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { FiMail, FiPhone, FiMapPin, FiClock, FiSend, FiChevronDown, FiHelpCircle } from 'react-icons/fi';

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const ContactUs: React.FC = () => {
  const { language } = useLanguageTheme();
  const isEn = language === 'en';
  const [isSending, setIsSending] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>();

  const onSubmit = async (data: ContactFormData) => {
    setIsSending(true);
    // Simulate API request
    console.log('Contact message data:', data);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSending(false);
    
    toast.success(
      isEn 
        ? 'Message sent successfully! We will get back to you soon.' 
        : 'پیام شما با موفقیت ارسال شد! به زودی پاسخگوی شما خواهیم بود.',
      {
        duration: 4000,
        style: {
          borderRadius: '12px',
          background: '#0d7332',
          color: '#fff',
        },
      }
    );
    reset();
  };

  const contactInfo = [
    {
      icon: <FiMail className="w-6 h-6 text-brand-600 dark:text-brand-400" />,
      titleEn: 'Email Us',
      titleFa: 'ارسال ایمیل',
      detail: 'verna123@gmail.com',
      subtextEn: 'Response in 24 hours',
      subtextFa: 'پاسخگویی در کمتر از ۲۴ ساعت',
    },
    {
      icon: <FiPhone className="w-6 h-6 text-brand-600 dark:text-brand-400" />,
      titleEn: 'Call Us',
      titleFa: 'تماس تلفنی',
      detail: '034-4683-2604',
      subtextEn: 'Mon-Fri 9:00 AM - 6:00 PM',
      subtextFa: 'شنبه تا چهارشنبه ۹:۰۰ الی ۱4:۰۰',
    },
    {
      icon: <FiMapPin className="w-6 h-6 text-brand-600 dark:text-brand-400" />,
      titleEn: 'Headquarters',
      titleFa: 'دفتر مرکزی',
      detail: 'کرمان, ایران',
      subtextEn: 'Sadid',
      subtextFa: 'شهرک صنعتی سدید, مرکز پژوهش و نوآوری',
    },
    {
      icon: <FiClock className="w-6 h-6 text-brand-600 dark:text-brand-400" />,
      titleEn: 'Support Hours',
      titleFa: 'ساعات پشتیبانی',
      detail: '9:00 AM - 17:00 PM',
      subtextEn: 'Available 7 days a week',
      subtextFa: 'کل روزهای هفته',
    },
  ];

  const faqs = [
    {
      qEn: 'How accurate is the AI plant identification?',
      qFa: 'دقت شناسایی گیاه با هوش مصنوعی چقدر است؟',
      aEn: 'Our AI model is trained on millions of plant images and registers an accuracy rate of over 98% for most common houseplants under good lighting conditions.',
      aFa: 'مدل هوش مصنوعی ما بر روی میلیون‌ها تصویر گیاه آموزش دیده است و در شرایط نوری مناسب، برای اکثر گیاهان خانگی رایج، نرخ دقت بالای ۹۸٪ را ثبت می‌کند.',
    },
    {
      qEn: 'Is Verna free to use?',
      qFa: 'آیا استفاده از ورنا رایگان است؟',
      aEn: 'Yes! Verna offers plant identification, disease checking, and water reminders completely free. We also offer premium features for advanced garden analytics.',
      aFa: 'بله! ورنا شناسایی گیاهان، تشخیص بیماری‌ها و یادآوری آبیاری را به طور کامل رایگان ارائه می‌دهد. ما همچنین ویژگی‌های پیشرفته‌تری را برای تجزیه و تحلیل حرفه‌ای باغچه ارائه می‌دهیم.',
    },
    {
      qEn: 'What should I do if my plant is not identified?',
      qFa: 'اگر گیاهم شناسایی نشد چه کار کنم؟',
      aEn: 'Ensure the photo is clear, well-lit, and focused on the leaf or flower. If the AI still fails, you can post in our community tab or reach out to our support botanists.',
      aFa: 'مطمئن شوید تصویر واضح است، نور کافی دارد و روی برگ یا گل فوکوس شده است. در صورتی که هوش مصنوعی موفق نشد، می‌توانید آن را در بخش وبلاگ/جامعه ما بپرسید یا به پشتیبانی پیام دهید.',
    },
    {
      qEn: 'How does the disease checker work?',
      qFa: 'بررسی بیماری‌ها چگونه کار می‌کند؟',
      aEn: 'Simply upload a photo of the affected area (leaves, stem). The AI analyzes structural changes, spotting symptoms of fungal, bacterial, or pest issues and suggests treatments.',
      aFa: 'کافی است تصویری از بخش آسیب‌دیده (برگ‌ها، ساقه) آپلود کنید. هوش مصنوعی تغییرات ساختاری را تحلیل کرده، نشانه‌های قارچی، باکتریایی یا آفت‌ها را پیدا می‌کند و درمان پیشنهاد می‌دهد.',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring' as const, stiffness: 100, damping: 15 },
    },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-surface-light dark:bg-surface-dark text-slate-800 dark:text-slate-100 py-12 lg:py-20"
      dir={language === 'fa' ? 'rtl' : 'ltr'}
    >
      <Toaster position="top-center" />

      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-40 right-20 w-80 h-80 bg-brand-500/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-40 left-10 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl -z-10" />

      <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
        {/* Page Header */}
        <motion.div variants={itemVariants} className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-500/10 dark:bg-brand-500/20 text-brand-800 dark:text-brand-400 text-sm font-medium mb-4">
            📞 {isEn ? 'Contact Support' : 'پشتیبانی و ارتباط با ما'}
          </span>
          <h1 className="font-display text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 dark:text-white mb-4">
            {isEn ? "We'd Love to Hear From You" : 'با ما در ارتباط باشید'}
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-355 max-w-2xl mx-auto">
            {isEn
              ? 'Have questions about features, accuracy, or partnership? Drop us a line, and our green team will be in touch.'
              : 'سوالی درباره ویژگی‌ها، دقت تشخیص یا همکاری دارید؟ پیام خود را برای ما بفرستید، تیم پشتیبانی ما به زودی با شما تماس خواهد گرفت.'}
          </p>
        </motion.div>

        {/* Core Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start mb-20">
          
          {/* Contact Details (Left Column) */}
          <motion.div variants={itemVariants} className="lg:col-span-5 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
              {contactInfo.map((info, idx) => (
                <div 
                  key={idx} 
                  className="flex items-start gap-4 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-700/50 bg-white/70 dark:bg-slate-800/40 backdrop-blur-md shadow-card hover:shadow-card-hover transition-all duration-300"
                >
                  <div className="p-3 rounded-xl bg-brand-500/10 dark:bg-brand-500/20 flex items-center justify-center">
                    {info.icon}
                  </div>
                  <div>
                    <h3 className="font-display text-sm font-bold text-slate-900 dark:text-white mb-1">
                      {isEn ? info.titleEn : info.titleFa}
                    </h3>
                    <p className="text-base font-semibold text-slate-800 dark:text-slate-200 mb-0.5">
                      {info.detail}
                    </p>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {isEn ? info.subtextEn : info.subtextFa}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Form Container (Right Column) */}
          <motion.div variants={itemVariants} className="lg:col-span-7">
            <Card className="p-6 lg:p-8 bg-white dark:bg-slate-800/60">
              <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white mb-6">
                {isEn ? 'Send us a Message' : 'ارسال پیام مستقیم'}
              </h2>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Name Input */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      {isEn ? 'Your Name' : 'نام شما'}
                    </label>
                    <input
                      id="name"
                      type="text"
                      className={`w-full rounded-xl border px-4 py-2.5 bg-slate-50/50 dark:bg-slate-900/40 focus:bg-white text-slate-900 dark:text-white outline-none transition-all ${
                        errors.name 
                          ? 'border-red-500 focus:ring-1 focus:ring-red-500' 
                          : 'border-slate-200 dark:border-slate-700 focus:border-brand-500 dark:focus:border-brand-400'
                      }`}
                      placeholder={isEn ? 'John Doe' : 'مثلا: علی رضایی'}
                      {...register('name', { required: true })}
                    />
                    {errors.name && (
                      <span className="text-xs text-red-500 mt-1 block">
                        {isEn ? 'Name is required' : 'وارد کردن نام الزامی است'}
                      </span>
                    )}
                  </div>

                  {/* Email Input */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      {isEn ? 'Email Address' : 'آدرس ایمیل'}
                    </label>
                    <input
                      id="email"
                      type="email"
                      className={`w-full rounded-xl border px-4 py-2.5 bg-slate-50/50 dark:bg-slate-900/40 focus:bg-white text-slate-900 dark:text-white outline-none transition-all ${
                        errors.email 
                          ? 'border-red-500 focus:ring-1 focus:ring-red-500' 
                          : 'border-slate-200 dark:border-slate-700 focus:border-brand-500 dark:focus:border-brand-400'
                      }`}
                      placeholder="example@mail.com"
                      {...register('email', { 
                        required: true, 
                        pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/ 
                      })}
                    />
                    {errors.email && (
                      <span className="text-xs text-red-500 mt-1 block">
                        {isEn ? 'Please enter a valid email address' : 'لطفاً یک ایمیل معتبر وارد کنید'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Subject Input */}
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    {isEn ? 'Subject' : 'موضوع پیام'}
                  </label>
                  <input
                    id="subject"
                    type="text"
                    className={`w-full rounded-xl border px-4 py-2.5 bg-slate-50/50 dark:bg-slate-900/40 focus:bg-white text-slate-900 dark:text-white outline-none transition-all ${
                      errors.subject 
                        ? 'border-red-500 focus:ring-1 focus:ring-red-500' 
                        : 'border-slate-200 dark:border-slate-700 focus:border-brand-500 dark:focus:border-brand-400'
                    }`}
                    placeholder={isEn ? 'How can we help?' : 'چطور می‌توانیم به شما کمک کنیم؟'}
                    {...register('subject', { required: true })}
                  />
                  {errors.subject && (
                    <span className="text-xs text-red-500 mt-1 block">
                      {isEn ? 'Subject is required' : 'موضوع پیام الزامی است'}
                    </span>
                  )}
                </div>

                {/* Message TextArea */}
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    {isEn ? 'Message' : 'متن پیام'}
                  </label>
                  <textarea
                    id="message"
                    rows={5}
                    className={`w-full rounded-xl border px-4 py-2.5 bg-slate-50/50 dark:bg-slate-900/40 focus:bg-white text-slate-900 dark:text-white outline-none transition-all resize-none ${
                      errors.message 
                        ? 'border-red-500 focus:ring-1 focus:ring-red-500' 
                        : 'border-slate-200 dark:border-slate-700 focus:border-brand-500 dark:focus:border-brand-400'
                    }`}
                    placeholder={isEn ? 'Write your message here...' : 'پیام خود را در این بخش بنویسید...'}
                    {...register('message', { required: true, minLength: 10 })}
                  />
                  {errors.message && (
                    <span className="text-xs text-red-500 mt-1 block">
                      {isEn ? 'Message must be at least 10 characters long' : 'متن پیام باید حداقل شامل ۱۰ کاراکتر باشد'}
                    </span>
                  )}
                </div>

                {/* Submit Button */}
                <Button 
                  type="submit" 
                  variant="primary" 
                  fullWidth 
                  disabled={isSending}
                >
                  {isSending ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin text-lg">⏳</span>
                      {isEn ? 'Sending...' : 'در حال ارسال...'}
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <FiSend className={language === 'fa' ? 'rotate-180' : ''} />
                      {isEn ? 'Send Message' : 'ارسال پیام'}
                    </span>
                  )}
                </Button>
              </form>
            </Card>
          </motion.div>
        </div>

        {/* FAQ Accordion Section */}
        <motion.section variants={itemVariants} className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="font-display text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white mb-2 flex items-center justify-center gap-2">
              <FiHelpCircle className="text-brand-500" />
              {isEn ? 'Frequently Asked Questions' : 'سوالات متداول'}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {isEn ? 'Find quick answers to common questions about Verna.' : 'پاسخ‌های سریع به سوالات پرتکرار کاربران درباره ورنا.'}
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div 
                  key={idx}
                  className="rounded-2xl border border-slate-200/60 dark:border-slate-700/50 bg-white/70 dark:bg-slate-800/40 backdrop-blur-md overflow-hidden transition-all duration-300"
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between p-5 text-left font-display font-semibold text-slate-900 dark:text-white focus:outline-none transition-colors"
                  >
                    <span className={language === 'fa' ? 'text-right' : 'text-left'}>
                      {isEn ? faq.qEn : faq.qFa}
                    </span>
                    <FiChevronDown 
                      className={`w-5 h-5 text-slate-500 transition-transform duration-350 ${
                        isOpen ? 'rotate-180' : ''
                      } ${language === 'fa' ? 'mr-4' : 'ml-4'}`}
                    />
                  </button>
                  
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                      >
                        <div className="px-5 pb-5 pt-1 text-slate-600 dark:text-slate-300 text-sm leading-relaxed border-t border-slate-100 dark:border-slate-700/30">
                          {isEn ? faq.aEn : faq.aFa}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </motion.section>
      </div>
    </motion.div>
  );
};

export default ContactUs;
