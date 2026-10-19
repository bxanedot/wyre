import { invoke } from '@tauri-apps/api/core';

export interface WyreMouseSettings {
  supported: boolean;
  speed: number | null;
  acceleration: boolean | null;
  accelerationProfile: string | null;
  reason: string | null;
}

export class WyreMouseService {
  static read(): Promise<WyreMouseSettings> {
    return invoke<WyreMouseSettings>('mouse_get_settings');
  }

  static apply(settings: WyreMouseSettings): Promise<WyreMouseSettings> {
    return invoke<WyreMouseSettings>('mouse_apply_settings', {
      speed: settings.speed,
      acceleration: settings.acceleration,
      accelerationProfile: settings.accelerationProfile,
    });
  }
}
