/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import Image from 'next/image';
import { useRef, type CSSProperties } from 'react';
import { useMagnet } from '@/components/use-magnet';
import { aboutCopy } from '@/content/copy/about';
import { mobaAboutCopy } from '@/content/copy/moba-about';
import { shell } from '@/lib/content/shell';
import { useCopy } from '@/lib/i18n/copy';
import { useProfileQuery } from '@/lib/query/use-content';
import { cn } from '@/lib/utils';
import { MbChip } from '@/skins/moba/ui/mb-chip';
import { MbSkeleton } from '@/skins/moba/ui/mb-skeleton';

/** A gold frame with cut corners; the picture inside has its own cut so the frame's line follows every corner. */
function Frame({
  src,
  alt,
  sizes,
  className,
  priority,
}: {
  src: string;
  alt: string;
  sizes: string;
  className?: string;
  priority?: boolean;
}) {
  return (
    <div className={cn('mb-photo group/photo relative min-h-0', className)}>
      <div className='mb-photo-in absolute inset-[3px] overflow-hidden bg-mb-well'>
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className='object-cover transition-transform duration-[600ms] ease-out motion-safe:group-hover/photo:scale-[1.05] motion-reduce:transition-none'
        />
      </div>
    </div>
  );
}

/**
 * The champion select: the title and the profile summary, the specialties as chips (only the visible ones, tinted by area; they lean
 * toward the pointer when it comes near) and the photo grid (the portrait and the two covers).
 */
export function AboutHero() {
  const copy = useCopy(aboutCopy);
  const mb = useCopy(mobaAboutCopy);
  const { data: profile, isPending } = useProfileQuery();
  const specialties = (profile?.specialties ?? []).filter((s) => s.visible);
  const [top, bottom] = profile?.covers ?? [];
  const chips = useRef<HTMLUListElement>(null);
  useMagnet(chips);
  const alt = `${copy.coverAlt} ${shell.name}`;

  return (
    <section
      data-part=''
      style={{ '--i': 0 } as CSSProperties}
      className='mb-rise grid gap-6 px-6 pt-7 pb-8 min-[760px]:grid-cols-[minmax(0,1fr)_300px] max-[719px]:px-4'
    >
      <div className='flex min-w-0 flex-col gap-5'>
        <p className='text-[10px] leading-none font-bold tracking-[0.24em] text-mb-teal-ink uppercase'>
          {mb.kickers.hero}
        </p>
        <h1 className='text-[40px] leading-[1.02] text-mb-title max-[719px]:text-[32px]'>
          {copy.title}
        </h1>
        <span aria-hidden='true' className='mb-hairline block w-24' />
        {isPending ? (
          <div aria-hidden='true' className='grid gap-2'>
            <MbSkeleton className='h-5 max-w-[520px]' />
            <MbSkeleton className='h-5 max-w-[480px]' />
            <MbSkeleton className='h-5 max-w-[300px]' />
          </div>
        ) : (
          profile?.summary && (
            <p className='max-w-[560px] text-[17px] leading-[1.6] text-mb-ink/90'>
              {profile.summary}
            </p>
          )
        )}
        {specialties.length > 0 && (
          <ul
            ref={chips}
            className='relative m-0 flex list-none flex-wrap gap-2.5 p-0'
          >
            {specialties.map((s) => (
              <li
                key={s.name}
                data-magnet=''
                className='[scale:var(--s,1)] [translate:var(--tx,0px)_var(--ty,0px)] transition-[translate,scale] duration-200 ease-out motion-reduce:transition-none'
              >
                <MbChip
                  tone={s.tone === 'primary' ? 'gold' : s.tone}
                  className='px-3.5 py-2 text-[13px]'
                >
                  {s.name}
                </MbChip>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className='grid h-[340px] min-w-0 grid-cols-[1.4fr_1fr] grid-rows-2 gap-3 max-[719px]:h-[300px] min-[760px]:h-[360px]'>
        {shell.avatar && (
          <Frame
            src={shell.avatar}
            alt={`${copy.avatarAlt} ${shell.name}`}
            sizes='(min-width: 760px) 180px, 60vw'
            priority
            className='row-span-2'
          />
        )}
        {top && (
          <Frame src={top} alt={alt} sizes='(min-width: 760px) 120px, 40vw' />
        )}
        {bottom && (
          <Frame
            src={bottom}
            alt={alt}
            sizes='(min-width: 760px) 120px, 40vw'
          />
        )}
      </div>
    </section>
  );
}
