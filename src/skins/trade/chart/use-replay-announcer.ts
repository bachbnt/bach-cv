/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import { fill } from '@/lib/chat/fill';
import type { Interval } from '@/skins/trade/chart/chart-types';
import type { ChartFlag } from '@/skins/trade/chart/use-chart-flags';
import { flagsPassed, type ReplayState } from '@/skins/trade/chart/replay';

/** The words said when the playhead passes a flag (`copy.replay.reached` and `.graduated`, with {company} {role} or {degree} {school}). */
export interface ReplayWords {
  reached: string;
  graduated: string;
}

/** A flag is announced (for a polite live region) when the replay's playhead passes the bar it is on. */
export function useReplayAnnouncer(
  items: ChartFlag[],
  replay: ReplayState,
  interval: Interval,
  words: ReplayWords,
): string {
  const [said, setSaid] = useState('');
  const playedTo = useRef(-1);
  const playedOn = useRef(interval);
  const replaying = replay.phase === 'ready';
  useEffect(() => {
    if (!replaying) {
      playedTo.current = -1;
      return;
    }
    const from = playedTo.current;
    playedTo.current = replay.at;
    // the bars of another interval are numbered again: nothing was passed by changing it
    if (playedOn.current !== interval) {
      playedOn.current = interval;
      return;
    }
    if (from < 0) return;
    const passed = flagsPassed(items, from, replay.at);
    if (passed.length > 0)
      setSaid(
        passed
          .map((item) =>
            item.kind === 'job'
              ? fill(words.reached, {
                  company: item.marker.company,
                  role: item.marker.role,
                })
              : fill(words.graduated, {
                  degree: item.study.degree,
                  school: item.study.school,
                }),
          )
          .join('. '),
      );
  }, [replaying, replay.at, items, interval, words.reached, words.graduated]);
  return replaying ? said : '';
}
