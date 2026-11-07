/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import {
  Crosshair,
  Dot,
  Eraser,
  MousePointer2,
  MoveUpRight,
  RectangleHorizontal,
  Ruler,
  TrendingUp,
  Type,
} from 'lucide-react';
import type { EntryId } from '@/skins/trade/chart/tool-groups';

const draw = {
  'aria-hidden': true,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round',
} as const;

/** A horizontal line with a dot on it: the dot is what tells it from a menu icon. */
const HLine = () => (
  <svg {...draw}>
    <path d='M3 12h6.5M14.5 12H21' />
    <circle cx='12' cy='12' r='2.5' />
  </svg>
);

const VLine = () => (
  <svg {...draw}>
    <path d='M12 3v6.5M12 14.5V21' />
    <circle cx='12' cy='12' r='2.5' />
  </svg>
);

/** A Fibonacci retracement: a trend line across levels of different lengths. */
const Fib = () => (
  <svg {...draw}>
    <path d='M4 5h16M4 10h11M4 15h8M4 20h16' strokeOpacity={0.55} />
    <path d='M6 20 19 5' />
    <circle cx='6' cy='20' r='1.5' fill='currentColor' />
    <circle cx='19' cy='5' r='1.5' fill='currentColor' />
  </svg>
);

/** The picture of a tool of the rail. */
export function ToolIcon({ id }: { id: EntryId }) {
  switch (id) {
    case 'cross':
      return <Crosshair aria-hidden='true' />;
    case 'dot':
      return <Dot aria-hidden='true' />;
    case 'arrow':
      return <MousePointer2 aria-hidden='true' />;
    case 'eraser':
      return <Eraser aria-hidden='true' />;
    case 'trend':
      return <TrendingUp aria-hidden='true' />;
    case 'ray':
      return <MoveUpRight aria-hidden='true' />;
    case 'hline':
      return <HLine />;
    case 'vline':
      return <VLine />;
    case 'fib':
      return <Fib />;
    case 'rect':
      return <RectangleHorizontal aria-hidden='true' />;
    case 'text':
      return <Type aria-hidden='true' />;
    case 'measure':
      return <Ruler aria-hidden='true' />;
  }
}
