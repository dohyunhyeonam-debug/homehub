import React, { useState } from 'react';
import { 
  Sun, Cloud, CloudRain, CloudSnow, CloudFog, CloudLightning, 
  MapPin, Droplets, Wind 
} from 'lucide-react';
import { WeatherInfo } from '../types/hub';
import { KOREA_CITIES, CityLocation } from '../utils/weatherApi';

interface WeatherWidgetProps {
  weather: WeatherInfo | null;
  currentCity: CityLocation;
  onSelectCity: (city: CityLocation) => void;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({
  weather,
  currentCity,
  onSelectCity,
}) => {
  const [showCityPicker, setShowCityPicker] = useState(false);

  const renderWeatherIcon = (code: number, className: string = 'w-6 h-6') => {
    if (code === 0 || code === 1) return <Sun className={`${className} text-neutral-100`} />;
    if (code >= 51 && code <= 82) return <CloudRain className={`${className} text-neutral-300`} />;
    if (code >= 71 && code <= 86) return <CloudSnow className={`${className} text-neutral-200`} />;
    if (code >= 95) return <CloudLightning className={`${className} text-neutral-100`} />;
    if (code === 45 || code === 48) return <CloudFog className={`${className} text-neutral-400`} />;
    return <Cloud className={`${className} text-neutral-300`} />;
  };

  return (
    <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-5 flex flex-col justify-between">
      {/* City & High/Low Header */}
      <div className="flex items-center justify-between pb-3 border-b border-neutral-800/80 text-xs">
        <div className="relative">
          <button
            onClick={() => setShowCityPicker(!showCityPicker)}
            className="flex items-center gap-1.5 text-neutral-300 hover:text-white cursor-pointer font-medium"
          >
            <MapPin className="w-3.5 h-3.5 text-neutral-400" />
            <span>{currentCity.name}</span>
            <span className="text-[10px] text-neutral-500">▼</span>
          </button>

          {showCityPicker && (
            <div className="absolute left-0 top-full mt-2 w-36 bg-neutral-900 border border-neutral-700 rounded-xl shadow-xl p-1 z-50 grid grid-cols-2 gap-0.5">
              {KOREA_CITIES.map((city) => (
                <button
                  key={city.name}
                  onClick={() => {
                    onSelectCity(city);
                    setShowCityPicker(false);
                  }}
                  className={`text-left text-xs px-2 py-1 rounded transition-colors cursor-pointer ${
                    currentCity.name === city.name
                      ? 'bg-neutral-100 text-neutral-950 font-bold'
                      : 'text-neutral-300 hover:bg-neutral-800'
                  }`}
                >
                  {city.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {weather && (
          <span className="text-neutral-500 font-mono text-[11px]">
            최고 {weather.highTemp}° / 최저 {weather.lowTemp}°
          </span>
        )}
      </div>

      {/* Main Temperature & Condition */}
      {weather ? (
        <div className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {renderWeatherIcon(weather.weatherCode, 'w-8 h-8')}
              <div>
                <div className="text-3xl font-bold font-mono text-neutral-100 tabular-nums">
                  {weather.temperature}°C
                </div>
                <div className="text-xs text-neutral-400 mt-0.5">
                  {weather.weatherText} · 체감 {weather.apparentTemperature}°
                </div>
              </div>
            </div>

            <div className="text-right text-xs text-neutral-400 font-mono space-y-1">
              <div className="flex items-center gap-1 justify-end">
                <Droplets className="w-3 h-3 text-neutral-500" />
                <span>습도 {weather.humidity}%</span>
              </div>
              <div className="flex items-center gap-1 justify-end">
                <Wind className="w-3 h-3 text-neutral-500" />
                <span>풍속 {weather.windSpeed}m/s</span>
              </div>
            </div>
          </div>

          {/* Hourly strip */}
          <div className="mt-4 pt-3 border-t border-neutral-800/80 flex items-center justify-between gap-1 overflow-x-auto">
            {weather.hourly.slice(0, 5).map((h, idx) => (
              <div key={idx} className="flex flex-col items-center gap-1 min-w-[36px]">
                <span className="text-[10px] text-neutral-500 font-mono">{h.time}</span>
                {renderWeatherIcon(h.weatherCode, 'w-3.5 h-3.5')}
                <span className="text-xs font-semibold text-neutral-300 font-mono tabular-nums">
                  {h.temp}°
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="py-8 text-center text-xs text-neutral-500 font-mono">
          날씨 동기화 중...
        </div>
      )}
    </div>
  );
};
