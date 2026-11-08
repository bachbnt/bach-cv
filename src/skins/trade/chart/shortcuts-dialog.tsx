/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import type { ReactNode } from 'react';
import { tradeChartCopy } from '@/content/copy/trade-chart';
import { useCopy } from '@/lib/i18n/copy';
import { TvDialogShell } from '@/skins/trade/shell/overlay-dialog-shell';
import { useModKey } from '@/skins/trade/shell/use-mod-key';

type Copy = (typeof tradeChartCopy)['en']['shortcuts'];

const Keys = ({ keys }: { keys: string[] }) => (
  <span className='flex shrink-0 gap-1'>
    {keys.map((key) => (
      <kbd
        key={key}
        className='rounded border border-tv-line bg-tv-hover px-1.5 py-0.5 font-sans text-[11px] text-tv-ink'
      >
        {key}
      </kbd>
    ))}
  </span>
);

const Row = ({ keys, children }: { keys: string[]; children: ReactNode }) => (
  <li className='flex items-center justify-between gap-3 text-[13px]'>
    <span>{children}</span>
    <Keys keys={keys} />
  </li>
);

const groups = (
  copy: Copy,
  mod: string,
): { title: string; rows: [string[], string][] }[] => [
  {
    title: copy.chart,
    rows: [
      [['←', '→'], copy.crosshair],
      [['Home', 'End'], copy.ends],
      [['+', '−'], copy.zoom],
      [['Alt', '1 – 4'], copy.interval],
    ],
  },
  {
    title: copy.draw,
    rows: [
      [['Alt', 'T'], copy.trend],
      [['Alt', 'H'], copy.hline],
      [['Alt', 'V'], copy.vline],
      [['Alt', 'R'], copy.rect],
      [['Alt', 'F'], copy.fib],
      [['Alt', 'M'], copy.measure],
      [['Esc'], copy.cancel],
      [['Delete'], copy.delete],
    ],
  },
  {
    title: copy.more,
    rows: [
      [[mod, 'Z'], copy.undo],
      [['Shift', mod, 'Z'], copy.redo],
      [['Shift', 'R'], copy.replay],
      [['?'], copy.help],
    ],
  },
];

/** The window that lists every keyboard shortcut of the chart. It is loaded the first time it opens (the question mark or its button). */
export default function ShortcutsDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const all = useCopy(tradeChartCopy);
  const copy = all.shortcuts;
  const mod = useModKey();
  return (
    <TvDialogShell
      open={open}
      onOpenChange={onOpenChange}
      title={copy.title}
      description={copy.description}
      closeLabel={all.toolbar.close}
      size='sm'
      bodyClassName='p-4'
    >
      <div
        data-testid='tv-shortcuts'
        className='flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto'
      >
        <p className='text-xs text-tv-mute'>{copy.description}</p>
        {groups(copy, mod).map((group) => (
          <section key={group.title} className='flex flex-col gap-1.5'>
            <h3 className='text-[11px] font-bold tracking-wide text-tv-mute uppercase'>
              {group.title}
            </h3>
            <ul className='flex flex-col gap-1.5'>
              {group.rows.map(([keys, text]) => (
                <Row key={text} keys={keys}>
                  {text}
                </Row>
              ))}
            </ul>
          </section>
        ))}
        <p className='text-xs text-tv-mute'>{copy.reset}</p>
      </div>
    </TvDialogShell>
  );
}
