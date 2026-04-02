import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, MapPin, MessageSquare, AlertCircle, Activity, TrendingUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SmsLog } from '../lib/supabase';
import { mockUsers, mockAreas, mockSmsLogs } from '../lib/mockStore';
import { format } from 'date-fns';

interface Stats {
  totalUsers: number;
  totalAreas: number;
  smsSentToday: number;
  smsFailed: number;
}

export function Dashboard({ onNavigate }: { onNavigate?: (page: string) => void }) {
  const { t } = useTranslation();
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalAreas: 0,
    smsSentToday: 0,
    smsFailed: 0,
  });
  const [recentLogs, setRecentLogs] = useState<SmsLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = () => {
    try {
      const usersCount = mockUsers.count();
      const areasCount = mockAreas.getAll().length;
      const recentLogsLimit = mockSmsLogs.getLimited(8);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayLogs = mockSmsLogs.getAll().filter(
        (log) => new Date(log.sent_at) >= today
      );

      setStats({
        totalUsers: usersCount,
        totalAreas: areasCount,
        smsSentToday: todayLogs.filter((log) => log.status === 'sent').length,
        smsFailed: todayLogs.filter((log) => log.status === 'failed').length,
      });

      setRecentLogs(recentLogsLimit);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: t('dashboard.totalUsers'),
      value: stats.totalUsers,
      icon: Users,
      gradient: 'from-blue-500 to-blue-600',
      path: 'users',
    },
    {
      title: t('dashboard.totalAreas'),
      value: stats.totalAreas,
      icon: MapPin,
      gradient: 'from-emerald-400 to-teal-500',
      path: 'areas',
    },
    {
      title: t('dashboard.smsSent'),
      value: stats.smsSentToday,
      icon: MessageSquare,
      gradient: 'from-purple-500 to-indigo-500',
      path: 'sms',
    },
    {
      title: t('dashboard.smsFailed'),
      value: stats.smsFailed,
      icon: AlertCircle,
      gradient: 'from-rose-400 to-red-500',
      path: 'sms',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500 dark:text-gray-400">{t('common.loading')}</div>
      </div>
    );
  }

  const totalSms = stats.smsSentToday + stats.smsFailed;
  const successRate = totalSms === 0 ? 100 : Math.round((stats.smsSentToday / totalSms) * 100);

  return (
    <div className="space-y-8 pb-8">
      {/* Premium Welcome Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-8 sm:p-10 text-white shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-2 tracking-tight">Welcome back, Admin! 👋</h1>
          <p className="text-blue-100 text-lg">Here's your live distribution overview for today.</p>
        </div>
        <div className="relative z-10 mt-6 sm:mt-0 bg-white/20 px-6 py-3 rounded-2xl backdrop-blur-md border border-white/20 shadow-inner">
           <p className="text-lg font-semibold tracking-wide">{format(new Date(), 'EEEE, MMM do')}</p>
        </div>
      </motion.div>

      {/* Sleek SaaS-style Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          // Extract the ending color of the gradient to use for the shadow glow realistically
          const shadowColor = card.gradient.split(' ')[1]?.replace('to-', '') || 'blue-500';

          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              onClick={() => onNavigate && card.path && onNavigate(card.path)}
              className="relative bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100 dark:border-gray-700 cursor-pointer overflow-hidden group hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)] hover:border-gray-200 dark:hover:border-gray-600 transition-all duration-300"
            >
              {/* Animated background gradient blob */}
              <div className={`absolute -right-8 -top-8 w-32 h-32 bg-gradient-to-br ${card.gradient} rounded-full blur-3xl opacity-10 group-hover:opacity-30 transition-opacity duration-500`}></div>
              
              <div className="relative z-10 flex justify-between items-start mb-6">
                <div className={`p-3 rounded-2xl bg-gradient-to-br ${card.gradient} shadow-lg shadow-${shadowColor}/30 transform group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                
                {/* Mocked trend indicator for an "advanced" look */}
                <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-100 dark:border-emerald-500/20">
                  <TrendingUp className="w-3 h-3" />
                  <span>+12%</span>
                </div>
              </div>

              <div className="relative z-10">
                <h3 className="text-gray-500 dark:text-gray-400 text-xs font-bold tracking-widest uppercase mb-1">
                  {card.title}
                </h3>
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                    {card.value}
                  </span>
                </div>
              </div>

              {/* Bottom decorative progress line */}
              <div className={`absolute bottom-0 left-0 w-0 h-1.5 bg-gradient-to-r ${card.gradient} group-hover:w-full transition-all duration-500 ease-out`}></div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Logs Table */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col">
          <div className="p-8 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('dashboard.recentLogs')}
            </h2>
          </div>
          <div className="flex-1 p-0">
            {recentLogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 h-full">
                <MessageSquare className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
                <p className="text-lg text-gray-500 dark:text-gray-400 font-medium">
                  {t('dashboard.noLogs')}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-4 px-8 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {t('sms.area')}
                      </th>
                      <th className="text-left py-4 px-8 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {t('sms.phone')}
                      </th>
                      <th className="text-left py-4 px-8 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Message (Tamil)
                      </th>
                      <th className="text-left py-4 px-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {t('dashboard.status')}
                      </th>
                      <th className="text-left py-4 px-8 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {t('sms.time')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {recentLogs.map((log) => (
                      <motion.tr
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        key={log.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        <td className="py-4 px-8 text-sm font-semibold text-gray-900 dark:text-white">
                          {log.area_name}
                        </td>
                        <td className="py-4 px-8 text-sm font-medium text-gray-600 dark:text-gray-300">
                          {log.phone}
                        </td>
                        <td className="py-4 px-8 text-sm font-medium text-gray-500 dark:text-gray-400 truncate max-w-[150px]" title={log.message}>
                          {log.message}
                        </td>
                        <td className="py-4 px-4">
                          <span
                            className={`inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                              log.status === 'sent'
                                ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400'
                                : 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400'
                            }`}
                          >
                            {log.status === 'sent' ? t('dashboard.sent') : t('dashboard.failed')}
                          </span>
                        </td>
                        <td className="py-4 px-8 text-sm font-medium text-gray-500 dark:text-gray-400">
                          {format(new Date(log.sent_at), 'hh:mm a')}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* System Health / Goal */}
        <motion.div 
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ delay: 0.4 }}
           className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 p-8 flex flex-col"
        >
          <div className="flex items-center gap-4 mb-10">
             <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-2xl shadow-inner">
               <Activity className="w-7 h-7 text-blue-600 dark:text-blue-400" />
             </div>
             <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">Delivery Rate</h2>
          </div>
          
          <div className="flex-1 flex flex-col justify-center items-center">
            <div className="relative w-56 h-56 flex items-center justify-center">
               <svg className="w-full h-full transform -rotate-90 drop-shadow-xl" viewBox="0 0 100 100">
                 <circle cx="50" cy="50" r="40" className="text-gray-100 dark:text-gray-700 stroke-current" strokeWidth="10" fill="transparent" />
                 <motion.circle 
                   initial={{ strokeDashoffset: 251 }}
                   animate={{ strokeDashoffset: Math.max(0, 251 - (251 * successRate) / 100) }}
                   transition={{ duration: 2, ease: "easeOut", delay: 0.5 }}
                   cx="50" cy="50" r="40" 
                   className={`${successRate > 80 ? 'text-green-500' : successRate > 50 ? 'text-yellow-500' : 'text-red-500'} stroke-current drop-shadow-md`} 
                   strokeWidth="10" fill="transparent" 
                   strokeDasharray="251" 
                   strokeLinecap="round" 
                 />
               </svg>
               <div className="absolute flex flex-col items-center">
                  <span className="text-5xl font-black text-gray-900 dark:text-white">{successRate}%</span>
                  <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wider">Success</span>
               </div>
            </div>
            
            <div className="mt-10 w-full bg-gray-50 dark:bg-gray-900/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-800">
              <p className="text-center text-gray-600 dark:text-gray-300 font-medium leading-relaxed">
                 <span className="text-green-500 font-bold">{stats.smsSentToday} sent</span> and <span className="text-red-500 font-bold">{stats.smsFailed} failed</span><br/>out of <span className="text-gray-900 dark:text-white font-bold">{totalSms} attempts</span> today.
              </p>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
