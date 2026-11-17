/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { ChevronUp } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { phoneCopy } from '@/content/copy/phone';
import { useCopy } from '@/lib/i18n/copy';
import { useLang } from '@/lib/i18n/language';
import { cn } from '@/lib/utils';
import { focusPage } from '@/skins/phone/shell/focus-page';
import { isUpDrag } from '@/skins/phone/shell/gestures';
import { usePhScreen } from '@/skins/phone/shell/screen-context';
import { StatusGlyphs } from '@/skins/phone/shell/status-glyphs';
import { useClockMinute } from '@/skins/phone/shell/use-clock';
import { useClockText } from '@/skins/phone/shell/use-clock-text';
import {
  actOnScreen,
  useScreenPower,
} from '@/skins/phone/shell/use-screen-power';

/**
 * The lock screen a woken screen shows first (never the page): the wallpaper of the home screen, a large clock (the time of the status bar, no seconds), the
 * date, the status glyphs and `Swipe up to unlock`, which is a button as well as a gesture. A drag up (the one of the home bar, `isUpDrag`), a click on the
 * hint, Enter or Space unlock it with a short rise (`translate` and `opacity`), and the focus goes to the first control of the page. It traps nobody: what is behind it
 * is inert, so Tab stays on its one button, Esc does nothing, and unlocking is one obvious action. The focus is on its button when it comes. Only drawn in a device.
 */
export function PhLockScreen() {
  const copy = useCopy(phoneCopy);
  const { lang } = useLang();
  const { scroller } = usePhScreen();
  const locked = useScreenPower() === 'locked';
  const time = useClockText();
  const minute = useClockMinute();
  const date = minute
    ? new Date(minute * 60_000).toLocaleDateString(lang, {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      })
    : '';
  const button = useRef<HTMLButtonElement>(null);
  const from = useRef<{ x: number; y: number } | null>(null);
  useEffect(() => {
    if (locked) button.current?.focus({ preventScroll: true });
  }, [locked]);
  const unlock = () => {
    actOnScreen('unlock');
    // the page is no longer inert once this has rendered
    requestAnimationFrame(() => focusPage(scroller));
  };
  return (
    <section
      inert={!locked}
      aria-label={copy.lockScreen}
      data-ph-lock={locked ? 'locked' : 'away'}
      onPointerDown={(event) => {
        from.current = { x: event.clientX, y: event.clientY };
      }}
      onPointerUp={(event) => {
        const start = from.current;
        from.current = null;
        if (start && isUpDrag(event.clientX - start.x, event.clientY - start.y))
          unlock();
      }}
      onPointerCancel={() => {
        from.current = null;
      }}
      className={cn(
        'ph-wallpaper absolute inset-0 z-[56] flex touch-none flex-col items-center text-ph-glass-ink transition-[opacity,translate] duration-[280ms] ease-ph-out',
        locked
          ? 'translate-y-0 opacity-100'
          : 'pointer-events-none -translate-y-6 opacity-0',
      )}
    >
      <div className='flex h-10 w-full shrink-0 items-center justify-between px-5 text-[15px] font-semibold @min-[900px]:px-8'>
        <span className='font-medium opacity-70'>{copy.os}</span>
        <StatusGlyphs />
      </div>
      <p
        className='mt-[16%] text-[88px]/[1] font-light tracking-[-0.03em] tabular-nums'
        suppressHydrationWarning
      >
        {time}
      </p>
      <p
        className='mt-3 text-[19px] font-semibold first-letter:uppercase'
        suppressHydrationWarning
      >
        {date}
      </p>
      <button
        ref={button}
        type='button'
        onClick={unlock}
        className='mt-auto mb-10 inline-flex h-11 cursor-pointer items-center gap-2 rounded-full border border-ph-glass-line bg-ph-glass px-5 text-[15px] font-semibold transition-[scale] duration-100 active:scale-[0.97]'
      >
        <ChevronUp aria-hidden='true' className='size-5' strokeWidth={2.4} />
        {copy.unlock}
      </button>
    </section>
  );
}
