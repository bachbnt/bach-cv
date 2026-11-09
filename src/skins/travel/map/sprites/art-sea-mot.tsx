/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import {
  Box,
  Boulder,
  OnFace,
  Roof,
  Shadow,
  Tree,
  WASH_DARK,
  type BoxShape,
} from '@/skins/travel/map/sprites/art-parts';
import { Shallows } from '@/skins/travel/map/sprites/art-sea-shallows';

/** A scrubby bush: two leaf blobs, the back one shaded. */
function Scrub({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={2} cy={-3} rx={6} ry={4} className='fill-tl-leaf' />
      <ellipse cx={-2} cy={-4} rx={5} ry={3.6} className='fill-tl-hill-s' />
      <ellipse
        cx={3}
        cy={-2}
        rx={4}
        ry={2.4}
        className={WASH_DARK}
        opacity={0.2}
      />
    </g>
  );
}

/** A rock with an arch through it: the sea shows through the hole (an even-odd cut-out). */
function ArchRock({ x, y }: { x: number; y: number }) {
  const rock =
    'M-26 0 C-28 -28 -16 -46 0 -46 C16 -46 28 -30 26 0Z M-9 0 C-9 -16 -5 -24 0 -24 C5 -24 9 -16 9 0Z';
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d={rock} className='fill-tl-rock' fillRule='evenodd' />
      <path
        d={rock}
        className='fill-tl-rock-2'
        fillRule='evenodd'
        transform='translate(-2 -1) scale(0.88 0.9)'
      />
      <path
        d='M9 0 C9 -16 5 -24 0 -24 C5 -26 12 -18 12 0z'
        className={WASH_DARK}
        opacity={0.3}
      />
      <path
        d='M-14 -34 q3 6 0 14 M12 -36 q4 8 2 16'
        className='fill-none stroke-tl-soil-2'
        strokeOpacity={0.3}
        strokeWidth={1}
        strokeLinecap='round'
      />
    </g>
  );
}

/** Hon Mot: the quietest of the three. Big boulders and an arch rock, scrub, a sliver of white beach and one lone hut. */
export function HonMotArt() {
  const hut: BoxShape = { cx: 0, y: 0, wl: 7, wr: 6, h: 6 };
  return (
    <g>
      <Shadow rx={50} ry={9} />
      <Shallows rx={56} ry={13} />
      <ellipse cx={62} cy={147} rx={24} ry={5.5} className='fill-tl-sand-2' />
      <ellipse cx={61} cy={146} rx={21} ry={4.4} className='fill-tl-sand' />
      <Boulder x={136} y={152} rx={5} ry={9} />
      <Boulder x={112} y={147} rx={14} ry={11} />
      <Boulder x={90} y={146} rx={30} ry={34} />
      <ArchRock x={50} y={146} />
      <Boulder x={120} y={146} rx={7} ry={5} />
      <Boulder x={84} y={104} rx={14} ry={9} />
      <g transform='translate(96 105)'>
        <Box shape={hut} wall='fill-tl-wall' />
        <OnFace shape={hut} side='l' at={0.5}>
          <rect
            x={-1.6}
            y={-5}
            width={3.2}
            height={5}
            className='fill-tl-soil-2'
          />
        </OnFace>
        <Roof
          shape={{ cx: 0, y: 0, wl: 9, wr: 8, h: 6 }}
          roof='fill-tl-soil'
          rise={5}
        />
      </g>
      <path
        d='M96 149 q8 3 18 0 M26 149 q6 3 14 1 M124 151 q6 2 12 0'
        className='fill-none stroke-tl-foam'
        strokeWidth={1.4}
        strokeLinecap='round'
        opacity={0.85}
      />
      <g className='fill-tl-rock-2'>
        <ellipse cx={52} cy={148.4} rx={2} ry={1} />
        <ellipse cx={66} cy={147.6} rx={1.5} ry={0.8} />
        <ellipse cx={72} cy={149} rx={2.2} ry={1} />
      </g>
      <path
        d='M96 98 V91'
        className='stroke-tl-soil-2'
        strokeWidth={1}
        strokeLinecap='round'
      />
      <path d='M96 91 l5 1.6 l-5 1.8z' className='fill-tl-coral' />
      <Scrub x={70} y={118} s={0.9} />
      <Scrub x={112} y={125} s={0.8} />
      <Tree x={78} y={100} s={0.55} />
      <Scrub x={40} y={111} s={0.7} />
      <Scrub x={58} y={104} s={0.5} />
      <path
        d='M96 126 q4 8 1 18 M76 124 q-6 10 -2 20 M104 140 q3 3 1 6'
        className='fill-none stroke-tl-soil-2'
        strokeOpacity={0.3}
        strokeWidth={1}
        strokeLinecap='round'
      />
      <path
        d='M34 78 q3 -3 6 0 q3 -3 6 0 M54 68 q2.5 -2.5 5 0 q2.5 -2.5 5 0'
        className='fill-none stroke-tl-foam'
        strokeWidth={1.2}
        strokeLinecap='round'
      />
    </g>
  );
}
