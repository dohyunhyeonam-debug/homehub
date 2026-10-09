import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { TopBar } from './components/TopBar';
import { MainClockHero } from './components/MainClockHero';
import { WeatherWidget } from './components/WeatherWidget';
import { MiniCalendar } from './components/MiniCalendar';
import { WeatherDetails } from './components/WeatherDetails';
import { WifiQrModal } from './components/WifiQrModal';
import { AutoStartSetup } from './components/AutoStartSetup';
import { CameraPermissionGuideModal } from './components/CameraPermissionGuideModal';
import { AmbientScreen } from './components/AmbientScreen';
import { useWakeLock } from './hooks/useWakeLock';
import { useBattery } from './hooks/useBattery';
import { useAmbientLightSensor } from './hooks/useAmbientLightSensor';
import { WeatherInfo } from './types/hub';
import { KOREA_CITIES, CityLocation, fetchWeatherData } from './utils/weatherApi';

export default function App() {
  const [isScreensaver, setIsScreensaver] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isWifiModalOpen, setIsWifiModalOpen] = useState<boolean>(false);
  const [isAutoStartModalOpen, setIsAutoStartModalOpen] = useState<boolean>(false);
  const [isCameraGuideOpen, setIsCameraGuideOpen] = useState<boolean>(false);
  const [currentHour, setCurrentHour] = useState<number>(() => new Date().getHours());

  // Wake Lock Hook (Screen On)
  const { isLocked: isWakeLocked, toggleWakeLock, requestLock } = useWakeLock();

  // Battery Hook
  const battery = useBattery();

  // Camera Ambient Light Sensor Hook (Detects room lights on/off)
  const ambientLight = useAmbientLightSensor();

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

  // Dynamic screen brightness based on room lighting (via camera)
  // When lights are OFF (isDark): slowly dims down to ~0.36 and executes night mode
  // When lights are ON: slowly brightens up to 1.0
  const screenBrightness = useMemo(() => {
    if (!ambientLight.isEnabled) return 1.0;
    if (ambientLight.isDark) {
      return 0.38; // Dimmed for comfortable sleeping/dark room
    }
    // Room lights ON: dynamically map brightness from 0.75 to 1.0
    const ratio = Math.max(0, Math.min(1, (ambientLight.brightness - ambientLight.threshold) / 50));
    return Number((0.75 + ratio * 0.25).toFixed(2));
  }, [ambientLight.isEnabled, ambientLight.isDark, ambientLight.brightness, ambientLight.threshold]);

  const isNightMode = ambientLight.isEnabled && ambientLight.isDark;

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
      className="min-h-screen text-neutral-100 flex flex-col antialiased relative overflow-x-hidden"
      style={{
        backgroundColor: backdropTheme.bgColor,
        filter: `brightness(${screenBrightness})`,
        transition: 'filter 2.5s cubic-bezier(0.16, 1, 0.3, 1), background-color 2000ms ease',
      }}
    >
      {/* Subtle adaptive ambient glow overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-1000"
        style={{ background: backdropTheme.glow }}
      />

      {/* Camera Permission/Error Banner */}
      {ambientLight.error && (
        <div className="relative z-50 bg-amber-950/90 border-b border-amber-800 text-amber-200 px-4 py-2.5 text-xs flex items-center justify-between font-mono gap-3">
          <span className="truncate">{ambientLight.error}</span>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsCameraGuideOpen(true)}
              className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-semibold rounded border border-amber-500/40 cursor-pointer"
            >
              1초 해결 가이드
            </button>
            <button
              onClick={ambientLight.clearError}
              className="text-amber-400 hover:text-white cursor-pointer px-1.5"
            >
              닫기
            </button>
          </div>
        </div>
      )}

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
        ambientLight={ambientLight}
      />

      {/* Main Container */}
      <main className="relative z-10 flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6 flex flex-col justify-between">
        <div className="space-y-6">
          {/* Main Hero: 시계가 확실한 메인 비주얼 */}
          <MainClockHero battery={battery} isNightMode={isNightMode} />

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
        <footer className="pt-6 pb-2 flex items-center justify-between text-[11px] text-neutral-600 font-mono">
          <span>LIVING ROOM STANDBY HUB · 24/7 ACTIVE</span>
          {ambientLight.isEnabled && (
            <span className="text-neutral-500">
              {isNightMode ? '🌙 거실 소등 감지 · 나이트 모드 실행 중' : '💡 거실 점등 감지 · 주간 밝기'}
            </span>
          )}
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

      <CameraPermissionGuideModal
        isOpen={isCameraGuideOpen}
        onClose={() => setIsCameraGuideOpen(false)}
        ambientLight={ambientLight}
      />
    </div>
  );
}
