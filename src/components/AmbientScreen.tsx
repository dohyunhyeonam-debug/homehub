import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock } from 'lucide-react';
import { WeatherInfo } from '../types/hub';

interface AmbientScreenProps {
  weather: WeatherInfo | null;
  onExit: () => void;
}

export const AmbientScreen: React.FC<AmbientScreenProps> = ({ weather, onExit }) => {
  const [time, setTime] = useState(new Date());
  const [burnInOffset, setBurnInOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Subtle pixel shifting every 60 seconds to protect laptop display from burn-in
  useEffect(() => {
    const burnTimer = setInterval(() => {
      setBurnInOffset({
        x: Math.floor(Math.random() * 16) - 8,
        y: Math.floor(Math.random() * 12) - 6,
      });
    }, 60000);
    return () => clearInterval(burnTimer);
  }, []);

  const hours = time.getHours().toString().padStart(2, '0');
  const minutes = time.getMinutes().toString().padStart(2, '0');
  const seconds = time.getSeconds().toString().padStart(2, '0');

  const year = time.getFullYear();
  const month = time.getMonth() + 1;
  const date = time.getDate();
  const dayNames = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
  const dayName = dayNames[time.getDay()];

  return (
    <div
      onClick={onExit}
      className="fixed inset-0 z-50 bg-black text-neutral-100 flex flex-col justify-between p-8 select-none cursor-pointer"
    >
      {/* Top Header */}
      <div className="flex items-center justify-between text-xs text-neutral-500 font-mono">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          <span>FULLSCREEN CLOCK</span>
        </div>
        <span>화면 클릭 시 대시보드 복귀</span>
      </div>

      {/* Center Huge Minimalist Clock */}
      <div
        className="flex-1 flex flex-col items-center justify-center transition-transform duration-1000 ease-in-out"
        style={{
          transform: `translate(${burnInOffset.x}px, ${burnInOffset.y}px)`,
        }}
      >
        <div className="flex items-baseline gap-2">
          <span className="text-[18vw] leading-none font-black font-mono tracking-tighter text-white tabular-nums">
            {hours}:{minutes}
          </span>
          <span className="text-[4vw] font-bold font-mono text-neutral-600 tabular-nums">
            :{seconds}
          </span>
        </div>

        <div className="mt-4 flex items-center gap-3 text-lg sm:text-2xl font-light text-neutral-400 font-mono">
          <span>{year}. {month}. {date}.</span>
          <span className="text-neutral-600">·</span>
          <span>{dayName}</span>
          {weather && (
            <>
              <span className="text-neutral-600">·</span>
              <span className="text-neutral-200 font-normal">{weather.temperature}°C</span>
              <span className="text-neutral-500 text-base">({weather.weatherText})</span>
            </>
          )}
        </div>
      </div>

      {/* Bottom Quiet Status */}
      <div className="flex items-center justify-between text-[11px] text-neutral-600 font-mono">
        <span>OLED 번인 보호 모드 활성 (60초 주기 픽셀 시프트)</span>
        <button
          onClick={onExit}
          className="hover:text-neutral-300 underline cursor-pointer"
        >
          대시보드로 나가기
        </button>
      </div>
    </div>
  );
};

