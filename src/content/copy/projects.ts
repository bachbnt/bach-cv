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
    loading: 'Loading...',
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
      counter: 'Screenshot {current} of {total}',
      alt: '{name} screenshot {current}',
    },
    empty: {
      title: 'No projects to show yet',
      body: "I'm preparing the case studies. In the meantime, you can read where I have worked, or write to me about a project.",
      resume: 'See my resume',
    },
    error: {
      title: "Projects couldn't be loaded",
      body: 'Check your connection and reload the page.',
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
    loading: 'Đang tải...',
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
      counter: 'Ảnh {current} / {total}',
      alt: '{name}, ảnh chụp màn hình {current}',
    },
    empty: {
      title: 'Chưa có dự án nào để hiển thị',
      body: 'Tôi đang chuẩn bị các dự án. Trong lúc đó, bạn có thể xem quá trình làm việc của tôi hoặc nhắn cho tôi về dự án của bạn.',
      resume: 'Xem hồ sơ',
    },
    error: {
      title: 'Không thể tải danh sách dự án',
      body: 'Hãy kiểm tra kết nối mạng và tải lại trang.',
    },
  },
);
