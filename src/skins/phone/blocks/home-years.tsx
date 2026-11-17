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
  WIDGET_BODY,
  WIDGET_TITLE_ROW,
} from '@/skins/phone/blocks/home-widget-layout';
import { useReveal } from '@/skins/phone/blocks/use-reveal';
import { HomeWidgetNumber } from '@/skins/phone/blocks/home-widget-number';
import { HomeWidgetTitle } from '@/skins/phone/blocks/home-widget-title';
import { HomeYearRing } from '@/skins/phone/blocks/home-year-ring';
import { PhSkeleton } from '@/skins/phone/ui/ph-skeleton';
import { cn } from '@/lib/utils';

/**
 * The widget of the years in software: the number Standard states in the middle of a ring that has an arc for each year (decoration, the
 * number is the datum). When the widget is wide enough the years it spans (from the year of the first role to this one) are at the end of
 * its title row. The ring takes the whole body, so there is no room left over (`home-widget-layout.ts`).
 */
export function HomeYears() {
  const copy = useCopy(phoneHomeCopy).home;
  const { lang } = useLang();
  const now = useNow();
  const jobs = useContentQuery('experience');
  const years = useCareerYears();
  const { ref, played } = useReveal();

  if (jobs.isPending)
    return (
      <LoadingBlock className='min-w-0'>
        <HomeGlass className='flex h-full flex-col'>
          <HomeWidgetTitle>{copy.inSoftware}</HomeWidgetTitle>
          <div className={cn(WIDGET_BODY, 'items-center justify-center')}>
            <PhSkeleton className='aspect-square w-full max-w-36 rounded-full' />
          </div>
        </HomeGlass>
      </LoadingBlock>
    );
  if (years === null) return null;

  // "7 years": the number goes in the ring, the rest of the phrase under it
  const unit = yearsPhrase(years, lang).replace(String(years), '').trim();
  const first = careerFacts(jobs.data ?? [], [], now).first;
  return (
    <HomeGlass
      ref={ref}
      data-reveal={played ? 'play' : 'idle'}
      className='ph-reveal @container flex h-full min-w-0 flex-col'
    >
      <div className={WIDGET_TITLE_ROW}>
        <HomeWidgetTitle>{copy.inSoftware}</HomeWidgetTitle>
        {first && (
          <p className='hidden text-[12px]/[1.3] font-semibold text-ph-mute tabular-nums @min-[12.5rem]:block'>
            {first.year} – {now.getFullYear()}
          </p>
        )}
      </div>
      <div className={cn(WIDGET_BODY, 'items-center justify-center')}>
        <HomeYearRing years={years} unit={unit}>
          <HomeWidgetNumber value={years} play={played} />
        </HomeYearRing>
      </div>
    </HomeGlass>
  );
}
