import { useState, useEffect, useCallback } from 'react';

export function useWakeLock() {
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [wakeLockSentinel, setWakeLockSentinel] = useState<WakeLockSentinel | null>(null);

  useEffect(() => {
    setIsSupported('wakeLock' in navigator);
  }, []);

  const requestLock = useCallback(async () => {
    if (!('wakeLock' in navigator)) return false;
    try {
      const sentinel = await navigator.wakeLock.request('screen');
      sentinel.addEventListener('release', () => {
        setIsLocked(false);
        setWakeLockSentinel(null);
      });
      setWakeLockSentinel(sentinel);
      setIsLocked(true);
      return true;
    } catch (err) {
      console.warn('Wake Lock request error:', err);
      setIsLocked(false);
      return false;
    }
  }, []);

  const releaseLock = useCallback(async () => {
    if (wakeLockSentinel) {
      try {
        await wakeLockSentinel.release();
      } catch (err) {
        console.warn('Wake lock release error:', err);
      }
      setWakeLockSentinel(null);
      setIsLocked(false);
    }
  }, [wakeLockSentinel]);

  const toggleWakeLock = useCallback(async () => {
    if (isLocked) {
      await releaseLock();
    } else {
      await requestLock();
    }
  }, [isLocked, releaseLock, requestLock]);

  // Re-acquire lock if tab visibility changes
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && isLocked && !wakeLockSentinel) {
        await requestLock();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isLocked, wakeLockSentinel, requestLock]);

  return {
    isSupported,
    isLocked,
    toggleWakeLock,
    requestLock,
    releaseLock,
  };
}
