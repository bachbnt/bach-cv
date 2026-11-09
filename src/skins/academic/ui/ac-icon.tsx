/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/*
 * The marks are drawn like the rest of the board: strokes with a round pen, none of them quite straight, the corners a little overshot, the
 * pen lifted between lines. They are paths, not characters, so they have the colour and the size of the words beside them.
 */
const PATHS: Record<
  | 'download'
  | 'pencil'
  | 'external'
  | 'close'
  | 'arrowLeft'
  | 'arrowRight'
  | 'chevronDown'
  | 'chevronLeft'
  | 'chevronRight',
  ReactNode
> = {
  // an arrow going down into a tray
  download: (
    <>
      <path d='M12.2 3.4 C11.9 7.4 12.3 11 11.8 15.4' />
      <path d='M7 10.6 C8.8 12.4 10.5 14.1 12 15.9 C13.7 14.2 15.4 12.5 17.2 10.4' />
      <path d='M3.9 15.3 C3.7 17.3 3.8 18.8 4.1 20.4 C8.4 20.7 15.6 20.6 20 20.2 C20.4 18.7 20.2 17 19.8 15.2' />
    </>
  ),
  // a pencil lying slantwise, its point at the lower left
  pencil: (
    <>
      <path d='M15.3 4.1 C16.4 2.9 18.4 3 19.7 4.3 C21 5.6 21.1 7.4 19.9 8.6 L9 19.7 C7.9 20.3 5.7 20.8 3.5 21.1 C3.8 19 4.4 16.9 5 15.7 L15.3 4.1 Z' />
      <path d='M13.2 6.4 C14.9 7.8 16.5 9.5 18 11' />
      <path d='M5 15.9 C6.6 16.4 8.2 17.9 8.9 19.5' />
    </>
  ),
  // a cross, two strokes that do not quite meet
  close: (
    <>
      <path d='M5.4 5.2 C9 8.8 15.2 15.4 18.8 18.9' />
      <path d='M18.6 5.4 C15 9 8.8 15.2 5.2 18.7' />
    </>
  ),
  // arrows along a line, the head two strokes
  arrowRight: (
    <>
      <path d='M3.8 12.3 C8 12 13.5 12.4 19.8 11.9' />
      <path d='M14.2 6.4 C16.2 8.4 18.2 10.2 20.2 12 C18.2 13.9 16.1 15.7 14 17.8' />
    </>
  ),
  arrowLeft: (
    <>
      <path d='M20.2 12.2 C16 12.4 10.5 11.9 4.2 12.1' />
      <path d='M9.8 6.2 C7.8 8.2 5.8 10 3.8 11.9 C5.8 13.8 7.9 15.6 10 17.6' />
    </>
  ),
  // a chevron: one stroke that bends once
  chevronDown: (
    <path d='M5.5 8.8 C8 11.4 10 13.6 12 15.6 C14.2 13.4 16.4 11 18.6 8.6' />
  ),
  chevronLeft: (
    <path d='M15.2 5.4 C13.2 8 11 10 8.6 12 C11 14 13.2 16 15.4 18.6' />
  ),
  chevronRight: (
    <path d='M8.8 5.4 C10.8 8 13 10 15.4 12 C13 14 10.8 16 8.6 18.6' />
  ),
  // an arrow leaving towards the upper right
  external: (
    <>
      <path d='M6.4 17.8 C9.8 14.1 13.6 10.2 17.4 6.5' />
      <path d='M9.3 6.1 C11.9 6.4 14.8 6 17.8 6.2 C17.6 9.1 18 12 17.6 14.9' />
    </>
  ),
};

/**
 * The little marks after the words of a button or a link (a tray for the CV, a pen for what you write, an arrow for a new tab, a cross to close, the arrows of the page turns and of the menus). They are drawn, not
 * typed: a character such as ⇩ or ✎ comes from whatever font has it, which is never the font of the words beside it. They follow the size of the text.
 */
export function AcIcon({
  name,
  className,
}: {
  name: keyof typeof PATHS;
  className?: string;
}) {
  return (
    <svg
      aria-hidden='true'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2.3'
      strokeLinecap='round'
      strokeLinejoin='round'
      className={cn('size-[1.2em] flex-none', className)}
    >
      {PATHS[name]}
    </svg>
  );
}
