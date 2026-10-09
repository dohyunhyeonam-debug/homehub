import React from 'react';
import { Sun, Cloud, CloudRain, CloudSnow, CloudLightning, CloudFog } from 'lucide-react';
import { WeatherInfo } from '../types/hub';

interface WeatherDetailsProps {
  weather: WeatherInfo | null;
}

export const WeatherDetails: React.FC<WeatherDetailsProps> = ({ weather }) => {
  if (!weather) return null;

  const renderWeatherIcon = (code: number) => {
    if (code === 0 || code === 1) return <Sun className="w-4 h-4 text-neutral-100" />;
    if (code >= 51 && code <= 82) return <CloudRain className="w-4 h-4 text-neutral-300" />;
    if (code >= 71 && code <= 86) return <CloudSnow className="w-4 h-4 text-neutral-200" />;
    if (code >= 95) return <CloudLightning className="w-4 h-4 text-neutral-100" />;
    if (code === 45 || code === 48) return <CloudFog className="w-4 h-4 text-neutral-400" />;
    return <Cloud className="w-4 h-4 text-neutral-300" />;
  };

  return (
    <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-4">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-neutral-800/80">
        <span className="text-xs font-semibold text-neutral-200">
          주간 날씨 예보
        </span>
        <span className="text-[11px] text-neutral-500 font-mono">
          강수확률 {weather.precipitationProb}%
        </span>
      </div>

      <div className="space-y-2">
        {weather.daily.map((d, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between text-xs py-1 px-1.5 rounded hover:bg-neutral-800/40 font-mono"
          >
            <span className="w-16 text-neutral-300">{d.dayName}</span>
            <div className="flex items-center gap-1.5">
              {renderWeatherIcon(d.weatherCode)}
            </div>
            <div className="flex items-center gap-2 text-right">
              <span className="text-neutral-200 font-semibold tabular-nums">{d.high}°</span>
              <span className="text-neutral-500 text-[11px]">/</span>
              <span className="text-neutral-500 tabular-nums">{d.low}°</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
