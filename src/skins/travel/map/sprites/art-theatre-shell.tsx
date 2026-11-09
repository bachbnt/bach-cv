/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { AXIS } from '@/skins/travel/map/sprites/art-theatre-frame';
import { fmt, rad } from '@/skins/travel/map/sprites/art-town-math';

/** The fish trap is a body of revolution along a 2:1 axis (`u`, rising `RISE` per step), lying with its mouth towards the viewer. */
const LENGTH = 62;
const RISE = 0.2;
const MOUTH = 28;
/** Slope of the axis in the local (sheared) plane, where every section is a true circle. */
const SPEED = 1 + RISE;
const NORM = Math.hypot(1, SPEED);
const STEP = 3;

/** Radius of the shell at distance `u` from the mouth: a round shoulder, then a long taper into the neck. */
const radius = (u: number) => {
  const t = Math.min(Math.max(u / LENGTH, 0), 1);
  return 7 + 21 * (1 - t) ** 1.6 * (1 + 3.5 * t);
};
const slope = (u: number) => radius(u + 0.5) - radius(u - 0.5);

/** Screen point of the section at `u`, at angle `phi` (0 is the right face side, 90 degrees up) and radius `r`. */
const project = (cx: number, cy: number, u: number, phi: number, r: number) => {
  const x = u + r * Math.cos(phi);
  const y = -SPEED * u - r * Math.sin(phi);
  return [cx + x, cy + y + 0.5 * x] as const;
};

/** Is that bit of the surface turned to the viewer (who looks along the mouth, from the right and above)? */
const faces = (u: number, phi: number) =>
  slope(u) + Math.cos(phi) + Math.sin(phi) > 0.05;

const samples = Array.from(
  { length: Math.round(LENGTH / STEP) + 1 },
  (_, i) => i * STEP,
);

/** The two outlines of the shell: tangent points of the sections, which is where the silhouette runs. */
function outline(cx: number, cy: number) {
  const pairs = samples.map((u) => {
    const r = radius(u);
    const rs = slope(u);
    const along = (r * rs) / (NORM * NORM);
    const across = r * Math.sqrt(1 - (rs * rs) / (NORM * NORM));
    const cX = u - along;
    const cY = -SPEED * u + along * SPEED;
    const nx = SPEED / NORM;
    const ny = 1 / NORM;
    const at = (sign: 1 | -1) => {
      const x = cX + sign * across * nx;
      const y = cY + sign * across * ny;
      return [cx + x, cy + y + 0.5 * x] as const;
    };
    return [at(1), at(-1)] as const;
  });
  // the two sides, upper one first
  const upper = pairs.map(([a, b]) => (a[1] < b[1] ? a : b));
  const lower = pairs.map(([a, b]) => (a[1] < b[1] ? b : a));
  return { upper, lower };
}

