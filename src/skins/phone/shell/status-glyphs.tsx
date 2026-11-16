/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { cn } from '@/lib/utils';
import { batteryTone, WIFI_MAX } from '@/skins/phone/shell/status-sim';
import { useStatusSim } from '@/skins/phone/shell/use-status-sim';

/** the bars of the mobile data: their tops, tallest last */
const BARS = [
  { x: 0, y: 8, height: 4 },
  { x: 5, y: 5.5, height: 6.5 },
  { x: 10, y: 3, height: 9 },
  { x: 15, y: 0, height: 12 },
] as const;
/** the arcs of the Wi-Fi, the smallest first; the dot under them is always there */
const ARCS = [
  'M5.88 7.88A3 3 0 0 1 10.12 7.88',
  'M3.76 5.76A6 6 0 0 1 12.24 5.76',
  'M1.64 3.64A9 9 0 0 1 14.36 3.64',
] as const;
/** the width of a full fill of the battery, in the units of its drawing */
const FILL = 17.8;
/** the bolt, and where it is drawn: for a normal charge (one, at the middle of the body) and for a fast one (two) */
const BOLT = 'M12.6 2.4 8.4 6.5h2.5l-.7 3.2 4.3-4.2h-2.5z';
const BOLT_X = [
  { normal: 0.85, fast: -2.6 },
  { normal: 0.85, fast: 4.3 },
] as const;
/** what is not lit is the same shape, dimmed */
const OFF = 'opacity-30';
const FADE =
  'transition-opacity duration-[280ms] motion-reduce:transition-none';

/**
 * The signal, Wi-Fi and battery glyphs of a status bar, drawn as SVG in the ink of the bar, and ALIVE: what they draw is the small story of
 * `status-sim.ts` (the mobile data and the Wi-Fi rise and fall, the battery drains, is charged and drains again). Decoration: nothing here is a reading
 * of the device, and nothing is announced (the quick settings read the same state out, `status-summary.tsx`). The fill of the battery is a `scaleX`
 * of an inline rect, with its colour, so a change moves nothing around it; for a visitor who asks for less motion it is still (and the transitions are off).
 */
export function StatusGlyphs() {
  const { level, chargeMode, signal, wifi } = useStatusSim();
  const tone = batteryTone({ level, chargeMode });
  const fast = chargeMode === 'fast';
  return (
    <span
      aria-hidden='true'
      className='inline-flex items-center gap-2 [&_svg]:h-3 [&_svg]:w-auto'
    >
      <svg
        data-ph-signal=''
        data-level={signal}
        focusable='false'
        viewBox='0 0 18 12'
        fill='currentColor'
      >
        {BARS.map((bar, index) => (
          <rect
            key={bar.x}
            x={bar.x}
            y={bar.y}
            width='3'
            height={bar.height}
            rx='1'
            className={cn(FADE, index >= signal && OFF)}
          />
        ))}
      </svg>
      <svg
        data-ph-wifi=''
        data-level={wifi}
        focusable='false'
        viewBox='0 0 16 12'
        fill='none'
        stroke='currentColor'
        strokeWidth='1.8'
        strokeLinecap='round'
      >
        {ARCS.slice(0, WIFI_MAX).map((path, index) => (
          <path
            key={path}
            d={path}
            className={cn(FADE, index >= wifi && OFF)}
          />
        ))}
        <circle cx='8' cy='10' r='1.1' fill='currentColor' stroke='none' />
      </svg>
      <svg
        data-ph-battery=''
        data-level={level}
        data-charge={chargeMode ?? ''}
        data-tone={tone}
        focusable='false'
        viewBox='0 0 26 12'
        fill='currentColor'
      >
        <rect
          x='.75'
          y='.75'
          width='21.5'
          height='10.5'
          rx='3.2'
          fill='none'
          stroke='currentColor'
          opacity='.55'
          strokeWidth='1.5'
        />
        <rect
          x='2.6'
          y='2.6'
          width={FILL}
          height='6.8'
          rx='1.7'
          className={cn(
            'transition-[transform,fill] duration-[280ms] motion-reduce:transition-none',
            tone === 'danger' && 'fill-ph-danger',
            tone === 'ok' && 'fill-ph-ok',
          )}
          style={{
            transform: `scaleX(${level / 100})`,
            transformOrigin: '2.6px 6px',
          }}
        />
        {/* the bolt of a charge: one bolt in the middle of the body for a normal charge, two side by side for a fast one (the same shape, moved) */}
        {BOLT_X.map((x, index) => {
          const shown = index === 0 ? chargeMode !== null : fast;
          return (
            <path
              key={index}
              d={BOLT}
              data-ph-bolt=''
              strokeWidth='.7'
              strokeLinejoin='round'
              className='fill-ph-sheet stroke-ph-ok transition-[opacity,transform] duration-[280ms] motion-reduce:transition-none'
              style={{
                opacity: shown ? 1 : 0,
                transform: `translateX(${fast ? x.fast : x.normal}px)`,
              }}
            />
          );
        })}
        <path
          d='M24 4v4'
          stroke='currentColor'
          strokeLinecap='round'
          strokeWidth='1.6'
          opacity='.55'
        />
      </svg>
    </span>
  );
}
