/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import {
  Box,
  Cylinder,
  Mound,
  OnFace,
  Palm,
  Roof,
  Shadow,
  Tree,
  WASH_DARK,
  Win,
  type BoxShape,
} from '@/skins/travel/map/sprites/art-parts';
import { Dinghy, Jetty, Shallows } from '@/skins/travel/map/sprites/art-sea';

/** A small sea turtle seen from above: green shell with scutes, a head and four flippers. */
function Turtle({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <g className='fill-tl-hill-s'>
        <ellipse cx={-4.6} cy={-2.4} rx={3} ry={1.2} />
        <ellipse cx={-4.6} cy={2.6} rx={3} ry={1.2} />
        <ellipse cx={3.6} cy={-2.6} rx={2.4} ry={1} />
        <ellipse cx={3.6} cy={2.8} rx={2.4} ry={1} />
        <circle cx={8.8} cy={0} r={2} />
      </g>
      <ellipse cx={0} cy={0} rx={6.8} ry={4.4} className='fill-tl-leaf' />
      <path
        d='M-3 -2 L0 -3 L3 -2 M-3 2 L0 3 L3 2 M0 -3 V3'
        className='fill-none stroke-tl-hill-t'
        strokeWidth={0.8}
        strokeLinejoin='round'
        opacity={0.8}
      />
    </g>
  );
}

/** A lighthouse-like marker: a tapered white tower with a red band, a gallery and a lantern. */
function Beacon({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d='M-4.4 0 L-2.8 -22 H2.8 L4.4 0z' className='fill-tl-wall' />
      <path d='M0 0 H4.4 L2.8 -22 H0z' className={WASH_DARK} opacity={0.25} />
      <path d='M-3.7 -8 H3.7 L3.4 -12 H-3.4z' className='fill-tl-coral' />
      <rect
        x={-4.4}
        y={-24}
        width={8.8}
        height={2.2}
        className='fill-tl-soil-2'
      />
      <rect x={-2.4} y={-29} width={4.8} height={5} className='fill-tl-sun' />
      <path d='M-3.6 -29 L0 -34 L3.6 -29z' className='fill-tl-coral' />
    </g>
  );
}

/** Hon Mieu: a green island with a lighthouse marker, the white aquarium with a blue dome, a pier with boats and a turtle. */
export function HonMieuArt() {
  const hall: BoxShape = { cx: 98, y: 144, wl: 22, wr: 17, h: 13 };
  const wing: BoxShape = { cx: 124, y: 148, wl: 9, wr: 8, h: 7 };
  return (
    <g>
      <Shadow rx={62} ry={11} />
      <Shallows rx={70} ry={15.5} />
      <ellipse cx={80} cy={146.5} rx={62} ry={13} className='fill-tl-sand-2' />
      <ellipse cx={80} cy={145} rx={58} ry={11} className='fill-tl-sand' />
      <Mound x={48} y={141} w={76} h={46} />
      <Tree x={30} y={128} s={0.8} />
      <Tree x={64} y={124} s={0.7} />
      <Beacon x={50} y={106} />
      <Palm x={20} y={148} s={0.95} lean={-1} />
      <Box shape={wing} wall='fill-tl-wall' />
      <Roof shape={{ ...wing, wl: 11, wr: 10 }} roof='fill-tl-teal' rise={4} />
      <Box shape={hall} wall='fill-tl-wall' />
      <OnFace shape={hall} side='l' at={0.5}>
        <Win x={-8} y={-3} w={4} h={7} arch />
        <path
          d='M-3 0 v-6 a3 3 0 0 1 6 0 v6z'
          className='fill-tl-stop-1'
          opacity={0.85}
        />
        <Win x={8} y={-3} w={4} h={7} arch />
      </OnFace>
      <OnFace shape={hall} side='r' at={0.5}>
        <Win x={-5} y={-3} w={4} h={7} arch />
        <Win x={5} y={-3} w={4} h={7} arch />
      </OnFace>
      <Cylinder cx={95.5} y={122} r={10} h={4} wall='fill-tl-wall' />
      <path
        d='M85.5 118 A10 13 0 0 1 105.5 118 A10 5 0 0 1 85.5 118z'
        className='fill-tl-stop-1'
      />
      <path
        d='M95.5 105 A10 13 0 0 1 105.5 118 A10 5 0 0 1 95.5 123z'
        className={WASH_DARK}
        opacity={0.28}
      />
      <path
        d='M88 115 A10 13 0 0 1 93 107.5'
        className='fill-none stroke-tl-foam'
        strokeWidth={1.5}
        strokeLinecap='round'
        opacity={0.75}
      />
      <path
        d='M95.5 105 V98'
        className='stroke-tl-soil-2'
        strokeWidth={1.2}
        strokeLinecap='round'
      />
      <path d='M95.5 98 l7 2 l-7 2.4z' className='fill-tl-coral' />
      <Palm x={140} y={141} s={0.85} lean={-1} />
      <Jetty x={118} y={144} len={18} />
      <Dinghy x={106} y={155} s={0.8} />
      <Dinghy x={151} y={150} s={0.8} canopy='fill-tl-sun' />
      <Turtle x={34} y={155} />
    </g>
  );
}
