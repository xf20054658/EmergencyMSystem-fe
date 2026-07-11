'use client';

// ============================================================
// Mobile SOSButton — 长按 1.5s → 3s 倒计时确认
// ============================================================

import React, { useState, useRef, useCallback } from 'react';

interface SOSButtonProps {
  onConfirm: (lat: number, lng: number) => void;
}

export function SOSButton({ onConfirm }: SOSButtonProps) {
  const [phase, setPhase] = useState<'idle' | 'confirming' | 'countdown'>('idle');
  const [countdown, setCountdown] = useState(3);
  const longPressTimer = useRef<ReturnType<typeof setTimeout>>();
  const countdownTimer = useRef<ReturnType<typeof setInterval>>();

  const startLongPress = useCallback(() => {
    longPressTimer.current = setTimeout(() => {
      setPhase('confirming');
    }, 1500);
  }, []);

  const cancelLongPress = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  }, []);

  const startCountdown = useCallback(() => {
    setPhase('countdown');
    setCountdown(3);
    countdownTimer.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownTimer.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const handleCancel = useCallback(() => {
    if (countdownTimer.current) clearInterval(countdownTimer.current);
    setPhase('idle');
    setCountdown(3);
  }, []);

  const handleConfirm = useCallback(() => {
    if (countdownTimer.current) clearInterval(countdownTimer.current);
    setPhase('idle');
    setCountdown(3);

    // Get GPS, fallback to last known
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => onConfirm(pos.coords.latitude, pos.coords.longitude),
        () => {
          // GPS fail — use last known (stored in localStorage)
          const lastLat = localStorage.getItem('last_known_lat');
          const lastLng = localStorage.getItem('last_known_lng');
          if (lastLat && lastLng) {
            onConfirm(parseFloat(lastLat), parseFloat(lastLng));
          } else {
            alert('无法获取您的位置，请手动输入地址');
          }
        },
        { timeout: 5000, enableHighAccuracy: true }
      );
    }
  }, [onConfirm]);

  // Store location on mount
  React.useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          localStorage.setItem('last_known_lat', String(pos.coords.latitude));
          localStorage.setItem('last_known_lng', String(pos.coords.longitude));
        },
        () => {},
        { timeout: 10000, enableHighAccuracy: true }
      );
    }
  }, []);

  return (
    <div className="relative">
      {/* SOS Button */}
      <button
        onMouseDown={startLongPress}
        onMouseUp={cancelLongPress}
        onMouseLeave={cancelLongPress}
        onTouchStart={startLongPress}
        onTouchEnd={cancelLongPress}
        onTouchCancel={cancelLongPress}
        className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-sm transition-all duration-300
          ${phase === 'idle' ? 'bg-ios-red shadow-lg shadow-red-500/40' : 'bg-red-700 scale-110'}`}
      >
        SOS
      </button>

      {/* Confirmation Dialog */}
      {phase === 'confirming' && (
        <div className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 w-64 bg-white rounded-2xl shadow-xl p-5 animate-slide-up z-50">
          <div className="text-center">
            <div className="text-red-500 text-4xl mb-2">⚠️</div>
            <div className="text-ios-text text-sm font-semibold mb-1">确认紧急求助？</div>
            <div className="text-ios-muted text-xs mb-4">系统将立即通知附近救援力量</div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              className="flex-1 py-2 bg-gray-100 text-ios-text rounded-xl text-sm font-medium"
            >
              取消
            </button>
            <button
              onClick={startCountdown}
              className="flex-1 py-2 bg-ios-red text-white rounded-xl text-sm font-medium"
            >
              确认求助
            </button>
          </div>
        </div>
      )}

      {/* Countdown Overlay */}
      {phase === 'countdown' && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fade-in">
          <div className="text-center">
            <div className="text-6xl font-bold text-white mb-4">{countdown}</div>
            <div className="text-white/80 text-sm mb-6">秒后发出紧急求助</div>
            <div className="flex gap-3 justify-center">
              <button
                onClick={handleCancel}
                className="px-8 py-2.5 bg-white/20 text-white rounded-xl text-sm font-medium backdrop-blur"
              >
                取消
              </button>
              <button
                onClick={handleConfirm}
                className="px-8 py-2.5 bg-ios-red text-white rounded-xl text-sm font-medium"
              >
                立即求助
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
