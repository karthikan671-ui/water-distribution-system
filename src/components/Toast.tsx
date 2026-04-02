import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, type, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50, x: '-50%' }}
        animate={{ opacity: 1, y: 0, x: '-50%' }}
        exit={{ opacity: 0, y: -50, x: '-50%' }}
        className="fixed top-4 left-1/2 z-50 min-w-80 max-w-md"
      >
        <div
          className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg ${
            type === 'success'
              ? 'bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700'
              : 'bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700'
          }`}
        >
          {type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
          ) : (
            <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
          )}
          <p
            className={`flex-1 text-sm font-medium ${
              type === 'success'
                ? 'text-green-800 dark:text-green-200'
                : 'text-red-800 dark:text-red-200'
            }`}
          >
            {message}
          </p>
          <button
            onClick={onClose}
            className={`flex-shrink-0 ${
              type === 'success'
                ? 'text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200'
                : 'text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
