/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { Tree, WASH_DARK } from '@/skins/travel/map/sprites/art-parts';
import { BoatBody } from '@/skins/travel/map/sprites/boat-body';

interface Peak {
  /** Position of the summit along the width (0 to 1). */
  x: number;
  /** Height against the tallest peak (0 to 1). */
  h: number;
  /** Half-width of its foot against the width. */
  hw: number;
}

const PEAKS: readonly Peak[] = [
  { x: 0.78, h: 0.52, hw: 0.28 },
  { x: 0.2, h: 0.62, hw: 0.3 },
  { x: 0.5, h: 1, hw: 0.4 },
];

/** One peak: a lit left face, a shaded right face along a jagged ridge, and a pale top when it is high. */
function MountainPeak({
  x,
  top,
  foot,
  hw,
  snow,
}: {
  x: number;
  top: number;
  foot: number;
  hw: number;
  snow: boolean;
}) {
  const h = foot - top;
  const base = x + hw * 0.14;
  const ridge = `${x},${top} ${x + hw * 0.04},${top + h * 0.3} ${x + hw * 0.1},${top + h * 0.52} ${base},${foot}`;
  const cap = `${x - hw * 0.34},${top + h * 0.3} ${x - hw * 0.16},${top + h * 0.24} ${x - hw * 0.06},${top + h * 0.34} ${x + hw * 0.04},${top + h * 0.3} ${x + hw * 0.16},${top + h * 0.38} ${x + hw * 0.34},${top + h * 0.3}`;
  return (
    <g>
      <polygon
        points={`${x - hw},${foot} ${ridge}`}
        className='fill-tl-mtn-s'
      />
      <polygon
        points={`${ridge} ${x + hw},${foot}`}
        className='fill-tl-mtn-w'
      />
      {snow && (
        <g>
          <polygon points={`${x},${top} ${cap}`} className='fill-tl-mtn-t' />
          <polygon
            points={`${x},${top} ${x + hw * 0.04},${top + h * 0.3} ${x + hw * 0.16},${top + h * 0.38} ${x + hw * 0.34},${top + h * 0.3}`}
            className={WASH_DARK}
            opacity={0.14}
          />
        </g>
      )}
      <path
        d={`M${x - hw * 0.5} ${foot - h * 0.2} l${hw * 0.18} ${-h * 0.14} M${x + hw * 0.4} ${foot - h * 0.16} l${-hw * 0.12} ${-h * 0.12}`}
        className='fill-none stroke-tl-mtn-w'
        strokeWidth={1.6}
        strokeLinecap='round'
        opacity={0.6}
      />
    </g>
  );
}

/** A mountain on a real peak: a ridge of two or three peaks with a lit and a shaded face, a pale top for the high ones, trees at the foot. */
export function MountainArt({ metres }: { metres: number }) {
  const h = 46 + metres * 0.2;
  const w = h * 1.5;
  const ts = Math.max(0.7, h / 110);
  const count = metres > 120 ? 3 : 2;
  const peaks = count === 3 ? PEAKS : PEAKS.slice(1);
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      width={w}
      height={h}
      aria-hidden='true'
      focusable='false'
      style={{ overflow: 'visible' }}
    >
      <ellipse
        cx={w / 2}
        cy={h - 1}
        rx={w * 0.52}
        ry={h * 0.07}
        className='fill-tl-soil-2'
        opacity={0.22}
      />
      {peaks.map((p) => (
        <MountainPeak
          key={p.x}
          x={w * p.x}
          top={h * (1 - p.h)}
          foot={h - 2}
          hw={w * p.hw}
          snow={metres > 450 && p.h > 0.9}
        />
      ))}
      {[0.1, 0.22, 0.34, 0.68, 0.82, 0.92].map((f, i) => (
        <Tree
          key={f}
          x={w * f}
          y={h + (i % 2 === 0 ? 1 : -3)}
          s={ts * (i % 3 === 0 ? 0.9 : 0.7)}
        />
      ))}
    </svg>
  );
}

/** A lovely little tourist boat with a wake. */
export function BoatArt({ scale, flip }: { scale: number; flip: boolean }) {
  return (
    <svg
      viewBox='-6 -6 72 50'
      width={72 * scale}
      height={50 * scale}
      aria-hidden='true'
      focusable='false'
      style={{
        transform: flip ? 'scaleX(-1)' : undefined,
        overflow: 'visible',
      }}
    >
      <BoatBody />
    </svg>
  );
}
