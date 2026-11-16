/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { defineCopy } from '@/lib/i18n/define-copy';

/**
 * Words only the overlays of the Phone skin have (the viewer, the chat, the Connect sheet). What Standard already says (the chat, the CV,
 * Connect, the screenshots and certificates) is read from its own copy files.
 */
export const phoneOverlaysCopy = defineCopy(
  {
    viewer: {
      description:
        'Picture viewer. Use the left and right arrow keys or swipe to browse, and Escape to close.',
      close: 'Close',
      previous: 'Previous',
      next: 'Next',
      /** between the two step buttons: `2 of 5` */
      counter: '{current} of {total}',
      pictures: 'Pictures',
      goTo: 'Go to {current} of {total}',
    },
    chat: {
      description:
        'Chat with the AI assistant of this site. Ask about my experience, projects and skills.',
      you: 'You',
      messages: 'Messages',
      /** under the avatar of the empty chat */
      hint: 'Ask about my experience, projects and skills, or pick a question.',
    },
    connect: {
      description: 'My email address and the links to my accounts.',
      /** Standard's Connect is a popover with no button; the sheet has one */
      close: 'Close',
    },
  },
  {
    viewer: {
      description:
        'Trình xem ảnh. Dùng phím mũi tên trái và phải hoặc vuốt để chuyển ảnh, phím Escape để đóng.',
      close: 'Đóng',
      previous: 'Trước',
      next: 'Tiếp theo',
      counter: '{current} / {total}',
      pictures: 'Các ảnh',
      goTo: 'Đến ảnh {current} / {total}',
    },
    chat: {
      description:
        'Trò chuyện với trợ lý AI của trang web này. Hãy hỏi về kinh nghiệm, dự án và kỹ năng của mình.',
      you: 'Bạn',
      messages: 'Tin nhắn',
      hint: 'Hỏi về kinh nghiệm, dự án và kỹ năng của mình, hoặc chọn một câu hỏi.',
    },
    connect: {
      description: 'Địa chỉ email của mình và các liên kết đến tài khoản.',
      close: 'Đóng',
    },
  },
);
