/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { defineCopy } from '@/lib/i18n/define-copy';

/**
 * The words around the Output and Problems tabs of the Dev skin. The lines of the Output themselves (`I/Router: /about`) are
 * technical English, like a real logcat, and are not here.
 */
export const devOutputCopy = defineCopy(
  {
    output: {
      /** the accessible name of the log */
      label: 'Output log',
      empty: 'Nothing has been logged yet.',
      clear: 'Clear output',
    },
    problems: {
      label: 'Problems list',
      queryFailed: '{subject}: could not be read',
      queryRetried: '{subject}: needed a retry to be read',
      uncaught: 'An uncaught error occurred ({subject})',
      rejection: 'A promise was rejected and nothing handled it ({subject})',
      error: 'Error',
      warning: 'Warning',
      times: '{n} times',
    },
    /** the accessible name of the counters in the status bar */
    status: 'Problems ({errors} errors, {warnings} warnings)',
  },
  {
    output: {
      label: 'Nhật ký Output',
      empty: 'Chưa có gì được ghi lại.',
      clear: 'Xóa output',
    },
    problems: {
      label: 'Danh sách vấn đề',
      queryFailed: '{subject}: không đọc được',
      queryRetried: '{subject}: phải thử lại mới đọc được',
      uncaught: 'Có một lỗi không được xử lý ({subject})',
      rejection: 'Có một promise bị từ chối mà không ai xử lý ({subject})',
      error: 'Lỗi',
      warning: 'Cảnh báo',
      times: '{n} lần',
    },
    status: 'Vấn đề ({errors} lỗi, {warnings} cảnh báo)',
  },
);

export type DevOutputCopy = (typeof devOutputCopy)['en'];
