/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { WORLD, type Pt } from '@/skins/moba/world/geometry';

/** How far past the edge of the map the camera may look, in pixels: the dark forest around the arena. */
export const SLACK = 130;

export interface View {
  w: number;
  h: number;
}

/** How many screen pixels one map unit is: the map is drawn bigger than the window and the camera follows the champion over it. */
export function scaleFor(view: View): number {
  // a phone sees a smaller part of the map than a desktop does
  return view.w < 720 ? 1.25 : view.w < 1100 ? 1.5 : 1.75;
}

/**
 * Where the world sits on the stage so the champion is at `focus` (a point of the stage in pixels). The camera may show a little beyond
 * the edge of the map (`SLACK`), enough that a champion in a corner is lifted clear of the champion bar; a stage larger than the map
 * centres it.
 */
export function cameraOffset(
  pos: Pt,
  scale: number,
  view: View,
  focus: Pt,
): Pt {
  const size = WORLD * scale;
  const clamp = (wanted: number, room: number): number =>
    size <= room
      ? (room - size) / 2
      : Math.min(SLACK, Math.max(room - size - SLACK, wanted));
  return {
    x: clamp(focus.x - pos.x * scale, view.w),
    y: clamp(focus.y - pos.y * scale, view.h),
  };
}

/** The map point under a point of the stage (a click), given the camera. */
export function worldAt(screen: Pt, camera: Pt, scale: number): Pt {
  return { x: (screen.x - camera.x) / scale, y: (screen.y - camera.y) / scale };
}

/** What the HUD covers, in pixels: the list of places on the left, the top bar, the panel of the page on the right and the champion bar. */
export interface Insets {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

/** The width of the page panel on a wide screen. */
export const panelWidth = (view: View): number => Math.min(780, view.w * 0.54);

export const WIDE_VIEW = 1100;
export const isWide = (view: View): boolean => view.w >= WIDE_VIEW;

export function insetsFor(view: View, panelOpen: boolean): Insets {
  if (isWide(view))
    return {
      left: 84,
      top: 56,
      right: panelOpen ? panelWidth(view) : 0,
      bottom: 176,
    };
  // on a phone the panel covers the stage, and the map has the part above the champion bar
  return { left: 0, top: 52, right: 0, bottom: view.w < 720 ? 150 : 170 };
}

/** The middle of the part of the stage that nothing covers: where the camera keeps the champion. */
export function focusFor(view: View, panelOpen: boolean): Pt {
  const inset = insetsFor(view, panelOpen);
  return {
    x: (inset.left + view.w - inset.right) / 2,
    y: (inset.top + view.h - inset.bottom) / 2,
  };
}
