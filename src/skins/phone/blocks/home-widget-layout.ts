/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

/**
 * The inside of a stat widget of the home screen, the same for every widget of a row: a title row, then a body that is as tall as what it
 * holds (the ring of the years, the count and the bars of the projects) and nothing under it, so no widget has room it does not use. The
 * widgets of a row are stretched to the same height, and the body of the shorter one centres what it holds.
 */
export const WIDGET_TITLE_ROW = 'flex items-baseline justify-between gap-2';
export const WIDGET_BODY = 'mt-2.5 flex flex-1 flex-col';
