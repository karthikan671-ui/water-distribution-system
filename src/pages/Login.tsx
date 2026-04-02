import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, Mail, Lock, Droplets } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { Toast } from '../components/Toast';

export function Login() {
  const { t } = useTranslation();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('admin@123.com');
  const [password, setPassword] = useState('12345678');
  const [loading, setLoading] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setToast(null);

    try {
      await signIn(email, password);
    } catch {
      setToast({
        message: t('login.invalidCredentials'),
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReveal = useCallback(() => {
    setShowLogin(true);
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#0a192f] flex items-center justify-center p-4">
      {/* Water Flow Animation Background */}
      <div className="absolute inset-0 z-0">
        <div className="water-vessel">
          <div className="wave -one"></div>
          <div className="wave -two"></div>
          <div className="wave -three"></div>
        </div>
      </div>

      <style>{`
        .water-vessel {
          position: absolute;
          width: 100%;
          height: 100%;
          background: #0ea5e9;
          overflow: hidden;
        }
        .wave {
          position: absolute;
          width: 200%;
          height: 200%;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 43%;
          left: -50%;
        }
        .wave.-one {
          bottom: 15%;
          animation: drift 15s infinite linear;
          background: rgba(255, 255, 255, 0.2);
        }
        .wave.-two {
          bottom: 12%;
          animation: drift 20s infinite linear;
          background: rgba(255, 255, 255, 0.3);
          opacity: 0.5;
        }
        .wave.-three {
          bottom: 8%;
          animation: drift 25s infinite linear;
          background: #38bdf8;
        }
        @keyframes drift {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <AnimatePresence mode="wait">
        {!showLogin ? (
          <motion.div
            key="portal"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 2, opacity: 0, filter: 'blur(20px)' }}
            onDoubleClick={handleReveal}
            className="z-10 group cursor-pointer flex flex-col items-center"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-white/20 rounded-full blur-2xl group-hover:bg-white/40 transition-all duration-500 animate-pulse"></div>
              <div className="w-32 h-32 bg-white/10 backdrop-blur-xl border-2 border-white/30 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(255,255,255,0.2)] group-hover:scale-110 transition-transform duration-500">
                <Droplets className="w-12 h-12 text-white animate-bounce" />
              </div>
            </div>
            <p className="mt-6 text-white text-lg font-bold tracking-widest uppercase opacity-60 animate-pulse">
              Double Click To Login
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, backdropFilter: 'blur(10px)' }}
            transition={{ duration: 0.8 }}
            className="w-full max-w-md z-10"
          >
            <div className="bg-white/10 backdrop-blur-2xl rounded-3xl shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] border border-white/20 p-8 sm:p-10">
              <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 rounded-3xl backdrop-blur-md border border-white/20 mb-6 shadow-xl">
                  <LogIn className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-4xl font-extrabold text-white tracking-tight mb-2">
                  Portal Login
                </h2>
                <p className="text-blue-100/60 font-medium">Please enter your distribution credentials</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-white/80 mb-2 ml-1">
                    {t('login.email')}
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-blue-400">
                      <Mail className="h-5 w-5 text-white/50" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="block w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white/10 transition-all text-lg"
                      placeholder="admin@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-white/80 mb-2 ml-1">
                    {t('login.password')}
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-blue-400">
                      <Lock className="h-5 w-5 text-white/50" />
                    </div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="block w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white/10 transition-all text-lg"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black py-4 rounded-2xl shadow-[0_8px_20px_-4px_rgba(59,130,246,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-xl mt-4"
                >
                  {loading ? (
                    <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      {t('login.loginButton')}
                      <LogIn className="w-6 h-6" />
                    </>
                  )}
                </motion.button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

