/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { defineCopy } from '@/lib/i18n/define-copy';

/**
 * Words only the Resume page of the Moba skin has: the small headings over its sections, the tower of each role and the lengths. The page's
 * own text (titles, Current, Show responsibilities, the skill tips...) is the Standard copy. `{n}`, `{total}`, `{time}` are slots.
 */
export const mobaResumeCopy = defineCopy(
  {
    kickers: {
      experience: 'Tower line',
      skills: 'Items and abilities',
      core: 'Key skills',
      areas: 'Item shop',
      education: 'Academy',
    },
    /** the position of a role in the career: the roles are the towers of the red half of the mid lane */
    tower: 'Tower {n} of {total}',
    /** the role that counts as "now" is the nexus */
    nexus: 'Nexus',
    /** how long a role lasted, in the slots of `lengthLabel`; `held` puts it in a sentence */
    held: 'Held {time}',
    length: {
      length: '{years} y {months} mo',
      lengthYears: '{years} y',
      lengthMonths: '{months} mo',
    },
    /** how long a key skill has been in use, in the units of `formatUsed` */
    used: 'Used {time}',
    units: { years: '{n} y', months: '{n} mo' },
  },
  {
    kickers: {
      experience: 'Đường trụ',
      skills: 'Trang bị và kỹ năng',
      core: 'Kỹ năng chính',
      areas: 'Cửa hàng trang bị',
      education: 'Học viện',
    },
    tower: 'Trụ {n} trên {total}',
    nexus: 'Nhà chính',
    held: 'Giữ {time}',
    length: {
      length: '{years} năm {months} tháng',
      lengthYears: '{years} năm',
      lengthMonths: '{months} tháng',
    },
    used: 'Dùng {time}',
    units: { years: '{n} năm', months: '{n} tháng' },
  },
);
