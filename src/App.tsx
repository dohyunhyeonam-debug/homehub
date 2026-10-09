import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { TopBar } from './components/TopBar';
import { MainClockHero } from './components/MainClockHero';
import { WeatherWidget } from './components/WeatherWidget';
import { MiniCalendar } from './components/MiniCalendar';
import { WeatherDetails } from './components/WeatherDetails';
import { WifiQrModal } from './components/WifiQrModal';
import { AutoStartSetup } from './components/AutoStartSetup';
import { AmbientScreen } from './components/AmbientScreen';
import { useWakeLock } from './hooks/useWakeLock';
import { useBattery } from './hooks/useBattery';
import { WeatherInfo } from './types/hub';
import { KOREA_CITIES, CityLocation, fetchWeatherData } from './utils/weatherApi';

export default function App() {
  const [isScreensaver, setIsScreensaver] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isWifiModalOpen, setIsWifiModalOpen] = useState<boolean>(false);
  const [isAutoStartModalOpen, setIsAutoStartModalOpen] = useState<boolean>(false);
  const [currentHour, setCurrentHour] = useState<number>(() => new Date().getHours());

  // Wake Lock Hook (Screen On)
  const { isLocked: isWakeLocked, toggleWakeLock, requestLock } = useWakeLock();

  // Battery Hook
  const battery = useBattery();

  // City & Weather
  const [currentCity, setCurrentCity] = useState<CityLocation>(KOREA_CITIES[0]);
  const [weather, setWeather] = useState<WeatherInfo | null>(null);

  // Update current hour periodically for the adaptive backdrop
  useEffect(() => {
    const updateHour = () => {
      const h = new Date().getHours();
      setCurrentHour(h);
    };
    const timer = setInterval(updateHour, 30000);
    return () => clearInterval(timer);
  }, []);

  // Compute subtle background shift based on the hour:
  // 13:00 (midday) = deep neutral (#0a0a0b)
  // 01:00 (midnight) = very dark indigo (#070814)
  const backdropTheme = useMemo(() => {
    const angle = ((currentHour - 13) / 24) * 2 * Math.PI;
    const indigoFactor = Math.max(0, Math.min(1, (1 - Math.cos(angle)) / 2));

    const r = Math.round(10 - 3 * indigoFactor);
    const g = Math.round(10 - 2 * indigoFactor);
    const b = Math.round(11 + 9 * indigoFactor);

    const bgColor = `rgb(${r}, ${g}, ${b})`;

    const glowR = Math.round(38 + 7 * indigoFactor);
    const glowG = Math.round(38 + 2 * indigoFactor);
    const glowB = Math.round(45 + 60 * indigoFactor);
    const glowAlpha = (0.12 + 0.18 * indigoFactor).toFixed(2);
    const glow = `radial-gradient(ellipse 90% 60% at 50% -10%, rgba(${glowR}, ${glowG}, ${glowB}, ${glowAlpha}), transparent 75%)`;

    return { bgColor, glow };
  }, [currentHour]);

  const loadWeather = useCallback(async (city: CityLocation) => {
    const w = await fetchWeatherData(city.lat, city.lng);
    setWeather(w);
  }, []);

  useEffect(() => {
    loadWeather(currentCity);
    const interval = setInterval(() => {
      loadWeather(currentCity);
    }, 15 * 60 * 1000); // 15 min refresh
    return () => clearInterval(interval);
  }, [currentCity, loadWeather]);

  // Fullscreen Detection & Listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
      }
    } catch (err) {
      console.warn('Fullscreen toggle error:', err);
    }
  };

  // Activate wake lock on initial load
  useEffect(() => {
    requestLock();
  }, [requestLock]);

  // Fullscreen Minimal Desk Clock mode
  if (isScreensaver) {
    return (
      <AmbientScreen
        weather={weather}
        onExit={() => setIsScreensaver(false)}
      />
    );
  }

  return (
    <div
      className="min-h-screen text-neutral-100 flex flex-col antialiased transition-colors duration-1000 relative overflow-x-hidden"
      style={{ backgroundColor: backdropTheme.bgColor }}
    >
      {/* Subtle adaptive ambient glow overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-1000"
        style={{ background: backdropTheme.glow }}
      />

      {/* Top Bar (단 한 곳에만 기능 버튼 배치) */}
      <TopBar
        isScreensaver={isScreensaver}
        toggleScreensaver={() => setIsScreensaver(!isScreensaver)}
        isFullscreen={isFullscreen}
        toggleFullscreen={toggleFullscreen}
        isWakeLocked={isWakeLocked}
        toggleWakeLock={toggleWakeLock}
        onOpenAutoStartModal={() => setIsAutoStartModalOpen(true)}
        onOpenWifiModal={() => setIsWifiModalOpen(true)}
      />

      {/* Main Container */}
      <main className="relative z-10 flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6 flex flex-col justify-between">
        <div className="space-y-6">
          {/* Main Hero: 시계가 확실한 메인 비주얼 */}
          <MainClockHero battery={battery} />

          {/* Secondary Sub-Grid: 실시간 날씨 / 이번 달 달력 / 5일 주간 예보 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <WeatherWidget
              weather={weather}
              currentCity={currentCity}
              onSelectCity={(city) => {
                setCurrentCity(city);
                loadWeather(city);
              }}
            />
            <MiniCalendar />
            <WeatherDetails weather={weather} />
          </div>
        </div>

        {/* Clean Footer (중복 버튼/링크 완전 제거) */}
        <footer className="pt-6 pb-2 text-center text-[11px] text-neutral-600 font-mono">
          <span>LIVING ROOM STANDBY HUB · 24/7 ACTIVE</span>
        </footer>
      </main>

      {/* Modals */}
      <AutoStartSetup
        isOpen={isAutoStartModalOpen}
        onClose={() => setIsAutoStartModalOpen(false)}
      />

      <WifiQrModal
        isOpen={isWifiModalOpen}
        onClose={() => setIsWifiModalOpen(false)}
      />
    </div>
  );
}