const line = (list: readonly (readonly [number, number])[]) =>
  list
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${fmt(p[0])} ${fmt(p[1])}`)
    .join('');

/** One weave strand: the visible parts of a helix round the shell, `turn` degrees per unit of length. */
function strand(cx: number, cy: number, phi0: number, turn: number, from = 0) {
  let d = '';
  let open = false;
  for (const u of samples) {
    const phi = rad(phi0 + turn * u);
    if (u < from || !faces(u, phi)) {
      open = false;
      continue;
    }
    const [x, y] = project(cx, cy, u, phi, radius(u));
    d += `${open ? 'L' : 'M'}${fmt(x)} ${fmt(y)}`;
    open = true;
  }
  return d;
}

/** A hoop round the shell at `u`: the visible half of the section. */
function hoop(cx: number, cy: number, u: number) {
  const points: (readonly [number, number])[] = [];
  for (let a = -60; a <= 150; a += 10) {
    if (faces(u, rad(a)))
      points.push(project(cx, cy, u, rad(a), radius(u) + 0.4));
  }
  return line(points);
}

const STRANDS = Array.from({ length: 16 }, (_, i) => i * 22.5);
const HOOPS = [10, 26, 41, 52, 57];

/**
 * The woven shell of the Do Theatre, a giant fish trap: a round tapering body of bamboo seen from its wide mouth, a lattice of two
 * crossing families of strands, a few hoops, and the light from within the mouth. The axis starts at the centre of the mouth.
 */
export function TrapShell() {
  const { x: cx, y: cy } = AXIS;
  const { upper, lower } = outline(cx, cy);
  const body = `${line(upper)}${line([...lower].reverse()).replace('M', 'L')}z`;
  const tail = project(cx, cy, LENGTH, 0, 0);
  const lit = line(upper.slice(1));
  const shaded = line(lower.slice(1));
  const rim = `translate(${cx} ${cy}) skewY(26.57)`;
  const chord = MOUTH * 0.5;
  const reach = Math.sqrt((MOUTH - 2.4) ** 2 - chord * chord);
  const tailR = radius(LENGTH);
  return (
    <g>
      <defs>
        <linearGradient
          id='tl-theatre-bamboo'
          gradientUnits='userSpaceOnUse'
          x1={cx - 10}
          y1={cy - 50}
          x2={cx + 62}
          y2={cy + 24}
        >
          <stop offset='0' style={{ stopColor: 'var(--tl-sand)' }} />
          <stop offset='0.42' style={{ stopColor: 'var(--tl-sand-2)' }} />
          <stop offset='1' style={{ stopColor: 'var(--tl-soil)' }} />
        </linearGradient>
        <radialGradient id='tl-theatre-glow' cx='0.62' cy='0.4' r='0.7'>
          <stop offset='0' style={{ stopColor: 'var(--tl-sun)' }} />
          <stop
            offset='1'
            style={{ stopColor: 'var(--tl-soil-2)' }}
            stopOpacity='0'
          />
        </radialGradient>
      </defs>
      <path d={body} className='fill-tl-soil-2' />
      <ellipse
        cx={tail[0]}
        cy={tail[1]}
        rx={tailR}
        ry={tailR * 1.12}
        transform={`rotate(-26 ${tail[0]} ${tail[1]})`}
        className='fill-tl-soil'
      />
      <path d={body} fill='url(#tl-theatre-bamboo)' />
      <path
        d={[
          ...STRANDS.map((a) => strand(cx, cy, a, 1.5)),
          ...STRANDS.map((a) => strand(cx, cy, a, -1.5)),
        ].join('')}
        className='fill-none stroke-tl-soil-2'
        strokeOpacity={0.42}
        strokeWidth={1.1}
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d={STRANDS.map((a) => strand(cx, cy, a + 4, 1.5, 3)).join('')}
        className='fill-none stroke-tl-sun'
        strokeOpacity={0.5}
        strokeWidth={0.7}
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d={HOOPS.map((u) => hoop(cx, cy, u)).join('')}
        className='fill-none stroke-tl-trunk'
        strokeOpacity={0.55}
        strokeWidth={1.8}
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d={lit}
        className='fill-none stroke-tl-foam'
        strokeOpacity={0.5}
        strokeWidth={1.4}
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d={shaded}
        className='fill-none stroke-tl-soil-2'
        strokeOpacity={0.4}
        strokeWidth={1.6}
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <g transform={rim}>
        <circle r={MOUTH} className='fill-tl-sand-2' />
        <circle r={MOUTH - 2.4} className='fill-tl-soil-2' />
        <circle r={MOUTH - 2.4} fill='url(#tl-theatre-glow)' />
        <path
          d={`M${-reach} ${chord} A${MOUTH - 2.4} ${MOUTH - 2.4} 0 0 0 ${reach} ${chord}z`}
          className='fill-tl-sand'
          opacity={0.7}
        />
        <circle
          r={MOUTH * 0.58}
          cx={7}
          cy={-7}
          className='fill-none stroke-tl-sand'
          strokeOpacity={0.35}
          strokeWidth={1.2}
        />
        <circle
          r={MOUTH}
          className='fill-none stroke-tl-trunk'
          strokeOpacity={0.6}
          strokeWidth={1.2}
        />
      </g>
    </g>
  );
}
