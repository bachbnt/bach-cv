/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

// The size of a sheet of the CV preview, shared so every skin breaks the pages in the same places.

/** A4 at 96dpi, in pixels. */
export const SHEET_WIDTH = 794;
export const SHEET_HEIGHT = 1123;

/** The room for the text: 40px above and below and 46px each side are the padding of a sheet. */
export const CONTENT_WIDTH = SHEET_WIDTH - 92;
export const CONTENT_HEIGHT = SHEET_HEIGHT - 80;
