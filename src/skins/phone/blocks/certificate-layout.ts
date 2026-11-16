/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { cn } from '@/lib/utils';

/**
 * The grid of the Wallet: one column, two from 600 px (the cards lend their three parts to the rows, so the gap between the rows is the margin
 * of a card, and the last margin is taken back). Add `HINGE_PANES` for the two panes of an open device.
 */
export const CERTIFICATE_GRID =
  'grid gap-4 @min-[600px]:-mb-5 @min-[600px]:grid-cols-2 @min-[600px]:gap-x-5 @min-[600px]:gap-y-0';

/**
 * Where the parts of a pass sit: the card (`wide` spans both columns of a tablet, `split` puts the picture beside the face), the face, the
 * picture and the block with the tags and the action. The loaded card and its skeleton both take them from here, so they never differ.
 */
export function certificateLayout({
  wide,
  split,
}: {
  wide: boolean;
  split: boolean;
}) {
  return {
    card: cn(
      'relative flex flex-col overflow-hidden rounded-ph-panel shadow-ph-card @min-[600px]:mb-5',
      wide && '@min-[600px]:col-span-2',
      split &&
        '@min-[600px]:grid @min-[600px]:grid-cols-2 @min-[600px]:grid-rows-[auto_1fr] group-data-[hinge]/ph:@min-[900px]:grid-cols-[calc(var(--ph-pane-left,50%)+var(--ph-pane-gap,0px)/2)_minmax(0,1fr)]',
      // in two columns the card lends its three parts (face, picture, tags and action) to the rows of the gallery, so the parts of the
      // cards of one row are equally tall and start at the same height; the gap between the rows is the margin of the card
      !wide &&
        '@min-[600px]:row-span-3 @min-[600px]:grid @min-[600px]:grid-rows-subgrid @min-[600px]:gap-y-0',
    ),
    face: cn(
      split && '@min-[600px]:col-start-2 @min-[600px]:row-start-1',
      !wide && '@min-[600px]:row-start-1',
    ),
    picture: cn(
      split &&
        '@min-[600px]:col-start-1 @min-[600px]:row-span-2 @min-[600px]:row-start-1',
      !wide && '@min-[600px]:row-start-2',
    ),
    body: cn(
      split && '@min-[600px]:col-start-2 @min-[600px]:row-start-2',
      !wide && '@min-[600px]:row-start-3',
    ),
  };
}
