/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { WASH_DARK } from '@/skins/travel/map/sprites/art-parts';

const PODS = [
  'fill-tl-stop-3',
  'fill-tl-stop-4',
  'fill-tl-stop-2',
  'fill-tl-stop-1',
  'fill-tl-stop-5',
  'fill-tl-stop-6',
] as const;
// the turn of `tl-wheel` is around (50, 82) (css/sprites.css)
const X = 50;
const Y = 82;
const R = 31;
const CABINS = 10;

/** A big Ferris wheel on an A-frame: a double rim, spokes and cabins that turn slowly and stay upright (`tl-wheel`, `tl-pod`). */
export function FerrisWheel() {
  const spokes = Array.from({ length: 5 }, (_, i) => {
    const a = (i * Math.PI) / 5;
    return `M${X - R * Math.sin(a)} ${Y + R * Math.cos(a)} L${X + R * Math.sin(a)} ${Y - R * Math.cos(a)}`;
  }).join(' ');
  return (
    <g>
      <path
        d={`M${X + 4} ${Y} L${X - 14} 130 M${X + 4} ${Y} L${X + 23} 130`}
        className='fill-none stroke-tl-rock'
        strokeWidth={2.4}
        strokeLinecap='round'
      />
      <path
        d={`M${X} ${Y} L${X - 19} 133 M${X} ${Y} L${X + 19} 133 M${X - 12} 112 H${X + 12} M${X - 7} 100 H${X + 7}`}
        className='fill-none stroke-tl-rock'
        strokeWidth={3.2}
        strokeLinecap='round'
      />
      <path
        d={`M${X} ${Y} L${X - 19} 133`}
        className='fill-none stroke-tl-wall'
        strokeWidth={1.5}
        strokeLinecap='round'
      />
      <g className='tl-wheel'>
        <circle
          cx={X + 4}
          cy={Y}
          r={R}
          className='fill-none stroke-tl-coral-2'
          strokeWidth={1.6}
        />
        <circle
          cx={X}
          cy={Y}
          r={R}
          className='fill-none stroke-tl-coral'
          strokeWidth={2.6}
        />
        <circle
          cx={X}
          cy={Y}
          r={R * 0.6}
          className='fill-none stroke-tl-coral'
          strokeOpacity={0.7}
          strokeWidth={1.2}
        />
        <path
          d={spokes}
          className='fill-none stroke-tl-wall'
          strokeWidth={0.9}
        />
        {Array.from({ length: CABINS }, (_, i) => {
          const a = (i * 2 * Math.PI) / CABINS;
          return (
            <g
              key={i}
              transform={`translate(${X + R * Math.sin(a)} ${Y - R * Math.cos(a)})`}
            >
              <g className='tl-pod'>
                <rect
                  x={-3.4}
                  y={0.6}
                  width={6.8}
                  height={6.4}
                  rx={1.9}
                  className={PODS[i % PODS.length]}
                />
                <rect
                  x={-2.2}
                  y={2}
                  width={4.4}
                  height={2.2}
                  rx={0.7}
                  className='fill-tl-glass'
                />
              </g>
            </g>
          );
        })}
      </g>
      <circle cx={X} cy={Y} r={4} className='fill-tl-sun' />
      <circle
        cx={X + 1}
        cy={Y + 1}
        r={1.8}
        className={WASH_DARK}
        opacity={0.4}
      />
    </g>
  );
}
