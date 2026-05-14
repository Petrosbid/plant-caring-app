import { motion, AnimatePresence } from 'framer-motion';

interface LoginPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
}

export const LoginPopup: React.FC<LoginPopupProps> = ({ isOpen, onClose, onLogin }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl"
          >
            <div className="text-center">
              <div className="text-5xl mb-4">🔒</div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Login Required
              </h3>
              <p className="text-slate-600 dark:text-slate-300 mb-6">
                Please log in to continue with this action
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={onLogin}
                  className="px-6 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors font-medium"
                >
                  Log In
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
