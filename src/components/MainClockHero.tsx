import React, { useState, useEffect } from 'react';
import { BatteryCharging, Battery } from 'lucide-react';
import { BatteryState } from '../hooks/useBattery';

interface MainClockHeroProps {
  battery: BatteryState;
  isNightMode?: boolean;
}

export const MainClockHero: React.FC<MainClockHeroProps> = ({ battery, isNightMode = false }) => {
  const [time, setTime] = useState(new Date());
  const [is24Hour, setIs24Hour] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = time.getHours();
  const minutes = time.getMinutes().toString().padStart(2, '0');
  const seconds = time.getSeconds().toString().padStart(2, '0');
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = is24Hour ? hours.toString().padStart(2, '0') : (hours % 12 || 12).toString();

  const year = time.getFullYear();
  const month = time.getMonth() + 1;
  const date = time.getDate();
  const dayNames = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
  const dayName = dayNames[time.getDay()];

  return (
    <div className="bg-neutral-900/60 border border-neutral-800 rounded-3xl p-8 sm:p-12 text-center flex flex-col items-center justify-center relative overflow-hidden select-none">
      {/* Top Meta Line: Date, 12/24H, Battery */}
      <div className="w-full flex items-center justify-between text-xs sm:text-sm text-neutral-400 font-mono mb-4 pb-4 border-b border-neutral-800/60">
        {/* Full Date */}
        <div className="flex items-center gap-2 text-neutral-200 font-semibold">
          <span>{year}년 {month}월 {date}일</span>
          <span className="text-neutral-600">·</span>
          <span>{dayName}</span>
        </div>

        {/* Battery & 12H/24H Toggle (단 한 곳에만 존재) */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 tabular-nums">
            {battery.charging ? (
              <BatteryCharging className="w-4 h-4 text-emerald-400" />
            ) : (
              <Battery className="w-4 h-4 text-neutral-400" />
            )}
            <span>{battery.level}%</span>
          </div>

          <span className="text-neutral-700">·</span>

          <button
            onClick={() => setIs24Hour(!is24Hour)}
            className="hover:text-neutral-100 transition-colors cursor-pointer px-2 py-0.5 rounded bg-neutral-800/80 hover:bg-neutral-800 text-[11px]"
            title="12시간/24시간 형식 전환"
          >
            {is24Hour ? '24H' : '12H'}
          </button>
        </div>
      </div>

      {/* Massive Main Clock Display (압도적 중심) */}
      <div className="py-2 sm:py-6 flex items-baseline justify-center gap-2 sm:gap-4">
        <span
          className={`text-8xl sm:text-9xl md:text-[11rem] lg:text-[13rem] leading-none font-black font-mono tracking-tighter tabular-nums drop-shadow-md transition-colors duration-1000 ${
            isNightMode ? 'text-amber-500/90' : 'text-neutral-100'
          }`}
        >
          {displayHours}:{minutes}
        </span>
        <div className="flex flex-col items-start pb-2 sm:pb-6">
          <span
            className={`text-2xl sm:text-4xl lg:text-5xl font-bold font-mono tabular-nums transition-colors duration-1000 ${
              isNightMode ? 'text-amber-600/80' : 'text-neutral-500'
            }`}
          >
            :{seconds}
          </span>
          {!is24Hour && (
            <span
              className={`text-xs sm:text-sm font-semibold uppercase tracking-widest mt-1 transition-colors duration-1000 ${
                isNightMode ? 'text-amber-600/70' : 'text-neutral-500'
              }`}
            >
              {period}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
