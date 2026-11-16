/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { defineCopy } from '@/lib/i18n/define-copy';

/**
 * The words only the Phone skin has for the Home, About and Resume pages: the names of the widgets of the home screen, the rows of the
 * settings-style lists and the master-detail of the roles. The content and every other interface string are the Standard ones (`homeCopy`,
 * `aboutCopy`, `resumeCopy`, `projectsCopy`, `statesCopy`, `chatCopy`).
 */
export const phoneHomeCopy = defineCopy(
  {
    home: {
      /** the heading, for assistive technology, of the cards under the launcher */
      feed: 'Today',
      /** the widget with the years in software */
      inSoftware: 'In software',
      /** the name of the group of apps, for assistive technology */
      apps: 'Apps',
    },
    about: {
      specialties: 'Specialties',
      photos: 'Photos',
      facts: {
        title: 'Facts',
        company: 'Company',
        location: 'Location',
        experience: 'Experience',
        firstRole: 'First role',
        areas: 'Areas',
        languages: 'Site languages',
      },
    },
    resume: {
      /** the control that goes from the role back to the list of roles (phone) */
      backToRoles: 'All roles',
      detail: {
        period: 'Period',
        length: 'Length',
        team: 'Team',
      },
      /** the length of a role or of the use of a skill, in the slots of `lengthLabel` */
      length: '{years} y {months} mo',
      lengthYears: '{years} y',
      lengthMonths: '{months} mo',
      /** read before the length a skill was used, in the list of skills */
      usedFor: 'Used for',
      /** under "All skills by area": Standard's own lead speaks of a hover, which a phone does not have */
      allLead:
        'The core stack is marked. Each skill says where it was used and for how long.',
    },
  },
  {
    home: {
      feed: 'Hôm nay',
      inSoftware: 'Trong ngành phần mềm',
      apps: 'Ứng dụng',
    },
    about: {
      specialties: 'Chuyên môn',
      photos: 'Ảnh',
      facts: {
        title: 'Thông tin',
        company: 'Nơi làm việc',
        location: 'Nơi ở',
        experience: 'Kinh nghiệm',
        firstRole: 'Công việc đầu tiên',
        areas: 'Lĩnh vực',
        languages: 'Ngôn ngữ của trang',
      },
    },
    resume: {
      backToRoles: 'Tất cả vai trò',
      detail: {
        period: 'Thời gian',
        length: 'Thời lượng',
        team: 'Nhóm',
      },
      length: '{years} năm {months} tháng',
      lengthYears: '{years} năm',
      lengthMonths: '{months} tháng',
      usedFor: 'Đã dùng trong',
      allLead:
        'Công nghệ chính được đánh dấu. Mỗi kỹ năng cho biết đã dùng ở đâu và trong bao lâu.',
    },
  },
);
