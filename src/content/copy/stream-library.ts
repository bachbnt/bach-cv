/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { defineCopy } from '@/lib/i18n/define-copy';

/** The few words only the Stream skin has on Certificates (the playlist) and Services (the community tab). */
export const streamLibraryCopy = defineCopy(
  {
    playlist: {
      count: (n: number) => (n === 1 ? '1 certificate' : `${n} certificates`),
      viewAll: 'View all',
    },
    community: {
      askAbout: 'Ask about this',
      askAboutLabel: (name: string) => `Ask about ${name}`,
      postedBy: 'Your message',
    },
  },
  {
    playlist: {
      count: (n: number) => `${n} chứng chỉ`,
      viewAll: 'Xem tất cả',
    },
    community: {
      askAbout: 'Hỏi về mục này',
      askAboutLabel: (name: string) => `Hỏi về ${name}`,
      postedBy: 'Tin nhắn của bạn',
    },
  },
);
