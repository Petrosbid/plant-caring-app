import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '', title, subtitle }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`bg-white dark:bg-slate-800/80 rounded-2xl shadow-card border border-slate-200/60 dark:border-slate-700/50 overflow-hidden hover:shadow-card-hover transition-shadow duration-300 ${className}`}
    >
      {(title || subtitle) && (
        <div className="border-b border-slate-200 dark:border-slate-700 p-6">
          {title && (
            <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm">
              {subtitle}
            </p>
          )}
        </div>
      )}
      <div className={title || subtitle ? 'p-6' : ''}>{children}</div>
    </motion.div>
  );
};

export default Card;
