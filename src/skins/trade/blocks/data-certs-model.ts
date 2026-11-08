/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { Doc } from '@/lib/content/schema';
import { issuedNewestFirst, issuedOldestFirst } from '@/lib/derive/recency';

type Certificate = Doc<'certificates'>;

export type CertOrder = 'newest' | 'oldest';

/** The certificates in the order the visitor chose, by issue date (`lib/derive/recency`). */
export const sortCertificates = (
  items: Certificate[],
  order: CertOrder,
): Certificate[] =>
  order === 'newest' ? issuedNewestFirst(items) : issuedOldestFirst(items);

interface IssuerOption {
  issuer: string;
  count: number;
}

/** The issuers that appear, the one with the most certificates first. A certificate with no issuer is left out. */
export const issuersOf = (items: Certificate[]): IssuerOption[] => {
  const counts = new Map<string, number>();
  for (const item of items)
    if (item.issuer)
      counts.set(item.issuer, (counts.get(item.issuer) ?? 0) + 1);
  return [...counts]
    .map(([issuer, count]) => ({ issuer, count }))
    .sort((a, b) => b.count - a.count || a.issuer.localeCompare(b.issuer));
};

export const filterByIssuer = (
  items: Certificate[],
  issuer: string | null,
): Certificate[] =>
  issuer === null ? items : items.filter((item) => item.issuer === issuer);
