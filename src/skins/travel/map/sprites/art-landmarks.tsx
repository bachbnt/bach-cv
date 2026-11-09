/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { ChamTower } from '@/skins/travel/map/sprites/art-landmarks-cham-tower';
import { BellTower } from '@/skins/travel/map/sprites/art-landmarks-bell-tower';
import { gothicPath } from '@/skins/travel/map/sprites/art-landmarks-gothic';
import { Mandapa } from '@/skins/travel/map/sprites/art-landmarks-mandapa';
import { LotusPetals } from '@/skins/travel/map/sprites/art-landmarks-lotus-petals';
import { roofLines } from '@/skins/travel/map/sprites/art-landmarks-roof-lines';
import {
  Box,
  Cylinder,
  Mound,
  OnFace,
  Palm,
  Roof,
  Shadow,
  Tree,
  WASH_DARK,
  topCorners,
  type BoxShape,
} from '@/skins/travel/map/sprites/art-parts';

type Corners = ReturnType<typeof topCorners>;

/** Joints of the paving on the top of the terrace: lines both ways between its corners. */
function paving({ a, b, c, d }: Corners) {
  const lerp = (
    p: readonly [number, number],
    q: readonly [number, number],
    t: number,
  ) => `${p[0] + (q[0] - p[0]) * t} ${p[1] + (q[1] - p[1]) * t}`;
  return [0.2, 0.4, 0.6, 0.8]
    .map(
      (t) =>
        `M${lerp(a, d, t)}L${lerp(b, c, t)}M${lerp(a, b, t)}L${lerp(d, c, t)}`,
    )
    .join('');
}

const BLOCKS =
  'M-22 -5.5h44M-12 0v-5.5M0 0v-5.5M12 0v-5.5M-6 -5.5v-5.5M6 -5.5v-5.5M18 -5.5v-5.5M-18 -5.5v-5.5';

/** Po Nagar: the Cham brick sanctuaries on their hilltop terrace, the porch hall in front and the stair up the hill. */
export function ChamTowersArt() {
  const terrace: BoxShape = { cx: 80, y: 140, wl: 44, wr: 50, h: 11 };
  const hall: BoxShape = { cx: 94, y: 122, wl: 14, wr: 20, h: 0 };
  return (
    <g>
      <Shadow rx={62} />
      <Mound x={80} y={150} w={152} h={62} />
      <polygon
        points='51,125.5 65,132.5 43,143.5 29,136.5'
        className='fill-tl-stone'
      />
      <path
        d='M33 138.5l14 -7M37 140.5l14 -7M41 142.5l14 -7'
        className='fill-none stroke-tl-soil-2'
        strokeOpacity={0.25}
        strokeWidth={0.7}
      />
      <Box shape={terrace} wall='fill-tl-rock-2' top='fill-tl-stone' />
      <OnFace shape={terrace} side='l' at={0.5}>
        <path
          d={BLOCKS}
          className='fill-none stroke-tl-soil-2'
          strokeOpacity={0.22}
          strokeWidth={0.6}
        />
        <rect x={-8} y={-11} width={16} height={11} className='fill-tl-rock' />
        <path
          d='M-8 -2.8h16M-8 -5.5h16M-8 -8.2h16'
          className='fill-none stroke-tl-foam'
          strokeOpacity={0.5}
          strokeWidth={0.8}
        />
        <path
          d='M-8 0V-11M8 0V-11'
          className='fill-none stroke-tl-soil-2'
          strokeOpacity={0.35}
          strokeWidth={0.9}
        />
      </OnFace>
      <OnFace shape={terrace} side='r' at={0.5}>
        <path
          d={BLOCKS}
          className='fill-none stroke-tl-soil-2'
          strokeOpacity={0.22}
          strokeWidth={0.6}
        />
      </OnFace>
      <polyline
        points='36,107 80,129 130,104'
        className='fill-none stroke-tl-foam'
        strokeOpacity={0.7}
        strokeWidth={1}
        strokeLinejoin='round'
      />
      <path
        d={paving(topCorners(terrace))}
        className='fill-none stroke-tl-soil-2'
        strokeOpacity={0.14}
        strokeWidth={0.6}
      />
      <ChamTower cx={110} y={103} w={7} tiers={2} />
      <ChamTower cx={74} y={108} w={13} tiers={3} rich />
      <ChamTower cx={50} y={114} w={7} tiers={2} />
      <Mandapa shape={hall} column={11} rise={8} />
      <ellipse
        cx={68}
        cy={124}
        rx={3.4}
        ry={1.7}
        className='fill-tl-soil-2'
        opacity={0.3}
      />
      <path d='M65.6 124l1 -5h4.8l1 5z' className='fill-tl-brick' />
      <ellipse
        cx={68}
        cy={119}
        rx={2.4}
        ry={1.1}
        className='fill-tl-soil-2'
        opacity={0.7}
      />
      <Tree x={14} y={142} s={0.75} />
      <Tree x={142} y={146} s={0.75} />
    </g>
  );
}

