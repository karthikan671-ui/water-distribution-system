import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Droplets, Timer, MapPin, AlertCircle, TrendingUp, Waves } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { mockSchedules, mockAreas } from '../lib/mockStore';
import { WaterFlowAnimation } from '../components/WaterFlowAnimation';
import { CountdownTimer } from '../components/CountdownTimer';
import { Toast } from '../components/Toast';

export function WaterFlow() {
  const { t } = useTranslation();
  const [activeSchedule, setActiveSchedule] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const checkActiveSchedule = () => {
    const schedules = mockSchedules.getAll();
    const active = schedules.find(s => s.is_active);
    if (active) {
      const area = mockAreas.getAll().find(a => a.id === active.area_id);
      setActiveSchedule({ ...active, areaName: area?.name || 'Unknown' });
    } else {
      setActiveSchedule(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    checkActiveSchedule();
    const interval = setInterval(checkActiveSchedule, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleEmergencyStop = () => {
    if (!activeSchedule) return;
    
    if (window.confirm("Are you sure you want to trigger an EMERGENCY STOP? All water distribution for this area will cease immediately.")) {
       mockSchedules.deactivate(activeSchedule.id);
       setToast({ message: "EMERGENCY STOP TRIGGERED! Distribution halted.", type: "error" });
       checkActiveSchedule();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500 dark:text-gray-400">{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      
      {/* Immersive Header */}
      <motion.div 
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-[2.5rem] p-10 overflow-hidden bg-white dark:bg-gray-800 shadow-2xl border border-gray-100 dark:border-gray-700"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/40">
                <Waves className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">
                Water Flow <span className="text-blue-600">Terminal</span>
              </h1>
            </div>
            <p className="text-lg text-gray-500 dark:text-gray-400 font-medium">
              Real-time monitoring system for area-wise water distribution.
            </p>
          </div>

          {activeSchedule && (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="px-6 py-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-500/30 rounded-3xl flex items-center gap-4"
            >
              <div className="relative flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500"></span>
              </div>
              <div>
                <p className="text-emerald-700 dark:text-emerald-400 font-black uppercase tracking-widest text-xs">System Status</p>
                <p className="text-emerald-900 dark:text-emerald-100 font-bold">Active Distribution</p>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {activeSchedule ? (
          <motion.div
            key="active"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            {/* Main Visualizer */}
            <div className="lg:col-span-8 space-y-8">
              <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-gray-700 p-8 flex flex-col h-full">
                <div className="flex items-center justify-between mb-8">
                   <div className="flex items-center gap-4">
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-2xl">
                         <MapPin className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{activeSchedule.areaName}</h3>
                        <p className="text-sm text-gray-500">Target Distribution Area</p>
                      </div>
                   </div>
                   <div className="text-right">
                      <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Flow Rate</p>
                      <div className="flex items-center gap-2 text-blue-600">
                        <TrendingUp className="w-5 h-5" />
                        <span className="text-2xl font-black">1.2k L/m</span>
                      </div>
                   </div>
                </div>
                
                <div className="flex-1 min-h-[300px]">
                  <WaterFlowAnimation isActive={true} />
                </div>

                 <div className="mt-8 grid grid-cols-3 gap-4">
                    {[
                      { label: 'Pressure', value: '4.2 Bar', classes: 'text-blue-600 dark:text-blue-400' },
                      { label: 'Purity', value: '98%', classes: 'text-emerald-600 dark:text-emerald-400' },
                      { label: 'Capacity', value: '85%', classes: 'text-indigo-600 dark:text-indigo-400' },
                    ].map(stat => (
                      <div key={stat.label} className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                         <p className="text-[10px] font-black text-gray-400 uppercase mb-1">{stat.label}</p>
                         <p className={`text-lg font-bold ${stat.classes}`}>{stat.value}</p>
                      </div>
                    ))}
                 </div>
              </div>
            </div>

            {/* Timer Sidebar */}
            <div className="lg:col-span-4 space-y-8">
              <div className="bg-gray-900 rounded-[2.5rem] shadow-2xl p-8 flex flex-col items-center justify-center h-full relative overflow-hidden border border-white/10">
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-600 to-indigo-600" />
                
                <div className="mb-10 flex flex-col items-center">
                  <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center mb-4 border border-white/10">
                    <Timer className="w-8 h-8 text-blue-400" />
                  </div>
                  <h3 className="text-white font-black uppercase tracking-[0.3em] text-xs">Remaining Time</h3>
                </div>

                <CountdownTimer 
                  startTime={activeSchedule.start_time}
                  endTime={activeSchedule.end_time} 
                />

                <div className="mt-12 w-full space-y-4">
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between">
                    <span className="text-white/40 text-sm font-medium">Started At</span>
                    <span className="text-white font-bold">{activeSchedule.start_time}</span>
                  </div>
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between">
                    <span className="text-white/40 text-sm font-medium">Ending At</span>
                    <span className="text-white font-bold">{activeSchedule.end_time}</span>
                  </div>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleEmergencyStop}
                  className="mt-8 w-full py-4 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-colors shadow-lg shadow-red-600/30"
                >
                  Emergency Stop
                </motion.button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="inactive"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center p-20 bg-white dark:bg-gray-800 rounded-[3rem] border-4 border-dashed border-gray-100 dark:border-gray-700/50"
          >
            <div className="w-24 h-24 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center mb-8">
              <Droplets className="w-12 h-12 text-gray-300 dark:text-gray-600" />
            </div>
            <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-4 tracking-tight text-center">
              No Active Distribution
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-lg font-medium text-center max-w-md">
              The water system is currently in standby mode. 
              Schedule a distribution from the <span className="text-blue-600 font-bold">Water Schedule</span> tab to begin.
            </p>
            
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
               <div className="flex items-center gap-3 px-6 py-3 bg-blue-50 dark:bg-blue-900/30 rounded-2xl text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-800/50">
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-bold">Next Maintenance: Today</span>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
