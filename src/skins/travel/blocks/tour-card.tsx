/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import {
  ArrowRight,
  Check,
  Compass,
  Globe,
  GitBranch,
  PenLine,
  Presentation,
  Smartphone,
  type LucideIcon,
} from 'lucide-react';
import type { Doc } from '@/lib/content/schema';
import { cn } from '@/lib/utils';

/** The icon tile of a tour, by the kind of art the service has: the icon and the colour (a stop colour; the generic tour wears coral). */
const TILE: Record<
  Doc<'services'>['art'],
  { icon: LucideIcon; color: string }
> = {
  app: { icon: Smartphone, color: '[--tl-pc:var(--tl-stop-2)]' },
  web: { icon: Globe, color: '[--tl-pc:var(--tl-stop-1)]' },
  oss: { icon: GitBranch, color: '[--tl-pc:var(--tl-stop-5)]' },
  teaching: { icon: Presentation, color: '[--tl-pc:var(--tl-stop-4)]' },
  writing: { icon: PenLine, color: '[--tl-pc:var(--tl-stop-3)]' },
  generic: { icon: Compass, color: '[--tl-pc:var(--tl-coral)]' },
};

/**
 * One service as a tour: a coloured icon tile, the name and the description. When the contact form is on, the whole card is the
 * button that picks the topic (named by the service, `aria-pressed`, like Standard's topic chips); when it is off it is just a card.
 */
export function TourCard({
  service,
  chosen,
  onChoose,
}: {
  service: Doc<'services'>;
  chosen: boolean;
  /** leave out when the form is off */
  onChoose?: () => void;
}) {
  const { icon: Icon, color } = TILE[service.art];
  return (
    <article
      className={cn(
        color,
        'tl-tour relative flex items-center gap-3 rounded-2xl border border-tl-line bg-tl-panel-2 p-2.5 transition-[transform,box-shadow,background-color,border-color] duration-200 has-[[aria-pressed=true]]:border-[var(--tl-pc)] has-[[aria-pressed=true]]:bg-[color-mix(in_srgb,var(--tl-pc)_14%,transparent)]',
      )}
    >
      <span
        aria-hidden='true'
        className='grid size-11 flex-none place-items-center rounded-[14px] bg-[var(--tl-pc)] text-tl-solid'
      >
        <Icon className='size-[22px]' strokeWidth={2} />
      </span>
      <div className='min-w-0 flex-1 pr-7'>
        <h2 className='m-0 text-[14px] leading-[1.25] font-extrabold'>
          {service.name}
        </h2>
        <p className='m-0 text-[12.5px] leading-[1.4] text-tl-muted'>
          {service.description}
        </p>
      </div>
      {onChoose && (
        <button
          type='button'
          aria-pressed={chosen}
          aria-label={service.name}
          onClick={onChoose}
          className='absolute inset-0 flex cursor-pointer items-center justify-end rounded-2xl pr-3.5 text-tl-muted focus-visible:rounded-2xl! pointer-coarse:min-h-11'
        >
          {chosen ? (
            <Check aria-hidden='true' className='size-[18px] text-tl-ink' />
          ) : (
            <ArrowRight aria-hidden='true' className='size-[18px]' />
          )}
        </button>
      )}
    </article>
  );
}
