/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

// Newest-first order of roles, degrees and certificates, and the latest certificate.

import type { MonthSpanned } from '@/lib/derive/career-months';

/** Newest first: a role or a degree with no end comes first, then the latest end, then the latest start. Compare keys with `localeCompare`. */
export const recencyKey = (item: MonthSpanned): string =>
  `${item.endMonth ?? '9999-12'} ${item.startMonth}`;

/** Roles or degrees, newest first (a copy; the order of equal ones is kept). */
export const newestFirst = <T extends MonthSpanned>(items: T[]): T[] =>
  [...items].sort((a, b) => recencyKey(b).localeCompare(recencyKey(a)));

/** Certificates, latest issued first (a copy). */
export const issuedNewestFirst = <T extends { issuedAt: string }>(
  items: T[],
): T[] => [...items].sort((a, b) => b.issuedAt.localeCompare(a.issuedAt));

/** Certificates, oldest issued first (a copy; the order of equal ones is kept). */
export const issuedOldestFirst = <T extends { issuedAt: string }>(
  items: T[],
): T[] => [...items].sort((a, b) => a.issuedAt.localeCompare(b.issuedAt));

/** The certificate issued last, or `undefined` with none: the one every list calls "Latest", whatever order it shows. */
export const latestCertificate = <T extends { issuedAt: string }>(
  items: T[],
): T | undefined => issuedNewestFirst(items)[0];
