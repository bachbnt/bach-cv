/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { devOverlaysCopy } from '@/content/copy/dev-overlays';
import { fill } from '@/lib/chat/fill';
import { useCopy } from '@/lib/i18n/copy';
import { cn } from '@/lib/utils';
import { DevKbd } from '@/skins/dev/ui/dev-kbd';

/** The status line: what the picture is (size, type, weight), where you are in the set and the keys that work. */
export function DevViewerStatus({
  info,
  index,
  total,
}: {
  info: string;
  index: number;
  total: number;
}) {
  const copy = useCopy(devOverlaysCopy).viewer;
  return (
    <div
      data-slot='dev-viewer-status'
      className='flex items-center gap-4 border-t border-line bg-chrome-2 px-[14px] py-[6px] font-code text-[11.5px] leading-[normal] text-mute'
    >
      <span>{info}</span>
      {total > 1 && (
        <span className='ml-auto text-head'>
          {fill(copy.counter, { current: index + 1, total })}
        </span>
      )}
      <span
        className={cn(
          'whitespace-nowrap max-[700px]:hidden',
          total < 2 && 'ml-auto',
        )}
        aria-hidden='true'
      >
        {total > 1 && (
          <>
            <DevKbd>←</DevKbd>
            <DevKbd>→</DevKbd> {copy.keys.browse}{' '}
          </>
        )}
        <DevKbd>+</DevKbd>
        <DevKbd>−</DevKbd> {copy.keys.zoom} <DevKbd>0</DevKbd> {copy.keys.fit}{' '}
        <DevKbd>Esc</DevKbd> {copy.keys.close}
      </span>
    </div>
  );
}
