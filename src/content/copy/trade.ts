/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { defineCopy } from '@/lib/i18n/define-copy';

/**
 * Interface copy of the Trade skin (the candlestick-terminal look): the words that only exist there. Content (roles, projects, ...)
 * is the same as in the Standard skin and is not repeated here. `{name}` slots are filled with `fill`.
 */
export const tradeCopy = defineCopy(
  {
    home: 'Home',
    watchlist: { title: 'Watchlist' },
    details: {
      title: 'Details',
      yearsMany: 'years in software',
      yearsOne: 'year in software',
      location: 'Location',
      role: 'Role',
      company: 'Company',
    },
    tabs: {
      label: 'Sections of the home page',
      projects: 'Projects',
      work: 'Work',
      build: 'Build',
      contact: 'Contact',
    },
    bottomNav: 'Quick links',
  },
  {
    home: 'Trang chủ',
    watchlist: { title: 'Danh sách theo dõi' },
    details: {
      title: 'Chi tiết',
      yearsMany: 'năm làm phần mềm',
      yearsOne: 'năm làm phần mềm',
      location: 'Nơi ở',
      role: 'Vị trí',
      company: 'Nơi làm',
    },
    tabs: {
      label: 'Các phần của trang chủ',
      projects: 'Dự án',
      work: 'Công việc',
      build: 'Đã xây',
      contact: 'Liên hệ',
    },
    bottomNav: 'Liên kết nhanh',
  },
);
