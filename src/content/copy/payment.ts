/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { Localized } from '@/lib/i18n/define-copy';

/** The English shape with strings widened and functions kept, so `vi` must have exactly the English keys. */
type Shape<T> = T extends string
  ? string
  : T extends (...args: never[]) => unknown
    ? T
    : T extends object
      ? { [K in keyof T]: Shape<T[K]> }
      : T;

// Interface copy for the Payment page, in both languages.
const en = {
  title: 'Payment',
  intro:
    'Scan a QR code or copy an account number to pay for a project or say thanks.',
  note: 'Check the account name shown in your banking app before you confirm the transfer.',
  details: 'Payment details',
  preferred: 'Preferred methods',
  more: 'More ways to pay',
  filterLabel: 'Filter payment methods',
  filterAll: 'All',
  kinds: { bank: 'Bank', wallet: 'Wallet' },
  accountName: 'Account name',
  accountNumber: 'Account number',
  copyAccount: 'Copy account number',
  copyNumber: 'Copy number',
  copyAll: 'Copy all details',
  qrCode: 'QR code',
  saveQr: 'Save QR',
  closeQr: 'Close QR code',
  previousMethod: 'Previous method',
  nextMethod: 'Next method',
  empty: {
    title: 'Payments are paused for now',
    body: "There's nothing to pay at the moment, and nothing you need to do. If you'd like to work together, tell me about your project and I'll reply.",
    action: 'Tell me about your project',
    href: '/services#contact-cta',
  },
  toast: {
    accountCopied: (name: string) => `${name} account number copied`,
    allCopied: (name: string) => `${name} details copied`,
    copyFailed: 'Could not copy. Select the number and press Ctrl or Cmd + C.',
    qrSaved: 'QR code saved',
    qrOpened: 'Opened the QR image. Save it from the new tab.',
  },
  enlargeQr: (name: string) => `Enlarge ${name} QR code`,
  showQr: (name: string) => `Show ${name} QR code`,
  qrAlt: (name: string) => `${name} payment QR code`,
  qrTitle: (name: string) => `${name} QR code`,
  counter: (n: number, total: number) => `${n} of ${total}`,
} as const;

const vi: Shape<typeof en> = {
  title: 'Thanh toán',
  intro:
    'Quét mã QR hoặc sao chép số tài khoản để thanh toán cho một dự án hoặc gửi lời cảm ơn.',
  note: 'Hãy kiểm tra tên tài khoản hiển thị trong ứng dụng ngân hàng trước khi xác nhận chuyển khoản.',
  details: 'Thông tin thanh toán',
  preferred: 'Phương thức ưu tiên',
  more: 'Các cách thanh toán khác',
  filterLabel: 'Lọc phương thức thanh toán',
  filterAll: 'Tất cả',
  kinds: { bank: 'Ngân hàng', wallet: 'Ví điện tử' },
  accountName: 'Tên tài khoản',
  accountNumber: 'Số tài khoản',
  copyAccount: 'Sao chép số tài khoản',
  copyNumber: 'Sao chép số',
  copyAll: 'Sao chép toàn bộ thông tin',
  qrCode: 'Mã QR',
  saveQr: 'Lưu mã QR',
  closeQr: 'Đóng mã QR',
  previousMethod: 'Phương thức trước',
  nextMethod: 'Phương thức tiếp theo',
  empty: {
    title: 'Hiện tạm dừng nhận thanh toán',
    body: 'Hiện không có khoản nào cần thanh toán và bạn không cần làm gì cả. Nếu muốn hợp tác, hãy cho tôi biết về dự án của bạn, tôi sẽ phản hồi.',
    action: 'Cho tôi biết về dự án của bạn',
    href: '/services#contact-cta',
  },
  toast: {
    accountCopied: (name: string) => `Đã sao chép số tài khoản ${name}`,
    allCopied: (name: string) => `Đã sao chép thông tin ${name}`,
    copyFailed: 'Không sao chép được. Hãy chọn số rồi nhấn Ctrl hoặc Cmd + C.',
    qrSaved: 'Đã lưu mã QR',
    qrOpened: 'Đã mở ảnh mã QR. Hãy lưu ảnh từ thẻ mới.',
  },
  enlargeQr: (name: string) => `Phóng to mã QR ${name}`,
  showQr: (name: string) => `Xem mã QR ${name}`,
  qrAlt: (name: string) => `Mã QR thanh toán ${name}`,
  qrTitle: (name: string) => `Mã QR ${name}`,
  counter: (n: number, total: number) => `${n} / ${total}`,
};

export const paymentCopy: Localized<Shape<typeof en>> = { en, vi };
