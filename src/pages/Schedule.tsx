import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, Send, MessageSquare, Droplets, Timer } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Area, WaterSchedule } from '../lib/supabase';
import { mockAreas, mockSchedules, mockUsers, mockSmsLogs } from '../lib/mockStore';
import { Toast } from '../components/Toast';
import { WaterFlowAnimation } from '../components/WaterFlowAnimation';
import { CountdownTimer } from '../components/CountdownTimer';

interface ScheduleWithArea extends WaterSchedule {
  areas?: Area;
}

export function Schedule() {
  const { t } = useTranslation();
  const [areas, setAreas] = useState<Area[]>([]);
  const [schedules, setSchedules] = useState<ScheduleWithArea[]>([]);
  const [selectedAreaId, setSelectedAreaId] = useState('');
  const [startHour, setStartHour] = useState('06');
  const [startMinute, setStartMinute] = useState('00');
  const [startPeriod, setStartPeriod] = useState('AM');
  const [endHour, setEndHour] = useState('09');
  const [endMinute, setEndMinute] = useState('00');
  const [endPeriod, setEndPeriod] = useState('AM');
  const [sending, setSending] = useState(false);
  
  const [activeStartTime, setActiveStartTime] = useState<string | null>(null);
  const [activeEndTime, setActiveEndTime] = useState<string | null>(null);
  const [activeAreaName, setActiveAreaName] = useState<string | null>(null);

  const hoursList = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  const minutesList = Array.from({ length: 12 }, (_, i) => (i * 5).toString().padStart(2, '0')); // 00, 05, 10...55
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    try {
      const areasData = mockAreas.getAll();
      const schedulesData = mockSchedules.getAll().map((schedule) => ({
        ...schedule,
        areas: areasData.find((a) => a.id === schedule.area_id),
      }));

      setAreas(areasData);
      setSchedules(schedulesData);
      
      // Load active monitoring state if any
      const active = schedulesData.find(s => s.is_active);
      if (active) {
        setActiveStartTime(active.start_time);
        setActiveEndTime(active.end_time);
        setActiveAreaName(active.areas?.name || 'Unknown Area');
      }

      if (areasData.length > 0 && !selectedAreaId) {
        setSelectedAreaId(areasData[0].id);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setToast({ message: 'Error loading data', type: 'error' });
    }
  };

  const handleSetSchedule = async () => {
    if (!selectedAreaId) {
      setToast({ message: 'Please fill all fields', type: 'error' });
      return;
    }

    setSending(true);
    try {
      const usersInArea = mockUsers.getByArea(selectedAreaId);
      
      if (usersInArea.length === 0) {
        setToast({ message: 'Cannot set schedule: This area has no registered users!', type: 'error' });
        return;
      }

      const start12 = `${startHour}:${startMinute} ${startPeriod}`;
      const end12 = `${endHour}:${endMinute} ${endPeriod}`;

      mockSchedules.set(selectedAreaId, start12, end12);

      const areaName = areas.find((a) => a.id === selectedAreaId)?.name || 'Unknown Area';

      usersInArea.forEach((u) => {
        mockSmsLogs.add({
          user_id: u.id,
          message: `தண்ணீர் விநியோகம் ${start12} முதல் ${end12} வரை திட்டமிடப்பட்டுள்ளது`,
          status: 'sent',
          area_name: areaName,
          phone: u.phone,
        });
      });

      setActiveStartTime(start12);
      setActiveEndTime(end12);
      setActiveAreaName(areaName);

      setToast({
        message: `Schedule set! SMS sent to ${usersInArea.length} users`,
        type: 'success',
      });

      loadData();
    } catch (error) {
      console.error('Error setting schedule:', error);
      setToast({ message: error instanceof Error ? error.message : 'Error setting schedule', type: 'error' });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-8">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          {t('schedule.title')}
        </h1>
        {activeEndTime && (
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full border border-blue-100 dark:border-blue-800/50">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-sm font-bold uppercase tracking-wider">Live Monitoring Enabled</span>
          </div>
        )}
      </div>

      {/* Live Monitoring Dashboard (appears when schedule is set) */}
      <AnimatePresence>
        {activeEndTime && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden group">
              <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/50">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Droplets className="w-5 h-5 text-blue-500" />
                    Distribution: <span className="text-blue-600">{activeAreaName}</span>
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Real-time flow visualization and timing</p>
                </div>
                <div className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-xs font-black uppercase tracking-widest">
                  Active Channel
                </div>
              </div>
              <div className="p-6">
                <WaterFlowAnimation isActive={!!activeEndTime} />
              </div>
            </div>

            <div className="bg-gray-900 rounded-3xl shadow-2xl border border-white/10 p-8 flex flex-col items-center justify-center relative overflow-hidden group">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-500/20 transition-all duration-700" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 group-hover:bg-indigo-500/20 transition-all duration-700" />
              
              <div className="relative z-10 w-full flex flex-col items-center">
                <div className="mb-6 flex flex-col items-center">
                  <div className="p-3 bg-white/5 rounded-2xl mb-3 border border-white/10 group-hover:scale-110 transition-transform duration-500">
                    <Timer className="w-6 h-6 text-blue-400" />
                  </div>
                </div>
                
                <CountdownTimer 
                  startTime={activeStartTime || undefined}
                  endTime={activeEndTime || undefined} 
                  onComplete={() => {
                    setActiveEndTime(null);
                    setActiveStartTime(null);
                    setActiveAreaName(null);
                    loadData();
                  }} 
                />
                
                <div className="mt-8 px-5 py-2 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm">
                  <p className="text-blue-100/40 text-xs font-medium">Window: {activeStartTime} - {activeEndTime}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('schedule.selectArea')}
            </label>
            <select
              value={selectedAreaId}
              onChange={(e) => setSelectedAreaId(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {areas.map((area) => (
                <option key={area.id} value={area.id}>
                  {area.name} — {area.location}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                {t('schedule.startTime')}
              </label>
              <div className="flex gap-2">
                <select
                  value={startHour}
                  onChange={(e) => setStartHour(e.target.value)}
                  className="flex-1 px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {hoursList.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
                <span className="self-center font-bold dark:text-white">:</span>
                <select
                  value={startMinute}
                  onChange={(e) => setStartMinute(e.target.value)}
                  className="flex-1 px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {minutesList.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <select
                  value={startPeriod}
                  onChange={(e) => setStartPeriod(e.target.value)}
                  className="flex-1 px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                {t('schedule.endTime')}
              </label>
              <div className="flex gap-2">
                <select
                  value={endHour}
                  onChange={(e) => setEndHour(e.target.value)}
                  className="flex-1 px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {hoursList.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
                <span className="self-center font-bold dark:text-white">:</span>
                <select
                  value={endMinute}
                  onChange={(e) => setEndMinute(e.target.value)}
                  className="flex-1 px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {minutesList.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <select
                  value={endPeriod}
                  onChange={(e) => setEndPeriod(e.target.value)}
                  className="flex-1 px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
            </div>
            </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6 border border-blue-100 dark:border-blue-800/50">
            <h4 className="text-sm font-bold text-blue-800 dark:text-blue-300 uppercase tracking-widest mb-3 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              SMS Preview (Tamil)
            </h4>
            <div className="bg-white dark:bg-gray-700 rounded-xl p-4 shadow-inner border border-blue-50 dark:border-gray-600">
               <p className="text-gray-900 dark:text-white font-medium leading-relaxed italic">
                 "தண்ணீர் விநியோகம் {startHour}:{startMinute} {startPeriod} முதல் {endHour}:{endMinute} {endPeriod} வரை திட்டமிடப்பட்டுள்ளது"
               </p>
               <div className="mt-3 flex items-center gap-2">
                 <div className="flex -space-x-2">
                   {[1, 2, 3].map(i => (
                     <div key={i} className="w-6 h-6 rounded-full border-2 border-white dark:border-gray-700 bg-blue-100 dark:bg-blue-800 flex items-center justify-center text-[10px] font-bold text-blue-600 dark:text-blue-300">
                       {i}
                     </div>
                   ))}
                 </div>
                 <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold">
                    Will be sent to {mockUsers.getByArea(selectedAreaId).length} users in this area
                 </span>
               </div>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSetSchedule}
            disabled={sending}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
            {sending ? t('schedule.sendingSMS') : t('schedule.setSchedule')}
          </motion.button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            {t('schedule.currentSchedules')}
          </h2>
        </div>
        <div className="p-6">
          {schedules.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">
              {t('schedule.noSchedules')}
            </p>
          ) : (
            <div className="space-y-4">
              {schedules.map((schedule) => (
                <motion.div
                  key={schedule.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      {schedule.areas?.name}
                      <span className="text-xs font-normal text-gray-500 dark:text-gray-400 px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-600">
                        {schedule.areas?.location}
                      </span>
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {schedule.start_time} - {schedule.end_time}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      schedule.is_active
                        ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                        : 'bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200'
                    }`}
                  >
                    {schedule.is_active ? t('schedule.active') : t('schedule.inactive')}
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
