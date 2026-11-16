/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { defineCopy } from '@/lib/i18n/define-copy';

/**
 * The words only the Phone Projects app has. The rest (the title, the kinds, the platforms, the statuses, the filters, the orders, the links and
 * the viewer buttons) is the Standard copy in `projects.ts`. `{count}`, `{name}`, `{kind}`, `{current}` and `{total}` are filled in by `fill`.
 */
export const phoneProjectsCopy = defineCopy(
  {
    /** the way from a project back to the list, on a phone where the detail is a screen of its own */
    backToList: 'Back to the list',
    /** the name of the region that tells about the open project */
    details: 'Project details',
    period: 'Period',
    links: 'Links',
    screenshots: 'Screenshots',
    /** the button of the filters that closes the sheet: how many projects it leaves */
    showOne: 'Show 1 project',
    showMany: 'Show {count} projects',
    showNone: 'No projects match',
    clearAll: 'Clear all',
    /** the button inside the search field that empties it */
    clearSearch: 'Clear search',
    /** the removable chips under the buttons */
    activeFilters: 'Active filters',
    removeFilter: 'Remove filter {name}',
    /** the chip that stands for the technologies a row does not list: `+3` */
    moreTech: 'and {count} more technologies',
    /** under the name in the viewer: `Freelance · screenshot 2 of 8` */
    screenshotOf: '{kind} · screenshot {current} of {total}',
  },
  {
    backToList: 'Về danh sách',
    details: 'Chi tiết dự án',
    period: 'Thời gian',
    links: 'Liên kết',
    screenshots: 'Ảnh chụp màn hình',
    showOne: 'Xem 1 dự án',
    showMany: 'Xem {count} dự án',
    showNone: 'Không có dự án nào khớp',
    clearAll: 'Xóa tất cả',
    clearSearch: 'Xóa nội dung tìm kiếm',
    activeFilters: 'Bộ lọc đang bật',
    removeFilter: 'Bỏ bộ lọc {name}',
    moreTech: 'và {count} công nghệ khác',
    screenshotOf: '{kind} · ảnh chụp màn hình {current} / {total}',
  },
);
