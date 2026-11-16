/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { Dialog as DialogPrimitive } from '@base-ui/react/dialog';
import { cva } from 'class-variance-authority';
import { useCallback } from 'react';
import { Dialog, DialogOverlay, DialogPortal } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { usePhScreen } from '@/skins/phone/shell/screen-context';
import { useOverlayDrag } from '@/skins/phone/shell/use-overlay-drag';
import '@/skins/phone/css/overlays.css';

/**
 * Where an overlay sits, in percentages of the screen: the frame is put in the layer of the screen (`usePhScreen().root`, which is fixed
 * over the window of a phone and absolute over the screen of a device) and is `absolute` in it, so it never covers the window of a desktop
 * (`container-type` alone would not contain a `fixed` element). When the screen is narrow (a phone, a folded device) `sheet` and `dock`
 * rise from the bottom edge (the dock is the chat: taller, and lifted by the keyboard through `--chat-inset`) and `stage` is the whole
 * screen. From 900 px of screen a `sheet` is a card in the middle, the `dock` a panel at the right edge and the `stage` a large card; a
 * panel or a card keeps clear of the status bar and the camera cut-out (3rem). Centred with auto margins, never with a transform, so the
 * arrival animation and the drag own `translate` and `transform`.
 */
const frameVariants = cva(
  'ph-root ph-overlay-frame absolute z-50 flex flex-col overflow-hidden bg-ph-sheet text-[15px]/[1.5] text-ph-ink shadow-ph-float outline-none',
  {
    variants: {
      kind: {
        sheet:
          'inset-x-0 bottom-0 mx-auto max-h-[92%] w-full max-w-[620px] rounded-t-ph-sheet @min-[900px]:inset-0 @min-[900px]:m-auto @min-[900px]:h-fit @min-[900px]:max-h-[min(86%,860px)] @min-[900px]:rounded-ph-sheet',
        dock: 'inset-x-0 bottom-[var(--chat-inset,0px)] mx-auto h-[min(88%,760px,calc(100%-var(--chat-inset,0px)-0.75rem))] w-full max-w-[620px] rounded-t-ph-sheet @min-[900px]:inset-x-auto @min-[900px]:top-12 @min-[900px]:right-4 @min-[900px]:bottom-[calc(1rem+var(--chat-inset,0px))] @min-[900px]:mx-0 @min-[900px]:h-auto @min-[900px]:w-[420px] @min-[900px]:rounded-ph-sheet',
        stage:
          'inset-0 h-full w-full @min-[900px]:m-auto @min-[900px]:h-[min(860px,calc(100%-4.5rem))] @min-[900px]:w-[min(1040px,calc(100%-3rem))] @min-[900px]:rounded-ph-sheet',
      },
    },
  },
);

/**
 * The window of an overlay: the shadcn `Dialog` (focus trap, Esc, a click outside, a title and a description for readers, focus back to
 * what opened it) with the phone's shape, over a dark scrim, inside the screen of the device. A sheet or a dock has a grabber at its top
 * edge on a narrow screen; the grabber and the bar of the overlay (`data-ph-drag`) drag the window down to close it.
 */
export function PhOverlayFrame({
  open,
  onOpenChange,
  kind,
  inset = 0,
  className,
  children,
  ...props
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kind: 'sheet' | 'dock' | 'stage';
  /** how far the on-screen keyboard covers the bottom of the page, in px: lifts a dock */
  inset?: number;
  className?: string;
} & Omit<DialogPrimitive.Popup.Props, 'className' | 'ref'>) {
  const { root } = usePhScreen();
  const { setPopup, scrim, handlers } = useOverlayDrag(() =>
    onOpenChange(false),
  );

  // the frame reads the lift from a custom property, so the panel of a wide screen can add it to its own margin
  const place = useCallback(
    (element: HTMLDivElement | null) => {
      setPopup(element);
      element?.style.setProperty('--chat-inset', `${inset}px`);
    },
    [setPopup, inset],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal container={root}>
        <DialogOverlay
          ref={scrim}
          className='absolute bg-ph-scrim supports-backdrop-filter:backdrop-blur-none motion-reduce:animate-none'
        />
        <DialogPrimitive.Popup
          ref={place}
          data-kind={kind}
          aria-modal='true'
          className={cn(frameVariants({ kind }), className)}
          {...handlers}
          {...props}
        >
          {kind !== 'stage' && (
            <div
              aria-hidden='true'
              data-ph-drag=''
              className='flex h-7 shrink-0 cursor-grab touch-none items-start justify-center pt-2.5 select-none active:cursor-grabbing @min-[900px]:hidden'
            >
              <span className='h-1.5 w-10 rounded-full bg-ph-mute/40' />
            </div>
          )}
          {children}
        </DialogPrimitive.Popup>
      </DialogPortal>
    </Dialog>
  );
}
