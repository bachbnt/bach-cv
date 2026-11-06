/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

/**
 * The frame of a picture on a card (a project cover, a certificate, a degree, a QR code): a fixed-ratio box that clips its picture.
 * It is a `button` when it opens the viewer and a `div` when it does not (`cursor-default` then). The card sets the ratio, the
 * borders and the fit of the picture; `COVER_IMAGE` is the picture, which grows a little when the frame is hovered.
 */
export const COVER =
  'group/cover relative block aspect-[16/10] w-full cursor-zoom-in overflow-hidden border-b border-line-2 bg-chrome-2 p-0 focus-visible:-outline-offset-2 focus-visible:outline-2 focus-visible:outline-signal';

export const COVER_IMAGE =
  'object-cover object-top transition-[transform] duration-[600ms] ease-[ease] group-hover/cover:[transform:scale(1.04)]';
