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

// Interface copy for the Certificates page, in both languages.
const en = {
  title: 'Certificates',
  intro: 'Credentials in AI and project management.',
  latest: 'Latest',
  issued: (date: string) => `Issued ${date}`,
  /** the line under the image in the preview: issuer, then the date */
  meta: (issuer: string, date: string) =>
    [issuer, `issued ${date}`].filter(Boolean).join(', '),
  skillsLabel: 'Skills covered',
  viewCertificate: 'View certificate',
  openPdf: 'Open PDF',
  openPdfDialog: 'Open PDF',
  closePreview: 'Close preview',
  previousCertificate: 'Previous certificate',
  nextCertificate: 'Next certificate',
  imageAlt: (name: string) => `${name} certificate`,
  viewLabel: (name: string) => `View ${name} certificate`,
  counter: (n: number, total: number) => `${n} of ${total}`,
} as const;

const vi: Shape<typeof en> = {
  title: 'Chứng chỉ',
  intro: 'Các chứng chỉ về AI và quản lý dự án.',
  latest: 'Mới nhất',
  issued: (date: string) => `Cấp ngày ${date}`,
  meta: (issuer: string, date: string) =>
    [issuer, `cấp ngày ${date}`].filter(Boolean).join(', '),
  skillsLabel: 'Kỹ năng đạt được',
  viewCertificate: 'Xem chứng chỉ',
  openPdf: 'Mở PDF',
  openPdfDialog: 'Mở PDF',
  closePreview: 'Đóng xem trước',
  previousCertificate: 'Chứng chỉ trước',
  nextCertificate: 'Chứng chỉ tiếp theo',
  imageAlt: (name: string) => `Chứng chỉ ${name}`,
  viewLabel: (name: string) => `Xem chứng chỉ ${name}`,
  counter: (n: number, total: number) => `${n} / ${total}`,
};

export const certificatesCopy: Localized<Shape<typeof en>> = { en, vi };
