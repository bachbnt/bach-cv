/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import type { PageKey } from '@/lib/content/schema';
import { useCareerYears } from '@/lib/query/use-career-years';
import { useContentQuery } from '@/lib/query/use-content';
import { useCachedContent } from '@/skins/trade/shell/use-cached-content';

/**
 * The number each page can state, for the watchlist and the ticker tape: the years in software for Home, the roles for Resume, and the
 * projects, certificates and services once a page has read them (those three come from the query cache only, so a page never pays for
 * documents it does not show). `null` where there is no number.
 */
export function useCounts(): Partial<Record<PageKey, number | null>> {
  const years = useCareerYears();
  const { data: jobs } = useContentQuery('experience');
  const projects = useCachedContent('projects');
  const certificates = useCachedContent('certificates');
  const services = useCachedContent('services');
  return {
    home: years,
    projects: projects?.length ?? null,
    resume: jobs?.length ?? null,
    certificates: certificates?.length ?? null,
    services: services?.length ?? null,
  };
}
