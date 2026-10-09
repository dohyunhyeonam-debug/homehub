import React from 'react';
import { Maximize, Minimize, Moon, Sun, ShieldCheck, QrCode, Power, Camera } from 'lucide-react';
import { AmbientLightState } from '../hooks/useAmbientLightSensor';

interface TopBarProps {
  isScreensaver: boolean;
  toggleScreensaver: () => void;
  isFullscreen: boolean;
  toggleFullscreen: () => void;
  isWakeLocked: boolean;
  toggleWakeLock: () => void;
  onOpenAutoStartModal: () => void;
  onOpenWifiModal: () => void;
  ambientLight: AmbientLightState;
}

export const TopBar: React.FC<TopBarProps> = ({
  isScreensaver,
  toggleScreensaver,
  isFullscreen,
  toggleFullscreen,
  isWakeLocked,
  toggleWakeLock,
  onOpenAutoStartModal,
  onOpenWifiModal,
  ambientLight,
}) => {
  return (
    <header className="flex items-center justify-between px-6 py-3.5 border-b border-neutral-800/60 bg-neutral-950/60 backdrop-blur-md sticky top-0 z-40 select-none">
      {/* Brand: Clean simple title */}
      <div className="flex items-center gap-2.5">
        <span className="text-sm font-bold tracking-wider text-neutral-100 font-mono">
          HUB
        </span>
        <span className="text-xs text-neutral-500 font-mono">
          · LIVING ROOM
        </span>
      </div>

      {/* Action controls */}
      <div className="flex items-center gap-2">
        {/* Camera Ambient Light Sensor Toggle */}
        <button
          onClick={ambientLight.toggleSensor}
          title={
            ambientLight.isEnabled
              ? `조도 감지 켜짐: ${ambientLight.brightness}% (${ambientLight.isDark ? '소등 감지됨 / 나이트 모드' : '점등 상태'})`
              : '카메라로 거실 불 켜짐/꺼짐을 감지하여 자동 밝기 및 나이트 모드 실행'
          }
          className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono rounded-lg transition-colors cursor-pointer border ${
            ambientLight.isEnabled
              ? ambientLight.isDark
                ? 'bg-amber-950/40 text-amber-300 border-amber-600/40 shadow-sm'
                : 'bg-neutral-800 text-neutral-200 border-neutral-700'
              : 'bg-neutral-950 text-neutral-500 border-neutral-800 hover:text-neutral-300'
          }`}
        >
          <Camera className={`w-3.5 h-3.5 ${ambientLight.isEnabled ? (ambientLight.isDark ? 'text-amber-400' : 'text-neutral-200') : 'text-neutral-500'}`} />
          <span>
            {ambientLight.isEnabled
              ? `${ambientLight.isDark ? '🌙' : '💡'} 조도 ${ambientLight.brightness}%`
              : '조도 센서'}
          </span>
        </button>

        <button
          onClick={onOpenAutoStartModal}
          title="부팅 시 자동 실행 설정"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-neutral-300 hover:text-white bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-lg transition-colors cursor-pointer"
        >
          <Power className="w-3.5 h-3.5 text-neutral-400" />
          <span>자동 실행 설정</span>
        </button>

        <button
          onClick={onOpenWifiModal}
          title="Wi-Fi QR 코드"
          className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-900 rounded-lg transition-colors cursor-pointer"
        >
          <QrCode className="w-4 h-4" />
        </button>

        <button
          onClick={toggleScreensaver}
          title={isScreensaver ? '대시보드 보기' : '대형 시계 모드'}
          className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-900 rounded-lg transition-colors cursor-pointer"
        >
          {isScreensaver ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        <button
          onClick={toggleWakeLock}
          title={isWakeLocked ? '화면 켜짐 유지 활성' : '화면 켜짐 유지 비활성'}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono rounded-lg transition-colors cursor-pointer border ${
            isWakeLocked
              ? 'bg-neutral-800 text-neutral-100 border-neutral-700'
              : 'bg-neutral-950 text-neutral-500 border-neutral-800 hover:text-neutral-300'
          }`}
        >
          <ShieldCheck className={`w-3.5 h-3.5 ${isWakeLocked ? 'text-emerald-400' : 'text-neutral-600'}`} />
          <span className="hidden sm:inline">{isWakeLocked ? '절전 방지 ON' : '절전 허용'}</span>
        </button>

        <button
          onClick={toggleFullscreen}
          title="전체화면 (F11)"
          className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-900 rounded-lg transition-colors cursor-pointer"
        >
          {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};

