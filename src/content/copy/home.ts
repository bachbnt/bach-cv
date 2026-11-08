/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { defineCopy } from '@/lib/i18n/define-copy';

// Interface copy for the Home page.
export const homeCopy = defineCopy(
  {
    title: 'I lead mobile teams and build the AI tooling they ship with.',
    // `{years}` is the years in software worked out from the roles; `introUndated` is the same text while they load
    intro:
      'Team Lead at FPT Software with {years} in software, from mobile apps (Kotlin, KMM, React Native) to AI tooling. Today I lead 10 developers on a 13-module Android app and run the Claude Code workflows that fix, review and sync its code.',
    introUndated:
      'Team Lead at FPT Software, from mobile apps (Kotlin, KMM, React Native) to AI tooling. Today I lead 10 developers on a 13-module Android app and run the Claude Code workflows that fix, review and sync its code.',
    downloadCv: 'Download CV',
    avatarAlt: '{name} reading a book',
    pipeline: {
      title: 'How a bug becomes a merge request',
      subtitle:
        'An AI workflow I built at FPT with Claude Code (14 skills, 2 agents). It reads a Jira bug and opens the fix for review, so my team of 10 does not start from a blank page.',
      steps: [
        {
          title: 'Reads the Jira bug',
          body: 'It skips tickets that are stale or cannot be acted on.',
          tags: [] as string[],
        },
        {
          title: 'Finds the root cause',
          body: 'It searches the source code, design docs, the legacy app and device logs.',
          tags: [] as string[],
        },
        {
          title: 'Opens the right fix for review',
          body: 'Depending on what the evidence shows, it opens one of:',
          tags: ['Fix MR', 'Vendor Q&A', 'Design + code MRs'],
        },
      ],
    },
    technologies: 'Technologies',
    pauseTechnologies: 'Pause the moving list of technologies',
    playTechnologies: 'Play the moving list of technologies',
    work: {
      title: "Where I've worked",
      all: 'Full resume',
      current: 'Current',
    },
    contact: { title: 'Have a role or a project in mind?' },
  },
  {
    title:
      'Mình dẫn dắt các nhóm mobile và xây dựng công cụ AI để họ giao sản phẩm.',
    intro:
      'Team Lead tại FPT Software với {years} làm việc trong ngành phần mềm, từ ứng dụng mobile (Kotlin, KMM, React Native) đến công cụ AI. Hiện mình dẫn dắt 10 lập trình viên trên một ứng dụng Android 13 module và vận hành các quy trình Claude Code để sửa lỗi, review và đồng bộ code.',
    introUndated:
      'Team Lead tại FPT Software, từ ứng dụng mobile (Kotlin, KMM, React Native) đến công cụ AI. Hiện mình dẫn dắt 10 lập trình viên trên một ứng dụng Android 13 module và vận hành các quy trình Claude Code để sửa lỗi, review và đồng bộ code.',
    downloadCv: 'Tải CV',
    avatarAlt: '{name} đang đọc sách',
    pipeline: {
      title: 'Một lỗi trở thành merge request như thế nào',
      subtitle:
        'Quy trình AI mình xây ở FPT bằng Claude Code (14 skill, 2 agent). Nó đọc một bug trên Jira rồi mở sẵn bản sửa để review, nên nhóm 10 người không phải bắt đầu từ con số không.',
      steps: [
        {
          title: 'Đọc bug trên Jira',
          body: 'Bỏ qua các ticket đã cũ hoặc không thể xử lý.',
          tags: [],
        },
        {
          title: 'Tìm nguyên nhân gốc',
          body: 'Tra mã nguồn, tài liệu thiết kế, ứng dụng cũ và log thiết bị.',
          tags: [],
        },
        {
          title: 'Mở đúng bản sửa để review',
          body: 'Tùy bằng chứng tìm được, nó mở một trong:',
          tags: ['Fix MR', 'Hỏi đáp với vendor', 'MR thiết kế + code'],
        },
      ],
    },
    technologies: 'Công nghệ',
    pauseTechnologies: 'Tạm dừng danh sách công nghệ đang chạy',
    playTechnologies: 'Cho danh sách công nghệ chạy lại',
    work: {
      title: 'Nơi mình đã làm việc',
      all: 'Xem hồ sơ đầy đủ',
      current: 'Hiện tại',
    },
    contact: { title: 'Bạn có vai trò hoặc dự án nào cần trao đổi?' },
  },
);
