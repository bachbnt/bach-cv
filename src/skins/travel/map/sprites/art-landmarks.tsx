/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import {
  Box,
  Boulder,
  Mound,
  OnFace,
  Roof,
  Shadow,
  Tree,
  WASH_DARK,
  WASH_LIGHT,
  topCorners,
  type BoxShape,
} from '@/skins/travel/map/sprites/art-parts';

const TIERS = [
  { k: 1, h: 0.36 },
  { k: 0.8, h: 0.22 },
  { k: 0.62, h: 0.18 },
  { k: 0.44, h: 0.14 },
] as const;

/** One tapering brick tower of Po Nagar: a door block and three tiers, each with a ledge, and a finial. */
function ChamTower({
  cx,
  y,
  w,
  h,
}: {
  cx: number;
  y: number;
  w: number;
  h: number;
}) {
  const tiers = TIERS.reduce<
    { shape: BoxShape; tw: number; th: number; i: number; next: number }[]
  >((acc, t, i) => {
    const tw = w * t.k;
    const th = h * t.h;
    const base = acc.length === 0 ? y : acc[acc.length - 1].next;
    const nextW = w * (TIERS[i + 1]?.k ?? t.k * 0.7);
    acc.push({
      shape: { cx, y: base, wl: tw, wr: tw, h: th },
      tw,
      th,
      i,
      next: base - th - (tw - nextW) / 2,
    });
    return acc;
  }, []);
  const last = tiers[tiers.length - 1];
  const top = last.next - last.tw * 0.35;
  const f = last.tw;
  return (
    <g>
      {tiers.map(({ shape, tw, th, i }) => (
        <g key={i}>
          <Box shape={shape} wall='fill-tl-brick' />
          <OnFace shape={shape} side='l' at={0.5}>
            {i === 0 ? (
              <path
                d={`M${-tw * 0.2} 0 V${-th * 0.55} a${tw * 0.2} ${tw * 0.2} 0 0 1 ${tw * 0.4} 0 V0z`}
                className='fill-tl-soil-2'
              />
            ) : (
              <rect
                x={-tw * 0.14}
                y={-th * 0.8}
                width={tw * 0.28}
                height={th * 0.5}
                rx={tw * 0.1}
                className='fill-tl-soil-2'
                opacity={0.45}
              />
            )}
          </OnFace>
          <Box
            shape={{
              cx: shape.cx,
              y: shape.y - th + 1.1,
              wl: tw + 2.2,
              wr: tw + 2.2,
              h: 2.2,
            }}
            wall='fill-tl-roof'
          />
        </g>
      ))}
      <ellipse
        cx={cx}
        cy={top + 1}
        rx={f * 0.75}
        ry={f * 0.38}
        className='fill-tl-brick'
      />
      <path
        d={`M${cx} ${top - f * 1.7} Q${cx + f * 0.75} ${top - f * 0.4} ${cx + f * 0.75} ${top + 1} h${-f * 1.5} Q${cx - f * 0.75} ${top - f * 0.4} ${cx} ${top - f * 1.7}z`}
        className='fill-tl-roof'
      />
      <path
        d={`M${cx} ${top - f * 1.7} Q${cx + f * 0.75} ${top - f * 0.4} ${cx + f * 0.75} ${top + 1} h${-f * 0.75}z`}
        className={WASH_DARK}
        opacity={0.25}
      />
    </g>
  );
}

/** Po Nagar: three Cham brick towers of different heights on a small hill. */
export function ChamTowersArt() {
  return (
    <g>
      <Shadow rx={56} />
      <Mound x={80} y={149} w={124} h={44} />
      <Tree x={22} y={146} s={0.8} />
      <Tree x={138} y={146} s={0.7} />
      <ChamTower cx={52} y={132} w={11} h={52} />
      <ChamTower cx={112} y={130} w={10} h={44} />
      <ChamTower cx={80} y={124} w={15} h={78} />
      <Boulder x={34} y={148} rx={7} ry={4} />
    </g>
  );
}

/** A pointed (Gothic) window or door whose foot is on (x, y). */
function Gothic({
  x,
  y,
  w,
  h,
  fill = 'fill-tl-soil-2',
  opacity = 0.7,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  fill?: string;
  opacity?: number;
}) {
  const s = h - w * 0.9;
  return (
    <path
      d={`M${x - w / 2} ${y} v${-s} Q${x - w / 2} ${y - h + w * 0.2} ${x} ${y - h} Q${x + w / 2} ${y - h + w * 0.2} ${x + w / 2} ${y - s} v${s}z`}
      className={fill}
      opacity={opacity}
    />
  );
}

