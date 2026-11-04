/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { liveSchema, type Live } from '@/lib/content/schema';
import { liveQueryOptions } from '@/lib/query/options';

/** Until the switches arrive (or if they cannot be read) every page and feature is on: the site fails open. */
const DEFAULT_LIVE = liveSchema.parse({});

export function useLive(): Live {
  const { data } = useQuery(liveQueryOptions());
  return data ?? DEFAULT_LIVE;
}
