/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { defineCopy } from '@/lib/i18n/define-copy';

/** The few words only the Stream skin has: the Home link (Standard has none in its menu), the reel and the chat. */
export const streamCopy = defineCopy(
  {
    home: 'Home',
    reel: {
      previous: 'Previous project',
      next: 'Next project',
      position: '{current} of {total}',
      pause: 'Pause the reel',
      play: 'Play the reel',
    },
    chat: { you: 'You' },
  },
  {
    home: 'Trang chủ',
    reel: {
      previous: 'Dự án trước',
      next: 'Dự án tiếp theo',
      position: '{current} / {total}',
      pause: 'Tạm dừng reel',
      play: 'Phát reel',
    },
    chat: { you: 'Bạn' },
  },
);