/** Nha Trang Cathedral: a grey stone church on a rise, a gable nave and a tall bell tower with a pointed spire and a cross. */
export function CathedralArt() {
  const nave: BoxShape = { cx: 90, y: 138, wl: 20, wr: 46, h: 30 };
  const tower: BoxShape = { cx: 76, y: 144, wl: 13, wr: 13, h: 62 };
  const tt = topCorners(tower);
  const centre = (tt.a[1] + tt.d[1]) / 2;
  const sx = tower.cx;
  return (
    <g>
      <Shadow rx={58} />
      <Mound x={80} y={149} w={128} h={26} />
      <Tree x={20} y={146} s={0.8} />
      <Tree x={142} y={144} s={0.75} />
      <Box shape={nave} wall='fill-tl-rock-2' />
      <OnFace shape={nave} side='r' at={0.5}>
        {[-16.5, -5.5, 5.5, 16.5].map((x) => (
          <Gothic key={x} x={x} y={-5} w={5} h={13} />
        ))}
      </OnFace>
      <Roof
        shape={nave}
        roof='fill-tl-rock'
        rise={15}
        gable
        end='fill-tl-rock-2'
      />
      <OnFace shape={nave} side='l' at={0.5}>
        <circle cx={0} cy={-39} r={4} className='fill-tl-glass' />
        <circle
          cx={0}
          cy={-39}
          r={4}
          className='fill-none stroke-tl-rock'
          strokeWidth={1}
        />
      </OnFace>
      <Box
        shape={{ cx: tower.cx - 3, y: 151, wl: 20, wr: 12, h: 2.4 }}
        wall='fill-tl-rock-2'
      />
      <Box
        shape={{ cx: tower.cx - 2, y: 148, wl: 16, wr: 9, h: 2.4 }}
        wall='fill-tl-rock-2'
      />
      <Box shape={tower} wall='fill-tl-rock-2' />
      <OnFace shape={tower} side='l' at={0.5}>
        <Gothic x={0} y={0} w={7} h={14} />
        <Gothic x={0} y={-24} w={5} h={11} opacity={0.5} />
        <Gothic x={0} y={-47} w={6} h={12} />
      </OnFace>
      <OnFace shape={tower} side='r' at={0.5}>
        <Gothic x={0} y={-24} w={5} h={11} opacity={0.5} />
        <Gothic x={0} y={-47} w={6} h={12} />
      </OnFace>
      <polygon
        points={`${tt.a} ${tt.b} ${sx},${centre - 32}`}
        className='fill-tl-rock'
      />
      <polygon
        points={`${tt.b} ${tt.c} ${sx},${centre - 32}`}
        className='fill-tl-rock'
      />
      <polygon
        points={`${tt.b} ${tt.c} ${sx},${centre - 32}`}
        className={WASH_DARK}
        opacity={0.3}
      />
      <polygon
        points={`${tt.a} ${tt.b} ${sx},${centre - 32}`}
        className={WASH_LIGHT}
        opacity={0.18}
      />
      <path
        d={`M${sx} ${centre - 32} v-11 M${sx - 3.5} ${centre - 39} h7`}
        className='fill-none stroke-tl-sun'
        strokeWidth={1.8}
        strokeLinecap='round'
      />
    </g>
  );
}

const PETALS: readonly { a: number; l: number; w: number; tone: string }[] = [
  { a: -62, l: 28, w: 9, tone: 'fill-tl-coral-2' },
  { a: 62, l: 28, w: 9, tone: 'fill-tl-coral-2' },
  { a: -34, l: 38, w: 9, tone: 'fill-tl-coral-2' },
  { a: 34, l: 38, w: 9, tone: 'fill-tl-coral' },
  { a: -13, l: 46, w: 8.5, tone: 'fill-tl-coral' },
  { a: 13, l: 46, w: 8.5, tone: 'fill-tl-coral' },
];

/** Tram Huong tower: a slender tower on a round podium with a viewing drum, topped by an opening lotus. */
export function LotusTowerArt() {
  const shade = 'M80 70 L86.5 70 L89 142 L80 144z';
  return (
    <g>
      <Shadow rx={44} />
      <ellipse cx={80} cy={143} rx={40} ry={11} className='fill-tl-river' />
      <ellipse cx={80} cy={141} rx={34} ry={8.5} className='fill-tl-sand' />
      <ellipse cx={80} cy={139} rx={26} ry={6.5} className='fill-tl-stone' />
      <ellipse cx={80} cy={137} rx={20} ry={5} className='fill-tl-wall' />
      <path d='M71 136 L76 70 H84 L89 136z' className='fill-tl-wall' />
      <path d={shade} className={WASH_DARK} opacity={0.2} />
      <path
        d='M76 70 H84 L83.4 82 H76.6z'
        className={WASH_LIGHT}
        opacity={0.35}
      />
      {[78, 92, 108, 122].map((y) => (
        <rect
          key={y}
          x={75 + (y - 70) * 0.08}
          y={y}
          width={10 - (y - 70) * 0.16}
          height={5}
          rx={0.8}
          className='fill-tl-glass'
          opacity={0.9}
        />
      ))}
      <g>
        <path
          d='M65 98 Q80 107 95 98 L96 94 Q80 89 64 94z'
          className='fill-tl-stone'
        />
        <path
          d='M65 98 Q80 107 95 98 L96 94 Q80 100 64 94z'
          className={WASH_LIGHT}
          opacity={0.3}
        />
        <path
          d='M66 96 Q80 104 94 96'
          className='fill-none stroke-tl-glass'
          strokeWidth={2.4}
        />
      </g>
      <g transform='translate(80 70)'>
        {PETALS.map((p) => (
          <g key={p.a} transform={`rotate(${p.a})`}>
            <path
              d={`M0 0 C${-p.w} ${-p.l * 0.3} ${-p.w * 0.8} ${-p.l * 0.8} 0 ${-p.l} C${p.w * 0.8} ${-p.l * 0.8} ${p.w} ${-p.l * 0.3} 0 0z`}
              className={p.tone}
            />
            <path
              d={`M0 0 C${-p.w} ${-p.l * 0.3} ${-p.w * 0.8} ${-p.l * 0.8} 0 ${-p.l} Q${-p.w * 0.2} ${-p.l * 0.5} 0 0z`}
              className={WASH_LIGHT}
              opacity={0.35}
            />
            {p.a > 0 && (
              <path
                d={`M0 0 C${p.w} ${-p.l * 0.3} ${p.w * 0.8} ${-p.l * 0.8} 0 ${-p.l} Q${p.w * 0.2} ${-p.l * 0.5} 0 0z`}
                className={WASH_DARK}
                opacity={0.2}
              />
            )}
          </g>
        ))}
        <circle cx={0} cy={-47} r={1.8} className='fill-tl-sun' />
      </g>
    </g>
  );
}
