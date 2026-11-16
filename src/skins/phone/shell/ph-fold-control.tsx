/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { Columns2, Smartphone } from 'lucide-react';
import { phoneCopy } from '@/content/copy/phone';
import { useCopy } from '@/lib/i18n/copy';
import { cn } from '@/lib/utils';

/**
 * The button in the top left corner of the window, off the device, that folds and unfolds it. It is a toggle button: its name, `Fold`, is
 * the same in both states (a name that changes with the state would make a pressed button say the opposite) and `aria-pressed` says that
 * the device is folded. `F` does the same from the keyboard. A live text for readers says which screen is in use. It is only drawn where there is a device.
 */
export function PhFoldControl({
  folded,
  onToggle,
}: {
  folded: boolean;
  onToggle: () => void;
}) {
  const copy = useCopy(phoneCopy);
  const Icon = folded ? Smartphone : Columns2;
  const status = folded ? copy.foldCover : copy.foldOpen;
  return (
    <>
      <button
        type='button'
        onClick={onToggle}
        aria-pressed={folded}
        aria-keyshortcuts='F'
        className={cn(
          'absolute top-3 left-3 z-10 inline-flex h-11 cursor-pointer items-center gap-2 rounded-full border bg-ph-sheet-2/80 pr-3 pl-3.5 text-[14px] font-semibold text-ph-ink transition-[border-color,scale] duration-100 hover:border-ph-accent active:scale-[0.97]',
          folded ? 'border-ph-accent' : 'border-ph-line',
        )}
      >
        <Icon
          aria-hidden='true'
          className='size-5 text-ph-accent-ink'
          strokeWidth={2}
        />
        {copy.fold}
        <kbd
          aria-hidden='true'
          className='rounded-ph-mark border border-ph-line px-1.5 py-0.5 text-[12px] leading-none font-semibold text-ph-mute [font-family:inherit]'
        >
          F
        </kbd>
      </button>
      <span role='status' className='sr-only'>
        {status}
      </span>
    </>
  );
}
