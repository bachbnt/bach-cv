/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { MonthSpanned } from '@/lib/derive/career-months';
import { newestFirst } from '@/lib/derive/recency';

/** Roles or degrees in the order they happened: the one that started first comes first (a copy; the reverse of `newestFirst`). */
export const oldestFirst = <T extends MonthSpanned>(items: T[]): T[] =>
  newestFirst(items).reverse();
