/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { Dialog as DialogPrimitive } from '@base-ui/react/dialog';
import { useRef, type MouseEvent } from 'react';
import { Dialog, DialogPortal, DialogTitle } from '@/components/ui/dialog';
import { commonCopy } from '@/content/copy/common';
import { useCopy } from '@/lib/i18n/copy';
import { cn } from '@/lib/utils';
import { mono } from '@/skins/dev/fonts';
import { ConnectPaletteBox } from '@/skins/dev/shell/connect-palette-box';

/**
 * The Connect menu of the account button as a command palette (like Ctrl+P of the editor): a box at the bottom left, by the button,
 * with a line to type in and the contacts under it (a sheet at the bottom on a phone). Typing filters them, the arrow keys move between them, Enter opens the one in use. It has what the
 * Standard menu has (the email with a Copy button, the links by group, the location).
 */
export function ConnectPalette({
  open,
  raised,
  onClose,
}: {
  open: boolean;
  /** the bottom panel is open: the box sits above it (the panel is 220px) */
  raised: boolean;
  onClose: () => void;
}) {
  const text = useCopy(commonCopy).connect;
  const input = useRef<HTMLInputElement>(null);
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <DialogPortal>
        <DialogPrimitive.Popup
          id='dv-acctmenu'
          data-slot='dev-connect-palette'
          // the filter line takes the focus from here, not with `autoFocus`: the dialog has to see which button had it, to give it back
          initialFocus={input}
          className={cn(
            // the layer that catches a click outside is clear; the box is at the bottom left, by the account button (the status bar is 22px, and
            // this is outside .dv-root, so it is written out); on a phone it is a sheet at the bottom
            'fixed inset-0 z-100 flex items-end justify-start pb-[30px] pl-[54px] font-sans text-base/[1.6] text-ink antialiased **:focus-visible:outline-2 **:focus-visible:outline-offset-2 **:focus-visible:outline-signal max-[900px]:justify-center max-[900px]:p-2',
            mono.variable,
            raised && 'pb-[250px] max-[900px]:pb-[228px]',
          )}
          onClick={(event: MouseEvent) => {
            if (event.target === event.currentTarget) onClose();
          }}
        >
          <DialogTitle className='sr-only'>{text.title}</DialogTitle>
          <ConnectPaletteBox input={input} />
        </DialogPrimitive.Popup>
      </DialogPortal>
    </Dialog>
  );
}
