/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { defineCopy } from '@/lib/i18n/define-copy';

// Interface copy for the Projects page. `{name}`, `{count}`, `{current}` and `{total}` are filled in by `fillCopy`.
export const projectsCopy = defineCopy(
  {
    title: 'Projects',
    intro:
      'Tools I build for myself, and apps and sites I shipped for clients.',
    featured: 'Featured projects',
    featuredTag: 'Featured',
    all: 'All projects',
    filterLabel: 'Filter projects',
    filterAll: 'All',
    technologies: 'Technologies',
    kinds: {
      company: 'Company',
      freelance: 'Freelance',
      personal: 'Personal',
      academic: 'Academic',
    },
    coverAlt: '{name} cover',
    screenshotsOne: '1 screenshot',
    screenshotsMany: '{count} screenshots',
    links: {
      site: 'Visit site',
      store: 'Store',
      github: 'GitHub',
      releases: 'Releases',
      pdf: 'PDF',
      source: 'Source',
      other: 'Link',
      appStore: 'App Store',
      googlePlay: 'Google Play',
    },
    dialog: {
      close: 'Close screenshots',
      previous: 'Previous screenshot',
      next: 'Next screenshot',
      counter: '{current} of {total}',
      alt: '{name} screenshot {current}',
    },
  },
  {
    title: 'Dự án',
    intro:
      'Những công cụ tôi tự xây dựng cho bản thân, cùng các ứng dụng và website tôi đã thực hiện cho khách hàng.',
    featured: 'Dự án nổi bật',
    featuredTag: 'Nổi bật',
    all: 'Tất cả dự án',
    filterLabel: 'Lọc dự án',
    filterAll: 'Tất cả',
    technologies: 'Công nghệ',
    kinds: {
      company: 'Công ty',
      freelance: 'Freelance',
      personal: 'Cá nhân',
      academic: 'Học thuật',
    },
    coverAlt: 'Ảnh bìa {name}',
    screenshotsOne: '1 ảnh chụp màn hình',
    screenshotsMany: '{count} ảnh chụp màn hình',
    links: {
      site: 'Xem website',
      store: 'Cửa hàng ứng dụng',
      github: 'GitHub',
      releases: 'Bản phát hành',
      pdf: 'PDF',
      source: 'Mã nguồn',
      other: 'Liên kết',
      appStore: 'App Store',
      googlePlay: 'Google Play',
    },
    dialog: {
      close: 'Đóng ảnh chụp màn hình',
      previous: 'Ảnh trước',
      next: 'Ảnh tiếp theo',
      counter: '{current} / {total}',
      alt: '{name}, ảnh chụp màn hình {current}',
    },
  },
);
