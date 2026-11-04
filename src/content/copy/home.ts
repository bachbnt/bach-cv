/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { defineCopy } from '@/lib/i18n/define-copy';

// Interface copy for the Home page.
export const homeCopy = defineCopy(
  {
    greeting: 'Bùi Ngô Tôn Bách. Team Lead at FPT Software, Ho Chi Minh City.',
    title: 'I lead mobile teams and build the AI tooling they ship with.',
    intro:
      'Mobile engineer with 5+ years in payments and large Super Apps (Kotlin, KMM, React Native). Today I lead 5 developers on a 13-module Android app and run the Claude Code workflows that fix, review and sync its code.',
    downloadCv: 'Download CV',
    pipeline: {
      title: 'How a bug becomes a merge request',
      subtitle: 'Built on Claude Code: 14 skills, 2 agents.',
      steps: [
        {
          title: 'Pick up a Jira bug',
          body: 'Stale and non-actionable tickets are skipped.',
          tags: [] as string[],
        },
        {
          title: 'Trace the root cause',
          body: 'Source, design docs, the legacy app and device logs.',
          tags: [] as string[],
        },
        {
          title: 'Route by the evidence',
          body: 'The fix goes where it belongs:',
          tags: ['Fix MR', 'Vendor Q&A', 'Design + code MRs'],
        },
      ],
    },
    technologies: 'Technologies',
    loading: 'Loading...',
    work: {
      title: "Where I've worked",
      all: 'Full resume',
      current: 'Current',
    },
    contact: { title: 'Have a role or a project in mind?' },
  },
  {
    greeting: 'Bùi Ngô Tôn Bách. Team Lead tại FPT Software, TP. Hồ Chí Minh.',
    title:
      'Mình dẫn dắt các nhóm mobile và xây dựng công cụ AI để họ giao sản phẩm.',
    intro:
      'Kỹ sư mobile với hơn 5 năm kinh nghiệm trong mảng thanh toán và các Super App lớn (Kotlin, KMM, React Native). Hiện mình dẫn dắt 5 lập trình viên trên một ứng dụng Android 13 module và vận hành các quy trình Claude Code để sửa lỗi, review và đồng bộ code.',
    downloadCv: 'Tải CV',
    pipeline: {
      title: 'Một lỗi trở thành merge request như thế nào',
      subtitle: 'Xây trên Claude Code: 14 skill, 2 agent.',
      steps: [
        {
          title: 'Nhận một bug từ Jira',
          body: 'Các ticket đã cũ hoặc không thể xử lý sẽ bị bỏ qua.',
          tags: [],
        },
        {
          title: 'Truy tìm nguyên nhân gốc',
          body: 'Mã nguồn, tài liệu thiết kế, ứng dụng cũ và log thiết bị.',
          tags: [],
        },
        {
          title: 'Chọn hướng xử lý theo bằng chứng',
          body: 'Bản sửa đi đúng nơi nó thuộc về:',
          tags: ['Fix MR', 'Hỏi đáp với vendor', 'MR thiết kế + code'],
        },
      ],
    },
    technologies: 'Công nghệ',
    loading: 'Đang tải...',
    work: {
      title: 'Nơi mình đã làm việc',
      all: 'Xem hồ sơ đầy đủ',
      current: 'Hiện tại',
    },
    contact: { title: 'Bạn có vai trò hoặc dự án nào cần trao đổi?' },
  },
);
