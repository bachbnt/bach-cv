/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { CollectionName } from '@/lib/content/schema';

export const queryKeys = {
  live: ['site', 'live'] as const,
  profile: ['site', 'profile'] as const,
  settings: ['site', 'settings'] as const,
  content: (name: CollectionName) => ['content', name] as const,
};
