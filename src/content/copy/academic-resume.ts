/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { defineCopy } from '@/lib/i18n/define-copy';

/**
 * The words only the Academic Resume page has: how long a role lasted, the table of skills (its columns, its filter and the note that
 * explains the tally marks). The words of the roles, the skills and the degrees are Standard's (`resumeCopy`).
 */
export const academicResumeCopy = defineCopy(
  {
    /** the length of a role, in the slots of `lengthLabel` */
    length: '{years} y {months} mo',
    lengthYears: '{years} y',
    lengthMonths: '{months} mo',
    skills: {
      /** the caption of the table, before the number of skills */
      caption:
        'Skills by area. Months is the time a skill was in use, overlaps counted once.',
      columns: { skill: 'Skill', area: 'Area', months: 'Months' },
      /** the months a skill was used, in the cell of the table */
      monthsOf: '{n} mo',
      filter: 'Filter skills by area',
      all: 'All',
      /** under "All skills by area": the core stack is marked in the table and the places are in its last column (Standard's own lead speaks of a hover) */
      allLead:
        'Skills of the core stack are marked †. The last column says where each was used.',
      /** a skill that is part of the core stack, in the table */
      coreMark: 'Core stack',
      /** an empty `Used at` cell */
      none: '—',
      tally: {
        title: 'tally',
        text: 'One stroke for each year a skill was in use, rounded up. Four strokes crossed by a fifth make five years. Months, in the table, is the exact time.',
      },
    },
  },
  {
    length: '{years} năm {months} tháng',
    lengthYears: '{years} năm',
    lengthMonths: '{months} tháng',
    skills: {
      caption:
        'Kỹ năng theo lĩnh vực. Số tháng là thời gian kỹ năng được dùng, phần chồng nhau chỉ tính một lần.',
      columns: { skill: 'Kỹ năng', area: 'Lĩnh vực', months: 'Số tháng' },
      monthsOf: '{n} tháng',
      filter: 'Lọc kỹ năng theo lĩnh vực',
      all: 'Tất cả',
      allLead:
        'Công nghệ chính được đánh dấu †. Cột cuối cho biết mỗi kỹ năng đã được dùng ở đâu.',
      coreMark: 'Công nghệ chính',
      none: '—',
      tally: {
        title: 'vạch đếm',
        text: 'Mỗi vạch là một năm kỹ năng được dùng, làm tròn lên. Bốn vạch và một vạch chéo qua là năm năm. Số tháng trong bảng là thời gian chính xác.',
      },
    },
  },
);
