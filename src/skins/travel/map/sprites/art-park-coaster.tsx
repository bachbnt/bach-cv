/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

/** A roller coaster in the back: a steel track with a hill and a vertical loop on thin supports, and a train on the hill. */
export function Coaster({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path
        d='M-2 36 V12 M10 36 V4 M22 36 V22 M34 36 V30 M38 36 V30'
        className='fill-none stroke-tl-rock'
        strokeWidth={1}
      />
      <circle
        cx={30}
        cy={14}
        r={11}
        className='fill-none stroke-tl-coral'
        strokeWidth={1.8}
      />
      <path
        d='M-6 26 C0 26 4 2 12 2 C20 2 22 22 30 25 L38 29'
        className='fill-none stroke-tl-coral'
        strokeWidth={1.8}
        strokeLinecap='round'
      />
      <rect
        x={6}
        y={-3}
        width={9}
        height={4}
        rx={1.4}
        className='fill-tl-sun'
      />
      <rect
        x={6}
        y={-3}
        width={4}
        height={4}
        rx={1.4}
        className='fill-tl-stop-1'
      />
    </g>
  );
}
