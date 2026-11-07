/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

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
  WASH_LIGHT,
  Win,
  type BoxShape,
} from '@/skins/travel/map/sprites/art-parts';

/** Dam Market: a big round hall with a striped awning ring, arched windows, a low dome and a small waving flag. */
export function DomeMarketArt() {
  const cx = 80;
  const r = 44;
  const ry = r * 0.5;
  const ex = (u: number) => cx + u * r;
  const ey = (u: number, y: number) => y + ry * Math.sqrt(1 - u * u);
  const us = [-0.92, -0.69, -0.46, -0.23, 0, 0.23, 0.46, 0.69, 0.92];
  return (
    <g>
      <Shadow rx={58} ry={13} />
      <ellipse
        cx={cx}
        cy={144}
        rx={r + 8}
        ry={ry + 4}
        className='fill-tl-stone'
      />
      <ellipse
        cx={cx}
        cy={144}
        rx={r + 8}
        ry={ry + 4}
        className={WASH_LIGHT}
        opacity={0.35}
      />
      <Cylinder
        cx={cx}
        y={140}
        r={r}
        h={30}
        wall='fill-tl-wall'
        top='fill-tl-wall'
      />
      {us.slice(1, -1).map((u) => (
        <path
          key={u}
          d={`M${ex(u) - 3} ${ey(u, 124)} v-7 a3 3 0 0 1 6 0 v7z`}
          className='fill-tl-glass'
          opacity={0.9}
        />
      ))}
      {us.slice(0, -1).map((u, i) => (
        <path
          key={u}
          d={`M${ex(u)} ${ey(u, 126)} L${ex(us[i + 1])} ${ey(us[i + 1], 126)} L${ex(us[i + 1])} ${ey(us[i + 1], 135)} Q${(ex(u) + ex(us[i + 1])) / 2} ${ey((u + us[i + 1]) / 2, 138)} ${ex(u)} ${ey(u, 135)}z`}
          className={i % 2 === 0 ? 'fill-tl-coral' : 'fill-tl-wall'}
        />
      ))}
      <ellipse
        cx={cx}
        cy={113}
        rx={r + 3}
        ry={ry + 2}
        className='fill-tl-roof'
      />
      <path
        d={`M${cx - r + 1} 111 A${r - 1} 22 0 0 1 ${cx + r - 1} 111 A${r - 1} ${ry} 0 0 1 ${cx - r + 1} 111z`}
        className='fill-tl-brick'
      />
      <path
        d={`M${cx + 4} 89 C${cx + 24} 92 ${cx + 30} 100 ${cx + 29} ${111 + ry * 0.7} A${r - 1} ${ry} 0 0 0 ${cx + r - 1} 111 A${r - 1} 22 0 0 0 ${cx + 4} 89z`}
        className={WASH_DARK}
        opacity={0.22}
      />
      {[-0.62, -0.3, 0.02].map((u) => (
        <path
          key={u}
          d={`M${cx} 89 Q${cx + u * r * 1.3} 104 ${cx + u * r} ${111 + ry * Math.sqrt(1 - u * u) - 1}`}
          className='fill-none stroke-tl-soil-2'
          strokeWidth={0.9}
          opacity={0.22}
        />
      ))}
      <path
        d={`M${cx - r + 8} 104 q8 -12 24 -14`}
        className='fill-none stroke-tl-foam'
        strokeWidth={2.4}
        strokeLinecap='round'
        opacity={0.4}
      />
      <rect
        x={cx - 5}
        y={80}
        width={10}
        height={10}
        rx={2}
        className='fill-tl-wall'
      />
      <path d={`M${cx - 6.5} 80.5 h13 l-6.5 -8z`} className='fill-tl-brick' />
      <path d={`M${cx} 73 v-14`} className='stroke-tl-ink' strokeWidth={1.4} />
      <path
        d={`M${cx} 59 q7 -3 14 0 q-7 3 -14 7z`}
        className='tl-flag fill-tl-coral'
      />
    </g>
  );
}

