/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { ComponentProps } from 'react';
import { DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { WindowDots } from '@/skins/dev/ui/window-dots';

/**
 * The parts the picture viewer and the CV window have in common: a preview window (title bar, tools, body) above the page. The dialog
 * is portaled outside `.dv-root`, so the popup brings its own base style (font, colour, focus ring); the palette comes from `html`.
 */

/** The popup of the dialog: a backdrop that centres the window; maximized, and on a phone, the window fills it. */
export const windowPopupClass = (maximized: boolean) =>
  cn(
    'fixed inset-0 z-100 grid place-items-center bg-[rgba(1,4,9,0.74)] p-[22px] font-sans text-base/[1.6] text-ink antialiased backdrop-blur-[3px] animate-[dv-lbfade_0.2s_ease_both] max-[700px]:place-items-stretch max-[700px]:p-0 **:focus-visible:outline-2 **:focus-visible:outline-offset-2 **:focus-visible:outline-signal',
    maximized && 'p-0',
  );

/** A hit area around each light for a finger (the lights are 12px). */
export const touchDots =
  'pointer-coarse:gap-4 pointer-coarse:[&>:is(i,button)]:before:absolute pointer-coarse:[&>:is(i,button)]:before:-inset-2 pointer-coarse:[&>:is(i,button)]:before:content-[""]';

/** The three lights of a window above the page; the green one is not offered on a phone, where the window is always full screen. */
export function DevWindowDots({
  className,
  ...props
}: ComponentProps<typeof WindowDots>) {
  return (
    <WindowDots
      className={cn(
        'mr-[6px] flex-none max-[700px]:[&_[data-light=max]]:hidden',
        touchDots,
        className,
      )}
      {...props}
    />
  );
}

/** The window itself. Its size comes from the caller (`className`). */
export function DevWindow({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot='dev-window'
      className={cn(
        'flex max-h-full w-[min(1120px,100%)] flex-col overflow-hidden rounded-[12px] border border-line-2 bg-chrome shadow-[0_30px_80px_rgba(0,0,0,0.6)] animate-[dv-lbpop_0.3s_cubic-bezier(0.2,0.8,0.2,1)_both] max-[700px]:h-dvh max-[700px]:rounded-none',
        className,
      )}
      {...props}
    />
  );
}

/** The title bar: lights, a file icon, the title, a subtitle and the tools on the right. */
export function DevWindowBar({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot='dev-window-bar'
      className={cn(
        'flex min-h-[42px] min-w-0 items-center gap-[10px] border-b border-line bg-chrome-2 pr-2 pl-[14px] font-code text-[12.5px] leading-[normal]',
        className,
      )}
      {...props}
    />
  );
}

/** The title of the dialog, in the bar. */
export function DevWindowTitle({
  className,
  ...props
}: ComponentProps<typeof DialogTitle>) {
  return (
    <DialogTitle
      className={cn(
        'm-0 max-w-[34%] overflow-hidden font-code text-[12.5px] leading-[normal] font-semibold text-ellipsis whitespace-nowrap text-head max-[700px]:max-w-none max-[700px]:flex-1',
        className,
      )}
      {...props}
    />
  );
}

/** What comes after the title (a file name, the issuer); it gives way to the title and is hidden on a phone. */
export function DevWindowSub({ className, ...props }: ComponentProps<'span'>) {
  return (
    <span
      className={cn(
        'min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-mute max-[700px]:hidden',
        className,
      )}
      {...props}
    />
  );
}

/** The tools of the bar, at its right end. */
export function DevWindowTools({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn('ml-auto flex flex-none items-center gap-[2px]', className)}
      {...props}
    />
  );
}

/** A square icon button (or link) of the bar. */
export const windowToolClass =
  'inline-grid size-[30px] cursor-pointer place-items-center rounded-[6px] border-0 bg-transparent text-mute [transition:background_0.15s,color_0.15s] hover:bg-hov hover:text-head pointer-coarse:size-10';