/** Nha Trang Cathedral: grey stone Gothic church on a terrace: the bell tower with its spire in front of a steep-roofed nave. */
export function CathedralArt() {
  const platform: BoxShape = { cx: 60, y: 150, wl: 32, wr: 68, h: 12 };
  const nave: BoxShape = { cx: 58.5, y: 128.75, wl: 13, wr: 56, h: 24 };
  const bays = [-14, -4.5, 5, 14.5, 24];
  const buttresses = [-9.25, 0.25, 9.75, 19.25, 27]
    .map((x) => `M${x - 1.3} 0V-17.5L${x + 1.3} -19.5V0z`)
    .join('');
  const eave = topCorners(nave);
  return (
    <g>
      <Shadow rx={64} />
      <Mound x={80} y={152} w={150} h={34} />
      <polygon
        points='37,138.5 51,145.5 41,150.5 27,143.5'
        className='fill-tl-stone'
      />
      <Box shape={platform} wall='fill-tl-rock-2' top='fill-tl-hill-s' />
      <OnFace shape={platform} side='l' at={0.5}>
        <rect x={-7} y={-12} width={14} height={12} className='fill-tl-stone' />
        <path
          d='M-7 -2.4h14M-7 -4.8h14M-7 -7.2h14M-7 -9.6h14'
          className='fill-none stroke-tl-soil-2'
          strokeOpacity={0.3}
          strokeWidth={0.7}
        />
        <path
          d='M-7 0V-12M7 0V-12'
          className='fill-none stroke-tl-soil-2'
          strokeOpacity={0.4}
          strokeWidth={1}
        />
      </OnFace>
      <OnFace shape={platform} side='r' at={0.5}>
        <path
          d='M-34 -6h68M-26 0v-6M-12 0v-6M2 0v-6M16 0v-6M30 0v-6M-19 -6v-6M-5 -6v-6M9 -6v-6M23 -6v-6'
          className='fill-none stroke-tl-soil-2'
          strokeOpacity={0.2}
          strokeWidth={0.6}
        />
      </OnFace>
      <Box shape={nave} wall='fill-tl-rock-2' />
      <OnFace shape={nave} side='r' at={0.5}>
        <path
          d={`M-28 -8h56M-28 -16h56${bays.map((x) => `M${x - 4.75} -8v-8M${x + 4.75} 0v-8`).join('')}`}
          className='fill-none stroke-tl-soil-2'
          strokeOpacity={0.16}
          strokeWidth={0.5}
        />
        <rect
          x={-28}
          y={-3}
          width={56}
          height={3}
          className={WASH_DARK}
          opacity={0.18}
        />
        <path
          d={bays.map((x) => gothicPath(x, -5, 3.8, 13)).join('')}
          className='fill-tl-glass'
        />
        <path d={buttresses} className='fill-tl-rock-2' />
        <path d={buttresses} className={WASH_DARK} opacity={0.3} />
      </OnFace>
      <polyline
        points={`${eave.b} ${eave.c}`}
        className='fill-none stroke-tl-foam'
        strokeOpacity={0.55}
        strokeWidth={0.9}
      />
      <Roof
        shape={nave}
        roof='fill-tl-rock'
        rise={20}
        gable
        end='fill-tl-rock-2'
      />
      <path
        d={roofLines(nave, 20, [0.25, 0.5, 0.75])}
        className='fill-none stroke-tl-soil-2'
        strokeOpacity={0.28}
        strokeWidth={0.6}
      />
      <BellTower cx={52} y={132} />
      <path
        d='M26 138v-7M52 151v-7'
        className='fill-none stroke-tl-soil-2'
        strokeOpacity={0.7}
        strokeWidth={1}
      />
      <circle cx={26} cy={130} r={1.8} className='fill-tl-sun' />
      <circle cx={52} cy={143} r={1.8} className='fill-tl-sun' />
      <Palm x={14} y={148} s={0.75} />
      <Tree x={140} y={146} s={0.8} />
    </g>
  );
}

/** Where the 12 columns of the ring stand: the ones behind the tower (back) and the ones in front of it. */
const RING = Array.from({ length: 12 }, (_, k) => (k * Math.PI) / 6);

