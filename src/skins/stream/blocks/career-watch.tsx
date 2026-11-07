/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useMemo, useState } from 'react';
import { useContentQuery } from '@/lib/query/use-content';
import {
  chaptersOf,
  inOrder,
  yearRange,
} from '@/skins/stream/blocks/career-chapters';
import { CareerPanel } from '@/skins/stream/blocks/career-panel';
import { CareerPlayer } from '@/skins/stream/blocks/career-player';
import { CareerTitle } from '@/skins/stream/blocks/career-title';
import { useCareerPlayer } from '@/skins/stream/blocks/career-use-player';
import { StreamDataState } from '@/skins/stream/ui/stream-data-state';
import { StreamSkeleton } from '@/skins/stream/ui/stream-skeleton';

/**
 * The top of Home, the watch page of a career: the player that plays the real roles from the oldest to the newest, the title and the
 * description under it, and the chapters panel beside it (below it on a narrow screen). The player and the panel share one clock.
 */
export function CareerWatch() {
  const query = useContentQuery('experience');
  // the month the bar is drawn for is read once, so a re-render never moves it
  const [now] = useState(() => new Date());
  const data = query.data;
  const jobs = useMemo(() => inOrder(data ?? []), [data]);
  const chapters = useMemo(() => chaptersOf(jobs, now), [jobs, now]);
  const { from, to } = useMemo(() => yearRange(jobs, now), [jobs, now]);
  const player = useCareerPlayer(jobs, now);

  return (
    <div className='grid items-start gap-6 min-[1100px]:grid-cols-[minmax(0,1fr)_380px]'>
      <div className='min-w-0'>
        <StreamDataState
          query={query}
          count={jobs.length}
          empty='work'
          subject='work'
          level={2}
          skeleton={
            <StreamSkeleton className='h-[420px] rounded-none min-[701px]:h-[400px] min-[701px]:rounded-xl' />
          }
        >
          <CareerPlayer
            jobs={jobs}
            chapters={chapters}
            from={from}
            to={to}
            player={player}
          />
        </StreamDataState>
        <CareerTitle />
      </div>
      <CareerPanel
        jobs={jobs}
        pending={query.isPending}
        scene={player.scene}
        onSeek={(index) => player.seek(index)}
      />
    </div>
  );
}
