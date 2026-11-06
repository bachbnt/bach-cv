/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import Image from 'next/image';
import { useRef } from 'react';
import { Tag } from '@/components/tag';
import { useMagnet } from '@/components/use-magnet';
import { aboutCopy } from '@/content/copy/about';
import { shell } from '@/lib/content/shell';
import { useCopy } from '@/lib/i18n/copy';
import { useProfileQuery } from '@/lib/query/use-content';
import { cn } from 'cn';

/** A frame the photo fills: the photo's own width and height are never overridden by CSS, which Next.js warns about. It rises under the mouse like a card. */
const frame =
  'group/photo lift relative overflow-hidden rounded-[20px] bg-border';
/** The photo inside zooms a little, slowly, under the mouse (inside its own frame). */
const photo =
  'object-cover transition-transform duration-[600ms] ease-out motion-safe:group-hover/photo:scale-[1.05] motion-reduce:transition-none';

/** The tinted head of About: the profile summary, the specialty chips and the photo grid. */
export function AboutHead() {
  const copy = useCopy(aboutCopy);
  const { data: profile } = useProfileQuery();
  const specialties = (profile?.specialties ?? []).filter((s) => s.visible);
  const [top, bottom] = profile?.covers ?? [];
  // the chips lean toward the mouse when it comes near
  const chips = useRef<HTMLUListElement>(null);
  useMagnet(chips);

  return (
    <div className='band-glow rounded-b-[40px] bg-page-tint'>
      <section className='mx-auto flex w-full max-w-[1200px] flex-wrap items-center gap-14 px-5 pt-14 pb-20 min-[721px]:px-12'>
        <div className='flex min-w-0 flex-[1_1_460px] flex-col gap-6'>
          <h1 className='text-[38px] leading-[1.04] min-[721px]:text-[60px]'>
            {copy.title}
            <span
              aria-hidden='true'
              className='mt-[18px] block h-1.5 w-16 rounded-[3px] bg-page'
            />
          </h1>
          {profile?.summary && (
            <p className='max-w-[560px] text-xl leading-[1.6] text-body'>
              {profile.summary}
            </p>
          )}
          {specialties.length > 0 && (
            <ul
              ref={chips}
              className='relative m-0 flex list-none flex-wrap gap-2.5 p-0'
            >
              {specialties.map((s) => (
                <li
                  key={s.name}
                  data-magnet
                  className='[scale:var(--s,1)] [translate:var(--tx,0px)_var(--ty,0px)] transition-[translate,scale] duration-200 ease-out motion-reduce:transition-none'
                >
                  <Tag
                    tone={s.tone === 'primary' ? 'neutral' : s.tone}
                    className={cn(
                      'px-3.5 py-[7px] text-[15px]',
                      s.tone === 'primary' && 'bg-night text-white',
                    )}
                  >
                    {s.name}
                  </Tag>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className='grid h-[520px] min-w-0 flex-[1_1_380px] grid-cols-[1.4fr_1fr] grid-rows-2 gap-4'>
          {shell.avatar && (
            <div className={cn(frame, 'row-span-2')}>
              <Image
                src={shell.avatar}
                alt={`${copy.avatarAlt} ${shell.name}`}
                fill
                sizes='(min-width: 901px) 320px, 60vw'
                priority
                className={photo}
              />
            </div>
          )}
          {top && (
            <div className={frame}>
              <Image
                src={top}
                alt={`${copy.coverAlt} ${shell.name}`}
                fill
                sizes='(min-width: 901px) 220px, 40vw'
                className={photo}
              />
            </div>
          )}
          {bottom && (
            <div className={frame}>
              <Image
                src={bottom}
                alt={`${copy.coverAlt} ${shell.name}`}
                fill
                sizes='(min-width: 901px) 220px, 40vw'
                className={photo}
              />
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
