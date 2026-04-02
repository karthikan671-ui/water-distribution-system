import React from 'react';
import { motion } from 'framer-motion';

export const WaterFlowAnimation: React.FC<{ isActive: boolean }> = ({ isActive }) => {
  return (
    <div className="relative w-full h-48 bg-blue-50 dark:bg-blue-900/10 rounded-2xl overflow-hidden border border-blue-100 dark:border-blue-800/30 shadow-inner">
      {/* Background static water */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-blue-200/30 dark:to-blue-900/20" />
      
      {/* Animated Waves */}
      {isActive ? (
        <>
          <motion.div
            animate={{
              x: [-100, 0],
              transition: { repeat: Infinity, duration: 2, ease: "linear" }
            }}
            className="absolute bottom-0 left-0 w-[200%] h-24 opacity-40"
          >
            <svg viewBox="0 0 800 200" className="w-full h-full preserve-3d">
              <path
                d="M 0 100 Q 100 50 200 100 T 400 100 T 600 100 T 800 100 V 200 H 0 Z"
                fill="url(#wave-gradient)"
              />
              <defs>
                <linearGradient id="wave-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="50%" stopColor="#60a5fa" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
              </defs>
            </svg>
          </motion.div>
          
          <motion.div
            animate={{
              x: [-150, 0],
              transition: { repeat: Infinity, duration: 3, ease: "linear" }
            }}
            className="absolute bottom-0 left-0 w-[200%] h-20 opacity-30"
          >
            <svg viewBox="0 0 800 200" className="w-full h-full preserve-3d">
              <path
                d="M 0 100 Q 100 150 200 100 T 400 100 T 600 100 T 800 100 V 200 H 0 Z"
                fill="#2563eb"
              />
            </svg>
          </motion.div>

          {/* Bubbles animation */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ y: 200, x: Math.random() * 400, opacity: 0 }}
              animate={{ 
                y: -50, 
                opacity: [0, 0.5, 0],
                transition: { 
                  duration: 2 + Math.random() * 2, 
                  repeat: Infinity, 
                  delay: Math.random() * 2 
                } 
              }}
              className="absolute w-2 h-2 bg-white/40 rounded-full blur-sm"
            />
          ))}

          {/* Flowing Text Indicator */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="px-6 py-2 bg-white/20 backdrop-blur-md rounded-full border border-white/30 shadow-xl"
            >
              <span className="text-blue-700 dark:text-blue-300 font-bold tracking-widest uppercase text-sm flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                </span>
                Water Flow Active
              </span>
            </motion.div>
          </div>
        </>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center opacity-40">
          <svg className="w-16 h-16 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.260.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
          <span className="text-gray-500 font-medium">Ready to Flow</span>
        </div>
      )}
    </div>
  );
};
