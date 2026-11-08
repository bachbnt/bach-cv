/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useNow } from '@/hooks/use-now';
import { careerYears } from '@/lib/derive/career-years';
import { yearsPhrase } from '@/lib/derive/years-phrase';
import { fill } from '@/lib/chat/fill';
import { useLang } from '@/lib/i18n/language';
import { useContentQuery } from './use-content';

/** The years in software of the roles (`careerYears`), or `null` until they are read and when there is no role. The one number every page and skin states. */
export function useCareerYears(): number | null {
  const now = useNow();
  const { data: jobs } = useContentQuery('experience');
  return jobs
    ? careerYears(
        jobs.map((job) => job.startMonth),
        now,
      )
    : null;
}

/**
 * A sentence of the copy that says the years in software: `withYears` has the slot `{years}` and is used once the roles are read,
 * `withoutYears` is the same sentence without it (while the roles load, or when there are none), so a number is never invented.
 * `spelled` writes the number as a word for a sentence that starts with it.
 */
export function useYearsText(
  withYears: string,
  withoutYears: string,
  options: { spelled?: boolean } = {},
): string {
  const years = useCareerYears();
  const { lang } = useLang();
  if (years === null) return withoutYears;
  return fill(withYears, { years: yearsPhrase(years, lang, options) });
}
