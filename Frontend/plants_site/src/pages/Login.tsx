// Login.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useLanguageTheme } from '../contexts/LanguageThemeContext';
import Register from './register';

interface LoginProps {
  navigateTo: (page: string) => void;
}

const Login: React.FC<LoginProps> = ({ navigateTo }) => {
  const { t } = useLanguageTheme();
  const { login, register, requestOtpCode, loginWithOtp } = useAuth();

  const isEn = t('home') === 'Home';

  // ----- State ها -----
  const [isSignUp, setIsSignUp] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'password' | 'otp'>('password'); // نوع ورود

  // فرم ثبت‌نام / ورود با رمز
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
  });

  // فرم OTP
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // ----- هندلرهای عمومی -----
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ----- ثبت‌نام و ورود با رمز عبور -----
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (isSignUp) {
        if (formData.password !== formData.confirmPassword) {
          setError(isEn ? 'Passwords do not match' : 'رمزهای عبور مطابقت ندارند');
          setLoading(false);
          return;
        }
        await register({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          first_name: formData.firstName,
          last_name: formData.lastName,
        });
      } else {
        // ورود با رمز عبور
        await login(formData.username, formData.password);
      }
      navigateTo('profile');
    } catch (err) {
      setError(err instanceof Error ? err.message : isEn ? 'An error occurred' : 'خطایی رخ داد');
    } finally {
      setLoading(false);
    }
  };

  // ----- درخواست کد یکبارمصرف -----
  const handleSendOtp = async () => {
    if (!phoneNumber) {
      setError(isEn ? 'Please enter your phone number' : 'لطفاً شماره تلفن خود را وارد کنید');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await requestOtpCode(phoneNumber);
      setOtpSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : isEn ? 'Failed to send OTP' : 'ارسال کد ناموفق بود');
    } finally {
      setLoading(false);
    }
  };

  // ----- تأیید کد و ورود با OTP -----
  const handleVerifyOtp = async () => {
    if (!otpCode) {
      setError(isEn ? 'Please enter the verification code' : 'لطفاً کد تایید را وارد کنید');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await loginWithOtp(phoneNumber, otpCode);
      navigateTo('profile');
    } catch (err) {
      setError(err instanceof Error ? err.message : isEn ? 'Invalid code' : 'کد نامعتبر است');
    } finally {
      setLoading(false);
    }
  };

  // ----- رندر فرم بر اساس نوع ورود (رمز یا OTP) -----
  const renderLoginForm = () => {
    if (loginMethod === 'password') {
      // فرم ورود با نام کاربری و رمز عبور (مشابه قبل)
      return (
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              {isEn ? 'Username' : 'نام کاربری'}
            </label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              required
              value={formData.username}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm"
              placeholder={isEn ? 'johndoe' : 'نامکاربری'}
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              {isEn ? 'Password' : 'رمز عبور'}
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm"
              placeholder="••••••••"
            />
          </div>
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <input type="checkbox" className="rounded border-slate-300 text-brand-500 focus:ring-brand-500" />
              {isEn ? 'Remember me' : 'مرا به خاطر بسپار'}
            </label>
            <button
                type="button"
                onClick={() => { /* منطق فراموشی رمز */ }}
                className="font-medium text-brand-600 dark:text-brand-400 hover:underline"
              >
                {isEn ? 'Forgot password?' : 'فراموشی رمز عبور؟'}
              </button>
          </div>
          <motion.button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-medium text-white bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 transition-colors"
            whileHover={loading ? {} : { scale: 1.01 }}
            whileTap={loading ? {} : { scale: 0.99 }}
          >
            {loading ? (isEn ? 'Processing...' : 'در حال پردازش...') : isEn ? 'Sign In' : 'ورود'}
          </motion.button>
        </form>
      );
    } else {
      // فرم ورود با کد یکبارمصرف
      return (
        <div className="space-y-5">
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              {isEn ? 'Phone Number' : 'شماره تلفن'}
            </label>
            <input
              id="phone"
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm"
              placeholder={isEn ? '09xxxxxxxxx' : '۰۹xxxxxxxxx'}
              disabled={otpSent}
            />
          </div>
          {!otpSent ? (
            <motion.button
              type="button"
              onClick={handleSendOtp}
              disabled={loading || !phoneNumber}
              className="w-full py-3 rounded-xl font-medium text-white bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 transition-colors"
              whileHover={loading ? {} : { scale: 1.01 }}
              whileTap={loading ? {} : { scale: 0.99 }}
            >
              {loading ? (isEn ? 'Sending...' : 'در حال ارسال...') : isEn ? 'Send Verification Code' : 'ارسال کد تایید'}
            </motion.button>
          ) : (
            <>
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {isEn ? 'Verification Code' : 'کد تایید'}
                </label>
                <input
                  id="otp"
                  type="text"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm"
                  placeholder="••••••"
                />
              </div>
              <div className="flex gap-3">
                <motion.button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={loading || !otpCode}
                  className="flex-1 py-3 rounded-xl font-medium text-white bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={loading ? {} : { scale: 1.01 }}
                  whileTap={loading ? {} : { scale: 0.99 }}
                >
                  {loading ? (isEn ? 'Verifying...' : 'در حال تایید...') : isEn ? 'Login' : 'ورود'}
                </motion.button>
                <motion.button
                  type="button"
                  onClick={() => {
                    setOtpSent(false);
                    setOtpCode('');
                    setError(null);
                  }}
                  disabled={loading}
                  className="flex-1 py-3 rounded-xl font-medium border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50"
                >
                  {isEn ? 'Back' : 'بازگشت'}
                </motion.button>
              </div>
            </>
          )}
        </div>
      );
    }
  };

  // ----- رندر فرم ثبت‌نام (که مستقل از روش ورود است) -----
  const renderSignUpForm = () => (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            {isEn ? 'First Name' : 'نام'}
          </label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            value={formData.firstName}
            onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm"
            placeholder={isEn ? 'John' : 'نام'}
          />
        </div>
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            {isEn ? 'Last Name' : 'نام خانوادگی'}
          </label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            value={formData.lastName}
            onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm"
            placeholder={isEn ? 'Doe' : 'نام خانوادگی'}
          />
        </div>
      </div>
      <div>
        <label htmlFor="username" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          {isEn ? 'Username' : 'نام کاربری'}
        </label>
        <input
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          required
          value={formData.username}
          onChange={handleChange}
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm"
          placeholder={isEn ? 'johndoe' : 'نامکاربری'}
        />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          {isEn ? 'Email Address' : 'آدرس ایمیل'}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={formData.email}
          onChange={handleChange}
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm"
          placeholder={isEn ? 'you@example.com' : 'شما@مثال.com'}
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          {isEn ? 'Password' : 'رمز عبور'}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          value={formData.password}
          onChange={handleChange}
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm"
          placeholder="••••••••"
        />
      </div>
      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          {isEn ? 'Confirm Password' : 'تایید رمز عبور'}
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          value={formData.confirmPassword}
          onChange={handleChange}
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm"
          placeholder="••••••••"
        />
      </div>
      <motion.button
        type="submit"
        disabled={loading}
        className="w-full py-3 rounded-xl font-medium text-white bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
        whileHover={loading ? {} : { scale: 1.01 }}
        whileTap={loading ? {} : { scale: 0.99 }}
      >
        {loading ? (isEn ? 'Processing...' : 'در حال پردازش...') : isEn ? 'Create Account' : 'ایجاد حساب کاربری'}
      </motion.button>
    </form>
  );

  // ----- نمایش خطا -----
  const ErrorDisplay = () => (
    error && (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        className="rounded-xl bg-red-50 dark:bg-red-900/30 p-4 mb-6 flex gap-3"
      >
        <span className="text-red-500 text-lg">⚠️</span>
        <p className="text-sm font-medium text-red-800 dark:text-red-200">{error}</p>
      </motion.div>
    )
  );

  // ----- صفحه اصلی -----
  return (
    <div className="min-h-screen flex items-center justify-center gradient-mesh bg-slate-50 dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-md w-full"
      >
        <div className="bg-white dark:bg-slate-800/80 rounded-2xl shadow-card border border-slate-200/60 dark:border-slate-700/50 p-8 lg:p-10">
          {/* هدر */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="mx-auto w-16 h-16 rounded-2xl bg-brand-500/15 dark:bg-brand-500/25 flex items-center justify-center text-4xl mb-4"
            >
              🌱
            </motion.div>
            <h2 className="font-display text-2xl lg:text-3xl font-semibold text-slate-900 dark:text-white">
              {isSignUp
                ? (isEn ? 'Create Account' : 'ایجاد حساب کاربری')
                : (isEn ? 'Sign in to your account' : 'ورود به حساب کاربری')}
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              {isSignUp
                ? (isEn ? 'Join our community of plant lovers' : 'به جامعه عاشقان گیاهان ما بپیوندید')
                : (isEn ? 'Access your personalized plant care dashboard' : 'دسترسی به داشبورد مراقبت از گیاهان')}
            </p>
          </div>

          <ErrorDisplay />
          {isSignUp ? (
            <Register onSuccess={() => navigateTo('profile')} switchToLogin={() => setIsSignUp(false)} />
          ) : (
            <>
              <div className="flex space-x-4 rtl:space-x-reverse mb-6">
                <button
                  type="button"
                  onClick={() => setLoginMethod('password')}
                  className={`flex-1 py-2 text-center rounded-lg transition-colors ${
                    loginMethod === 'password'
                      ? 'bg-brand-500 text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  {isEn ? 'Password Login' : 'ورود با رمز عبور'}
                </button>
                <button
                  type="button"
                  onClick={() => setLoginMethod('otp')}
                  className={`flex-1 py-2 text-center rounded-lg transition-colors ${
                    loginMethod === 'otp'
                      ? 'bg-brand-500 text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  {isEn ? 'One-Time Password' : 'ورود با کد یکبارمصرف'}
                </button>
              </div>

              {renderLoginForm()}
            </>
          )}

          <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
            {isSignUp
              ? (isEn ? 'Already have an account?' : 'حساب کاربری دارید؟')
              : (isEn ? "Don't have an account?" : 'حساب کاربری ندارید؟')}{' '}
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
                setOtpSent(false);
                setOtpCode('');
                setPhoneNumber('');
              }}
              disabled={loading}
              className="font-medium text-brand-600 dark:text-brand-400 hover:underline disabled:opacity-50"
            >
              {isSignUp
                ? (isEn ? 'Sign in here' : 'وارد شوید')
                : (isEn ? 'Sign up here' : 'ثبت نام کنید')}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;