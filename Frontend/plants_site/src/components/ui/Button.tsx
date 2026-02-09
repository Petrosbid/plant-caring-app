import React from 'react';
import { motion } from 'framer-motion';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  onClick,
  type = 'button',
}) => {
  const baseClasses =
    'font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors inline-flex items-center justify-center';

  const variantClasses = {
    primary:
      'bg-brand-500 hover:bg-brand-600 dark:bg-brand-500 dark:hover:bg-brand-600 text-white focus:ring-brand-500 shadow-lg hover:shadow-glow',
    secondary:
      'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 focus:ring-slate-400',
    danger:
      'bg-red-500 hover:bg-red-600 text-white focus:ring-red-500',
    success:
      'bg-brand-500 hover:bg-brand-600 text-white focus:ring-brand-500',
  };

  const sizeClasses = {
    sm: 'py-2 px-4 text-sm',
    md: 'py-2.5 px-5 text-base',
    lg: 'py-3 px-6 text-lg',
  };

  const widthClass = fullWidth ? 'w-full' : '';
  const disabledClass = disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : '';

  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${disabledClass}`;

  return (
    <motion.button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      transition={{ type: 'tween', duration: 0.15 }}
    >
      {children}
    </motion.button>
  );
};

export default Button;
