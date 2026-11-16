/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

/**
 * The two panes of a page on an open device: the left one is as wide as the shell says (`--ph-pane-left`, `--ph-pane-gap`: the crease lies
 * in the gap and both panes keep the same margin at their outer edge). Until the shell has set them the panes are equal halves.
 */
export const HINGE_PANES =
  'group-data-[hinge]/ph:@min-[900px]:grid-cols-[var(--ph-pane-left,calc((100%_-_var(--ph-pane-gap,2.5rem))_/_2))_minmax(0,1fr)] group-data-[hinge]/ph:@min-[900px]:gap-x-[var(--ph-pane-gap,2.5rem)]';
