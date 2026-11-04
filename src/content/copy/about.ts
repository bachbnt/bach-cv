/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { defineCopy } from '@/lib/i18n/define-copy';

// Interface copy for the About page, in both languages.
export const aboutCopy = defineCopy(
  {
    title: 'About',
    avatarAlt: 'Portrait of',
    coverAlt: 'Photo of',
    core: {
      title: 'Core stack',
      lead: 'What I use every day in my current role.',
      all: 'See all skills',
    },
  },
  {
    title: 'Giới thiệu',
    avatarAlt: 'Ảnh chân dung của',
    coverAlt: 'Ảnh của',
    core: {
      title: 'Công nghệ chính',
      lead: 'Những gì tôi dùng hằng ngày trong vai trò hiện tại.',
      all: 'Xem tất cả kỹ năng',
    },
  },
);
