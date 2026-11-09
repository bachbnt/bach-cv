/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { ReactNode } from 'react';

/**
 * Shared pieces of the sprite drawings. The light comes from the upper left: the left face of a box is lit, the right face is
 * shaded by a dark wash (`fill-tl-soil-2` with an opacity, dark in day and night) and the top gets a pale wash, so any token colour
 * works as a wall without a second "dark" token.
 */

const SKEW = 26.57; // degrees: the slope of an edge of an isometric box (1 up for 2 across)
const TAN = 0.5;

/** Class names are written whole so Tailwind finds them. */
export const WASH_DARK = 'fill-tl-soil-2';
export const WASH_LIGHT = 'fill-tl-foam';

export interface BoxShape {
  /** x of the front (lowest) corner. */
  cx: number;
  /** y of the front corner on the ground. */
  y: number;
  /** Width of the left face (the façade side): a point of it is at x in [-wl / 2, wl / 2] around its middle. */
  wl: number;
  /** Width of the right face. */
  wr: number;
  h: number;
}

const pts = (list: readonly (readonly [number, number])[]) =>
  list.map((p) => `${p[0]},${p[1]}`).join(' ');

/** The four corners of the top of a box: left, front, right, back. */
export function topCorners({ cx, y, wl, wr, h }: BoxShape) {
  const t = y - h;
  return {
    a: [cx - wl, t - wl * TAN] as const,
    b: [cx, t] as const,
    c: [cx + wr, t - wr * TAN] as const,
    d: [cx + wr - wl, t - (wl + wr) * TAN] as const,
  };
}

/** A box with a lit left face, a shaded right face and a pale top. `wall` is a `fill-tl-*` class. */
export function Box({
  shape,
  wall,
  top = wall,
  shade = 0.27,
}: {
  shape: BoxShape;
  wall: string;
  top?: string;
  shade?: number;
}) {
  const { cx, y, wl, wr } = shape;
  const t = topCorners(shape);
  const left = pts([[cx - wl, y - wl * TAN], [cx, y], t.b, t.a]);
  const right = pts([[cx, y], [cx + wr, y - wr * TAN], t.c, t.b]);
  return (
    <g>
      <polygon points={left} className={wall} />
      <polygon points={right} className={wall} />
      <polygon points={right} className={WASH_DARK} opacity={shade} />
      <polygon points={pts([t.a, t.b, t.c, t.d])} className={top} />
      {top === wall && (
        <polygon
          points={pts([t.a, t.b, t.c, t.d])}
          className={WASH_LIGHT}
          opacity={0.3}
        />
      )}
    </g>
  );
}

/**
 * A roof over a box: a gable (the end over the left face is a wall triangle) or a hip (the end is roof too). The ridge runs along
 * the right face. `rise` is the height of the ridge; `curve` > 0 gives the eaves a sag with upturned corners (a pagoda roof).
 */
export function Roof({
  shape,
  roof,
  gable = false,
  rise,
  end,
  curve = 0,
}: {
  shape: BoxShape;
  roof: string;
  gable?: boolean;
  rise: number;
  end?: string;
  curve?: number;
}) {
  const t = topCorners(shape);
  const k = gable ? 0.5 : (shape.wr - shape.wl) / (2 * shape.wr);
  const ox = (t.a[0] + t.c[0]) / 2;
  const oy = (t.a[1] + t.c[1]) / 2;
  const vx = shape.wr;
  const vy = -shape.wr * TAN;
  const r1: readonly [number, number] = [ox - vx * k, oy - vy * k - rise];
  const r2: readonly [number, number] = [ox + vx * k, oy + vy * k - rise];
  const up = curve * 0.7;
  const lift = (p: readonly [number, number]) => [p[0], p[1] - up] as const;
  const [a, b, c] = [lift(t.a), lift(t.b), lift(t.c)];
  const sag = (p: readonly [number, number], q: readonly [number, number]) =>
    `Q${(p[0] + q[0]) / 2} ${(p[1] + q[1]) / 2 + curve}`;
  const front = `M${b} ${sag(b, c)} ${c} L${r2} L${r1}z`;
  const gableEnd = `M${a} ${sag(a, b)} ${b} L${r1}z`;
  return (
    <g>
      <path d={`M${a} L${t.d} L${c} L${r2} L${r1}z`} className={roof} />
      <path
        d={`M${a} L${t.d} L${c} L${r2} L${r1}z`}
        className={WASH_DARK}
        opacity={0.12}
      />
      <path d={gableEnd} className={gable ? (end ?? roof) : roof} />
      {!gable && <path d={gableEnd} className={WASH_LIGHT} opacity={0.22} />}
      <path d={front} className={roof} />
      <path d={front} className={WASH_DARK} opacity={0.24} />
      <polyline
        points={pts([a, r1, r2])}
        className='fill-none stroke-tl-soil-2'
        strokeOpacity={0.25}
        strokeWidth={0.8}
        strokeLinejoin='round'
      />
    </g>
  );
}

