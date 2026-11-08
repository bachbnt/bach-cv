/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { settingsSchema } from '@/lib/content/schema';
import { settingsQueryOptions } from '@/lib/query/options';

/** Until `site/settings` arrives the form uses the defaults of the schema. */
const DEFAULT_LIMITS = settingsSchema.parse({}).contactForm;

/** The limits of the contact form (lengths, rate), the same in every skin. */
export function useContactLimits() {
  const { data } = useQuery(settingsQueryOptions());
  return data?.contactForm ?? DEFAULT_LIMITS;
}
