/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { defineCopy } from '@/lib/i18n/define-copy';

/** Words only the Home page of the Moba skin has (the small headings over its sections). The page's own text is the Standard copy. */
export const mobaHomeCopy = defineCopy(
  {
    kickers: {
      hero: 'Champion select',
      pipeline: 'Recall path',
      skills: 'Skill orbs',
      work: 'Match history',
      build: 'Loadout',
      featured: 'Objectives',
      contact: 'Lobby',
    },
    step: 'Step {n}',
    yearsLabel: 'Level {n}',
    portraitAlt: '{name} reading a book',
  },
  {
    kickers: {
      hero: 'Chọn tướng',
      pipeline: 'Đường hồi',
      skills: 'Cầu kỹ năng',
      work: 'Lịch sử trận',
      build: 'Trang bị',
      featured: 'Mục tiêu',
      contact: 'Sảnh chờ',
    },
    step: 'Bước {n}',
    yearsLabel: 'Cấp {n}',
    portraitAlt: '{name} đang đọc sách',
  },
);
