/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { settingsSchema } from '@/lib/content/schema';
import { settingsQueryOptions } from '@/lib/query/options';

/** Until `site/settings` arrives (or if it cannot be read) the defaults of the schema apply. */
const DEFAULT_CHAT = settingsSchema.parse({}).chat;

/** The chat limits of `site/settings`, read when the chat first opens (`enabled`), not on page load; the defaults until then. */
export function useChatSettings(enabled: boolean) {
  const { data } = useQuery({ ...settingsQueryOptions(), enabled });
  return data?.chat ?? DEFAULT_CHAT;
}
