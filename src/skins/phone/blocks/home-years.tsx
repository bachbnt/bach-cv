/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { LoadingBlock } from '@/components/loading-block';
import { phoneHomeCopy } from '@/content/copy/phone-home';
import { yearsPhrase } from '@/lib/derive/years-phrase';
import { useNow } from '@/hooks/use-now';
import { careerFacts } from '@/lib/derive/career-facts';
import { useCopy } from '@/lib/i18n/copy';
import { useLang } from '@/lib/i18n/language';
import { useCareerYears } from '@/lib/query/use-career-years';
import { useContentQuery } from '@/lib/query/use-content';
import { HomeGlass } from '@/skins/phone/blocks/home-glass';
import {
  WIDGET_FOOTER,
  WIDGET_HERO,
} from '@/skins/phone/blocks/home-widget-layout';
import { HomeWidgetNumber } from '@/skins/phone/blocks/home-widget-number';
import { HomeWidgetTitle } from '@/skins/phone/blocks/home-widget-title';
import { HomeYearRing } from '@/skins/phone/blocks/home-year-ring';
import { PhSkeleton } from '@/skins/phone/ui/ph-skeleton';
import { cn } from '@/lib/utils';

/**
 * The widget of the years in software: the number Standard states in the middle of a ring that has an arc for each year (decoration, the
 * number is the datum), and under it the years it spans (from the year of the first role to this one). It has the same inside as the widget
 * of the projects beside it (`home-widget-layout.ts`), so the two numbers line up.
 */
export function HomeYears() {
  const copy = useCopy(phoneHomeCopy).home;
  const { lang } = useLang();
  const now = useNow();
  const jobs = useContentQuery('experience');
  const years = useCareerYears();

  if (jobs.isPending)
    return (
      <LoadingBlock className='min-w-0'>
        <HomeGlass className='flex h-full flex-col'>
          <HomeWidgetTitle>{copy.inSoftware}</HomeWidgetTitle>
          <div className={WIDGET_HERO}>
            <PhSkeleton className='aspect-square w-full max-w-36 rounded-full' />
          </div>
          <div className={cn(WIDGET_FOOTER, 'flex items-end justify-center')}>
            <PhSkeleton className='h-3 w-24' />
          </div>
        </HomeGlass>
      </LoadingBlock>
    );
  if (years === null) return null;

  // "7 years": the number goes in the ring, the rest of the phrase under it
  const unit = yearsPhrase(years, lang).replace(String(years), '').trim();
  const first = careerFacts(jobs.data ?? [], [], now).first;
  return (
    <HomeGlass className='flex h-full min-w-0 flex-col'>
      <HomeWidgetTitle>{copy.inSoftware}</HomeWidgetTitle>
      <div className={WIDGET_HERO}>
        <HomeYearRing years={years} unit={unit}>
          <HomeWidgetNumber>{years}</HomeWidgetNumber>
        </HomeYearRing>
      </div>
      <div className={cn(WIDGET_FOOTER, 'flex items-end justify-center')}>
        {first && (
          <p className='text-[13px]/[1.2] font-semibold text-ph-mute tabular-nums'>
            {first.year} – {now.getFullYear()}
          </p>
        )}
      </div>
    </HomeGlass>
  );
}
