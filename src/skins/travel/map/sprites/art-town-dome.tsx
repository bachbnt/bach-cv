/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { pt, rad, type Pt } from '@/skins/travel/map/sprites/art-town-math';

/**
 * The lobed roof of a round hall: a dome cut into `lobes` petals, each with a scalloped eave. (cx, cy) is the centre of the eave
 * ellipse of radius `rx`; only the front half is drawn. `gradientId` is the id of the lit-to-shaded overlay it defines.
 */
export function LobedDome({
  cx,
  cy,
  rx,
  rise,
  lobes,
  gradientId,
}: {
  cx: number;
  cy: number;
  rx: number;
  rise: number;
  lobes: number;
  gradientId: string;
}) {
  const ry = rx / 2;
  const apex: Pt = [cx, cy - rise];
  const angles = Array.from(
    { length: lobes + 1 },
    (_, k) => -90 + (k * 180) / lobes,
  );
  const onDome = (deg: number, rho: number): Pt => [
    cx + rx * rho * Math.sin(rad(deg)),
    cy + ry * rho * Math.cos(rad(deg)) - rise * Math.sqrt(1 - rho * rho),
  ];
  const eave = angles.map((deg) => onDome(deg, 1));
  // Control point of the rib that passes through the dome at 55 % of the radius.
  const rib = angles.map((deg, k): Pt => {
    const m = onDome(deg, 0.55);
    return [
      2 * m[0] - (apex[0] + eave[k][0]) / 2,
      2 * m[1] - (apex[1] + eave[k][1]) / 2,
    ];
  });
  const scallop = (k: number): Pt => {
    const mid = (angles[k] + angles[k + 1]) / 2;
    return [
      (eave[k][0] + eave[k + 1][0]) / 2 + 4 * Math.sin(rad(mid)),
      (eave[k][1] + eave[k + 1][1]) / 2 + 3.6 * Math.cos(rad(mid)) + 0.8,
    ];
  };
  const lobe = (k: number) =>
    `M${pt(apex)}Q${pt(rib[k])} ${pt(eave[k])}Q${pt(scallop(k))} ${pt(eave[k + 1])}Q${pt(rib[k + 1])} ${pt(apex)}z`;
  const chain = Array.from(
    { length: lobes },
    (_, k) => `Q${pt(scallop(k))} ${pt(eave[k + 1])}`,
  ).join('');
  const outline = `M${pt(apex)}Q${pt(rib[0])} ${pt(eave[0])}${chain}Q${pt(rib[lobes])} ${pt(apex)}z`;
  const ring = (rho: number, from: number, to: number) => {
    const steps = 8;
    return Array.from({ length: steps + 1 }, (_, i) => {
      const p = onDome(from + ((to - from) * i) / steps, rho);
      return `${i === 0 ? 'M' : 'L'}${pt(p)}`;
    }).join('');
  };
  return (
    <g>
      <defs>
        <linearGradient id={gradientId} x1={0} y1={0} x2={1} y2={0}>
          <stop
            offset={0}
            style={{ stopColor: 'var(--tl-foam)', stopOpacity: 0.4 }}
          />
          <stop
            offset={0.4}
            style={{ stopColor: 'var(--tl-foam)', stopOpacity: 0 }}
          />
          <stop
            offset={0.62}
            style={{ stopColor: 'var(--tl-soil-2)', stopOpacity: 0 }}
          />
          <stop
            offset={1}
            style={{ stopColor: 'var(--tl-soil-2)', stopOpacity: 0.4 }}
          />
        </linearGradient>
      </defs>
      <path
        d={outline}
        transform='translate(0 2.4)'
        className='fill-tl-soil-2'
        opacity={0.55}
      />
      {Array.from({ length: lobes }, (_, k) => (
        <path
          key={k}
          d={lobe(k)}
          className={k % 2 === 0 ? 'fill-tl-brick' : 'fill-tl-roof'}
        />
      ))}
      <path d={outline} fill={`url(#${gradientId})`} />
      <path
        d={eave.map((e) => `M${pt(apex)}L${pt(e)}`).join('')}
        className='fill-none stroke-tl-soil-2'
        strokeWidth={0.8}
        strokeOpacity={0.3}
      />
      <path
        d={ring(0.4, -90, 90) + ring(0.66, -90, 90) + ring(0.86, -90, 90)}
        className='fill-none stroke-tl-soil-2'
        strokeWidth={0.6}
        strokeOpacity={0.16}
      />
      <path
        d={`M${pt(onDome(-48, 0.28))}Q${pt(onDome(-44, 0.55))} ${pt(onDome(-42, 0.82))}`}
        className='fill-none stroke-tl-foam'
        strokeWidth={2}
        strokeLinecap='round'
        strokeOpacity={0.5}
      />
      <path
        d={`M${pt(eave[0])}${chain}`}
        className='fill-none stroke-tl-soil-2'
        strokeWidth={1.1}
        strokeOpacity={0.4}
        strokeLinejoin='round'
      />
    </g>
  );
}
