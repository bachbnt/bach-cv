/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

/** The two panes of the roles on a tablet: the list at most 23 rem wide, the role beside it (the panes of an open device are `HINGE_PANES`). */
export const ROLES_GRID =
  'grid gap-6 @min-[900px]:grid-cols-[minmax(0,23rem)_minmax(0,1fr)] @min-[900px]:items-start';

/** The cards of the skills by area and of the degrees: one column, two on a tablet, each as tall as it is. */
export const RESUME_CARDS_GRID =
  'grid gap-4 @min-[900px]:grid-cols-2 @min-[900px]:items-start';
