/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { defineCopy } from '@/lib/i18n/define-copy';

/** The words only the Academic skin's Payment page has: the table of channels and the note in its margin. The rest is `paymentCopy`. */
export const academicPaymentCopy = defineCopy(
  {
    /** the line above the table of "More ways to pay" */
    caption:
      'Ways to pay, one channel to a line. Copy a number, or open its QR code.',
    columns: { method: 'Method', account: 'Account', actions: 'Actions' },
    /** the margin note: `{n} ways to pay`, then how many of each kind */
    noteTotal: '{n} ways to pay',
    noteKind: '{kind}: {n}',
  },
  {
    caption:
      'Các cách thanh toán, mỗi kênh một dòng. Sao chép số tài khoản hoặc mở mã QR.',
    columns: {
      method: 'Phương thức',
      account: 'Tài khoản',
      actions: 'Thao tác',
    },
    noteTotal: '{n} cách thanh toán',
    noteKind: '{kind}: {n}',
  },
);
