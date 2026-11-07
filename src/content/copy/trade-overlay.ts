/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { defineCopy } from '@/lib/i18n/define-copy';

/**
 * Words of the Trade skin's windows that Standard has no word for: the BB Bot panel (its other words are `chatCopy`), the picture
 * viewer, the QR window and the CV window (its other words are `cvCopy` and `paymentCopy`). `{name}` slots are filled with `fill`.
 */
export const tradeOverlayCopy = defineCopy(
  {
    chat: {
      you: 'You',
      messages: 'Conversation with {name}',
    },
    viewer: {
      zoomIn: 'Zoom in',
      zoomOut: 'Zoom out',
      zoomFit: 'Fit to window',
      zoomLevel: 'Zoom {percent}%',
      tools: 'Picture tools',
    },
    qr: {
      details: 'Account details',
    },
    cv: {
      tools: 'CV tools',
      zoomIn: 'Zoom in',
      zoomOut: 'Zoom out',
      zoomFit: 'Fit to window',
      zoomLevel: 'Zoom {percent}%',
    },
  },
  {
    chat: {
      you: 'Bạn',
      messages: 'Cuộc trò chuyện với {name}',
    },
    viewer: {
      zoomIn: 'Phóng to',
      zoomOut: 'Thu nhỏ',
      zoomFit: 'Vừa khung',
      zoomLevel: 'Thu phóng {percent}%',
      tools: 'Công cụ xem ảnh',
    },
    qr: {
      details: 'Thông tin tài khoản',
    },
    cv: {
      tools: 'Công cụ CV',
      zoomIn: 'Phóng to',
      zoomOut: 'Thu nhỏ',
      zoomFit: 'Vừa khung',
      zoomLevel: 'Thu phóng {percent}%',
    },
  },
);
