import { useState, useEffect, useRef, useCallback } from 'react';

export interface AmbientLightState {
  isEnabled: boolean;
  isSupported: boolean;
  isSimulated: boolean;
  brightness: number; // 0 to 100
  isDark: boolean; // whether ambient light is low (lights off)
  threshold: number; // threshold to trigger dark mode (default 22)
  error: string | null;
  errorType: 'denied' | 'notfound' | 'inuse' | 'other' | null;
  toggleSensor: () => Promise<void>;
  setThreshold: (val: number) => void;
  toggleSimulatedLight: () => void;
  clearError: () => void;
}

export function useAmbientLightSensor(initialThreshold: number = 22): AmbientLightState {
  const [isEnabled, setIsEnabled] = useState<boolean>(false);
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const [isSimulated, setIsSimulated] = useState<boolean>(false);
  const [brightness, setBrightness] = useState<number>(65);
  const [isDark, setIsDark] = useState<boolean>(false);
  const [threshold, setThresholdState] = useState<number>(() => {
    const saved = localStorage.getItem('hub_light_threshold');
    return saved ? Number(saved) : initialThreshold;
  });
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<'denied' | 'notfound' | 'inuse' | 'other' | null>(null);

  const streamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const timerRef = useRef<number | null>(null);
  const smoothedBrightnessRef = useRef<number>(65);

  const setThreshold = useCallback((val: number) => {
    setThresholdState(val);
    localStorage.setItem('hub_light_threshold', val.toString());
  }, []);

  const clearError = useCallback(() => {
    setError(null);
    setErrorType(null);
  }, []);

  const stopStream = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.remove();
      videoRef.current = null;
    }
    if (canvasRef.current) {
      canvasRef.current.remove();
      canvasRef.current = null;
    }
  }, []);

  const startStream = useCallback(async () => {
    setError(null);
    setErrorType(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setIsSupported(false);
      setError('이 브라우저는 카메라 조도 감지를 지원하지 않습니다.');
      setErrorType('other');
      return;
    }

    try {
      // Use standard { video: true } without strict constraints to prevent device rejection
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });

      streamRef.current = stream;

      // Hidden video element to read frames
      const video = document.createElement('video');
      video.muted = true;
      video.playsInline = true;
      video.autoplay = true;
      video.srcObject = stream;
      await video.play();
      videoRef.current = video;

      // Small offscreen canvas (16x16 is plenty for luminance calculation)
      const canvas = document.createElement('canvas');
      canvas.width = 16;
      canvas.height = 16;
      canvasRef.current = canvas;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });

      if (!ctx) return;

      setIsEnabled(true);
      setIsSimulated(false);

      // Sample ambient light every 1000ms
      timerRef.current = window.setInterval(() => {
        if (!videoRef.current || videoRef.current.readyState < 2) return;

        try {
          ctx.drawImage(videoRef.current, 0, 0, 16, 16);
          const imgData = ctx.getImageData(0, 0, 16, 16);
          const data = imgData.data;

          let totalLuminance = 0;
          const pixelCount = data.length / 4;

          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const lum = 0.299 * r + 0.587 * g + 0.114 * b;
            totalLuminance += lum;
          }

          const avgLum = totalLuminance / pixelCount;
          const currentPercent = Math.round((avgLum / 255) * 100);

          // Exponential moving average for silky smooth transitions
          smoothedBrightnessRef.current = Math.round(
            smoothedBrightnessRef.current * 0.6 + currentPercent * 0.4
          );

          const smoothed = smoothedBrightnessRef.current;
          setBrightness(smoothed);

          // Hysteresis threshold
          setIsDark((prevDark) => {
            if (prevDark) {
              return smoothed <= threshold + 4;
            } else {
              return smoothed < threshold;
            }
          });
        } catch (e) {
          console.warn('Ambient brightness read error:', e);
        }
      }, 1000);
    } catch (err: unknown) {
      console.warn('Camera access error:', err);
      stopStream();
      setIsEnabled(false);

      const errName = err instanceof Error ? err.name : '';
      if (errName === 'NotAllowedError' || errName === 'PermissionDeniedError') {
        setErrorType('denied');
        setError('카메라 권한이 차단되어 있습니다. 주소창 왼쪽 🔒(자물쇠) 아이콘을 눌러 카메라를 [허용]으로 변경해주세요.');
      } else if (errName === 'NotFoundError' || errName === 'DevicesNotFoundError') {
        setErrorType('notfound');
        setError('노트북 카메라를 찾을 수 없습니다. 카메라 커버(셔터)가 닫혀있거나 하드웨어 스위치가 꺼져 있는지 확인해주세요.');
      } else if (errName === 'NotReadableError' || errName === 'TrackStartError') {
        setErrorType('inuse');
        setError('다른 앱(Zoom, Teams 등)에서 카메라를 사용 중입니다.');
      } else {
        setErrorType('other');
        setError('카메라 권한 팝업이 차단되었습니다. 브라우저 설정에서 카메라 권한을 확인해주세요.');
      }
    }
  }, [threshold, stopStream]);

  const toggleSensor = useCallback(async () => {
    if (isEnabled) {
      stopStream();
      setIsEnabled(false);
      setIsDark(false);
    } else {
      await startStream();
    }
  }, [isEnabled, startStream, stopStream]);

  // Toggle simulated lighting (useful for testing or when camera is blocked)
  const toggleSimulatedLight = useCallback(() => {
    setIsSimulated(true);
    setIsEnabled(true);
    setError(null);
    setErrorType(null);
    setIsDark((prev) => {
      const next = !prev;
      setBrightness(next ? 8 : 75);
      return next;
    });
  }, []);

  return {
    isEnabled,
    isSupported,
    isSimulated,
    brightness,
    isDark,
    threshold,
    error,
    errorType,
    toggleSensor,
    setThreshold,
    toggleSimulatedLight,
    clearError,
  };
}
