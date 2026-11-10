/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { defineCopy } from '@/lib/i18n/define-copy';

/** The words of the frame of the Travel skin: the menu of the trip, the trip-themed state screens and the panel controls. */
export const travelShellCopy = defineCopy(
  {
    brandTagline: 'Career trip across Nha Trang',
    /** Home is not in the Standard nav copy; the other pages use `commonCopy.nav` */
    nav: {
      home: 'Home',
      resume: 'Resume',
      projects: 'Projects',
      certificates: 'Certificates',
      services: 'Services',
      payment: 'Payment',
      about: 'About',
    },
    pagesLabel: 'Pages of the trip',
    panel: {
      expand: 'Show the whole panel',
      collapse: 'Show more of the map',
      close: 'Close',
    },
    states: {
      error: 'Lost signal',
      empty: 'No stops yet',
      offTheMap: 'Off the map',
      soon: 'Road works ahead',
      maintenance: 'Road closed',
    },
  },
  {
    brandTagline: 'Hành trình sự nghiệp quanh Nha Trang',
    nav: {
      home: 'Trang chủ',
      resume: 'Hồ sơ',
      projects: 'Dự án',
      certificates: 'Chứng chỉ',
      services: 'Dịch vụ',
      payment: 'Thanh toán',
      about: 'Giới thiệu',
    },
    pagesLabel: 'Các trang của chuyến đi',
    panel: {
      expand: 'Mở rộng bảng',
      collapse: 'Xem thêm bản đồ',
      close: 'Đóng',
    },
    states: {
      error: 'Mất sóng',
      empty: 'Chưa có điểm dừng',
      offTheMap: 'Ngoài bản đồ',
      soon: 'Đường đang thi công',
      maintenance: 'Đường đang đóng',
    },
  },
);