/** Places children on the left (lit) or right face of a box, `at` runs from 0 (outer edge) to 1 (front corner), the origin is on the ground. */
export function OnFace({
  shape,
  side,
  at,
  children,
}: {
  shape: BoxShape;
  side: 'l' | 'r';
  at: number;
  children: ReactNode;
}) {
  const { cx, y, wl, wr } = shape;
  const x = side === 'l' ? cx - wl + at * wl : cx + at * wr;
  const gy = side === 'l' ? y - wl * TAN + at * wl * TAN : y - at * wr * TAN;
  return (
    <g
      transform={`translate(${x} ${gy}) skewY(${side === 'l' ? SKEW : -SKEW})`}
    >
      {children}
    </g>
  );
}

/** A window with an optional pair of shutters, standing on its own origin (use inside `OnFace`). */
export function Win({
  x,
  y,
  w = 6,
  h = 9,
  shutters = false,
  arch = false,
}: {
  x: number;
  y: number;
  w?: number;
  h?: number;
  shutters?: boolean;
  arch?: boolean;
}) {
  return (
    <g>
      {shutters && (
        <g className='fill-tl-teal'>
          <rect x={x - w / 2 - 2.4} y={y - h} width={2.2} height={h} />
          <rect x={x + w / 2 + 0.2} y={y - h} width={2.2} height={h} />
        </g>
      )}
      {arch ? (
        <path
          d={`M${x - w / 2} ${y} v${-(h - w / 2)} a${w / 2} ${w / 2} 0 0 1 ${w} 0 v${h - w / 2}z`}
          className='fill-tl-glass'
        />
      ) : (
        <rect
          x={x - w / 2}
          y={y - h}
          width={w}
          height={h}
          rx={0.8}
          className='fill-tl-glass'
        />
      )}
      <path
        d={`M${x - w / 2} ${y - h * 0.5} h${w}`}
        className='stroke-tl-soil-2'
        strokeOpacity={0.35}
        strokeWidth={0.6}
      />
    </g>
  );
}

/** A cylinder (round hall, hut, tower): body, shaded flank and top, `wall` is a `fill-tl-*` class. */
export function Cylinder({
  cx,
  y,
  r,
  h,
  wall,
  top = wall,
}: {
  cx: number;
  y: number;
  r: number;
  h: number;
  wall: string;
  top?: string;
}) {
  const ry = r * 0.5;
  const u = 0.3 * r;
  const dy = ry * Math.sqrt(1 - 0.09);
  const flank = `M${cx + u} ${y - h + dy} A${r} ${ry} 0 0 0 ${cx + r} ${y - h} L${cx + r} ${y} A${r} ${ry} 0 0 1 ${cx + u} ${y + dy}z`;
  return (
    <g>
      <path
        d={`M${cx - r} ${y - h} L${cx - r} ${y} A${r} ${ry} 0 0 0 ${cx + r} ${y} L${cx + r} ${y - h}z`}
        className={wall}
      />
      <path d={flank} className={WASH_DARK} opacity={0.22} />
      <ellipse cx={cx} cy={y - h} rx={r} ry={ry} className={top} />
      {top === wall && (
        <ellipse
          cx={cx}
          cy={y - h}
          rx={r}
          ry={ry}
          className={WASH_LIGHT}
          opacity={0.3}
        />
      )}
    </g>
  );
}

/** The soft shadow a sight casts on the ground. */
export function Shadow({
  rx = 46,
  ry = 11,
  cx = 80,
  cy = 147,
}: {
  rx?: number;
  ry?: number;
  cx?: number;
  cy?: number;
}) {
  return (
    <ellipse
      cx={cx}
      cy={cy}
      rx={rx}
      ry={ry}
      className={WASH_DARK}
      opacity={0.3}
    />
  );
}

