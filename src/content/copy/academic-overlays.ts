/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { defineCopy } from '@/lib/i18n/define-copy';

/**
 * Words only the windows of the Academic skin have (the viewer, the chat slip). What Standard already says (the chat, the CV, Connect, the
 * screenshots and certificates) is read from its own copy files.
 */
export const academicOverlaysCopy = defineCopy(
  {
    viewer: {
      description:
        'Picture viewer. Use the left and right arrow keys to browse and Escape to close.',
      close: 'Close',
      previous: 'Previous',
      next: 'Next',
      /** the handwritten line under a photo when there are several */
      counter: '{current} of {total}',
      pictures: 'Pictures',
      goTo: 'Go to {current} of {total}',
    },
    chat: {
      you: 'You',
      messages: 'Messages',
      /** the pen button that sends (its accessible name is the Standard "Send chat message") */
      send: 'Send',
    },
    cv: { desk: 'The pages of the CV' },
  },
  {
    viewer: {
      description:
        'Trình xem ảnh. Dùng phím mũi tên trái và phải để chuyển ảnh, phím Escape để đóng.',
      close: 'Đóng',
      previous: 'Trước',
      next: 'Tiếp theo',
      counter: '{current} / {total}',
      pictures: 'Các ảnh',
      goTo: 'Đến ảnh {current} / {total}',
    },
    chat: {
      you: 'Bạn',
      messages: 'Tin nhắn',
      send: 'Gửi',
    },
    cv: { desk: 'Các trang của CV' },
  },
);
