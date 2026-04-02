import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CountdownTimerProps {
  startTime?: string;
  endTime?: string;
  onComplete?: () => void;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ startTime, endTime, onComplete }) => {
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number } | null>(null);
  const [status, setStatus] = useState<'pending' | 'active' | 'completed'>('pending');
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const parseTime = (timeStr: string | undefined): Date | null => {
    if (!timeStr) return null;
    const cleaned = timeStr.trim().toUpperCase();
    const match = cleaned.match(/(\d+)[:.](\d+)\s*(AM|PM)/);
    if (!match) return null;

    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const period = match[3];

    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;

    const d = new Date();
    d.setHours(hours, minutes, 0, 0);
    return d;
  };

  useEffect(() => {
    if (!endTime) return;

    const updateTimer = () => {
      const now = new Date();
      let start = parseTime(startTime);
      let end = parseTime(endTime);

      if (!end) return true;

      // Logic: If the end time has already passed TODAY, we assume it's for the next day.
      // This is crucial for future schedules.
      if (end.getTime() <= now.getTime()) {
        end.setDate(end.getDate() + 1);
        if (start) start.setDate(start.getDate() + 1);
      }

      // If we have a start time and it's in the future
      if (start && now < start) {
        setStatus('pending');
        const diff = start.getTime() - now.getTime();
        setTimeLeft({
          hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((diff / (1000 * 60)) % 60),
          seconds: Math.floor((diff / 1000) % 60)
        });
        return false;
      }

      // If now is between start and end
      if (now < end) {
        setStatus('active');
        const diff = end.getTime() - now.getTime();
        setTimeLeft({
          hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((diff / (1000 * 60)) % 60),
          seconds: Math.floor((diff / 1000) % 60)
        });
        return false;
      }

      // If now passed the end
      setStatus('completed');
      setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
      if (onCompleteRef.current) onCompleteRef.current();
      return true;
    };

    updateTimer();
    const interval = setInterval(() => {
      if (updateTimer()) clearInterval(interval);
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, endTime]);

  if (!timeLeft) return null;

  const units = [
    { label: 'Hours', value: timeLeft.hours.toString().padStart(2, '0') },
    { label: 'Minutes', value: timeLeft.minutes.toString().padStart(2, '0') },
    { label: 'Seconds', value: timeLeft.seconds.toString().padStart(2, '0') },
  ];

  return (
    <div className="flex flex-col items-center">
      <motion.div 
        key={status}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`px-6 py-2 rounded-2xl text-xs font-black uppercase tracking-[0.2em] mb-12 shadow-xl border ${
          status === 'pending' ? 'bg-amber-500/20 text-amber-500 border-amber-500/30' : 
          status === 'active' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-400/30 animate-pulse' :
          'bg-gray-500/20 text-gray-400 border-gray-500/30'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${status === 'active' ? 'bg-emerald-400' : 'bg-current opacity-50'}`} />
          {status === 'pending' ? 'Starting Soon...' : status === 'active' ? 'Distribution Active' : 'Distribution Ended'}
        </div>
      </motion.div>

      <div className="flex gap-3 items-center">
        {units.map((unit, i) => (
          <React.Fragment key={unit.label}>
            <div className="flex flex-col items-center">
              <div className="relative bg-[#0a0a0a] border border-white/5 rounded-2xl px-4 py-3 min-w-[70px] shadow-xl overflow-hidden group">
                <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent group-hover:via-blue-400/80 transition-all duration-500" />
                <AnimatePresence mode="popLayout">
                  <motion.span
                    key={unit.value}
                    initial={{ y: 20, opacity: 0, filter: 'blur(8px)' }}
                    animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                    exit={{ y: -20, opacity: 0, filter: 'blur(4px)' }}
                    className="text-4xl font-black text-blue-400 tracking-tighter block text-center drop-shadow-[0_0_10px_rgba(96,165,250,0.3)]"
                  >
                    {unit.value}
                  </motion.span>
                </AnimatePresence>
                <div className="absolute inset-x-0 bottom-0 h-[10px] bg-gradient-to-t from-blue-500/5 to-transparent" />
              </div>
              <span className="text-[9px] font-black text-gray-500 dark:text-gray-500 mt-2 uppercase tracking-[0.2em] leading-none">
                {unit.label}
              </span>
            </div>
            {i < units.length - 1 && (
              <div className="mb-6 self-center">
                <div className="flex flex-col gap-2">
                  <div className={`w-1 h-1 rounded-full ${status === 'active' ? 'bg-blue-500' : 'bg-gray-800'}`} />
                  <div className={`w-1 h-1 rounded-full ${status === 'active' ? 'bg-blue-500' : 'bg-gray-800'}`} />
                </div>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
