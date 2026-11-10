/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { defineCopy } from '@/lib/i18n/define-copy';

/**
 * Interface copy of the Dev skin (the code-editor look): the style switch, the editor chrome and the words that only
 * exist there. Content (roles, projects, …) is the same as in the Standard skin and is not repeated here.
 */
export const devCopy = defineCopy(
  {
    themeHints: {
      system: 'Follows your OS',
      light: 'Light+',
      dark: 'Dark+',
    },
    explorer: 'Explorer',
    files: 'Files',
    closeFiles: 'Close files',
    closeTab: 'Close',
    account: 'Account',
    activity: {
      label: 'Activity bar',
      manage: 'Manage',
    },
    outline: 'Outline',
    timeline: 'Timeline',
    panel: {
      problems: 'Problems',
      output: 'Output',
      terminal: 'Terminal',
      close: 'Close panel',
      noProblems: 'No problems have been detected in the workspace.',
    },
    status: { spaces: 'Spaces', line: 'Ln', column: 'Col' },
    hints: {
      roles: { one: '{n} role', other: '{n} roles' },
      projects: { one: '{n} project', other: '{n} projects' },
      certificates: { one: '{n} certificate', other: '{n} certificates' },
      services: { one: '{n} service', other: '{n} services' },
      methods: { one: '{n} method', other: '{n} methods' },
      degrees: { one: '{n} degree', other: '{n} degrees' },
    },
    windowLights: {
      close: 'Close',
      minimize: 'Fold',
      maximize: 'Maximize',
      restore: 'Restore size',
      /** the lights of the editor window itself */
      leave: 'Close the editor and return to the standard look',
      zen: 'Zen mode',
      exitZen: 'Leave Zen mode',
      fullscreen: 'Full screen',
      exitFullscreen: 'Exit full screen',
      zenHint: 'Zen mode. Press Esc to leave.',
    },
  },
  {
    themeHints: {
      system: 'Theo hệ điều hành',
      light: 'Light+',
      dark: 'Dark+',
    },
    explorer: 'Explorer',
    files: 'Tệp',
    closeFiles: 'Đóng danh sách tệp',
    closeTab: 'Đóng',
    account: 'Tài khoản',
    activity: {
      label: 'Thanh hoạt động',
      manage: 'Quản lý',
    },
    outline: 'Outline',
    timeline: 'Timeline',
    panel: {
      problems: 'Vấn đề',
      output: 'Output',
      terminal: 'Terminal',
      close: 'Đóng bảng',
      noProblems: 'Không phát hiện vấn đề nào trong workspace.',
    },
    status: { spaces: 'Khoảng trắng', line: 'Dòng', column: 'Cột' },
    hints: {
      roles: { one: '{n} vai trò', other: '{n} vai trò' },
      projects: { one: '{n} dự án', other: '{n} dự án' },
      certificates: { one: '{n} chứng chỉ', other: '{n} chứng chỉ' },
      services: { one: '{n} dịch vụ', other: '{n} dịch vụ' },
      methods: { one: '{n} phương thức', other: '{n} phương thức' },
      degrees: { one: '{n} bằng cấp', other: '{n} bằng cấp' },
    },
    windowLights: {
      close: 'Đóng',
      minimize: 'Thu gọn',
      maximize: 'Phóng to',
      restore: 'Khôi phục kích thước',
      leave: 'Đóng trình soạn thảo và quay về giao diện thường',
      zen: 'Chế độ Zen',
      exitZen: 'Thoát chế độ Zen',
      fullscreen: 'Toàn màn hình',
      exitFullscreen: 'Thoát toàn màn hình',
      zenHint: 'Chế độ Zen. Nhấn Esc để thoát.',
    },
  },
);