/** The Yersin museum: a small colonial villa, cream walls, a terracotta hip roof, shutters and a veranda along the front. */
export function VillaArt() {
  const house: BoxShape = { cx: 80, y: 138, wl: 30, wr: 40, h: 28 };
  const porch: BoxShape = { cx: 66, y: 145, wl: 30, wr: 14, h: 2.5 };
  return (
    <g>
      <Shadow rx={56} />
      <Mound x={80} y={149} w={130} h={16} />
      <Palm x={134} y={146} s={0.9} lean={-1} />
      <Tree x={22} y={146} s={0.9} />
      <Box shape={house} wall='fill-tl-wall' />
      <OnFace shape={house} side='l' at={0.5}>
        <Win x={-8} y={-17} w={5} shutters />
        <Win x={8} y={-17} w={5} shutters />
        <path
          d='M-4 0 v-10 a4 4 0 0 1 8 0 v10z'
          className='fill-tl-soil-2'
          opacity={0.75}
        />
        <Win x={-10.5} y={-3} w={5} h={8} />
        <Win x={10.5} y={-3} w={5} h={8} />
      </OnFace>
      <OnFace shape={house} side='r' at={0.5}>
        <Win x={-12} y={-15} w={5} shutters />
        <Win x={0} y={-15} w={5} shutters />
        <Win x={12} y={-15} w={5} shutters />
      </OnFace>
      <Roof shape={house} roof='fill-tl-roof' rise={19} />
      <rect x={96} y={86} width={7} height={13} className='fill-tl-brick' />
      <rect x={95} y={84} width={9} height={3} className='fill-tl-stone' />
      <Box shape={porch} wall='fill-tl-stone' />
      <OnFace shape={porch} side='l' at={0.5}>
        {[-13.5, -4.5, 4.5, 13.5].map((x) => (
          <rect
            key={x}
            x={x - 0.9}
            y={-14}
            width={1.8}
            height={12}
            className='fill-tl-wall'
          />
        ))}
      </OnFace>
      <Box
        shape={{
          ...porch,
          y: porch.y - 14,
          wl: porch.wl + 3,
          wr: porch.wr + 2,
          h: 2.5,
        }}
        wall='fill-tl-roof'
      />
    </g>
  );
}

/** A wave line that follows a face: `n` crests over the width `w`. */
function Waves({ w, fill, line }: { w: number; fill: string; line: string }) {
  const n = 3;
  const step = w / n;
  let d = `M${-w / 2} 3`;
  for (let i = 0; i < n; i += 1) {
    const x = -w / 2 + i * step;
    d += ` Q${x + step * 0.25} ${-9} ${x + step * 0.5} -3 T${x + step} 3`;
  }
  return (
    <g>
      <path d={`${d} V6 H${-w / 2}z`} className={fill} />
      <path
        d={d}
        className={`fill-none ${line}`}
        strokeWidth={1.2}
        strokeLinecap='round'
      />
    </g>
  );
}

/** A whale on a signboard (the sign of the Institute of Oceanography). */
function WhaleSign({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-1} y={-16} width={2} height={16} className='fill-tl-trunk' />
      <rect
        x={-13}
        y={-34}
        width={26}
        height={19}
        rx={3}
        className='fill-tl-sea-3'
      />
      <rect
        x={-13}
        y={-34}
        width={26}
        height={19}
        rx={3}
        className='fill-none stroke-tl-foam'
        strokeWidth={1}
        opacity={0.6}
      />
      <path
        d='M-9 -22 C-9 -29 3 -30 7 -24 C8 -22 9 -23 10 -26 C11 -23 10 -20 8 -19 C3 -16 -9 -15 -9 -22z'
        className='fill-tl-foam'
      />
      <circle cx={-4} cy={-23} r={0.9} className='fill-tl-sea-3' />
      <path
        d='M-1 -29 q1 -4 -1 -5 M-1 -29 q2 -3 3 -5'
        className='fill-none stroke-tl-teal'
        strokeWidth={1}
        strokeLinecap='round'
      />
    </g>
  );
}

/** The Institute of Oceanography: a low modern building with a blue wave roof and a whale sign. */
export function AquariumArt() {
  const hall: BoxShape = { cx: 82, y: 136, wl: 44, wr: 34, h: 20 };
  return (
    <g>
      <Shadow rx={60} />
      <Mound x={80} y={149} w={134} h={12} />
      <Box
        shape={{ cx: 82, y: 142, wl: 50, wr: 40, h: 4 }}
        wall='fill-tl-stone'
      />
      <Box shape={hall} wall='fill-tl-wall' top='fill-tl-sea-1' />
      <OnFace shape={hall} side='l' at={0.5}>
        <rect
          x={-18}
          y={-15}
          width={36}
          height={10}
          rx={2}
          className='fill-tl-glass'
        />
        {[-9, 0, 9].map((x) => (
          <path
            key={x}
            d={`M${x} -15 v10`}
            className='stroke-tl-wall'
            strokeWidth={1.2}
          />
        ))}
        <g transform='translate(0 -20)'>
          <Waves w={44} fill='fill-tl-sea-2' line='stroke-tl-foam' />
        </g>
      </OnFace>
      <OnFace shape={hall} side='r' at={0.5}>
        <rect
          x={-13}
          y={-14}
          width={26}
          height={8}
          rx={2}
          className='fill-tl-glass'
        />
        <g transform='translate(0 -20)'>
          <Waves w={34} fill='fill-tl-sea-3' line='stroke-tl-foam' />
        </g>
      </OnFace>
      <Tree x={142} y={146} s={0.8} />
      <WhaleSign x={30} y={146} />
    </g>
  );
}
