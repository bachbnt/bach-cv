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
    /** the short second name of a page on the rail, in the voice of a trip (decoration beside the real label) */
    metaphor: {
      home: 'Trip map',
      resume: 'Route',
      projects: 'Postcards',
      certificates: 'Passport',
      services: 'Tours',
      payment: 'Tickets',
      about: 'Traveller',
    },
    pagesLabel: 'Pages of the trip',
    panel: {
      expand: 'Show the whole panel',
      collapse: 'Show more of the map',
      close: 'Close',
    },
    states: {
      loadingTitle: 'Packing the map',
      loadingBody: 'Setting off from the south of the beach.',
      error: 'Lost signal',
      empty: 'No stops yet',
      offTheMap: 'Off the map',
      soon: 'Road works ahead',
      maintenance: 'Road closed',
    },
    credits: 'Map data © OpenStreetMap contributors',
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
    metaphor: {
      home: 'Bản đồ',
      resume: 'Lộ trình',
      projects: 'Bưu thiếp',
      certificates: 'Hộ chiếu',
      services: 'Tour',
      payment: 'Vé',
      about: 'Lữ khách',
    },
    pagesLabel: 'Các trang của chuyến đi',
    panel: {
      expand: 'Mở rộng bảng',
      collapse: 'Xem thêm bản đồ',
      close: 'Đóng',
    },
    states: {
      loadingTitle: 'Đang gấp bản đồ',
      loadingBody: 'Xuất phát từ phía nam bãi biển.',
      error: 'Mất sóng',
      empty: 'Chưa có điểm dừng',
      offTheMap: 'Ngoài bản đồ',
      soon: 'Đường đang thi công',
      maintenance: 'Đường đang đóng',
    },
    credits: 'Dữ liệu bản đồ © những người đóng góp OpenStreetMap',
  },
);
