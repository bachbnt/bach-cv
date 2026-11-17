/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

/*
 * An app opens by ZOOMING out of its icon, and closes by zooming back into it: the app itself (its first screen, with its bar and its title) is scaled from the
 * place and size of the icon to the whole screen, a window that grows with the corners of the icon (a 30% squircle) to those of the display, and the home
 * screen behind it recedes. These are the numbers and the maths, with no DOM, so that they can be tested: the rects are in px of the layout (a device that is scaled
 * to fit a small window is divided by its scale before they come here), in the system of the window the app opens in (the screen of a device, the viewport of a window).
 */

/** a box: where it starts and how big it is */
export interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** the four corners of a box, in the order of CSS: top left, top right, bottom right, bottom left */
export type Corners = readonly [number, number, number, number];

/**
 * how long a zoom takes, in ms, and its curve: it starts gently (the icon is seen to grow, not to jump), then settles softly, and it has no overshoot: no control
 * point goes past 1, so the box never goes beyond the window and nothing spills
 */
export const ZOOM_MS = 360;
export const ZOOM_CURVE = [0.3, 0.55, 0.1, 1] as const;
export const ZOOM_EASING = `cubic-bezier(${ZOOM_CURVE.join(', ')})`;
/** a short cross-fade for a visitor who asked for less motion, and for a page that is not zoomed (the rail, an address) */
export const FADE_MS = 120;
/** the home screen behind the app: how small it gets and how much of it is left (it is over the dark glass of the display, so it dims) */
export const RECEDE = { scale: 0.92, opacity: 0.55 } as const;
/** the part of the zoom in which the icon becomes the app (opening) and the app becomes the icon (closing): the first third, and the last third */
export const CROSS = 1 / 3;
/** an intent that is not used within this long is stale (a slow route in a development server takes a while) */
export const INTENT_MS = 8000;

/** A CSS `inset()` that cuts to `box` inside a container of `size`, with rounded corners. */
export function inset(
  box: Box,
  size: { width: number; height: number },
  corners: Corners,
): string {
  const px = (value: number) => `${round(value)}px`;
  return `inset(${px(box.y)} ${px(size.width - box.x - box.width)} ${px(size.height - box.y - box.height)} ${px(box.x)} round ${corners.map(px).join(' ')})`;
}

const round = (value: number): number => Math.round(value * 100) / 100;

/** The scale at which the app, laid out at the size of the window, is as wide as the icon. */
export const iconScale = (icon: Box, view: Box): number =>
  icon.width / view.width;

/** The keyframes of a zoom between the icon and the window. `to` and `from` are for opening (the icon first); closing plays them the other way round. */
export interface ZoomPlan {
  /** the `clip-path` that cuts what is seen: the icon, then the window, with the corners of each */
  clip: [string, string];
  /** the `transform` of the app, laid out at its full size, with its origin at its top left: the icon's size and place, then the identity */
  content: [string, string];
}

/**
 * The plan of a zoom of an app between an `icon` and the `view` (the window it opens in) inside a container of `size` (the box that is clipped: the page, which is as
 * tall as its content in a window of a phone). The clip and the transform have the same easing and the same two ends, so that the visible box and the scale of what is in it
 * are always one and the same interpolation: the app is never stretched, and its left and right edges follow those of the box.
 */
export function zoomPlan(input: {
  icon: Box;
  view: Box;
  size: { width: number; height: number };
  iconCorners: Corners;
  viewCorners: Corners;
}): ZoomPlan {
  const { icon, view, size, iconCorners, viewCorners } = input;
  const s = iconScale(icon, view);
  return {
    clip: [inset(icon, size, iconCorners), inset(view, size, viewCorners)],
    content: [
      `translate(${round(icon.x - s * view.x)}px, ${round(icon.y - s * view.y)}px) scale(${Math.round(s * 10000) / 10000})`,
      'translate(0px, 0px) scale(1)',
    ],
  };
}

/** The same cubic-bezier as `ZOOM_EASING`, as a function, for the tests: the progress of the zoom at `x` of its time. */
export function easeAt(x: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const [x1, y1, x2, y2] = ZOOM_CURVE;
  const point = (a: number, b: number, t: number) =>
    3 * (1 - t) ** 2 * t * a + 3 * (1 - t) * t * t * b + t ** 3;
  let low = 0;
  let high = 1;
  for (let i = 0; i < 40; i++) {
    const middle = (low + high) / 2;
    if (point(x1, x2, middle) < x) low = middle;
    else high = middle;
  }
  return point(y1, y2, (low + high) / 2);
}

/** The box a zoom shows at progress `p` (0 the icon, 1 the window): a straight interpolation, the same for the clip and for what is in it. */
export const boxAt = (icon: Box, view: Box, p: number): Box => ({
  x: icon.x + (view.x - icon.x) * p,
  y: icon.y + (view.y - icon.y) * p,
  width: icon.width + (view.width - icon.width) * p,
  height: icon.height + (view.height - icon.height) * p,
});

/** Whether `box` lies inside `bounds`, with `tolerance` px to spare on every side. */
export const isInside = (box: Box, bounds: Box, tolerance = 0): boolean =>
  box.x >= bounds.x - tolerance &&
  box.y >= bounds.y - tolerance &&
  box.x + box.width <= bounds.x + bounds.width + tolerance &&
  box.y + box.height <= bounds.y + bounds.height + tolerance;

/** `box` moved (not resized) the least that puts it inside `bounds`: the icon of an app that is below the fold of the home screen is zoomed into at the edge of the window, not out of it. */
export function clampInside(box: Box, bounds: Box): Box {
  const x = Math.min(
    Math.max(box.x, bounds.x),
    Math.max(bounds.x, bounds.x + bounds.width - box.width),
  );
  const y = Math.min(
    Math.max(box.y, bounds.y),
    Math.max(bounds.y, bounds.y + bounds.height - box.height),
  );
  return { ...box, x, y };
}

/** A box taken from a `DOMRect`, in the system of `origin` and divided by the `scale` the device is drawn at. */
export function relativeTo(rect: Box, origin: Box, scale: number): Box {
  return {
    x: (rect.x - origin.x) / scale,
    y: (rect.y - origin.y) / scale,
    width: rect.width / scale,
    height: rect.height / scale,
  };
}

/** The keyframes of the opacity of what is in the window: the icon becomes the app in the first third (opening), the app becomes the icon in the last third (closing). */
export const crossOpacity = (
  direction: 'open' | 'close',
): { opacity: number; offset: number }[] =>
  direction === 'open'
    ? [
        { opacity: 0, offset: 0 },
        { opacity: 1, offset: CROSS },
        { opacity: 1, offset: 1 },
      ]
    : [
        { opacity: 1, offset: 0 },
        { opacity: 1, offset: 1 - CROSS },
        { opacity: 0, offset: 1 },
      ];
