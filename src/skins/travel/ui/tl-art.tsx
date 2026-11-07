/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

/** Small trip drawings for the state screens (decoration, `aria-hidden`): an empty route, lost signal, a torn map, a sign and a barrier. */
export type StateArt = 'empty' | 'error' | 'offTheMap' | 'soon' | 'maintenance';

export function TlStateArt({
  art,
  className,
}: {
  art: StateArt;
  className?: string;
}) {
  const common = { 'aria-hidden': true, focusable: false, className } as const;
  switch (art) {
    case 'empty':
      return (
        <svg viewBox='0 0 280 150' {...common}>
          <path
            d='M30 112C80 40 130 140 180 72S240 64 254 40'
            className='fill-none stroke-tl-ink'
            strokeWidth='3'
            strokeDasharray='2 9'
            strokeLinecap='round'
            opacity='0.5'
          />
          <g
            className='fill-none stroke-tl-coral'
            strokeWidth='3'
            strokeDasharray='5 5'
          >
            <path d='M30 112c-14-14-14-30 0-38s30 0 30 16c0 14-16 28-30 22z' />
            <circle cx='254' cy='40' r='14' />
          </g>
          <ellipse
            cx='140'
            cy='132'
            rx='90'
            ry='8'
            className='fill-tl-ink'
            opacity='0.08'
          />
        </svg>
      );
    case 'error':
      return (
        <svg viewBox='0 0 280 150' {...common}>
          <g
            className='fill-none stroke-tl-ink'
            strokeWidth='9'
            strokeLinecap='round'
            opacity='0.35'
          >
            <path d='M60 62a110 110 0 0 1 160 0' />
            <path d='M88 90a70 70 0 0 1 104 0' />
            <path d='M115 116a32 32 0 0 1 50 0' />
          </g>
          <circle
            cx='140'
            cy='132'
            r='7'
            className='fill-tl-ink'
            opacity='0.5'
          />
          <path
            d='M60 24l160 112'
            className='stroke-tl-coral'
            strokeWidth='9'
            strokeLinecap='round'
          />
        </svg>
      );
    case 'offTheMap':
      return (
        <svg viewBox='0 0 280 160' {...common}>
          <path
            d='M20 30h240v100l-20 8-24-10-22 12-26-12-24 10-24-12-26 12-24-10-22 8-28-8z'
            className='fill-tl-solid stroke-tl-ink'
            strokeOpacity='0.3'
            strokeWidth='2'
          />
          <circle
            cx='140'
            cy='76'
            r='34'
            className='fill-tl-solid stroke-tl-coral'
            strokeWidth='4'
          />
          <g className='tl-spin-slow' style={{ transformOrigin: '140px 76px' }}>
            <path d='M140 48l9 28h-18z' className='fill-tl-coral' />
            <path
              d='M140 104l9-28h-18z'
              className='fill-tl-ink'
              opacity='0.5'
            />
          </g>
          <text
            x='140'
            y='150'
            textAnchor='middle'
            fontWeight='800'
            fontSize='20'
            className='fill-tl-ink'
            opacity='0.5'
          >
            404
          </text>
        </svg>
      );
    case 'soon':
      return (
        <svg viewBox='0 0 150 120' {...common}>
          <rect
            x='70'
            y='40'
            width='10'
            height='74'
            rx='3'
            className='fill-tl-trunk'
          />
          <path d='M20 14h96l14 15-14 15H20z' className='fill-tl-stop-4' />
          <path
            d='M20 14h96l14 15-14 15H20z'
            className='fill-none stroke-tl-ink'
            strokeOpacity='0.25'
            strokeWidth='2'
          />
          <path
            d='M34 29h62'
            className='stroke-tl-ink'
            strokeWidth='4'
            strokeLinecap='round'
            strokeDasharray='2 9'
          />
          <ellipse
            cx='75'
            cy='114'
            rx='30'
            ry='5'
            className='fill-tl-ink'
            opacity='0.12'
          />
        </svg>
      );
    case 'maintenance':
      return (
        <svg viewBox='0 0 150 100' {...common}>
          <rect
            x='20'
            y='20'
            width='6'
            height='72'
            rx='2'
            className='fill-tl-ink'
            opacity='0.5'
          />
          <rect
            x='124'
            y='20'
            width='6'
            height='72'
            rx='2'
            className='fill-tl-ink'
            opacity='0.5'
          />
          <rect
            x='12'
            y='26'
            width='126'
            height='22'
            rx='4'
            className='fill-tl-wall'
          />
          <path
            d='M12 26h126v22H12z'
            className='fill-none stroke-tl-ink'
            strokeOpacity='0.3'
            strokeWidth='2'
          />
          <g className='fill-tl-coral'>
            <path d='M22 26l16 0-10 22H12z' />
            <path d='M52 26l16 0-10 22H42z' />
            <path d='M82 26l16 0-10 22H72z' />
            <path d='M112 26l16 0-10 22H102z' />
          </g>
          <ellipse
            cx='75'
            cy='93'
            rx='56'
            ry='5'
            className='fill-tl-ink'
            opacity='0.12'
          />
        </svg>
      );
  }
}
