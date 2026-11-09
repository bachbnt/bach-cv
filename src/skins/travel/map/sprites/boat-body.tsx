/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { WASH_DARK, WASH_LIGHT } from '@/skins/travel/map/sprites/art-parts';

/**
 * A little tourist boat drawn in a 60 x 40 box that floats on its bottom centre (30, 38): hull with a pale rail, a cabin with
 * windows, a canopy and a flag. `flag` picks the colour class of the flag; `dive` swaps it for a dive flag (red, white stripe).
 */
export function BoatBody({
  flag = 'fill-tl-coral',
  wake = true,
  dive = false,
}: {
  flag?: string;
  wake?: boolean;
  dive?: boolean;
}) {
  return (
    <g>
      {wake && (
        <g className='fill-none stroke-tl-foam' strokeLinecap='round'>
          <path
            d='M-6 38 Q10 42 30 41 Q50 42 66 38'
            strokeWidth={2}
            opacity={0.7}
          />
          <path
            d='M2 41 q14 4 28 3 q14 1 26 -3'
            strokeWidth={1.4}
            opacity={0.45}
          />
        </g>
      )}
      <path d='M2 24 H58 L52 36 Q30 41 8 36z' className='fill-tl-hull' />
      <path d='M2 24 H58 L57 27.5 H3z' className='fill-tl-foam' />
      <path
        d='M8 36 Q30 41 52 36 L53.5 33 Q30 38 6.5 33z'
        className={WASH_DARK}
        opacity={0.3}
      />
      <path
        d='M2 24 H58 L52 36 Q30 41 8 36z'
        className={WASH_LIGHT}
        opacity={0.08}
      />
      <rect
        x={16}
        y={12}
        width={26}
        height={12}
        rx={2}
        className='fill-tl-wall'
      />
      <rect
        x={30}
        y={12}
        width={12}
        height={12}
        className={WASH_DARK}
        opacity={0.15}
      />
      {[19, 26, 33].map((x) => (
        <rect
          key={x}
          x={x}
          y={15}
          width={5}
          height={5}
          rx={1}
          className='fill-tl-glass'
        />
      ))}
      <rect
        x={13}
        y={8.5}
        width={32}
        height={4}
        rx={2}
        className='fill-tl-coral'
      />
      <rect
        x={13}
        y={8.5}
        width={32}
        height={2}
        rx={1}
        className={WASH_LIGHT}
        opacity={0.3}
      />
      <path
        d='M44 8.5 V-3'
        className='fill-none stroke-tl-ink'
        strokeWidth={1.2}
        strokeLinecap='round'
      />
      {dive ? (
        <g className='tl-flag'>
          <rect x={44} y={-4} width={11} height={8} className='fill-tl-coral' />
          <path d='M44 4 L55 -4 V-1.4 L47 4z' className='fill-tl-foam' />
        </g>
      ) : (
        <path
          d='M44 -3 q6 -2.5 11 0 q-5 2.5 -11 6z'
          className={`tl-flag ${flag}`}
        />
      )}
      <path
        d='M4 24 v-5 M10 24 v-5 M4 19 H10'
        className='fill-none stroke-tl-wall'
        strokeWidth={1}
      />
    </g>
  );
}
