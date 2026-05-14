// Register.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useLanguageTheme } from '../contexts/LanguageThemeContext';

interface RegisterProps {
  onSuccess: () => void;
  switchToLogin: () => void;
}

const Register: React.FC<RegisterProps> = ({ onSuccess, switchToLogin }) => {
  const { t } = useLanguageTheme();
  const { registerWithPhoneOtp, registerWithEmailOtp, verifyRegisterOtp } = useAuth();
  const isEn = t('home') === 'Home';

  const [method, setMethod] = useState<'phone' | 'email'>('phone');
  const [step, setStep] = useState<'form' | 'verify'>('form');
  const [formData, setFormData] = useState({
    username: '',
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
  });
  const [code, setCode] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSendCode = async () => {
    setError(null);
    if (method === 'phone' && !formData.phone) {
      setError(isEn ? 'Phone number required' : 'شماره تلفن لازم است');
      return;
    }
    if (method === 'email' && !formData.email) {
      setError(isEn ? 'Email required' : 'ایمیل لازم است');
      return;
    }
    if (!formData.username) {
      setError(isEn ? 'Username required' : 'نام کاربری لازم است');
      return;
    }

    setLoading(true);
    try {
      if (method === 'phone') {
        await registerWithPhoneOtp({
          phone: formData.phone,
          username: formData.username,
          first_name: formData.first_name,
          last_name: formData.last_name,
        });
        setIdentifier(formData.phone);
      } else {
        await registerWithEmailOtp({
          email: formData.email,
          username: formData.username,
          first_name: formData.first_name,
          last_name: formData.last_name,
        });
        setIdentifier(formData.email);
      }
      setStep('verify');
    } catch (err) {
      setError(err instanceof Error ? err.message : isEn ? 'Error sending code' : 'خطا در ارسال کد');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!code) {
      setError(isEn ? 'Code required' : 'کد تایید لازم است');
      return;
    }
    setLoading(true);
    try {
      await verifyRegisterOtp(identifier, code);
      onSuccess(); // به صفحه پروفایل یا داشبورد برود
    } catch (err) {
      setError(err instanceof Error ? err.message : isEn ? 'Invalid code' : 'کد نامعتبر');
    } finally {
      setLoading(false);
    }
  };

  const renderForm = () => (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            {isEn ? 'First Name' : 'نام'}
          </label>
          <input name="first_name" value={formData.first_name} onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700/50" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            {isEn ? 'Last Name' : 'نام خانوادگی'}
          </label>
          <input name="last_name" value={formData.last_name} onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700/50" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          {isEn ? 'Username' : 'نام کاربری'} *
        </label>
        <input name="username" value={formData.username} onChange={handleChange} required
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700/50" />
      </div>
      {method === 'phone' ? (
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            {isEn ? 'Phone Number' : 'شماره تلفن'} *
          </label>
          <input name="phone" value={formData.phone} onChange={handleChange} type="tel"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700/50" />
        </div>
      ) : (
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            {isEn ? 'Email Address' : 'آدرس ایمیل'} *
          </label>
          <input name="email" value={formData.email} onChange={handleChange} type="email"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700/50" />
        </div>
      )}
      <motion.button
        onClick={handleSendCode}
        disabled={loading}
        className="w-full py-3 rounded-xl font-medium text-white bg-brand-500 hover:bg-brand-600 disabled:opacity-50"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        {loading ? (isEn ? 'Sending...' : 'در حال ارسال...') : (isEn ? 'Send Verification Code' : 'ارسال کد تایید')}
      </motion.button>
    </div>
  );

  const renderVerify = () => (
    <div className="space-y-5">
      <p className="text-center text-slate-600 dark:text-slate-400">
        {isEn ? `Code sent to ${identifier}` : `کد به ${identifier} ارسال شد`}
      </p>
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          {isEn ? 'Verification Code' : 'کد تایید'}
        </label>
        <input type="text" value={code} onChange={(e) => setCode(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700/50" />
      </div>
      <motion.button
        onClick={handleVerifyCode}
        disabled={loading}
        className="w-full py-3 rounded-xl font-medium text-white bg-brand-500 hover:bg-brand-600"
      >
        {loading ? (isEn ? 'Verifying...' : 'در حال تایید...') : (isEn ? 'Complete Registration' : 'تکمیل ثبت‌نام')}
      </motion.button>
      <button
        onClick={() => { setStep('form'); setCode(''); setError(null); }}
        className="w-full text-center text-sm text-brand-600 dark:text-brand-400"
      >
        {isEn ? 'Change phone/email' : 'تغییر شماره/ایمیل'}
      </button>
    </div>
  );

  return (
    <div>
      {step === 'form' && (
        <>
          <div className="flex space-x-4 rtl:space-x-reverse mb-6">
            <button onClick={() => setMethod('phone')}
              className={`flex-1 py-2 rounded-lg ${method === 'phone' ? 'bg-brand-500 text-white' : 'bg-slate-100 dark:bg-slate-700'}`}>
              {isEn ? 'Via Phone' : 'با تلفن'}
            </button>
            <button onClick={() => setMethod('email')}
              className={`flex-1 py-2 rounded-lg ${method === 'email' ? 'bg-brand-500 text-white' : 'bg-slate-100 dark:bg-slate-700'}`}>
              {isEn ? 'Via Email' : 'با ایمیل'}
            </button>
          </div>
          {renderForm()}
        </>
      )}
      {step === 'verify' && renderVerify()}
      {error && <div className="mt-4 text-red-500 text-center text-sm">{error}</div>}
    </div>
  );
};

export default Register;