/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useEffect, useRef } from 'react';
import { ProjectCover } from '@/components/projects/project-cover';
import { projectsCopy } from '@/content/copy/projects';
import type { Doc } from '@/lib/content/schema';
import { useCopy } from '@/lib/i18n/copy';
import { cn } from '@/lib/utils';
import { swipeStep, WHEEL_COOLDOWN_MS, wheelStep } from '@/skins/stream/config';
import { ReelRail } from '@/skins/stream/blocks/reel-rail';
import { StreamTag } from '@/skins/stream/ui/stream-chip';

/**
 * The 9:16 reel of one project: its cover (or the tile with its initials) full bleed, the segments of the progress along the top (one
 * per project, decoration), and at the bottom the kind, the name, the summary and the technologies of the Standard cards. A vertical
 * swipe or a turn of the wheel changes the project; the rail has its screenshots and links. The segment of the open project fills in
 * `--sm-reel-time` (8 s) and, when it is full, the reel goes on by itself, unless it is paused: by the visitor (the button beside the
 * reel), by the pointer or the focus being in it, or by a window that is open over it. Reduced motion never goes on by itself.
 */
export function ReelCard({
  project,
  skills,
  index,
  total,
  playing,
  onStep,
  onOpenScreenshots,
}: {
  project: Doc<'projects'>;
  skills: Doc<'skills'>[];
  index: number;
  total: number;
  /** the reel goes on by itself when the bar is full */
  playing: boolean;
  onStep: (by: 1 | -1) => void;
  onOpenScreenshots: (project: Doc<'projects'>) => void;
}) {
  const copy = useCopy(projectsCopy);
  const touchStart = useRef<number | null>(null);
  const reel = useRef<HTMLDivElement>(null);
  const lastWheel = useRef(0);
  const step = useRef(onStep);
  useEffect(() => {
    step.current = onStep;
  }, [onStep]);

  // the wheel is a native listener: it has to be allowed to keep the page from scrolling while it changes the project
  useEffect(() => {
    const element = reel.current;
    if (!element || total < 2) return;
    const onWheel = (event: WheelEvent) => {
      const by = wheelStep(event.deltaY, event.deltaX);
      if (!by) return;
      event.preventDefault();
      const now = event.timeStamp;
      if (now - lastWheel.current < WHEEL_COOLDOWN_MS) return;
      lastWheel.current = now;
      step.current(by);
    };
    element.addEventListener('wheel', onWheel, { passive: false });
    return () => element.removeEventListener('wheel', onWheel);
  }, [total]);

  return (
    <div
      ref={reel}
      className='group/reel relative aspect-[9/16] max-h-[calc(100dvh-170px)] w-[min(100%,360px)] touch-pan-x overflow-hidden rounded-2xl bg-black text-white min-[701px]:max-h-[calc(100dvh-110px)]'
      onTouchStart={(event) => {
        touchStart.current = event.touches[0]?.clientY ?? null;
      }}
      onTouchEnd={(event) => {
        const end = event.changedTouches[0]?.clientY;
        if (touchStart.current !== null && end !== undefined) {
          const by = swipeStep(touchStart.current, end);
          if (by) onStep(by);
        }
        touchStart.current = null;
      }}
    >
      <div
        key={project.id}
        className='absolute inset-0 animate-[sm-slide_0.35s_cubic-bezier(0.2,0.7,0.2,1)]'
      >
        <ProjectCover
          project={project}
          firstSkill={skills[0]}
          className='absolute inset-0 h-full'
        />
        <div className='absolute inset-0 bg-linear-to-t from-black/85 via-black/10 to-black/30' />
        <div className='absolute inset-x-0 bottom-0 flex flex-col gap-2 py-4 pr-[72px] pl-4'>
          <div className='flex flex-wrap gap-1.5'>
            <StreamTag className='bg-white/20 text-white'>
              {copy.kinds[project.kind]}
            </StreamTag>
            {project.highlight !== null && (
              <StreamTag className='bg-sm-red text-white'>
                {copy.featuredTag}
              </StreamTag>
            )}
          </div>
          <h2 className='text-2xl/[1.1] font-bold tracking-tight'>
            {project.name}
          </h2>
          {project.summary && (
            <p className='line-clamp-4 text-sm/[1.4]'>{project.summary}</p>
          )}
          {skills.length > 0 && (
            <p
              aria-label={copy.technologies}
              className='line-clamp-2 text-xs font-medium text-white/85'
            >
              {skills.map((s) => s.name).join(' · ')}
            </p>
          )}
        </div>
      </div>
      <div aria-hidden='true' className='absolute inset-x-2 top-2 flex gap-1'>
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            className='relative h-[3px] flex-1 overflow-hidden rounded-sm bg-white/30'
          >
            <i
              data-sm-prog=''
              className={cn(
                'absolute inset-y-0 left-0 block w-full origin-left rounded-sm bg-white',
                i > index && 'hidden',
                i === index &&
                  total > 1 &&
                  'animate-[sm-prog_var(--sm-reel-time,8s)_linear] group-focus-within/reel:[animation-play-state:paused] group-hover/reel:[animation-play-state:paused]',
                i === index && !playing && '[animation-play-state:paused]',
              )}
              onAnimationEnd={() => {
                if (i === index && playing) onStep(1);
              }}
            />
          </span>
        ))}
      </div>
      <ReelRail project={project} onOpenScreenshots={onOpenScreenshots} />
    </div>
  );
}
