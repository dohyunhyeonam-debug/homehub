import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { X, Copy, Check, Wifi } from 'lucide-react';

interface WifiQrModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WifiQrModal: React.FC<WifiQrModalProps> = ({ isOpen, onClose }) => {
  const [ssid, setSsid] = useState(() => localStorage.getItem('hub_wifi_ssid') || 'LivingRoom_5G');
  const [password, setPassword] = useState(() => localStorage.getItem('hub_wifi_pw') || 'password1234');
  const [copied, setCopied] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    localStorage.setItem('hub_wifi_ssid', ssid);
    localStorage.setItem('hub_wifi_pw', password);
  }, [ssid, password]);

  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;

    const payload = `WIFI:T:WPA;S:${ssid};P:${password};;`;

    QRCode.toCanvas(canvasRef.current, payload, {
      width: 180,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    }).catch((err) => {
      console.warn('QR error:', err);
    });
  }, [isOpen, ssid, password]);

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-sm p-6 relative shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-neutral-400 hover:text-neutral-100 rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-1">
          <Wifi className="w-5 h-5 text-neutral-200" />
          <h3 className="text-sm font-bold text-neutral-100">Wi-Fi 연결 QR</h3>
        </div>
        <p className="text-xs text-neutral-400">
          스마트폰 카메라로 스캔하여 간편 접속
        </p>

        {/* QR Code Canvas Frame */}
        <div className="my-5 flex flex-col items-center justify-center">
          <div className="p-2.5 bg-white rounded-lg">
            <canvas ref={canvasRef} className="rounded" />
          </div>
        </div>

        {/* Inputs */}
        <div className="space-y-2.5 bg-neutral-950 p-3 rounded-xl border border-neutral-800 text-xs">
          <div>
            <label className="block text-neutral-400 mb-1">네트워크 이름 (SSID)</label>
            <input
              type="text"
              value={ssid}
              onChange={(e) => setSsid(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-neutral-200 focus:outline-none focus:border-neutral-500 font-mono"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-neutral-400">비밀번호</label>
              <button
                type="button"
                onClick={handleCopyPassword}
                className="flex items-center gap-1 text-neutral-300 hover:text-white cursor-pointer text-[11px]"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? '복사됨' : '복사'}</span>
              </button>
            </div>
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-neutral-200 focus:outline-none focus:border-neutral-500 font-mono"
            />
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-neutral-800 text-neutral-200 hover:bg-neutral-700 font-medium rounded-lg text-xs cursor-pointer transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
