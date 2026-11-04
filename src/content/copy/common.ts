/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { defineCopy } from '@/lib/i18n/define-copy';

/** Header, menus, footer and the 404 / Coming soon screens. */
export const commonCopy = defineCopy(
  {
    nav: {
      about: 'About',
      resume: 'Resume',
      projects: 'Projects',
      certificates: 'Certificates',
      services: 'Services',
      payment: 'Payment',
    },
    soon: 'Soon',
    menu: { open: 'Open menu', label: 'Menu' },
    language: {
      label: 'Language',
      english: 'English',
      vietnamese: 'Tiếng Việt',
    },
    connect: {
      button: 'Connect',
      title: "Let's connect",
      email: 'Email',
      copy: 'Copy',
      copied: 'Copied',
      groups: {
        professional: 'Professional',
        messaging: 'Messaging',
        social: 'Social',
      },
    },
    downloadCv: 'Download CV',
    status: {
      notFound: {
        title: "This page doesn't exist.",
        body: 'The link may be broken or the page may have moved. Go back to where you were, or start again from the home page.',
      },
      soon: {
        title: 'This page is coming soon.',
        body: "I'm still working on it. In the meantime, the rest of the site is open.",
      },
      home: 'Back to home',
      back: 'Go back',
    },
    maintenance: {
      code: 'Maintenance',
      title: "We'll be back soon.",
      body: 'The site is being updated right now. Please check back in a little while.',
      contact: 'Need me sooner? Email me',
    },
  },
  {
    nav: {
      about: 'Giới thiệu',
      resume: 'Hồ sơ',
      projects: 'Dự án',
      certificates: 'Chứng chỉ',
      services: 'Dịch vụ',
      payment: 'Thanh toán',
    },
    soon: 'Sắp có',
    menu: { open: 'Mở menu', label: 'Menu' },
    language: {
      label: 'Ngôn ngữ',
      english: 'English',
      vietnamese: 'Tiếng Việt',
    },
    connect: {
      button: 'Liên hệ',
      title: 'Kết nối với mình',
      email: 'Email',
      copy: 'Sao chép',
      copied: 'Đã chép',
      groups: {
        professional: 'Chuyên nghiệp',
        messaging: 'Nhắn tin',
        social: 'Mạng xã hội',
      },
    },
    downloadCv: 'Tải CV',
    status: {
      notFound: {
        title: 'Trang này không tồn tại.',
        body: 'Liên kết có thể đã hỏng hoặc trang đã được chuyển đi. Hãy quay lại nơi bạn vừa ở, hoặc bắt đầu lại từ trang chủ.',
      },
      soon: {
        title: 'Trang này sắp ra mắt.',
        body: 'Mình vẫn đang hoàn thiện trang này. Trong lúc chờ, các phần còn lại của trang web vẫn mở.',
      },
      home: 'Về trang chủ',
      back: 'Quay lại',
    },
    maintenance: {
      code: 'Bảo trì',
      title: 'Mình sẽ sớm quay lại.',
      body: 'Trang web đang được cập nhật. Bạn vui lòng ghé lại sau ít phút nhé.',
      contact: 'Cần gấp? Hãy gửi email cho mình',
    },
  },
);
