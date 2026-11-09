/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { defineCopy } from '@/lib/i18n/define-copy';

/**
 * The words only the Home and About pages of the Academic skin have: the notes in the margin, the caption of Figure 1 and the labels
 * the manuscript puts on what Standard already says. The text of the blocks themselves is Standard's (`home`, `about`, `chat`).
 */
export const academicHomeAboutCopy = defineCopy(
  {
    home: {
      /** the note beside the title: the role that is not over */
      currentRole: 'current role',
      /** `since Jan 2026` */
      since: 'since {month}',
      /** the note beside the abstract: `7 years` then this */
      inSoftware: 'in software',
      keywords: 'Keywords',
      figure: {
        label: 'Figure 1.',
        /** `Roles and studies over time, 2016–2026.` */
        title: 'Roles and studies over time, {from}–{to}.',
        legend:
          'Bar length is the duration of each item; blue hatched bars are full-time roles, green dashed bars other roles, dotted bars education, and an arrow marks an item that is still ongoing.',
        open: 'Select a row to read the resume.',
        axis: 'Years',
      },
      method: 'Method',
      /** `Step 2` over the title of a step of the pipeline */
      step: 'Step {n}',
    },
    about: {
      expertise: 'Expertise',
      photos: 'Photographs',
    },
  },
  {
    home: {
      currentRole: 'vai trò hiện tại',
      since: 'từ {month}',
      inSoftware: 'trong ngành phần mềm',
      keywords: 'Từ khóa',
      figure: {
        label: 'Hình 1.',
        title: 'Các vai trò và việc học theo thời gian, {from}–{to}.',
        legend:
          'Độ dài thanh là thời gian của từng mục; thanh xanh dương gạch chéo là vai trò toàn thời gian, thanh xanh lá nét đứt là các vai trò khác, thanh chấm là học vấn, và mũi tên là mục vẫn đang tiếp diễn.',
        open: 'Chọn một hàng để đọc hồ sơ.',
        axis: 'Năm',
      },
      method: 'Phương pháp',
      step: 'Bước {n}',
    },
    about: {
      expertise: 'Chuyên môn',
      photos: 'Hình ảnh',
    },
  },
);
