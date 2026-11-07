/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { defineCopy } from '@/lib/i18n/define-copy';

/** Words only the Certificates page of the Moba skin has. Everything the Standard page says is read from `certificatesCopy`. */
export const mobaCertificatesCopy = defineCopy(
  {
    inventory: 'Inventory',
    kickers: {
      inventory: 'Backpack',
      item: 'Item details',
    },
    /** the name of the group of item slots */
    slots: 'Certificate slots',
    /** the link to the credential page of a certificate (Standard keeps the field but shows no link) */
    credential: 'View credential',
  },
  {
    inventory: 'Kho đồ',
    kickers: {
      inventory: 'Ba lô',
      item: 'Chi tiết vật phẩm',
    },
    slots: 'Các ô chứng chỉ',
    credential: 'Xem chứng nhận',
  },
);
