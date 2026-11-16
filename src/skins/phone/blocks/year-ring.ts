/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

/** The radius of the ring in a `0 0 100 100` box; the stroke grows inwards and outwards from it. */
export const RING_RADIUS = 42;

/** From and to, in degrees clockwise from the top. */
export interface RingArc {
  from: number;
  to: number;
}

export interface Ring {
  /** the width of the stroke in the box: thinner when there are many arcs */
  stroke: number;
  /** one unbroken circle (a single year, or too many years for arcs that can be told apart) */
  full: boolean;
  arcs: RingArc[];
}

/** Up to this many years the arcs are wide, up to `MOST` they are thin, and beyond it the ring is one circle. */
const WIDE = 12;
const MOST = 24;

/**
 * The segmented ring of the years widget, one arc for each year of the career, the first at the top and going clockwise, with a gap
 * between them. Purely the shape of the picture: the number of years is the datum (`careerYears`).
 */
export function ringOf(years: number): Ring {
  if (years <= 0) return { stroke: 9, full: false, arcs: [] };
  if (years === 1) return { stroke: 9, full: true, arcs: [] };
  if (years > MOST) return { stroke: 6, full: true, arcs: [] };
  const wide = years <= WIDE;
  const gap = wide ? 6 : 3;
  const step = 360 / years;
  return {
    stroke: wide ? 9 : 6,
    full: false,
    arcs: Array.from({ length: years }, (_, index) => ({
      from: index * step + gap / 2,
      to: (index + 1) * step - gap / 2,
    })),
  };
}

const point = (degrees: number, radius: number) => {
  const radians = (degrees * Math.PI) / 180;
  return [50 + radius * Math.sin(radians), 50 - radius * Math.cos(radians)];
};

/** The SVG path of an arc of the ring (`M x y A r r 0 large 1 x y`). */
export function arcPath(arc: RingArc, radius = RING_RADIUS): string {
  const [x1, y1] = point(arc.from, radius);
  const [x2, y2] = point(arc.to, radius);
  const large = arc.to - arc.from > 180 ? 1 : 0;
  const f = (n: number) => n.toFixed(2);
  return `M ${f(x1)} ${f(y1)} A ${radius} ${radius} 0 ${large} 1 ${f(x2)} ${f(y2)}`;
}