/** A palm: a leaning trunk and a crown of fronds (the same shape as the one of the city layer, richer). */
export function Palm({
  x,
  y,
  s = 1,
  lean = 1,
}: {
  x: number;
  y: number;
  s?: number;
  lean?: 1 | -1;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s * lean} ${s})`}>
      <path
        d='M0 0 Q4 -14 1 -30'
        className='fill-none stroke-tl-trunk'
        strokeWidth={3}
        strokeLinecap='round'
      />
      <g transform='translate(1 -30)'>
        <path d='M0 0 q-14 -4 -21 6 q10 -6 21 -3z' className='fill-tl-leaf' />
        <path d='M0 0 q-6 -12 -2 -19 q6 8 2 19z' className='fill-tl-leaf' />
        <path d='M0 0 q14 -5 22 4 q-11 -6 -22 -1z' className='fill-tl-leaf' />
        <path d='M0 0 q6 -12 14 -14 q-3 9 -14 14z' className='fill-tl-leaf' />
        <path d='M0 0 q-12 -10 -18 -9 q8 10 18 9z' className='fill-tl-leaf' />
        <path
          d='M0 0 q-14 -4 -21 6 q10 -6 21 -3z'
          className={WASH_DARK}
          opacity={0.18}
        />
        <path
          d='M0 0 q14 -5 22 4 q-11 -6 -22 -1z'
          className={WASH_DARK}
          opacity={0.22}
        />
        <circle cx={1} cy={1} r={1.6} className='fill-tl-trunk' />
      </g>
    </g>
  );
}

/** A round tree: trunk and a crown lit from the upper left. */
export function Tree({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-1.2} y={-7} width={2.4} height={7} className='fill-tl-trunk' />
      <ellipse cx={0} cy={-12} rx={8} ry={8.5} className='fill-tl-leaf' />
      <ellipse
        cx={2.5}
        cy={-10}
        rx={5.6}
        ry={6.4}
        className={WASH_DARK}
        opacity={0.2}
      />
      <ellipse
        cx={-2.6}
        cy={-14.4}
        rx={3.4}
        ry={3}
        className={WASH_LIGHT}
        opacity={0.28}
      />
    </g>
  );
}

/** A rounded boulder: dark base, a lighter shape pushed to the upper left, so the lower right is in shade. */
export function Boulder({
  x,
  y,
  rx,
  ry,
  lit = 'fill-tl-rock-2',
  dark = 'fill-tl-rock',
}: {
  x: number;
  y: number;
  rx: number;
  ry: number;
  lit?: string;
  dark?: string;
}) {
  const d = `M${-rx} 0 C${-rx * 1.1} ${-ry * 1.5} ${rx * 0.5} ${-ry * 1.7} ${rx * 0.95} ${-ry * 0.7} Q${rx * 1.08} ${-ry * 0.2} ${rx} 0Z`;
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d={d} className={dark} />
      <path
        d={d}
        className={lit}
        transform={`translate(${-rx * 0.1} ${-ry * 0.06}) scale(0.88 0.86)`}
      />
      <path
        d={`M${-rx * 0.3} ${-ry * 1.05} q${rx * 0.12} ${ry * 0.5} ${-rx * 0.04} ${ry * 0.95}`}
        className='fill-none stroke-tl-soil-2'
        strokeOpacity={0.28}
        strokeWidth={0.9}
        strokeLinecap='round'
      />
    </g>
  );
}

/** A grassy mound: dark body and a lit cap. Stands on y with its width `w` and height `h`. */
export function Mound({
  x,
  y,
  w,
  h,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
}) {
  const body = `M${-w / 2} 0 C${-w * 0.42} ${-h * 1.1} ${w * 0.42} ${-h * 1.1} ${w / 2} 0 Q0 ${h * 0.22} ${-w / 2} 0Z`;
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d={body} className='fill-tl-hill-w' />
      <path
        d={body}
        className='fill-tl-hill-s'
        transform={`translate(${-w * 0.03} ${-h * 0.03}) scale(0.9 0.86)`}
      />
      <path
        d={`M${-w * 0.2} ${-h * 0.82} q${w * 0.12} ${-h * 0.14} ${w * 0.26} ${-h * 0.04}`}
        className='fill-none stroke-tl-hill-t'
        strokeWidth={2}
        strokeLinecap='round'
        opacity={0.8}
      />
    </g>
  );
}
