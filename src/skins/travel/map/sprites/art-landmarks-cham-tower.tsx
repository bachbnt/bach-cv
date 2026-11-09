/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import {
  OnFace,
  WASH_DARK,
  WASH_LIGHT,
  type BoxShape,
} from '@/skins/travel/map/sprites/art-parts';

/** The width of a level (as a share of the tower body) and its height (in body widths): the body, then the tiers. */
const LEVELS = [
  { k: 1, h: 2 },
  { k: 0.78, h: 1.1 },
  { k: 0.58, h: 0.85 },
  { k: 0.38, h: 0.65 },
] as const;
const TAPER = 0.95;

interface Level {
  w0: number;
  w1: number;
  /** y of the centre of the bottom and of the top of the level. */
  c0: number;
  c1: number;
  h: number;
}

const p = (x: number, y: number) => `${x},${y}`;

/** A pointed arch (the shape of a kalan door and of its false doors) standing on (x, y). */
function arch(x: number, y: number, w: number, h: number) {
  const s = y - h * 0.55;
  return `M${x - w / 2} ${y} V${s} Q${x - w / 2} ${y - h * 0.9} ${x} ${y - h} Q${x + w / 2} ${y - h * 0.9} ${x + w / 2} ${s} V${y}z`;
}

/** Rows of brick on a face (the face is flat, `OnFace` slopes it). */
function courses(w: number, h: number) {
  const rows: string[] = [];
  for (let y = -3; y > -h + 1; y -= 3.2) rows.push(`M${-w / 2} ${y}h${w}`);
  return rows.join('');
}

/** Little towers on the corners of the ledge between two levels: a lit half, and the same shape under the shade wash. */
function cornerTowers(level: Level, upperW0: number) {
  const m = Math.max((level.w1 - upperW0) * 0.55, 1.2);
  const ht = m * 3.4;
  const reach = (level.w1 + upperW0) / 2;
  const spots: [number, number][] = [
    [-reach, level.c1],
    [0, level.c1 + reach / 2],
    [reach, level.c1],
  ];
  return spots.map(([dx, by]) => ({ dx, by, m, ht }));
}

/**
 * One kalan of Po Nagar: a square brick body with a tall pointed door, then tiers that shrink, each ringed by little towers on its
 * corners and carrying an arched niche, and a rounded finial. `cx`, `y` is the front corner on the ground, `w` the width of a face.
 */
