/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { SkinId } from '@/lib/skin/skins';
import { defineCopy } from '@/lib/i18n/define-copy';

/** The skin switch: its label and, for each skin, the name and a few words that say what it looks like. */
export const skinsCopy = defineCopy(
  {
    label: 'Skin',
    names: {
      standard: { name: 'Standard', hint: 'Rainbow palette' },
      dev: { name: 'Dev', hint: 'Code editor' },
      trade: { name: 'Trade', hint: 'Trading chart' },
      academic: { name: 'Academic', hint: 'Chalkboard and paper' },
      travel: { name: 'Travel', hint: 'Trip map of Nha Trang' },
    } satisfies Record<SkinId, { name: string; hint: string }>,
    loadFailed: 'That skin could not be loaded. Showing the standard one.',
  },
  {
    label: 'Skin',
    names: {
      standard: { name: 'Chuẩn', hint: 'Bảng màu cầu vồng' },
      dev: { name: 'Dev', hint: 'Trình soạn thảo code' },
      trade: { name: 'Trade', hint: 'Biểu đồ giao dịch' },
      academic: { name: 'Academic', hint: 'Bảng đen và giấy' },
      travel: { name: 'Du lịch', hint: 'Bản đồ chuyến đi Nha Trang' },
    } satisfies Record<SkinId, { name: string; hint: string }>,
    loadFailed: 'Không tải được skin này. Đang hiển thị skin chuẩn.',
  },
);