/** Tram Huong tower: a lotus bud of pink-red petals round a cream shaft, on a round drum and steps, inside a ring of columns on a paved plaza. */
export function LotusTowerArt() {
  const column = (a: number) => {
    const x = 80 + 30 * Math.cos(a) - 1.3;
    const y = 126 + 13.5 * Math.sin(a);
    return `M${x} ${y}v-9h2.6v9z`;
  };
  const back = RING.filter((a) => Math.sin(a) < 0.01);
  const front = RING.filter((a) => Math.sin(a) >= 0.01);
  const fins = [-7, -3.5, 0, 3.5, 7]
    .map((dx) => {
      const edge = 5.5 * Math.sqrt(1 - (dx / 11) ** 2);
      return `M${80 + dx} ${100 + edge}v20`;
    })
    .join('');
  return (
    <g>
      <defs>
        <linearGradient id='tl-lotus-petal' x1='0' y1='0' x2='0' y2='1'>
          <stop offset='0' style={{ stopColor: 'var(--tl-coral)' }} />
          <stop offset='0.8' style={{ stopColor: 'var(--tl-coral-2)' }} />
        </linearGradient>
        <linearGradient id='tl-lotus-back' x1='0' y1='0' x2='0' y2='1'>
          <stop offset='0' style={{ stopColor: 'var(--tl-coral-2)' }} />
          <stop offset='1' style={{ stopColor: 'var(--tl-foam)' }} />
        </linearGradient>
        <linearGradient id='tl-lotus-shaft' x1='0' y1='0' x2='1' y2='0'>
          <stop offset='0' style={{ stopColor: 'var(--tl-foam)' }} />
          <stop offset='1' style={{ stopColor: 'var(--tl-stone)' }} />
        </linearGradient>
      </defs>
      <ellipse cx={80} cy={128} rx={76} ry={22} className='fill-tl-river' />
      <path
        d='M30 144q5 -3 10 0t10 0M104 146q5 -3 10 0t10 0'
        className='fill-none stroke-tl-foam'
        strokeOpacity={0.8}
        strokeWidth={1.2}
        strokeLinecap='round'
      />
      <ellipse cx={80} cy={127} rx={64} ry={18} className='fill-tl-sand' />
      <ellipse cx={80} cy={129} rx={40} ry={17} className='fill-tl-rock-2' />
      <ellipse cx={80} cy={126} rx={40} ry={17} className='fill-tl-sand-2' />
      <path
        d='M40 126h80M52 115l56 22M80 109v34M108 115l-56 22'
        className='fill-none stroke-tl-soil-2'
        strokeOpacity={0.12}
        strokeWidth={0.6}
      />
      <path d={back.map(column).join('')} className='fill-tl-stone' />
      <path
        d='M50 117A30 13.5 0 0 1 110 117'
        className='fill-none stroke-tl-wall'
        strokeWidth={2.2}
      />
      <Cylinder
        cx={80}
        y={126}
        r={19}
        h={3}
        wall='fill-tl-rock-2'
        top='fill-tl-stone'
      />
      <Cylinder
        cx={80}
        y={123}
        r={15}
        h={3}
        wall='fill-tl-rock-2'
        top='fill-tl-wall'
      />
      <Cylinder cx={80} y={120} r={11} h={20} wall='fill-tl-wall' />
      <path
        d={fins}
        className='fill-none stroke-tl-soil-2'
        strokeOpacity={0.14}
        strokeWidth={0.6}
      />
      <path
        d='M69 110A11 5.5 0 0 0 91 110'
        className='fill-none stroke-tl-glass'
        strokeWidth={3}
      />
      <LotusPetals row='back' cx={80} y={100} fill='url(#tl-lotus-back)' />
      <path
        d='M75 100L77.6 40 80 12 82.4 40 85 100z'
        fill='url(#tl-lotus-shaft)'
      />
      <circle cx={80} cy={11} r={1.8} className='fill-tl-sun' />
      <LotusPetals row='front' cx={80} y={100} fill='url(#tl-lotus-petal)' />
      <path d='M64 100A16 5.5 0 0 0 96 100z' className='fill-tl-wall' />
      <path
        d='M64 100A16 5.5 0 0 0 96 100'
        className='fill-none stroke-tl-stone'
        strokeWidth={1}
      />
      <path d={front.map(column).join('')} className='fill-tl-wall' />
      <path
        d={front.map(column).join('')}
        className={WASH_DARK}
        opacity={0.18}
      />
      <path
        d='M50 117A30 13.5 0 0 0 110 117'
        className='fill-none stroke-tl-wall'
        strokeWidth={2.2}
      />
      <Palm x={22} y={134} s={0.7} />
      <Tree x={138} y={132} s={0.75} />
    </g>
  );
}
