/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import type { ComponentProps } from 'react';
import { useDocumentHidden } from '@/hooks/use-document-hidden';
import { cn } from '@/lib/utils';
import { mono } from '@/skins/dev/fonts';

/**
 * The root of a Dev window (the editor, the maintenance screen): the page colours, the fonts and the two heights the shell is laid out
 * with (`--top` the title bar and tabs, `--bottom` the status bar; a phone has only the title bar). `dv-root` is the scope of the
 * rules in `dev.css` and `css/*`, `dv-js` the one of the reveal on scroll; `group/dv` lets the parts of the shell follow its state
 * (`data-nav-open`); with the bottom panel open (`data-panel`) `--bottom` is the panel as well. While the tab is in the background the
 * root carries `data-hidden`, and `dev-extra.css` pauses every animation under it (the loops of the skin have nobody to move for).
 */
export function DevRoot({ className, ...props }: ComponentProps<'div'>) {
  const hidden = useDocumentHidden();
  return (
    <div
      data-skin-root='dev'
      data-hidden={hidden ? '' : undefined}
      className={cn(
        'dv-root group/dv min-h-screen bg-editor pb-(--bottom) font-sans text-[16px]/[1.6] text-ink antialiased [--bottom:22px] [--top:88px] max-[900px]:[--top:30px]',
        mono.variable,
        className,
      )}
      {...props}
    />
  );
}
