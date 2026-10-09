import React from 'react';
import { X, Camera, Lock, RefreshCw, Sun, Moon, AlertTriangle } from 'lucide-react';
import { AmbientLightState } from '../hooks/useAmbientLightSensor';

interface CameraPermissionGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  ambientLight: AmbientLightState;
}

export const CameraPermissionGuideModal: React.FC<CameraPermissionGuideModalProps> = ({
  isOpen,
  onClose,
  ambientLight,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-lg p-6 relative shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-neutral-400 hover:text-neutral-100 rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-2">
          <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-neutral-100">카메라 조도 센서 권한 허용 안내</h2>
            <p className="text-xs text-neutral-400">
              브라우저에서 카메라 권한 팝업이 차단된 경우 아래 절차로 1초 만에 허용할 수 있습니다.
            </p>
          </div>
        </div>

        {/* Step-by-step resolution */}
        <div className="mt-4 space-y-3 text-xs">
          <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2.5">
            <div className="font-semibold text-neutral-200 flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-amber-400" />
              <span>브라우저 주소창에서 카메라 허용하기</span>
            </div>

            <ol className="list-decimal list-inside space-y-1.5 text-neutral-400 leading-relaxed">
              <li>
                브라우저 맨 위 주소창 왼쪽의 <span className="text-neutral-100 font-semibold font-mono">🔒(자물쇠)</span> 또는 <span className="text-neutral-100 font-semibold font-mono">설정/튠</span> 아이콘을 클릭합니다.
              </li>
              <li>
                메뉴에서 <span className="text-neutral-100 font-semibold">카메라 (Camera)</span> 항목을 찾아 <span className="text-emerald-400 font-semibold">"허용"</span>으로 변경합니다.
              </li>
              <li>
                윈도우 10/11 시스템 설정: <span className="text-neutral-300">설정 &gt; 개인 정보 &gt; 카메라 &gt; '앱에서 카메라 액세스 허용'</span>이 켜져 있는지 확인합니다.
              </li>
            </ol>

            <div className="pt-2 flex justify-end">
              <button
                onClick={async () => {
                  await ambientLight.toggleSensor();
                  if (!ambientLight.error) {
                    onClose();
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-100 font-semibold rounded-lg transition-colors cursor-pointer text-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>카메라 다시 연결 시도</span>
              </button>
            </div>
          </div>

          {/* Quick Fallback: Instant Light Toggle Simulation */}
          <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-neutral-200">
                카메라 없이 즉시 테스트 / 수동 조도 모드
              </span>
              <span className="text-[10px] text-neutral-500 font-mono">
                {ambientLight.isSimulated ? '시뮬레이션 모드 활성' : '수동 토글'}
              </span>
            </div>
            <p className="text-neutral-400 mb-3 text-[11px] leading-relaxed">
              카메라 권한 없이도 아래 버튼을 누르면 실제와 동일하게 2.5초 동안 서서히 어두워지며 나이트 모드가 실행됩니다.
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  ambientLight.toggleSimulatedLight();
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl font-medium cursor-pointer transition-all ${
                  ambientLight.isDark
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-neutral-800 text-neutral-200 hover:bg-neutral-700'
                }`}
              >
                {ambientLight.isDark ? (
                  <>
                    <Sun className="w-4 h-4 text-amber-400" />
                    <span>불 켜기 (화면 서서히 밝아짐)</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4 text-indigo-400" />
                    <span>불 끄기 (화면 서서히 어두워짐 & 나이트)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-medium rounded-lg text-xs cursor-pointer transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
