/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

// The shape and the timing of the eraser that wipes one page off the board and shows the next (pure maths, no DOM).
//
// The eraser turns like an arm on a pivot below the board and crosses it along an arc, from the left edge to the lower right. Where it has
// been, the old page is gone. Then that swath swells, inward to the pivot and outward to the corners, until the board is bare. The swath is a
// RING around the pivot cut by a SECTOR (the part of the turn made so far), so each board needs only two gradient layers for its mask.

const DEG = 180 / Math.PI;

/** The timing: the whole wipe, when the eraser has crossed, when the swath starts to swell (while the eraser is still crossing, so a tall photo is not left with its top edge and tape hidden for long). */
export const WIPE = {
  ms: 1200,
  sweepEnd: 0.5,
  swellStart: 0.3,
  /** the soft edge of the swath on the two pages, in px (short: a soft edge hides the top of a photo and its tape while the eraser passes), and of the end of the sector, in degrees */
  soft: 14,
  sectorSoft: 7,
  /** the soft edge of the haze of dust, in px: the dust is soft, the pages are not */
  hazeSoft: 54,
} as const;

interface WipeGeometry {
  /** the pivot, in viewport px */
  cx: number;
  cy: number;
  /** the radius of the eraser's path */
  rho: number;
  /** where the arc begins, in radians (the top of the circle is -PI/2), and how far it turns, in degrees */
  phi0: number;
  sweepDeg: number;
  /** the `from` angle of a conic gradient that starts where the arc begins */
  fromDeg: number;
  eraserW: number;
  eraserH: number;
  /** the half width of the swath the eraser leaves, and the one that covers the whole board */
  r0: number;
  rMax: number;
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

/** The arc, the eraser and the reach of the swath for a window of this size. */
export function wipeGeometry(width: number, height: number): WipeGeometry {
  const small = width < 600;
  const eraserW = small ? 140 : 190;
  const eraserH = small ? 76 : 96;
  const cx = width / 2;
  const cy = height * 1.05;
  const rho = height * 0.7;
  // the arc enters at the left where the eraser is just out of sight, and leaves at the right the same way
  const phi0 = -Math.acos(clamp((-eraserW - cx) / rho, -1, 1));
  const phi1 = -Math.acos(clamp((width + eraserW - cx) / rho, -1, 1));
  let far = 0;
  for (const [x, y] of [
    [0, 0],
    [width, 0],
    [0, height],
    [width, height],
  ]) {
    far = Math.max(far, Math.hypot(x - cx, y - cy));
  }
  return {
    cx,
    cy,
    rho,
    phi0,
    sweepDeg: (phi1 - phi0) * DEG,
    fromDeg: phi0 * DEG + 90,
    eraserW,
    eraserH,
    r0: eraserH / 2 + 54,
    rMax: Math.max(rho, far - rho) + WIPE.soft * 2 + 24,
  };
}

interface WipeFrame {
  /** the half width of the swath where the old page is gone, and where the new one shows */
  radius: number;
  newRadius: number;
  /** how far round the circle each board is cut, in degrees (the same for both: the new page takes the place of the old as it fades) */
  oldSectorDeg: number;
  newSectorDeg: number;
  /** the haze of dust on the swath: it settles as the swath swells */
  hazeOpacity: number;
  /** the eraser: its top-left corner, its turn, and whether it is still on the board */
  eraser: { x: number; y: number; angleDeg: number; visible: boolean };
}

/** How the wipe looks at `progress` (0 to 1 of `WIPE.ms`). */
export function wipeFrame(geometry: WipeGeometry, progress: number): WipeFrame {
  const raw = clamp(progress, 0, 1);
  const crossed = Math.min(1, raw / WIPE.sweepEnd);
  const swelled = Math.max(0, (raw - WIPE.swellStart) / (1 - WIPE.swellStart));
  // the eraser eases in and out; the swath swells with a smoothstep
  const lead = (0.5 - 0.5 * Math.cos(Math.PI * crossed)) * geometry.sweepDeg;
  const swell = swelled * swelled * (3 - 2 * swelled);
  const oldSectorDeg = lead + swell * (360 - lead);
  const radius = geometry.r0 + swell * (geometry.rMax - geometry.r0);
  const phi = geometry.phi0 + lead / DEG;
  return {
    radius,
    // the soft edge of the old page fades out between `radius` and `radius + soft`; the new page fades in over the same band, so each sheet,
    // photo and tape appears whole as the old one goes, with no bare strip that would hide the top of a photo for a moment
    newRadius: radius + WIPE.soft,
    oldSectorDeg,
    newSectorDeg: oldSectorDeg,
    hazeOpacity: 0.5 * Math.max(0, 1 - swelled * 3),
    eraser: {
      x: geometry.cx + geometry.rho * Math.cos(phi) - geometry.eraserW / 2,
      y: geometry.cy + geometry.rho * Math.sin(phi) - geometry.eraserH / 2,
      angleDeg: phi * DEG + 90,
      visible: crossed < 1,
    },
  };
}

/** What a mask of a box is drawn from: where the pivot is inside the box. */
interface MaskOrigin {
  x: number;
  y: number;
}

/** The pivot as seen from the top-left corner of a box that is at `left`, `top` of the viewport. */
export const maskOrigin = (
  geometry: WipeGeometry,
  left: number,
  top: number,
): MaskOrigin => ({ x: geometry.cx - left, y: geometry.cy - top });

/** How the layers of a mask combine: the old page is seen outside the swath or outside the sector (`add`), the new one only inside both. */
type MaskComposite = 'add' | 'intersect';

export interface BoardMask {
  /** the gradient layers (always two, or one that hides everything) */
  layers: string[];
  composite: MaskComposite;
}

const px = (value: number) => `${value.toFixed(1)}px`;

/** A ring around the pivot: opaque inside the swath (`band`) or outside it (`hole`), with a soft edge. */
function ring(
  geometry: WipeGeometry,
  origin: MaskOrigin,
  radius: number,
  kind: 'band' | 'hole',
  soft: number,
): string {
  const at = `radial-gradient(circle at ${px(origin.x)} ${px(origin.y)}, `;
  const inner = geometry.rho - radius;
  const outer = geometry.rho + radius;
  return kind === 'hole'
    ? `${at}#000 ${px(inner - soft)}, transparent ${px(inner)}, transparent ${px(outer)}, #000 ${px(outer + soft)})`
    : `${at}transparent ${px(inner)}, #000 ${px(inner + soft)}, #000 ${px(outer - soft)}, transparent ${px(outer)})`;
}

/** The turn made so far: opaque inside it (`swept`) or beyond it (`rest`). */
function sector(
  geometry: WipeGeometry,
  origin: MaskOrigin,
  turnDeg: number,
  kind: 'swept' | 'rest',
): string {
  const to = Math.min(360, turnDeg);
  const end = Math.min(360, turnDeg + WIPE.sectorSoft);
  const at = `conic-gradient(from ${geometry.fromDeg.toFixed(2)}deg at ${px(origin.x)} ${px(origin.y)}, `;
  return kind === 'rest'
    ? `${at}transparent 0deg, transparent ${to.toFixed(2)}deg, #000 ${end.toFixed(2)}deg, #000 360deg)`
    : `${at}#000 0deg, #000 ${to.toFixed(2)}deg, transparent ${end.toFixed(2)}deg, transparent 360deg)`;
}

/** The old page: seen everywhere except inside the swath that the eraser has already crossed. */
export function oldBoardMask(
  geometry: WipeGeometry,
  frame: WipeFrame,
  origin: MaskOrigin,
): BoardMask {
  return {
    layers: [
      ring(geometry, origin, frame.radius, 'hole', WIPE.soft),
      sector(geometry, origin, frame.oldSectorDeg, 'rest'),
    ],
    composite: 'add',
  };
}

/** The new page: the other half of the old page's mask, so it is seen exactly where the old one has been wiped, fading in as that fades out. */
export function newBoardMask(
  geometry: WipeGeometry,
  frame: WipeFrame,
  origin: MaskOrigin,
): BoardMask {
  return {
    layers: [
      ring(geometry, origin, frame.newRadius, 'band', WIPE.soft),
      sector(geometry, origin, frame.newSectorDeg, 'swept'),
    ],
    composite: 'intersect',
  };
}

/** The haze of dust: the swath itself, softer at its edges. */
export function hazeMask(
  geometry: WipeGeometry,
  frame: WipeFrame,
  origin: MaskOrigin,
): BoardMask {
  return {
    layers: [
      ring(geometry, origin, frame.radius, 'band', WIPE.hazeSoft),
      sector(geometry, origin, frame.oldSectorDeg, 'swept'),
    ],
    composite: 'intersect',
  };
}
