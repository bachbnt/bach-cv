/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { academicCopy } from '@/content/copy/academic';
import { academicHomeAboutCopy } from '@/content/copy/academic-home-about';
import { homeCopy } from '@/content/copy/home';
import { yearsPhrase } from '@/lib/derive/years-phrase';
import { useCopy } from '@/lib/i18n/copy';
import { useLang } from '@/lib/i18n/language';
import { useCareerYears, useYearsText } from '@/lib/query/use-career-years';
import { AcHeading } from '@/skins/academic/ui/ac-section';
import { AcNoteBig, AcNoteCap, AcRow } from '@/skins/academic/ui/ac-note';
import { AcPaper } from '@/skins/academic/ui/ac-paper';

/**
 * The paragraph of Home that says who I am and how long, written as the abstract of the manuscript on a sheet pinned to the board. In the margin,
 * the years in software: the same number and words as Standard's sentence (`useYearsText`), once the roles are read.
 */
export function HomeAbstract() {
  const copy = useCopy(homeCopy);
  const terms = useCopy(academicCopy).terms;
  const mine = useCopy(academicHomeAboutCopy).home;
  const { lang } = useLang();
  const years = useCareerYears();
  const intro = useYearsText(copy.intro, copy.introUndated);

  return (
    <AcRow
      className='mt-12'
      tone='a'
      note={
        years !== null && (
          <>
            <AcNoteBig>{yearsPhrase(years, lang)}</AcNoteBig>
            <AcNoteCap>{mine.inSoftware}</AcNoteCap>
          </>
        )
      }
    >
      <AcPaper kind='pinned' wind className='max-w-[640px]'>
        <AcHeading
          level={2}
          className='mb-3.5 text-[32px] [--ul:var(--ac-accent)]'
        >
          {terms.home}
        </AcHeading>
        <p className='m-0 mb-3 text-ac-ink'>{intro}</p>
      </AcPaper>
    </AcRow>
  );
}
