// Login.tsx
import React, { useState } from "react";
import { m } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import { useLanguageTheme } from "../contexts/LanguageThemeContext";
import Register from "./register";
import ElectricBorder from '../components/animation/ElectricBorder'
import { API_BASE_URL } from "../services/api";

interface LoginProps {
  navigateTo: (page: string) => void;
}

const ErrorDisplay: React.FC<{ error: string | null }> = ({ error }) => {
  if (!error) return null;
  return (
    <m.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      className="rounded-xl bg-red-50 dark:bg-red-900/30 p-4 mb-6 flex gap-3"
    >
      <span className="text-red-500 text-lg">⚠️</span>
      <p className="text-sm font-medium text-red-800 dark:text-red-200">
        {error}
      </p>
    </m.div>
  );
};

const Login: React.FC<LoginProps> = ({ navigateTo }) => {
  const { t } = useLanguageTheme();
  const { login, register, requestOtpCode, loginWithOtp, user } = useAuth();

  const isEn = t("home") === "Home";

  React.useEffect(() => {
    if (user) {
      navigateTo("profile");
    }
  }, [user, navigateTo]);

  const [isSignUp, setIsSignUp] = useState(false);
  const [loginMethod, setLoginMethod] = useState<"password" | "otp">(
    "password",
  ); // نوع ورود

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
  });

  // فرم OTP
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (isSignUp) {
        if (formData.password !== formData.confirmPassword) {
          setError(
            isEn ? "Passwords do not match" : "رمزهای عبور مطابقت ندارند",
          );
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
        await login(formData.username, formData.password);
      }
      navigateTo("profile");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : isEn
            ? "An error occurred"
            : "خطایی رخ داد",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!phoneNumber) {
      setError(
        isEn
          ? "Please enter your phone number"
          : "لطفاً شماره تلفن خود را وارد کنید",
      );
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await requestOtpCode(phoneNumber);
      setOtpSent(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : isEn
            ? "Failed to send OTP"
            : "ارسال کد ناموفق بود",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode) {
      setError(
        isEn
          ? "Please enter the verification code"
          : "لطفاً کد تایید را وارد کنید",
      );
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await loginWithOtp(phoneNumber, otpCode);
      navigateTo("profile");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : isEn
            ? "Invalid code"
            : "کد نامعتبر است",
      );
    } finally {
      setLoading(false);
    }
  };

  const renderLoginForm = () => {
    if (loginMethod === "password") {
      return (
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
            >
              {isEn ? "Username" : "نام کاربری"}
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
              placeholder={isEn ? "johndoe" : "نامکاربری"}
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
            >
              {isEn ? "Password" : "رمز عبور"}
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
              <input
                type="checkbox"
                className="rounded border-slate-300 text-brand-500 focus:ring-brand-500"
              />
              {isEn ? "Remember me" : "مرا به خاطر بسپار"}
            </label>
            <button
              type="button"
              onClick={() => {
                /* منطق فراموشی رمز */
              }}
              className="font-medium text-brand-600 dark:text-brand-400 hover:underline"
            >
              {isEn ? "Forgot password?" : "فراموشی رمز عبور؟"}
            </button>
          </div>
          <m.button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-medium text-white bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 transition-colors"
            whileHover={loading ? {} : { scale: 1.01 }}
            whileTap={loading ? {} : { scale: 0.99 }}
          >
            {loading
              ? isEn
                ? "Processing..."
                : "در حال پردازش..."
              : isEn
                ? "Sign In"
                : "ورود"}
          </m.button>
        </form>
      );
    } else {
      return (
        <div className="space-y-5">
          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
            >
              {isEn ? "Phone Number" : "شماره تلفن"}
            </label>
            <input
              id="phone"
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm"
              placeholder={isEn ? "09xxxxxxxxx" : "۰۹xxxxxxxxx"}
              disabled={otpSent}
            />
          </div>
          {!otpSent ? (
            <m.button
              type="button"
              onClick={handleSendOtp}
              disabled={loading || !phoneNumber}
              className="w-full py-3 rounded-xl font-medium text-white bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 transition-colors"
              whileHover={loading ? {} : { scale: 1.01 }}
              whileTap={loading ? {} : { scale: 0.99 }}
            >
              {loading
                ? isEn
                  ? "Sending..."
                  : "در حال ارسال..."
                : isEn
                  ? "Send Verification Code"
                  : "ارسال کد تایید"}
            </m.button>
          ) : (
            <>
              <div>
                <label
                  htmlFor="otp"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
                >
                  {isEn ? "Verification Code" : "کد تایید"}
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
                <m.button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={loading || !otpCode}
                  className="flex-1 py-3 rounded-xl font-medium text-white bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={loading ? {} : { scale: 1.01 }}
                  whileTap={loading ? {} : { scale: 0.99 }}
                >
                  {loading
                    ? isEn
                      ? "Verifying..."
                      : "در حال تایید..."
                    : isEn
                      ? "Login"
                      : "ورود"}
                </m.button>
                <m.button
                  type="button"
                  onClick={() => {
                    setOtpSent(false);
                    setOtpCode("");
                    setError(null);
                  }}
                  disabled={loading}
                  className="flex-1 py-3 rounded-xl font-medium border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50"
                >
                  {isEn ? "Back" : "بازگشت"}
                </m.button>
              </div>
            </>
          )}
        </div>
      );
    }
  };

  return (
    
      <div className="min-h-screen flex items-center justify-center gradient-mesh bg-slate-50 dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-md w-full"
        >
        <ElectricBorder color="#88ff7d"      speed={0.5}      chaos={0.1}       style={{ borderRadius: 16 }}   >
          <div className="bg-white dark:bg-slate-800/80 rounded-2xl shadow-card border border-slate-200/60 dark:border-slate-700/50 p-8 lg:p-10">
            <div className="text-center mb-8">
              <m.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="mx-auto w-16 h-16 rounded-2xl bg-brand-500/15 dark:bg-brand-500/25 flex items-center justify-center text-4xl mb-4"
              >
                🌱
              </m.div>
              <h2 className="font-display text-2xl lg:text-3xl font-semibold text-slate-900 dark:text-white">
                {isSignUp
                  ? isEn
                    ? "Create Account"
                    : "ایجاد حساب کاربری"
                  : isEn
                    ? "Sign in to your account"
                    : "ورود به حساب کاربری"}
              </h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                {isSignUp
                  ? isEn
                    ? "Join our community of plant lovers"
                    : "به جامعه عاشقان گیاهان ما بپیوندید"
                  : isEn
                    ? "Access your personalized plant care dashboard"
                    : "دسترسی به داشبورد مراقبت از گیاهان"}
              </p>
            </div>

            <ErrorDisplay error={error} />
            {isSignUp ? (
              <Register
                onSuccess={() => navigateTo("profile")}
                switchToLogin={() => setIsSignUp(false)}
              />
            ) : (
              <>
                <div className="flex space-x-4 rtl:space-x-reverse mb-6">
                  <button
                    type="button"
                    onClick={() => setLoginMethod("password")}
                    className={`flex-1 py-2 text-center rounded-lg transition-colors ${
                      loginMethod === "password"
                        ? "bg-brand-500 text-white"
                        : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                    }`}
                  >
                    {isEn ? "Password Login" : "ورود با رمز عبور"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setLoginMethod("otp")}
                    className={`flex-1 py-2 text-center rounded-lg transition-colors ${
                      loginMethod === "otp"
                        ? "bg-brand-500 text-white"
                        : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                    }`}
                  >
                    {isEn ? "One-Time Password" : "ورود با کد یکبارمصرف"}
                  </button>
                </div>

                {renderLoginForm()}
              </>
            )}

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
              </div>
              <div className="relative flex justify-center text-sm uppercase">
                <span className="bg-white dark:bg-slate-800 px-2 text-slate-500 dark:text-slate-400">
                  {isEn ? "Or" : "یا"}
                </span>
              </div>
            </div>

            <m.button
              type="button"
              onClick={() => {
                window.location.href = `${API_BASE_URL}/auth/google/login/?state=${encodeURIComponent(window.location.origin + window.location.pathname)}`;
              }}
              className="w-full py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center justify-center gap-3 transition-colors shadow-sm"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.54 14.98 0 12 0 7.35 0 3.37 2.67 1.43 6.56l3.86 3c.96-2.87 3.65-5 6.71-5z"
                />
                <path
                  fill="#4285F4"
                  d="M23.49 12.27c0-.81-.07-1.59-.2-2.27H12v4.51h6.46c-.29 1.48-1.14 2.73-2.4 3.58l3.76 2.91c2.2-2.02 3.67-5 3.67-8.73z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.29 14.56c-.25-.76-.39-1.57-.39-2.41s.14-1.65.39-2.41L1.43 6.56C.52 8.39 0 10.14 0 12s.52 3.61 1.43 5.44l3.86-3z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.97-1.07 7.96-2.91l-3.76-2.91c-1.1.74-2.52 1.18-4.2 1.18-3.06 0-5.75-2.13-6.71-5L1.43 17.4C3.37 21.33 7.35 24 12 24z"
                />
              </svg>
              <span>{isEn ? "Continue with Google" : "ادامه با گوگل"}</span>
            </m.button>


            <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
              {isSignUp
                ? isEn
                  ? "Already have an account?"
                  : "حساب کاربری دارید؟"
                : isEn
                  ? "Don't have an account?"
                  : "حساب کاربری ندارید؟"}{" "}
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError(null);
                  setOtpSent(false);
                  setOtpCode("");
                  setPhoneNumber("");
                }}
                disabled={loading}
                className="font-medium text-brand-600 dark:text-brand-400 hover:underline disabled:opacity-50"
              >
                {isSignUp
                  ? isEn
                    ? "Sign in here"
                    : "وارد شوید"
                  : isEn
                    ? "Sign up here"
                    : "ثبت نام کنید"}
              </button>
            </p>
          </div>
        </ElectricBorder>
        </m.div>
      </div>
    
  );
};

export default Login;
