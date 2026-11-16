/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useRef } from 'react';
import { phoneCopy } from '@/content/copy/phone';
import { useCopy } from '@/lib/i18n/copy';
import { cn } from '@/lib/utils';
import { isDownDrag } from '@/skins/phone/shell/gestures';
import { usePhOverlays } from '@/skins/phone/shell/overlay-context';
import { StatusGlyphs } from '@/skins/phone/shell/status-glyphs';
import { useClockText } from '@/skins/phone/shell/use-clock-text';

/**
 * The status bar: the time (real, from the clock of the page) at the start, the name of the system, and at the end the glyphs
 * of a phone. It is an overlay with no height of its own: the page is edge to edge and scrolls under it, and a strip of veil behind it (the page's colour from 70% at the top to nothing, one recipe
 * for every width and mode, `phone.css`) keeps the time and the glyphs legible over what passes. In a device the camera sits at the middle (or in the middle of the right half of an open one) and nothing is drawn there; in a window of its own there is no camera to avoid, and the bar starts below the safe area of a notched phone. The whole bar is one button that opens the quick
 * settings (a tap, or a drag down on a touch screen); the glyphs are decoration, the button has a name. On the home screen the veil is the
 * wallpaper's own colour.
 */
export function StatusBar({ onWallpaper }: { onWallpaper: boolean }) {
  const copy = useCopy(phoneCopy);
  const time = useClockText();
  const { openSettings } = usePhOverlays();
  const from = useRef<{ x: number; y: number } | null>(null);
  return (
    // one box in the layout, as the status bar always was (the screen and its tests count its children); the two layers are its own
    <div className='contents'>
      {/* the material is its own layer BELOW the app bar (z-10 against z-20): the bar starts where the status bar ends and nothing of the strip may
          lie over it, which the strip did when it shared the stacking context of the clock (it is taller than the status bar, for its soft end) */}
      <div className='pointer-events-none sticky top-0 z-10 h-0 shrink-0 group-data-[mode=device]/ph:absolute group-data-[mode=device]/ph:inset-x-0'>
        <div
          aria-hidden='true'
          data-ph-strip=''
          // ONE material at every width and in every mode (`phone.css`): the page's colour, or the wallpaper's on the home screen, from 70% at the top
          // to nothing at the foot over the same height in px, by a smooth multi-stop falloff; no blur, no mask, so that it has no edge anywhere
          className={cn(
            'ph-strip absolute inset-x-0 top-0',
            onWallpaper && 'ph-strip-wall',
          )}
        />
      </div>
      <div
        className={cn(
          'pointer-events-none sticky top-0 z-30 h-0 shrink-0 group-data-[mode=device]/ph:absolute group-data-[mode=device]/ph:inset-x-0',
          onWallpaper ? 'text-ph-glass-ink' : 'text-ph-ink',
        )}
      >
        <button
          type='button'
          onClick={openSettings}
          onPointerDown={(event) => {
            if (event.pointerType === 'mouse') return;
            from.current = { x: event.clientX, y: event.clientY };
            event.currentTarget.setPointerCapture(event.pointerId);
          }}
          onPointerUp={(event) => {
            const start = from.current;
            from.current = null;
            if (
              start &&
              isDownDrag(event.clientX - start.x, event.clientY - start.y)
            )
              openSettings();
          }}
          onPointerCancel={() => {
            from.current = null;
          }}
          aria-haspopup='dialog'
          aria-label={copy.quick}
          className='pointer-events-auto absolute inset-x-0 top-0 box-border flex h-(--ph-bar-top) cursor-pointer touch-none items-center justify-end px-5 pt-[env(safe-area-inset-top,0px)] focus-visible:-outline-offset-2 @min-[900px]:px-8'
        >
          <StatusGlyphs />
        </button>
        <span className='pointer-events-none absolute top-0 left-5 box-border flex h-(--ph-bar-top) items-center gap-2.5 pt-[env(safe-area-inset-top,0px)] text-[15px] font-semibold @min-[900px]:left-8'>
          <span className='tabular-nums' suppressHydrationWarning>
            {time}
          </span>
          <span aria-hidden='true' className='font-medium opacity-70'>
            {copy.os}
          </span>
        </span>
      </div>
    </div>
  );
}
