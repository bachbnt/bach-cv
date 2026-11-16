/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

/**
 * The separator of a row of a grouped list, as a phone draws it: a hairline above every row but the first that starts at `--inset` (after
 * the icon) and runs to the edge. The row sets the inset (`[--inset:62px]`).
 */
export const ROW_SEPARATOR =
  'relative before:absolute before:top-0 before:right-0 before:left-(--inset) before:h-px before:bg-ph-line first:before:hidden';
