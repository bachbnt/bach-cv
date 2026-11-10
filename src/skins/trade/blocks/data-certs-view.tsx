/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { CalendarDays, LayoutGrid } from 'lucide-react';
import { useRef, useState } from 'react';
import { certificatesCopy } from '@/content/copy/certificates';
import { tradeDataCopy } from '@/content/copy/trade-data';
import type { Doc } from '@/lib/content/schema';
import { fill } from '@/lib/chat/fill';
import { latestCertificate } from '@/lib/derive/recency';
import { useCopy } from '@/lib/i18n/copy';
import { useContentQuery } from '@/lib/query/use-content';
import { DataCertsCalendar } from '@/skins/trade/blocks/data-certs-calendar';
import type { CertDensity } from '@/skins/trade/blocks/data-certs-calendar';
import { DataCertsFeed } from '@/skins/trade/blocks/data-certs-feed';
import {
  filterByIssuer,
  issuersOf,
  sortCertificates,
  type CertOrder,
} from '@/skins/trade/blocks/data-certs-model';
import { useCertPreview } from '@/skins/trade/blocks/data-cert-preview';
import { DataSegmented } from '@/skins/trade/blocks/data-segmented';
import { useFlip } from '@/skins/trade/blocks/data-use-flip';
import { useSkillMap } from '@/skins/trade/blocks/use-skill-map';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { TvDataState } from '@/skins/trade/ui/tv-data-state';
import { TvPanel } from '@/skins/trade/ui/tv-panel';
import { TvSkeleton } from '@/skins/trade/ui/tv-skeleton';
import { TvToggleChip } from '@/skins/trade/ui/tv-toggle-chip';

type View = 'calendar' | 'feed';

/** The Certificates page: a timeline of what was issued and when, or a feed of cards, with an issuer filter, an order and a density. */
export function DataCertsView() {
  const copy = useCopy(certificatesCopy);
  const { certificates: words } = useCopy(tradeDataCopy);
  const query = useContentQuery('certificates');
  const skills = useSkillMap();
  const reduced = useReducedMotion();
  const [view, setView] = useState<View>('calendar');
  const [order, setOrder] = useState<CertOrder>('newest');
  const [density, setDensity] = useState<CertDensity>('compact');
  const [issuer, setIssuer] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const capture = useFlip(listRef, !reduced);

  const all: Doc<'certificates'>[] = query.data ?? [];
  const latest = latestCertificate(all);
  const issuers = issuersOf(all);
  const shown = sortCertificates(filterByIssuer(all, issuer), order);
  const [openPreview, dialog] = useCertPreview(shown);
  const change =
    <T,>(set: (value: T) => void) =>
    (value: T) => {
      capture();
      set(value);
    };

  const switcher = all.length > 0 && (
    <DataSegmented
      label={words.view.label}
      value={view}
      onChange={setView}
      options={[
        {
          value: 'calendar',
          label: words.view.calendar,
          icon: <CalendarDays aria-hidden='true' />,
        },
        {
          value: 'feed',
          label: words.view.feed,
          icon: <LayoutGrid aria-hidden='true' />,
        },
      ]}
    />
  );

  return (
    <TvPanel title={copy.title} intro={copy.intro} actions={switcher}>
      <TvDataState
        query={query}
        count={all.length}
        empty='certificates'
        subject='certificates'
        skeleton={
          <div className='grid gap-3 p-3.5'>
            <TvSkeleton className='h-[26px] w-64' />
            {Array.from({ length: 3 }, (_, i) => (
              <TvSkeleton key={i} className='h-[120px]' />
            ))}
          </div>
        }
        className='m-3.5'
      >
        <div className='flex flex-wrap items-center gap-x-2.5 gap-y-2 px-3.5 py-2'>
          {issuers.length > 1 && (
            <div
              role='group'
              aria-label={words.filter.label}
              className='flex flex-wrap gap-1.5'
            >
              {[null, ...issuers.map((option) => option.issuer)].map(
                (value) => (
                  <TvToggleChip
                    key={value ?? 'all'}
                    aria-pressed={issuer === value}
                    onClick={() => change(setIssuer)(value)}
                  >
                    {value ?? words.filter.all}
                  </TvToggleChip>
                ),
              )}
            </div>
          )}
          <div className='ml-auto flex flex-wrap items-center gap-2'>
            <DataSegmented
              label={words.order.label}
              value={order}
              onChange={change(setOrder)}
              options={[
                { value: 'newest', label: words.order.newest },
                { value: 'oldest', label: words.order.oldest },
              ]}
            />
            <DataSegmented
              label={words.density.label}
              value={density}
              onChange={change(setDensity)}
              options={[
                { value: 'compact', label: words.density.compact },
                { value: 'comfortable', label: words.density.comfortable },
              ]}
            />
          </div>
          <p
            role='status'
            className='basis-full text-xs text-tv-mute tabular-nums'
          >
            {fill(words.results, { shown: shown.length, total: all.length })}
          </p>
        </div>
        {view === 'calendar' ? (
          <DataCertsCalendar
            items={shown}
            skills={skills}
            latestId={latest?.id}
            density={density}
            onPreview={openPreview}
            listRef={listRef}
          />
        ) : (
          <DataCertsFeed
            items={shown}
            skills={skills}
            latestId={latest?.id}
            density={density}
            onPreview={openPreview}
            listRef={listRef}
          />
        )}
      </TvDataState>
      {dialog}
    </TvPanel>
  );
}
