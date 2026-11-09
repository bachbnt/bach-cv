/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { defineCopy } from '@/lib/i18n/define-copy';

/**
 * Words of the Travel skin's windows that Standard has no word for: the BB Bot card (its other words are `chatCopy`), the picture
 * viewer, the QR window, the CV window and the Connect postcard. The small kicker over a title is decoration in the voice of a trip.
 * `{name}` and `{percent}` slots are filled with `fill`.
 */
export const travelOverlaysCopy = defineCopy(
  {
    chat: {
      kicker: 'Travel guide',
      you: 'You',
      messages: 'Conversation with {name}',
    },
    viewer: {
      kicker: 'Postcard',
      zoomIn: 'Zoom in',
      zoomOut: 'Zoom out',
      zoomFit: 'Fit to window',
      zoomLevel: 'Zoom {percent}%',
      tools: 'Picture tools',
    },
    qr: {
      kicker: 'Payment ticket',
      details: 'Account details',
    },
    cv: {
      kicker: 'Boarding pass',
    },
    connect: {
      kicker: 'Postcard',
    },
  },
  {
    chat: {
      kicker: 'Hướng dẫn viên',
      you: 'Bạn',
      messages: 'Cuộc trò chuyện với {name}',
    },
    viewer: {
      kicker: 'Bưu thiếp',
      zoomIn: 'Phóng to',
      zoomOut: 'Thu nhỏ',
      zoomFit: 'Vừa khung',
      zoomLevel: 'Thu phóng {percent}%',
      tools: 'Công cụ xem ảnh',
    },
    qr: {
      kicker: 'Vé thanh toán',
      details: 'Thông tin tài khoản',
    },
    cv: {
      kicker: 'Thẻ lên tàu',
    },
    connect: {
      kicker: 'Bưu thiếp',
    },
  },
);
