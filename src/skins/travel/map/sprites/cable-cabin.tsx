/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

/**
 * A cable-car cabin seen from the side: the carriage that rides the cable with two wheels, the hanger, a red roof, white walls with
 * two windows and a red skirt. Its grip is the top centre of the 28 x 42 box, so the cable passes through it.
 */
export function CableCabin() {
  return (
    <svg
      viewBox='0 0 28 42'
      width={28}
      height={42}
      aria-hidden='true'
      focusable='false'
      style={{ overflow: 'visible' }}
    >
      <rect x={13} y={5} width={2} height={10} className='fill-tl-ink' />
      <rect x={8} y={1} width={12} height={5} rx={2} className='fill-tl-ink' />
      <circle cx={11} cy={1.5} r={2} className='fill-tl-wall' />
      <circle cx={17} cy={1.5} r={2} className='fill-tl-wall' />
      <path d='M3 20 Q3 14 9 14 H19 Q25 14 25 20z' className='fill-tl-coral' />
      <rect
        x={3}
        y={20}
        width={22}
        height={16}
        rx={2}
        className='fill-tl-wall'
      />
      <rect
        x={14}
        y={20}
        width={11}
        height={16}
        rx={2}
        className='fill-tl-soil-2'
        opacity={0.14}
      />
      <rect
        x={5.5}
        y={22}
        width={7}
        height={8}
        rx={1}
        className='fill-tl-glass'
      />
      <rect
        x={15.5}
        y={22}
        width={7}
        height={8}
        rx={1}
        className='fill-tl-glass'
      />
      <path
        d='M14 20 V34'
        className='fill-none stroke-tl-soil-2'
        strokeOpacity={0.3}
        strokeWidth={0.8}
      />
      <rect
        x={3}
        y={33}
        width={22}
        height={3.5}
        rx={1.4}
        className='fill-tl-coral'
      />
    </svg>
  );
}