export function ChamTower({
  cx,
  y,
  w,
  tiers,
  rich = false,
}: {
  cx: number;
  y: number;
  w: number;
  tiers: number;
  /** Niches on every tier and every face, and courses of brick: for the main tower only (a small one reads as a plain tower). */
  rich?: boolean;
}) {
  const levels = LEVELS.slice(0, tiers + 1).reduce<Level[]>((acc, l) => {
    const w0 = w * l.k;
    const c0 = acc.length === 0 ? y - w0 / 2 : acc[acc.length - 1].c1;
    const h = w * l.h;
    acc.push({ w0, w1: w0 * TAPER, c0, c1: c0 - h, h });
    return acc;
  }, []);
  const body = levels[0];
  const top = levels[levels.length - 1];
  const f = top.w1;
  const shapeOf = (l: Level): BoxShape => ({
    cx,
    y: l.c0 + l.w0 / 2,
    wl: l.w0,
    wr: l.w0,
    h: 0,
  });
  const ledges = levels.slice(1).map((l, i) => {
    const below = levels[i];
    const towers = cornerTowers(below, l.w0);
    const lit = towers
      .map(
        ({ dx, by, m, ht }) =>
          `M${cx + dx - m} ${by}L${cx + dx} ${by + m / 2}L${cx + dx + m} ${by}L${cx + dx} ${by - ht}z`,
      )
      .join('');
    const shaded = towers
      .map(
        ({ dx, by, m, ht }) =>
          `M${cx + dx} ${by + m / 2}L${cx + dx + m} ${by}L${cx + dx} ${by - ht}z`,
      )
      .join('');
    return { lit, shaded };
  });
  return (
    <g>
      {levels.map((l, i) => {
        const left = [
          p(cx - l.w0, l.c0),
          p(cx, l.c0 + l.w0 / 2),
          p(cx, l.c1 + l.w1 / 2),
          p(cx - l.w1, l.c1),
        ].join(' ');
        const right = [
          p(cx, l.c0 + l.w0 / 2),
          p(cx + l.w0, l.c0),
          p(cx + l.w1, l.c1),
          p(cx, l.c1 + l.w1 / 2),
        ].join(' ');
        const cap = [
          p(cx - l.w1, l.c1),
          p(cx, l.c1 + l.w1 / 2),
          p(cx + l.w1, l.c1),
          p(cx, l.c1 - l.w1 / 2),
        ].join(' ');
        const shape = shapeOf(l);
        const door = body.h * 0.74;
        return (
          <g key={i}>
            <polygon points={left} className='fill-tl-brick' />
            <polygon points={right} className='fill-tl-brick' />
            <polygon points={right} className={WASH_DARK} opacity={0.27} />
            <polygon points={cap} className='fill-tl-brick' />
            {(i === 0 || rich) && (
              <polygon points={cap} className={WASH_LIGHT} opacity={0.3} />
            )}
            {i === 0 && (
              <>
                {rich && (
                  <>
                    <OnFace shape={shape} side='l' at={0.5}>
                      <path
                        d={courses(l.w0, l.h)}
                        className='fill-none stroke-tl-soil-2'
                        strokeOpacity={0.16}
                        strokeWidth={0.5}
                      />
                    </OnFace>
                    <OnFace shape={shape} side='r' at={0.5}>
                      <path
                        d={courses(l.w0, l.h)}
                        className='fill-none stroke-tl-soil-2'
                        strokeOpacity={0.16}
                        strokeWidth={0.5}
                      />
                    </OnFace>
                  </>
                )}
                <OnFace shape={shape} side='l' at={0.5}>
                  <path
                    d={arch(0, 0, l.w0 * 0.62, door)}
                    className={WASH_LIGHT}
                    opacity={0.34}
                  />
                  <path
                    d={arch(0, 0, l.w0 * 0.4, door * 0.86)}
                    className='fill-tl-soil-2'
                    opacity={0.88}
                  />
                </OnFace>
                <OnFace shape={shape} side='r' at={0.5}>
                  <path
                    d={arch(0, 0, l.w0 * 0.34, door * 0.68)}
                    className='fill-tl-soil-2'
                    opacity={0.34}
                  />
                </OnFace>
              </>
            )}
            {i > 0 && rich && (
              <>
                <OnFace shape={shape} side='l' at={0.5}>
                  <path
                    d={arch(0, -l.h * 0.12, l.w0 * 0.34, l.h * 0.72)}
                    className='fill-tl-soil-2'
                    opacity={0.62}
                  />
                </OnFace>
                <OnFace shape={shape} side='r' at={0.5}>
                  <path
                    d={arch(0, -l.h * 0.12, l.w0 * 0.34, l.h * 0.72)}
                    className='fill-tl-soil-2'
                    opacity={0.3}
                  />
                </OnFace>
              </>
            )}
            {i > 0 && (i === 1 || rich) && (
              <>
                <path d={ledges[i - 1].lit} className='fill-tl-brick' />
                <path
                  d={ledges[i - 1].shaded}
                  className={WASH_DARK}
                  opacity={0.3}
                />
              </>
            )}
          </g>
        );
      })}
      <path
        d={`M${cx - f * 0.55} ${top.c1} Q${cx - f * 0.7} ${top.c1 - f * 0.9} ${cx} ${top.c1 - f * 1.5} Q${cx + f * 0.7} ${top.c1 - f * 0.9} ${cx + f * 0.55} ${top.c1}z`}
        className='fill-tl-brick'
      />
      <path
        d={`M${cx} ${top.c1 - f * 1.5} Q${cx + f * 0.7} ${top.c1 - f * 0.9} ${cx + f * 0.55} ${top.c1} L${cx} ${top.c1 + f * 0.25}z`}
        className={WASH_DARK}
        opacity={0.27}
      />
      <path
        d={`M${cx} ${top.c1 - f * 1.5} v${-f * 0.5}`}
        className='fill-none stroke-tl-soil-2'
        strokeOpacity={0.6}
        strokeWidth={0.9}
        strokeLinecap='round'
      />
    </g>
  );
}
