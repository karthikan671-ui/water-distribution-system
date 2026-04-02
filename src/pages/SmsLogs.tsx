import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, CheckCircle, XCircle, Radio, Activity } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SmsLog } from '../lib/supabase';
import { mockSmsLogs } from '../lib/mockStore';
import { format } from 'date-fns';

export function SmsLogs() {
  const { t } = useTranslation();
  const [logs, setLogs] = useState<SmsLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'sent' | 'failed'>('all');

  useEffect(() => {
    loadLogs();
    const interval = setInterval(loadLogs, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadLogs = () => {
    try {
      const data = mockSmsLogs.getLimited(100);
      setLogs(data);
    } catch (error) {
      console.error('Error loading logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    if (filter === 'all') return true;
    return log.status === filter;
  });

  const stats = {
    total: logs.length,
    sent: logs.filter((log) => log.status === 'sent').length,
    failed: logs.filter((log) => log.status === 'failed').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500 dark:text-gray-400">{t('common.loading')}</div>
      </div>
    );
  }

  const statCards = [
    { title: 'Total Handled', value: stats.total, icon: Radio, gradient: 'from-blue-600 to-indigo-600' },
    { title: t('sms.sent'), value: stats.sent, icon: CheckCircle, gradient: 'from-emerald-500 to-teal-500' },
    { title: t('sms.failed'), value: stats.failed, icon: XCircle, gradient: 'from-rose-500 to-red-600' }
  ];

  return (
    <div className="space-y-6 pb-8">
      {/* Advanced Premium Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-900 rounded-3xl p-8 sm:p-10 text-white shadow-2xl flex flex-col justify-between items-start relative overflow-hidden mb-8">
        <div className="absolute right-0 top-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl translate-x-1/4 -translate-y-1/4"></div>
        {/* Animated moving rings effect */}
        <motion.div 
           animate={{ scale: [1, 1.5, 2], opacity: [0.5, 0.2, 0] }} 
           transition={{ repeat: Infinity, duration: 3, ease: "easeOut" }} 
           className="absolute right-10 top-1/2 -translate-y-1/2 w-32 h-32 border-2 border-blue-400 rounded-full hidden md:block" 
        />
        <motion.div 
           animate={{ scale: [1, 1.5, 2], opacity: [0.5, 0.2, 0] }} 
           transition={{ repeat: Infinity, duration: 3, ease: "easeOut", delay: 1 }} 
           className="absolute right-10 top-1/2 -translate-y-1/2 w-32 h-32 border-2 border-blue-400 rounded-full hidden md:block" 
        />

        <div className="relative z-10 flex items-center gap-4">
          <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-md hidden sm:block">
            <Radio className="w-8 h-8 text-blue-200" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-1">{t('sms.title')}</h1>
            <p className="text-blue-200 text-lg">Monitor delivery status directly from the live network stream.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, type: 'spring' }}
              className={`bg-gradient-to-br ${card.gradient} rounded-3xl p-6 shadow-xl text-white relative overflow-hidden group hover:-translate-y-1 transition-transform cursor-default`}
            >
              <div className="absolute top-0 right-0 -mt-6 -mr-6 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-colors"></div>
              <div className="relative z-10 flex items-center justify-between mb-4">
                 <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <Icon className="w-6 h-6 text-white" />
                 </div>
                 <Activity className="w-4 h-4 text-white/50" />
              </div>
              <div className="relative z-10">
                <p className="text-white/80 text-xs font-bold tracking-widest uppercase mb-1">{card.title}</p>
                <p className="text-5xl font-black">{card.value}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gray-50/50 dark:bg-gray-900/50">
          <h2 className="text-xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-500" />
            Live Message Stream
          </h2>
          <div className="flex bg-gray-100 dark:bg-gray-900 p-1.5 rounded-xl border border-gray-200 dark:border-gray-700">
            {['all', 'sent', 'failed'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f as any)}
                className={`px-6 py-2 rounded-lg font-bold text-sm tracking-wide capitalize transition-all ${
                  filter === f
                    ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="p-0">
          {filteredLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-16">
              <MessageSquare className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
              <p className="text-center text-lg font-bold text-gray-500 dark:text-gray-400">
                {t('sms.noLogs')}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white dark:bg-gray-800 sticky top-0">
                  <tr className="border-b border-gray-100 dark:border-gray-700">
                    <th className="text-left py-5 px-8 text-xs font-bold text-gray-400 uppercase tracking-widest">
                      {t('sms.area')}
                    </th>
                    <th className="text-left py-5 px-8 text-xs font-bold text-gray-400 uppercase tracking-widest">
                      {t('sms.phone')}
                    </th>
                    <th className="text-left py-5 px-8 text-xs font-bold text-gray-400 uppercase tracking-widest">
                      Message (Tamil)
                    </th>
                    <th className="text-center py-5 px-8 text-xs font-bold text-gray-400 uppercase tracking-widest">
                      {t('sms.status')}
                    </th>
                    <th className="text-right py-5 px-8 text-xs font-bold text-gray-400 uppercase tracking-widest">
                      {t('sms.time')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                  <AnimatePresence>
                    {filteredLogs.map((log, index) => (
                      <motion.tr
                        key={log.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: Math.min(index * 0.05, 1) }}
                        className="group hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors"
                      >
                        <td className="py-4 px-8">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                            {log.area_name}
                          </span>
                        </td>
                        <td className="py-4 px-8 text-sm font-bold font-mono text-gray-700 dark:text-gray-300">
                          {log.phone}
                        </td>
                        <td className="py-4 px-8 text-sm font-medium text-gray-600 dark:text-gray-400 max-w-xs truncate italic" title={log.message}>
                          {log.message}
                        </td>
                        <td className="py-4 px-8 text-center">
                          <span
                            className={`inline-flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                              log.status === 'sent'
                                ? 'bg-emerald-100/50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/30'
                                : 'bg-rose-100/50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/30'
                            }`}
                          >
                            {log.status === 'sent' ? (
                              <CheckCircle className="w-3.5 h-3.5" />
                            ) : (
                              <XCircle className="w-3.5 h-3.5" />
                            )}
                            {log.status === 'sent' ? t('sms.sent') : t('sms.failed')}
                          </span>
                        </td>
                        <td className="py-4 px-8 text-sm font-semibold text-gray-500 dark:text-gray-400 text-right">
                          {format(new Date(log.sent_at), 'MMM dd, HH:mm:ss')}
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
