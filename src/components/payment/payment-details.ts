/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { Payment } from '@/lib/content/schema';

type Method = Pick<Payment, 'name' | 'holder' | 'account'>;

/** What "Copy all details" puts on the clipboard. A missing account name is left out, not printed blank. */
export const summaryOf = (
  m: Method,
  labels: { accountName: string; accountNumber: string },
): string =>
  [
    m.name,
    m.holder && `${labels.accountName}: ${m.holder}`,
    `${labels.accountNumber}: ${m.account}`,
  ]
    .filter(Boolean)
    .join('\n');

/** 'BIDV' + a QR url -> 'bidv-qr.jpg'. The extension comes from the image type, then from the url, else png. */
export const qrFileName = (name: string, mime: string, url: string): string => {
  const fromMime = mime.startsWith('image/') ? mime.split('/')[1] : '';
  const fromUrl = /\.([a-z0-9]{2,5})(?:\?|#|$)/i.exec(url)?.[1] ?? '';
  const ext = (fromMime || fromUrl || 'png')
    .toLowerCase()
    .replace('jpeg', 'jpg');
  const slug = name.trim().replace(/\s+/g, '-').toLowerCase() || 'payment';
  return `${slug}-qr.${ext}`;
};

/**
 * Splits methods into the featured ones (big QR cards) and the rest (rows). Featured are the highlighted ones;
 * when nothing is highlighted but there is exactly one method, that one is featured, as in the design mockup.
 */
export const splitMethods = <T extends { highlight: number | null }>(
  methods: T[],
): { featured: T[]; rest: T[] } => {
  const featured = methods.filter((m) => m.highlight !== null);
  if (!featured.length && methods.length === 1)
    return { featured: methods, rest: [] };
  return { featured, rest: methods.filter((m) => m.highlight === null) };
};
