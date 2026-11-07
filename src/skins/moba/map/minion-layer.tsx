/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { memo } from 'react';
import { LANE_IDS, LANES, lengthOf } from '@/skins/moba/world/geometry';

/** How fast a wave walks, in map units per second. */
const SPEED = 46;

const FORMATION: [number, number, number][] = [
  [-10, -6, 4.4],
  [-10, 6, 4.4],
  [0, 0, 4.4],
  [11, -5, 3.5],
  [11, 5, 3.5],
];

function Wave({
  d,
  team,
  seconds,
  offset,
  reverse,
}: {
  d: string;
  team: 'blue' | 'red';
  seconds: number;
  offset: number;
  reverse: boolean;
}) {
  return (
    <g>
      {FORMATION.map(([x, y, r]) => (
        <g key={`${x}${y}`} transform={`translate(${x} ${y})`}>
          <circle r={r + 2.6} fill='#000' fillOpacity='0.28' cx='1.4' cy='2' />
          <circle
            r={r}
            fill={`var(--mb-team-${team})`}
            stroke='#fff'
            strokeOpacity='0.75'
            strokeWidth='1.1'
          />
        </g>
      ))}
      <animateMotion
        dur={`${seconds}s`}
        begin={`${-offset}s`}
        repeatCount='indefinite'
        path={d}
        {...(reverse
          ? { keyPoints: '1;0', keyTimes: '0;1', calcMode: 'linear' }
          : {})}
      />
    </g>
  );
}

/**
 * The minion waves walking the lanes: two for each team on each lane, staggered. Blue walks toward the red nexus and red toward the
 * blue one. SMIL motion, so it can be paused for the whole drawing (`pauseAnimations`) when it is off screen or motion is reduced.
 */
export const MinionLayer = memo(function MinionLayer() {
  return (
    <g>
      {LANE_IDS.flatMap((lane) => {
        const seconds = Math.round(lengthOf(LANES[lane].samples) / SPEED);
        return (['blue', 'red'] as const).flatMap((team) =>
          [0, 0.5].map((phase, i) => (
            <Wave
              key={`${lane}-${team}-${i}`}
              d={LANES[lane].d}
              team={team}
              seconds={seconds}
              offset={seconds * (phase + (team === 'red' ? 0.25 : 0))}
              reverse={team === 'red'}
            />
          )),
        );
      })}
    </g>
  );
});
