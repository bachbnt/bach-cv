/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { Eye, EyeOff, Magnet, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { tradeChartCopy } from '@/content/copy/trade-chart';
import { useCopy } from '@/lib/i18n/copy';
import { chartStore, useChartStore } from '@/skins/trade/chart/chart-store';
import {
  FIRST_USED,
  entryOf,
  groupOf,
  remember,
} from '@/skins/trade/chart/tool-groups';
import { GROUPS } from '@/skins/trade/chart/tool-groups';
import { RailDivider } from '@/skins/trade/shell/rail-divider';
import { RailButton } from '@/skins/trade/shell/rail-button';
import { ToolGroupButton } from '@/skins/trade/shell/tool-group-button';

/**
 * The tools down the left edge of the chart (a strip above it on a phone), grouped as a chart terminal groups them: cursors (cross,
 * dot, arrow, eraser), lines (trend line, ray, horizontal and vertical line), Fibonacci, rectangle, text note and measure, then the
 * magnet that snaps points to candles and the buttons that hide or remove every drawing. Undo and redo are in the top toolbar.
 * They change what the chart's pointer does; the drawings live in the chart.
 */
export function ToolRail() {
  const copy = useCopy(tradeChartCopy).tools;
  const tool = useChartStore((s) => s.tool);
  const cursor = useChartStore((s) => s.cursor);
  const magnet = useChartStore((s) => s.magnet);
  const hidden = useChartStore((s) => s.hidden);
  const hasDrawings = useChartStore((s) => s.history.present.length > 0);
  const [last, setLast] = useState(FIRST_USED);
  const now = entryOf(tool, cursor);
  // the tool in use (a key, a menu or a button picked it) is the one its group shows from now on
  const remembered = remember(last, now);
  if (remembered !== last) setLast(remembered);

  return (
    <div
      role='toolbar'
      aria-label={copy.label}
      aria-orientation='vertical'
      className='flex items-center gap-0.5 overflow-auto border-tv-line bg-tv-bg py-2 text-tv-dim max-[1100px]:h-11 max-[1100px]:flex-row max-[1100px]:border-b max-[1100px]:px-1 max-[1100px]:py-0 min-[1101px]:col-1 min-[1101px]:row-[2/6] min-[1101px]:flex-col min-[1101px]:border-r'
    >
      {GROUPS.map((group) => (
        <ToolGroupButton
          key={group.id}
          group={group}
          shown={remembered[group.id]}
          active={groupOf(now).id === group.id}
          tool={tool}
        />
      ))}
      <RailDivider />
      <RailButton
        label={copy.magnet}
        active={magnet}
        onClick={chartStore.toggleMagnet}
      >
        <Magnet aria-hidden='true' />
      </RailButton>
      <RailButton
        label={hidden ? copy.show : copy.hide}
        active={hidden}
        disabled={!hasDrawings && !hidden}
        onClick={() => chartStore.setHidden(!hidden)}
      >
        {hidden ? <EyeOff aria-hidden='true' /> : <Eye aria-hidden='true' />}
      </RailButton>
      <RailButton
        label={copy.clear}
        disabled={!hasDrawings}
        onClick={chartStore.clear}
      >
        <Trash2 aria-hidden='true' />
      </RailButton>
    </div>
  );
}
