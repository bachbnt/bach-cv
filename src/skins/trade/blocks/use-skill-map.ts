/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useMemo } from 'react';
import { useContentQuery } from '@/lib/query/use-content';

/** The skills by id, for the blocks that show the technologies of an item. */
export function useSkillMap() {
  const { data = [] } = useContentQuery('skills');
  return useMemo(() => new Map(data.map((s) => [s.id, s])), [data]);
}
