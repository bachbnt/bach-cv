/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { ZoomIn } from 'lucide-react';
import Image from 'next/image';
import { createContext, useContext, useState, type ReactNode } from 'react';
import { initialsOf } from '@/lib/derive/initials';
import { certificatesCopy } from '@/content/copy/certificates';
import { tradeDataCopy } from '@/content/copy/trade-data';
import { formatPeriod } from '@/lib/format';
import { fill } from '@/lib/chat/fill';
import { useCopy } from '@/lib/i18n/copy';
import { useLang } from '@/lib/i18n/language';
import { useContentQuery } from '@/lib/query/use-content';
import { cn } from '@/lib/utils';
import {
  buildMedia,
  type MediaItem,
} from '@/skins/trade/blocks/data-media-model';
import { LazyLightbox } from '@/skins/trade/blocks/lazy-dialogs';

interface MediaValue {
  items: MediaItem[];
  /** opens the preview at the picture of a role (`job:<id>`) or a degree (`degree:<id>`) */
  open: (id: string) => void;
}

const MediaContext = createContext<MediaValue>({ items: [], open: () => {} });

export const useMedia = () => useContext(MediaContext);

/**
 * Holds the pictures of the Resume page (roles first, then degrees) and the Standard preview window that steps through all of them
 * with a counter. Anything below it opens a picture with `useMedia().open(id)`. The window is loaded when first opened.
 */
export function DataMediaHost({ children }: { children: ReactNode }) {
  const { resume } = useCopy(tradeDataCopy);
  const certificates = useCopy(certificatesCopy);
  const { lang } = useLang();
  const jobs = useContentQuery('experience').data ?? [];
  const degrees = useContentQuery('education').data ?? [];
  const items = buildMedia(jobs, degrees);
  const [index, setIndex] = useState<number | null>(null);
  const current = index === null ? undefined : items[index];
  const step = (by: number) =>
    setIndex((i) => ((i ?? 0) + by + items.length) % items.length);

  return (
    <MediaContext.Provider
      value={{
        items,
        open: (id) => {
          const at = items.findIndex((item) => item.id === id);
          if (at >= 0) setIndex(at);
        },
      }}
    >
      {children}
      {current && (
        <LazyLightbox
          open
          onOpenChange={(open) => !open && setIndex(null)}
          title={current.title}
          image={{ src: current.src, alt: current.alt }}
          meta={
            <p>
              {current.subtitle},{' '}
              {formatPeriod(current.startMonth, current.endMonth, lang)}
            </p>
          }
          closeLabel={certificates.closePreview}
          nav={
            items.length > 1
              ? {
                  onPrev: () => step(-1),
                  onNext: () => step(1),
                  prevLabel: resume.media.previous,
                  nextLabel: resume.media.next,
                  counter: certificates.counter((index ?? 0) + 1, items.length),
                }
              : undefined
          }
        />
      )}
    </MediaContext.Provider>
  );
}

const RATIO = {
  /** a role or a degree: beside the text on a wide screen */
  video: 'aspect-video',
} as const;

/**
 * A picture as a block of media with its aspect ratio reserved (so nothing moves when it loads): rounded, zooming a little under the
 * mouse, with an enlarge badge, and a button that opens the preview. Without a picture the initials of `name` stand in at the same size.
 */
export function DataMedia({
  id,
  name,
  ratio,
  sizes,
  className,
}: {
  /** `job:<id>` or `degree:<id>` */
  id: string;
  /** the company or the school, for the initials when there is no picture */
  name: string;
  ratio: keyof typeof RATIO;
  sizes: string;
  className?: string;
}) {
  const { items, open } = useMedia();
  const { resume } = useCopy(tradeDataCopy);
  const certificates = useCopy(certificatesCopy);
  const item = items.find((candidate) => candidate.id === id);
  const frame = cn(
    'relative w-full overflow-hidden rounded-md border border-tv-line bg-tv-hover',
    RATIO[ratio],
    className,
  );
  if (!item)
    return (
      <div aria-hidden='true' className={cn(frame, 'grid place-items-center')}>
        <span className='text-3xl font-bold tracking-tight text-tv-dim'>
          {initialsOf(name)}
        </span>
      </div>
    );
  return (
    <button
      type='button'
      data-media={id}
      aria-label={fill(resume.media.view, { name: item.title })}
      onClick={() => open(id)}
      className={cn(
        frame,
        'group/media block cursor-zoom-in outline-offset-2 transition-[border-color] hover:border-tv-accent active:scale-[0.99]',
      )}
    >
      <Image
        src={item.src}
        alt={item.alt}
        fill
        sizes={sizes}
        loading='lazy'
        className='object-cover object-[50%_22%] transition-transform duration-500 ease-out group-hover/media:scale-[1.05]'
      />
      <span
        aria-hidden='true'
        className='absolute right-2 bottom-2 inline-flex items-center gap-1 rounded bg-tv-night/80 px-1.5 py-0.5 text-[11px] font-medium text-white'
      >
        <ZoomIn className='size-3' />
        {certificates.enlarge}
      </span>
    </button>
  );
}
