/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { defineCopy } from '@/lib/i18n/define-copy';

/**
 * The words only the Stream skin has for its channel page (About) and its system screens (404, Coming soon, maintenance). Everything
 * else on those screens is read from the Standard copy (`about.ts`, `common.ts`, `states.ts`, `chat.ts`).
 */
export const streamChannelCopy = defineCopy(
  {
    /** the name of the row of tabs under the channel header */
    tabs: 'Channel',
    about: {
      description: 'Description',
      links: 'Links',
      details: 'Details',
      location: 'Location',
      since: 'Since',
      years: 'Years in software',
      yearsValue: (n: number) => (n === 1 ? '1 year' : `${n} years`),
      languages: 'Languages of the site',
    },
    unavailable: {
      label: 'Video unavailable',
      line: "This video isn't available any more.",
    },
    premiere: {
      badge: 'Premiere',
      title: 'Premieres soon',
      hint: 'Waiting for the page to go live',
    },
  },
  {
    tabs: 'Kênh',
    about: {
      description: 'Mô tả',
      links: 'Liên kết',
      details: 'Chi tiết',
      location: 'Vị trí',
      since: 'Từ năm',
      years: 'Số năm làm phần mềm',
      yearsValue: (n: number) => `${n} năm`,
      languages: 'Ngôn ngữ của trang',
    },
    unavailable: {
      label: 'Video không khả dụng',
      line: 'Video này không còn khả dụng.',
    },
    premiere: {
      badge: 'Công chiếu',
      title: 'Sắp công chiếu',
      hint: 'Đang chờ trang lên sóng',
    },
  },
);
