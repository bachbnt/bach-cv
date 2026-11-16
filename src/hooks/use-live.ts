/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { liveSchema, type Live } from '@/lib/content/schema';
import { liveQueryOptions } from '@/lib/query/options';

/** Until the switches arrive (or if they cannot be read) every page and feature is on: the site fails open. */
const DEFAULT_LIVE = liveSchema.parse({});

export function useLive(): Live {
  const { data } = useQuery(liveQueryOptions());
  // What the browser kept from an earlier visit is not parsed again when it comes back, and may lack a field that a newer version of the site
  // reads (`projects`): parse it again, which fills what is missing with the defaults, so an old cache never takes the page down.
  return useMemo(() => {
    if (!data) return DEFAULT_LIVE;
    const parsed = liveSchema.safeParse(data);
    return parsed.success ? parsed.data : DEFAULT_LIVE;
  }, [data]);
}
