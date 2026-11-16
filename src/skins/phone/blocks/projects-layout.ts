/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { HINGE_PANES } from '@/skins/phone/blocks/hinge-panes';

/*
 * The shapes of the Projects app that the loaded page and its skeleton both draw, so that nothing moves when the data arrives: the grid of
 * the two panes, the card of rows, the frame of a row and the card of the open project.
 */

/** one column on a phone; the list and the open project side by side from 900 px, two panes with the crease in the gap on an open device */
export const PROJECTS_GRID = `grid gap-6 @min-[900px]:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] @min-[900px]:items-start ${HINGE_PANES}`;

/** the card that holds the rows */
export const PROJECT_LIST_CARD =
  'm-0 list-none overflow-hidden rounded-ph-panel bg-ph-sheet-2 p-0 shadow-ph-card';

/** the box of a row, with the line between rows that starts under the text, not under the tile, the way a list of a phone is drawn */
export const PROJECT_ROW_FRAME =
  'relative flex min-h-[4.5rem] items-start gap-3.5 px-4 py-3.5 after:absolute after:right-0 after:bottom-0 after:left-[4.875rem] after:h-px after:bg-ph-line after:content-[""] last:after:hidden';

/** the card of the open project beside the list, and the padding of what is in it (it fades at its foot) */
export const PROJECT_PANE_CARD =
  'flex min-w-0 flex-col overflow-hidden rounded-ph-panel bg-ph-sheet-2 shadow-ph-card';
export const PROJECT_PANE_BODY =
  'min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pt-5 pb-12 [mask-image:linear-gradient(to_bottom,black_calc(100%-2.5rem),transparent)]';
