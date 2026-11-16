/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import type { ReactNode } from 'react';
import { yearsPhrase } from '@/lib/derive/years-phrase';
import { useLang } from '@/lib/i18n/language';
import { useYearsText } from '@/lib/query/use-career-years';
import { useContentQuery } from '@/lib/query/use-content';

/** Only the width of the blank depends on it (the blank is never shown and never read): about as long as the years usually are. */
const RESERVED_YEARS = 8;

/**
 * `useYearsText` as a node, for every skin: the sentence with the years once the roles are read. While they load, the number is a blank of
 * the length of a typical one (`invisible`, `aria-hidden`) in the full sentence, so the line wraps as many times before the data as after
 * it and nothing under the sentence moves when the roles arrive. When there are no roles (or they failed) it is the sentence without years.
 */
export function YearsText({
  withYears,
  withoutYears,
  spelled,
  blank,
}: {
  withYears: string;
  withoutYears: string;
  spelled?: boolean;
  /** what stands for the number while the roles load, if a skin draws a shape (its own skeleton idiom) instead of a blank */
  blank?: ReactNode;
}) {
  const text = useYearsText(withYears, withoutYears, { spelled });
  const { isPending } = useContentQuery('experience');
  const { lang } = useLang();
  const [before, after] = withYears.split('{years}');
  if (!isPending || after === undefined) return <>{text}</>;
  return (
    <>
      {before}
      {blank ?? (
        <span aria-hidden='true' className='invisible'>
          {yearsPhrase(RESERVED_YEARS, lang, { spelled })}
        </span>
      )}
      {after}
    </>
  );
}
