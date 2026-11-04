/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { defineCopy } from '@/lib/i18n/define-copy';

/**
 * The words of the three data states, shared by every block that reads data:
 * loading (a skeleton), empty (nothing to show) and error (could not be loaded, with a retry).
 * `subjects` name what failed; `empty` holds the card for each block, with an optional way forward.
 */
export const statesCopy = defineCopy(
  {
    loading: 'Loading',
    retry: 'Try again',
    error: {
      title: (what: string) => `${what} couldn't be loaded`,
      body: 'Check your connection and try again.',
    },
    subjects: {
      projects: 'Projects',
      certificates: 'Certificates',
      experience: 'Experience',
      education: 'Education',
      skills: 'Skills',
      coreStack: 'The core stack',
      services: 'Services',
      work: 'The work history',
      contact: 'The contact details',
      payments: 'The payment details',
      cv: 'The CV',
    },
    empty: {
      projects: {
        title: 'No projects to show yet',
        body: "I'm preparing the case studies. In the meantime, you can read where I have worked, or write to me about a project.",
        action: { label: 'See my resume', href: '/resume' },
      },
      certificates: {
        title: 'No certificates to show yet',
        body: "My credentials will appear here once they're added. In the meantime, you can read where I have worked.",
        action: { label: 'See my resume', href: '/resume' },
      },
      experience: {
        title: 'No experience to show yet',
        body: "My work history is being updated. In the meantime, you can see what I've built.",
        action: { label: 'See my projects', href: '/projects' },
      },
      education: {
        title: 'No education to show yet',
        body: 'My education details are being updated. In the meantime, you can read more about me.',
        action: { label: 'About me', href: '/about' },
      },
      skills: {
        title: 'No skills to show yet',
        body: "My skills are being updated. In the meantime, you can see what I've built with them.",
        action: { label: 'See my projects', href: '/projects' },
      },
      coreStack: {
        title: 'No core stack to show yet',
        body: "I'll list the skills I use every day here soon.",
        action: null,
      },
      services: {
        title: 'No services to show yet',
        body: 'My services will be listed here soon. In the meantime, you can write to me about your project.',
        action: { label: 'Tell me about your project', href: '#contact-cta' },
      },
      work: {
        title: 'No roles to show yet',
        body: 'My work history is being updated. In the meantime, you can read more about me.',
        action: { label: 'About me', href: '/about' },
      },
      contact: {
        title: 'No contact details yet',
        body: 'My email and phone will appear here soon.',
        action: null,
      },
    },
  },
  {
    loading: 'Đang tải',
    retry: 'Thử lại',
    error: {
      title: (what: string) => `Không tải được ${what}`,
      body: 'Hãy kiểm tra kết nối mạng rồi thử lại.',
    },
    subjects: {
      projects: 'dự án',
      certificates: 'chứng chỉ',
      experience: 'kinh nghiệm',
      education: 'học vấn',
      skills: 'kỹ năng',
      coreStack: 'bộ kỹ năng chính',
      services: 'dịch vụ',
      work: 'quá trình làm việc',
      contact: 'thông tin liên hệ',
      payments: 'thông tin thanh toán',
      cv: 'CV',
    },
    empty: {
      projects: {
        title: 'Chưa có dự án nào để hiển thị',
        body: 'Tôi đang chuẩn bị các dự án. Trong lúc đó, bạn có thể xem quá trình làm việc của tôi hoặc nhắn cho tôi về dự án của bạn.',
        action: { label: 'Xem hồ sơ', href: '/resume' },
      },
      certificates: {
        title: 'Chưa có chứng chỉ nào để hiển thị',
        body: 'Các chứng chỉ của tôi sẽ xuất hiện ở đây khi được bổ sung. Trong lúc đó, bạn có thể xem quá trình làm việc của tôi.',
        action: { label: 'Xem hồ sơ', href: '/resume' },
      },
      experience: {
        title: 'Chưa có kinh nghiệm nào để hiển thị',
        body: 'Quá trình làm việc của tôi đang được cập nhật. Trong lúc đó, bạn có thể xem những gì tôi đã xây dựng.',
        action: { label: 'Xem dự án', href: '/projects' },
      },
      education: {
        title: 'Chưa có học vấn nào để hiển thị',
        body: 'Thông tin học vấn của tôi đang được cập nhật. Trong lúc đó, bạn có thể đọc thêm về tôi.',
        action: { label: 'Giới thiệu', href: '/about' },
      },
      skills: {
        title: 'Chưa có kỹ năng nào để hiển thị',
        body: 'Các kỹ năng của tôi đang được cập nhật. Trong lúc đó, bạn có thể xem những gì tôi đã xây dựng với chúng.',
        action: { label: 'Xem dự án', href: '/projects' },
      },
      coreStack: {
        title: 'Chưa có bộ kỹ năng chính',
        body: 'Tôi sẽ sớm liệt kê ở đây những kỹ năng tôi dùng mỗi ngày.',
        action: null,
      },
      services: {
        title: 'Chưa có dịch vụ nào để hiển thị',
        body: 'Các dịch vụ của tôi sẽ sớm được cập nhật tại đây. Trong lúc đó, bạn có thể nhắn cho tôi về dự án của bạn.',
        action: {
          label: 'Cho tôi biết về dự án của bạn',
          href: '#contact-cta',
        },
      },
      work: {
        title: 'Chưa có vai trò nào để hiển thị',
        body: 'Quá trình làm việc của tôi đang được cập nhật. Trong lúc đó, bạn có thể đọc thêm về tôi.',
        action: { label: 'Giới thiệu', href: '/about' },
      },
      contact: {
        title: 'Chưa có thông tin liên hệ',
        body: 'Email và số điện thoại của tôi sẽ sớm xuất hiện ở đây.',
        action: null,
      },
    },
  },
);

export type EmptyKey = keyof (typeof statesCopy)['en']['empty'];
export type SubjectKey = keyof (typeof statesCopy)['en']['subjects'];
