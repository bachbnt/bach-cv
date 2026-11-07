/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { Award, ExternalLink } from 'lucide-react';
import type { CSSProperties, RefObject } from 'react';
import { formatIssued } from '@/components/certificates/format-issued';
import { certificatesCopy } from '@/content/copy/certificates';
import { tradeDataCopy } from '@/content/copy/trade-data';
import type { Doc } from '@/lib/content/schema';
import { groupByYear } from '@/lib/derive/group-by-year';
import { formatMonth } from '@/lib/format';
import { fill } from '@/lib/chat/fill';
import { useCopy } from '@/lib/i18n/copy';
import { useLang } from '@/lib/i18n/language';
import { cn } from '@/lib/utils';
import { CertThumb } from '@/skins/trade/blocks/data-cert-thumb';
import { DataTags } from '@/skins/trade/blocks/data-tags';
import { tvButton } from '@/skins/trade/ui/tv-button';
import { TvChip } from '@/skins/trade/ui/tv-chip';

export type CertDensity = 'compact' | 'comfortable';

/**
 * The certificates as a timeline: a rail of dates down the left (a day and a month for each one), and on it a card with the picture of the
 * certificate (it opens the preview), the issuer, the title, the date, the skills it covers and Open PDF. When the certificates span
 * more than one year the years are named on the way down; a single year needs no label. The latest one carries the Standard "Latest" word.
 * The layout follows the width of the panel (container queries), not the window: the rail needs 720px, the action sits beside the card from 560px.
 */
export function DataCertsCalendar({
  items,
  skills,
  latestId,
  density,
  onPreview,
  listRef,
}: {
  items: Doc<'certificates'>[];
  skills: Map<string, Doc<'skills'>>;
  latestId: string | undefined;
  density: CertDensity;
  /** index in `items` */
  onPreview: (index: number) => void;
  listRef: RefObject<HTMLDivElement | null>;
}) {
  const copy = useCopy(certificatesCopy);
  const { certificates: words } = useCopy(tradeDataCopy);
  const { lang } = useLang();
  const comfy = density === 'comfortable';
  const groups = groupByYear(items, (item) => item.issuedAt);
  const named = groups.length > 1;
  let row = 0;

  return (
    <div ref={listRef} className='@container border-t border-tv-line'>
      <div className='grid gap-1 p-3.5'>
        {groups.map((group) => (
          <section
            key={group.year}
            role='group'
            aria-label={named ? group.year : copy.title}
          >
            {named && (
              <div
                aria-hidden='true'
                className='flex items-center gap-2 pt-1 pb-2.5 text-xs text-tv-mute @[720px]:pl-[108px]'
              >
                <TvChip className='text-tv-ink tabular-nums'>
                  {group.year}
                </TvChip>
                {group.items.length === 1
                  ? words.groupOne
                  : fill(words.group, { count: group.items.length })}
              </div>
            )}
            <ul className='m-0 grid list-none p-0'>
              {group.items.map((item) => {
                const index = items.indexOf(item);
                const tags = item.skills.flatMap((id) => skills.get(id) ?? []);
                const latest = item.id === latestId;
                const issued = formatIssued(item.issuedAt, lang);
                return (
                  <li
                    key={item.id}
                    data-flip={item.id}
                    data-testid='certificate'
                    style={{ '--i': Math.min(row++, 10) } as CSSProperties}
                    className='group/row relative grid animate-[tv-slide-in_0.35s_cubic-bezier(0.2,0.7,0.2,1)_both] pb-3 [animation-delay:calc(var(--i)*45ms)] last:pb-0 @[720px]:grid-cols-[76px_minmax(0,1fr)] @[720px]:gap-x-8'
                  >
                    <div
                      aria-hidden='true'
                      className='hidden flex-col items-end pt-3 @[720px]:flex'
                    >
                      <span className='text-[22px]/none font-bold tabular-nums'>
                        {Number(item.issuedAt.slice(8, 10)) || ''}
                      </span>
                      <span className='mt-1 text-[11px] whitespace-nowrap text-tv-mute'>
                        {formatMonth(item.issuedAt.slice(0, 7), lang)}
                      </span>
                    </div>
                    <span
                      aria-hidden='true'
                      className='absolute top-0 bottom-0 left-[92px] hidden w-px bg-tv-line group-first/row:top-[18px] group-last/row:bottom-auto group-last/row:h-[18px] @[720px]:block'
                    />
                    <span
                      aria-hidden='true'
                      className={cn(
                        'absolute top-3.5 left-[92px] hidden size-2 -translate-x-1/2 rounded-full ring-4 ring-tv-bg @[720px]:block',
                        latest ? 'bg-tv-gold' : 'bg-tv-accent',
                      )}
                    />
                    <article
                      className={cn(
                        'grid min-w-0 items-start gap-x-4 gap-y-3 rounded-md border bg-tv-panel p-3 transition-colors hover:border-tv-dim',
                        latest ? 'border-tv-gold/40' : 'border-tv-line',
                        comfy
                          ? 'grid-cols-[112px_minmax(0,1fr)] @[560px]:grid-cols-[240px_minmax(0,1fr)_auto] @[560px]:p-4'
                          : 'grid-cols-[96px_minmax(0,1fr)] @[560px]:grid-cols-[152px_minmax(0,1fr)_auto]',
                      )}
                    >
                      <CertThumb item={item} onOpen={() => onPreview(index)} />
                      <div className='flex min-w-0 flex-col gap-1.5'>
                        <div className='flex flex-wrap items-center gap-1.5'>
                          {item.issuer && (
                            <TvChip tone='up' className='max-w-full gap-1.5'>
                              <Award
                                className='size-3.5 flex-none'
                                aria-hidden='true'
                              />
                              <span className='truncate'>{item.issuer}</span>
                            </TvChip>
                          )}
                          {latest && <TvChip tone='gold'>{copy.latest}</TvChip>}
                        </div>
                        <h2
                          className={cn(
                            'leading-snug font-semibold',
                            comfy ? 'text-base' : 'text-sm',
                          )}
                        >
                          {item.name}
                        </h2>
                        <p className='text-xs text-tv-mute tabular-nums @[720px]:sr-only'>
                          <time dateTime={item.issuedAt}>
                            {copy.issued(issued)}
                          </time>
                        </p>
                        <DataTags
                          skills={tags}
                          label={copy.skillsLabel}
                          className='mt-0.5'
                        />
                      </div>
                      {item.pdfUrl && (
                        <a
                          href={item.pdfUrl}
                          target='_blank'
                          rel='noopener noreferrer'
                          data-slot='tv-link'
                          className={cn(
                            tvButton({ variant: 'primary' }),
                            'col-span-2 w-full @[560px]:col-span-1 @[560px]:w-auto @[560px]:self-center',
                          )}
                        >
                          {copy.openPdf}
                          <ExternalLink aria-hidden='true' />
                        </a>
                      )}
                    </article>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
