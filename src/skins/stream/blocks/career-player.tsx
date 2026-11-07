/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { Pause, Play, RotateCcw } from 'lucide-react';
import type { ReactNode } from 'react';
import { careerCopy } from '@/content/copy/stream-career';
import { resumeCopy } from '@/content/copy/resume';
import type { Doc } from '@/lib/content/schema';
import { formatPeriod } from '@/lib/format';
import { useCopy } from '@/lib/i18n/copy';
import { useLang } from '@/lib/i18n/language';
import { cn } from '@/lib/utils';
import {
  CareerBar,
  type CareerBarItem,
} from '@/skins/stream/blocks/career-bar';
import {
  speedLabel,
  timeLabel,
  type Chapter,
} from '@/skins/stream/blocks/career-chapters';
import { fill } from '@/skins/stream/blocks/career-job';
import { CareerScene } from '@/skins/stream/blocks/career-scene';
import type { CareerPlayerState } from '@/skins/stream/blocks/career-use-player';
import { LiveBadge } from '@/skins/stream/ui/live-badge';

const control =
  'inline-grid size-10 flex-none cursor-pointer place-items-center rounded-full text-white transition-colors hover:bg-white/15 active:bg-white/20 pointer-coarse:size-11 [&_svg]:size-5';

/**
 * The player of Home: the career, scene by scene, in a dark frame with the controls of a video player at the bottom: play or pause (or
 * replay at the end), the speed (1x, 1.5x, 2x), the chapters as the seek bar, the year over the years of the career, the red LIVE
 * badge while the current role plays and the name of the chapter. With "reduce motion" nothing plays: there are only the chapters.
 */
export function CareerPlayer({
  jobs,
  chapters,
  from,
  to,
  player: {
    attach,
    scene,
    running,
    year,
    speed,
    cycleSpeed,
    playing,
    ended,
    reducedMotion,
    seek,
    toggle,
    hold,
  },
}: {
  /** the roles from the oldest to the newest */
  jobs: Doc<'experience'>[];
  chapters: Chapter[];
  from: number;
  to: number;
  player: CareerPlayerState;
}) {
  const { lang } = useLang();
  const copy = useCopy(careerCopy);
  const { experience } = useCopy(resumeCopy);
  const job = jobs[scene];

  const items: CareerBarItem[] = jobs.map((j) => {
    const years = formatPeriod(j.startMonth, j.endMonth, lang);
    return {
      id: j.id,
      label: fill(copy.chapters.item, {
        company: j.company,
        role: j.role,
        period: years,
      }),
      company: j.company,
      role: j.role,
      years,
    };
  });

  const playLabel = ended
    ? copy.player.replay
    : playing
      ? copy.player.pause
      : copy.player.play;
  const PlayIcon = ended ? RotateCcw : playing ? Pause : Play;

  return (
    <section
      ref={attach}
      aria-label={copy.player.label}
      data-career-player=''
      data-running={running}
      data-playing={playing}
      {...hold}
      className='sm-stage relative flex flex-col overflow-hidden text-white min-[701px]:min-h-[400px] min-[701px]:rounded-xl'
    >
      <div className='grid flex-1 [&>*]:col-start-1 [&>*]:row-start-1'>
        {jobs.map((j, i) => (
          <CareerScene key={j.id} job={j} active={i === scene} />
        ))}
      </div>
      <div className='bg-linear-to-t from-black/70 to-transparent px-3 pt-2 pb-1.5'>
        <CareerBar
          variant='bar'
          label={copy.chapters.label}
          items={items}
          chapters={chapters}
          active={scene}
          current={experience.current}
          onSelect={(index, pointer) => seek(index, pointer)}
        />
        <div className='flex items-center gap-0.5'>
          {!reducedMotion && (
            <>
              <Control label={playLabel} onClick={toggle}>
                <PlayIcon aria-hidden='true' />
              </Control>
              <button
                type='button'
                aria-label={fill(copy.player.speed, {
                  speed: speedLabel(speed),
                })}
                onClick={cycleSpeed}
                className={cn(
                  control,
                  'w-12 text-sm font-semibold tabular-nums',
                )}
              >
                {speedLabel(speed)}
              </button>
            </>
          )}
          <span className='px-2 text-[13px] tabular-nums'>
            {timeLabel(year, from, to)}
          </span>
          {!job.endMonth && (
            <LiveBadge className='hidden min-[420px]:inline-flex'>
              {experience.current}
            </LiveBadge>
          )}
          <span
            aria-hidden='true'
            className='ml-2 hidden min-w-0 flex-1 truncate text-[13px] text-white/80 min-[560px]:block'
          >
            {job.company}
          </span>
        </div>
      </div>
    </section>
  );
}

function Control({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type='button'
      aria-label={label}
      onClick={onClick}
      className={control}
    >
      {children}
    </button>
  );
}
