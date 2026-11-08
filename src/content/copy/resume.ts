/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { defineCopy } from '@/lib/i18n/define-copy';

// Interface copy for the Resume page and its Skills section, in both languages.
// `{year}` in `firstUsed` is replaced by the year. `{years}` in `intro` is the years in software, spelled ("Seven years"); `introUndated` is the same line while the roles load.
export const resumeCopy = defineCopy(
  {
    title: 'Resume',
    intro: '{years} in software, now leading a team of 10.',
    introUndated: 'Now leading a team of 10.',
    downloadCv: 'Download CV',
    experience: {
      title: 'Experience',
      current: 'Current',
      keyProject: 'Key project',
      show: 'Show responsibilities',
      hide: 'Hide responsibilities',
    },
    skills: {
      title: 'Skills',
      lead: 'The stack behind my work, grouped by area, with where I have used it.',
      core: {
        title: 'Core stack',
        lead: 'What I use every day in my current role.',
      },
      all: {
        title: 'All skills by area',
        lead: 'Bold ones are my core stack. Hover, focus or tap a skill to see where I used it.',
      },
      groups: {
        ai: 'AI and automation',
        mobile: 'Mobile',
        web: 'Frontend and backend',
        tools: 'Tools and process',
      },
      evidence: {
        usedAt: 'Used at',
        separator: ' · ',
        sideProjects: 'Side projects',
      },
      tip: {
        usedAt: 'Used at',
        onlySide: 'Used in side projects.',
        andSide: 'and in side projects',
        firstUsed: 'First used {year}.',
        none: 'No specific role or project listed for this yet.',
      },
    },
    education: {
      title: 'Education',
      thesis: 'Thesis',
      readThesis: 'Read the thesis',
      sourceCode: 'Source code',
    },
  },
  {
    title: 'Hồ sơ',
    intro:
      '{years} làm việc trong ngành phần mềm, hiện đang dẫn dắt một nhóm 10 người.',
    introUndated: 'Hiện đang dẫn dắt một nhóm 10 người.',
    downloadCv: 'Tải CV',
    experience: {
      title: 'Kinh nghiệm',
      current: 'Hiện tại',
      keyProject: 'Dự án chính',
      show: 'Xem trách nhiệm công việc',
      hide: 'Ẩn trách nhiệm công việc',
    },
    skills: {
      title: 'Kỹ năng',
      lead: 'Bộ công nghệ đứng sau công việc của tôi, nhóm theo lĩnh vực, kèm nơi tôi đã sử dụng.',
      core: {
        title: 'Công nghệ chính',
        lead: 'Những gì tôi dùng hằng ngày trong vai trò hiện tại.',
      },
      all: {
        title: 'Tất cả kỹ năng theo lĩnh vực',
        lead: 'Chữ đậm là công nghệ chính của tôi. Rê chuột, focus hoặc chạm vào một kỹ năng để xem tôi đã dùng nó ở đâu.',
      },
      groups: {
        ai: 'AI và tự động hóa',
        mobile: 'Mobile',
        web: 'Frontend và backend',
        tools: 'Công cụ và quy trình',
      },
      evidence: {
        usedAt: 'Đã dùng tại',
        separator: ' · ',
        sideProjects: 'Dự án cá nhân',
      },
      tip: {
        usedAt: 'Đã dùng tại',
        onlySide: 'Đã dùng trong các dự án cá nhân.',
        andSide: 'và trong các dự án cá nhân',
        firstUsed: 'Dùng lần đầu năm {year}.',
        none: 'Chưa có vai trò hay dự án cụ thể nào được liệt kê cho kỹ năng này.',
      },
    },
    education: {
      title: 'Học vấn',
      thesis: 'Luận văn',
      readThesis: 'Đọc luận văn',
      sourceCode: 'Mã nguồn',
    },
  },
);
