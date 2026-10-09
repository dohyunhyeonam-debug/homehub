import React, { useState } from 'react';
import { Download, Copy, Check, Terminal, Laptop, HelpCircle, X } from 'lucide-react';

interface AutoStartSetupProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AutoStartSetup: React.FC<AutoStartSetupProps> = ({ isOpen, onClose }) => {
  const [copiedCmd, setCopiedCmd] = useState(false);
  const [copiedStartup, setCopiedStartup] = useState(false);

  if (!isOpen) return null;

  const currentUrl = window.location.href;

  // Windows batch script content that launches Chrome or Edge in kiosk / app mode
  const batchScriptContent = `@echo off
rem Living Room Hub Windows Auto-Start Script
echo Starting Living Room Hub...
timeout /t 5 /nobreak >nul

rem Try Edge kiosk mode first (default on Windows 10/11)
where msedge >nul 2>nul
if %errorlevel% equ 0 (
    start msedge --start-fullscreen --app="${currentUrl}"
    exit
)

rem Try Chrome
where chrome >nul 2>nul
if %errorlevel% equ 0 (
    start chrome --start-fullscreen --app="${currentUrl}"
    exit
)

rem Fallback to default browser
start "" "${currentUrl}"
`;

  const downloadBatchFile = () => {
    const blob = new Blob([batchScriptContent], { type: 'application/bat' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'hub_autostart.bat';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyStartupCommand = () => {
    navigator.clipboard.writeText('shell:startup');
    setCopiedStartup(true);
    setTimeout(() => setCopiedStartup(false), 2000);
  };

  const copyKioskCommand = () => {
    navigator.clipboard.writeText(`msedge --start-fullscreen --app="${currentUrl}"`);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-xl p-6 relative shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-neutral-400 hover:text-neutral-100 rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-1">
          <div className="p-2 rounded-lg bg-neutral-800 text-neutral-100">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-neutral-100">노트북 부팅 시 자동 실행 설정</h2>
            <p className="text-xs text-neutral-400">
              노트북이 켜지거나 재부팅되면 자동으로 이 화면이 전체화면으로 실행됩니다.
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-4 text-xs">
          {/* Method 1: Download Batch File (Easiest) */}
          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-neutral-200">방법 1. 자동 실행 스크립트 파일 넣기 (가장 추천)</span>
              <button
                onClick={downloadBatchFile}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 hover:bg-white text-neutral-950 font-semibold rounded-lg transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>hub_autostart.bat 다운로드</span>
              </button>
            </div>
            <ol className="list-decimal list-inside space-y-1.5 text-neutral-400 mt-3">
              <li>위 버튼을 눌러 <span className="text-neutral-200 font-mono">hub_autostart.bat</span> 파일을 다운로드합니다.</li>
              <li>
                키보드의 <span className="text-neutral-200 font-mono">Win + R</span>을 누르고 아래 폴더 경로를 실행합니다:
                <div className="mt-1 flex items-center gap-2">
                  <code className="bg-neutral-900 px-2 py-1 rounded text-neutral-200 font-mono border border-neutral-800">
                    shell:startup
                  </code>
                  <button
                    onClick={copyStartupCommand}
                    className="text-neutral-400 hover:text-neutral-200 cursor-pointer text-[11px] underline flex items-center gap-1"
                  >
                    {copiedStartup ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedStartup ? '복사됨' : '복사'}</span>
                  </button>
                </div>
              </li>
              <li>열린 시작프로그램 폴더에 다운로드한 파일을 옮겨두면 설정이 완료됩니다.</li>
            </ol>
          </div>

          {/* Windows Power & Lid Settings */}
          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800">
            <span className="font-semibold text-neutral-200 block mb-2">
              필수 전원 설정 (덮개 닫힘 방지)
            </span>
            <ul className="space-y-1 text-neutral-400 list-disc list-inside">
              <li>
                <span className="text-neutral-300">제어판 &gt; 전원 옵션 &gt; 덮개를 닫을 때 수행되는 작업 선택</span>
              </li>
              <li>
                전원 사용 시: <span className="text-neutral-200 font-semibold">"아무 작업도 안 함"</span>으로 변경
              </li>
              <li>
                화면 꺼짐 시간: <span className="text-neutral-200 font-semibold">"해당 없음(안 끔)"</span>으로 설정
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
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
