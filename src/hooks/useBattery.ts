import { useState, useEffect } from 'react';

interface BatteryManager extends EventTarget {
  charging: boolean;
  chargingTime: number;
  dischargingTime: number;
  level: number;
  onchargingchange: ((this: BatteryManager, ev: Event) => void) | null;
  onlevelchange: ((this: BatteryManager, ev: Event) => void) | null;
}

interface NavigatorWithBattery extends Navigator {
  getBattery?: () => Promise<BatteryManager>;
}

export interface BatteryState {
  isSupported: boolean;
  level: number; // 0 - 100
  charging: boolean;
}

export function useBattery(): BatteryState {
  const [batteryState, setBatteryState] = useState<BatteryState>({
    isSupported: false,
    level: 100,
    charging: true,
  });

  useEffect(() => {
    const nav = navigator as NavigatorWithBattery;
    if (typeof nav.getBattery === 'function') {
      let batteryRef: BatteryManager | null = null;

      const updateBattery = (battery: BatteryManager) => {
        setBatteryState({
          isSupported: true,
          level: Math.round(battery.level * 100),
          charging: battery.charging,
        });
      };

      nav.getBattery().then((battery) => {
        batteryRef = battery;
        updateBattery(battery);

        battery.addEventListener('levelchange', () => updateBattery(battery));
        battery.addEventListener('chargingchange', () => updateBattery(battery));
      }).catch(() => {
        // Not supported or restricted
      });

      return () => {
        if (batteryRef) {
          // Cleanup listeners
        }
      };
    }
  }, []);

  return batteryState;
}
