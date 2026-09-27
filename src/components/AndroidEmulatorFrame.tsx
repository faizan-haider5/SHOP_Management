import React, { useState, useEffect } from 'react';
import {
  WifiOff,
  BatteryMedium,
  Signal,
  RotateCcw,
  Smartphone,
  Maximize2,
  Code2,
  Download,
  Info,
} from 'lucide-react';
import { AppColors } from '../utils/colors';

interface AndroidEmulatorFrameProps {
  children: React.ReactNode;
  viewMode: 'frame' | 'mobile-full' | 'code';
  onChangeViewMode: (mode: 'frame' | 'mobile-full' | 'code') => void;
  onResetApp: () => void;
  onOpenCode: () => void;
}

export const AndroidEmulatorFrame: React.FC<AndroidEmulatorFrameProps> = ({
  children,
  viewMode,
  onChangeViewMode,
  onResetApp,
  onOpenCode,
}) => {
  const [currentTime, setCurrentTime] = useState('9:41');

  useEffect(() => {
    const update = () => {
      const d = new Date();
      const h = d.getHours();
      const m = d.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${h}:${m}`);
    };
    update();
    const interval = setInterval(update, 30000);
    return () => clearInterval(interval);
  }, []);

  if (viewMode === 'mobile-full') {
    return (
      <div className="w-full h-screen max-w-md mx-auto flex flex-col bg-[#F6F5F1] shadow-2xl relative overflow-hidden">
        {/* Android Status Bar */}
        <div className="h-7 bg-[#1B4B43] text-white px-4 flex items-center justify-between text-[11px] font-medium shrink-0 z-30 select-none">
          <span>{currentTime}</span>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-[10px] text-teal-200">
              <WifiOff size={11} />
              <span>Offline</span>
            </span>
            <Signal size={11} />
            <div className="flex items-center gap-0.5">
              <span>98%</span>
              <BatteryMedium size={13} className="text-emerald-300" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {children}
        </div>

        {/* Android Gesture Bar */}
        <div className="h-4 bg-[#F6F5F1] flex items-center justify-center shrink-0 z-30">
          <div className="w-32 h-1 bg-slate-400/80 rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-2 sm:p-4 overflow-y-auto no-scrollbar">
      {/* Device Physical Outer Shell (Pixel 8 / Galaxy S24 styled) */}
      <div className="relative w-full max-w-[390px] h-[812px] max-h-[92vh] bg-[#1E2328] rounded-[48px] p-[10px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7),0_0_0_1px_rgba(255,255,255,0.1)] flex flex-col border-[3px] border-[#313840] shrink-0">
        {/* Hardware Antenna Lines & Volume button hints */}
        <div className="absolute -left-[5px] top-24 w-[3px] h-12 bg-[#3A434C] rounded-l-sm" />
        <div className="absolute -left-[5px] top-40 w-[3px] h-12 bg-[#3A434C] rounded-l-sm" />
        <div className="absolute -right-[5px] top-32 w-[3px] h-16 bg-[#3A434C] rounded-r-sm" />

        {/* Inner Screen Bezel with curved corners */}
        <div className="flex-1 bg-[#F6F5F1] rounded-[38px] overflow-hidden flex flex-col relative shadow-inner">
          {/* Android Status Bar with Punch-Hole Camera */}
          <div className="h-7 bg-[#1B4B43] text-white px-5 flex items-center justify-between text-[11px] font-medium shrink-0 z-30 select-none">
            <span className="font-semibold">{currentTime}</span>

            {/* Front Camera Punch-Hole */}
            <div className="w-3.5 h-3.5 bg-black rounded-full border border-white/10 shadow-inner flex items-center justify-center">
              <div className="w-1 h-1 bg-[#102030] rounded-full" />
            </div>

            <div className="flex items-center gap-1.5">
              <span className="flex items-center gap-0.5 text-[9px] text-teal-200">
                <WifiOff size={10} />
              </span>
              <Signal size={10} />
              <div className="flex items-center gap-0.5">
                <span>98%</span>
                <BatteryMedium size={12} className="text-emerald-300" />
              </div>
            </div>
          </div>

          {/* App Body */}
          <div className="flex-1 flex flex-col overflow-hidden relative">
            {children}
          </div>

          {/* Android Gesture Navigation Pill */}
          <div className="h-4 bg-white border-t border-[#E3E0D8] flex items-center justify-center shrink-0 z-30">
            <div className="w-28 h-1 bg-slate-400 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
};
