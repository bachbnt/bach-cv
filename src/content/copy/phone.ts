/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { defineCopy } from '@/lib/i18n/define-copy';

/** The words only the Phone skin has: the names of its parts (the shell, the home screen and the settings). */
export const phoneCopy = defineCopy(
  {
    os: 'BachOS',
    /** the name of the first page, which Standard has no tab for */
    home: 'Home',
    /** the back link of an app (it goes to the home screen) */
    backHome: 'Home',
    goHome: 'Go to the home screen',
    apps: 'Apps',
    settings: 'Settings',
    quick: 'Quick settings',
    /** the button above the device that folds and unfolds it (pressed = folded); the name does not change with the state */
    fold: 'Fold',
    foldOpen: 'Inner screen, tablet layout',
    foldCover: 'Cover screen, phone layout',
    closeQuick: 'Close quick settings',
    /** what the glyphs of the status bar show, read out on the quick settings only (the bar itself is not announced) */
    batteryLevel: (level: number) => `Battery ${level}%`,
    batteryFast: (level: number) => `Fast charging, ${level}%`,
    batteryCharging: (level: number) => `Charging, ${level}%`,
    mobileData: (bars: number, of: number) =>
      `Mobile data, ${bars} of ${of} bars`,
    wifi: (arcs: number, of: number) => `Wi-Fi, ${arcs} of ${of}`,
  },
  {
    os: 'BachOS',
    home: 'Trang chủ',
    backHome: 'Trang chủ',
    goHome: 'Về màn hình chính',
    apps: 'Ứng dụng',
    settings: 'Cài đặt',
    quick: 'Cài đặt nhanh',
    fold: 'Gập',
    foldOpen: 'Màn hình trong, bố cục máy tính bảng',
    foldCover: 'Màn hình ngoài, bố cục điện thoại',
    closeQuick: 'Đóng cài đặt nhanh',
    batteryLevel: (level: number) => `Pin ${level}%`,
    batteryFast: (level: number) => `Sạc nhanh, ${level}%`,
    batteryCharging: (level: number) => `Đang sạc, ${level}%`,
    mobileData: (bars: number, of: number) =>
      `Dữ liệu di động, ${bars} trên ${of} vạch`,
    wifi: (arcs: number, of: number) => `Wi-Fi, ${arcs} trên ${of} vạch`,
  },
);
