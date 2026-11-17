/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { Fold } from '@/skins/phone/shell/fold-mode';

/**
 * Where the device is in a fold. `drawn` is the state the screen is laid out for (the phone layout is the cover screen, the tablet layout
 * the inner one), `phase` the part of the motion that plays. The device opens like a book from its cover: the cover half swings TOWARD the
 * viewer about the hinge and lands flat on the left, the half behind it stays.
 *
 * Unfolding: `sliding` (the closed device slides right to where the half that stays is, and the cover screen dims), `swinging` (the
 * cover half lifts and turns over to the left, in front of the device, the screen at its dimmest), then `landing` (it flattens, and the layout changes to the
 * tablet's as a view transition while the screen is still at its dimmest: the inner display then lights up as the angle opens). Folding is the reverse:
 * `folding` (the left half swings back over the right one and the inner screen dims as the angle closes), then `closing` (the layout changes to the
 * phone's under a view transition, at the vertical, where the screen is at its dimmest, and the half goes on to lie over the right one), then `returning` (the cover
 * screen lights up and the device slides back to the middle). The layout therefore changes in one step, at the start of `landing` and of `closing`,
 * always at the dimmest point of the screen (`shell/fold-dim.ts`) and under a cross-fade.
 */
export interface FoldMotion {
  drawn: Fold;
  phase:
    | 'idle'
    | 'sliding'
    | 'swinging'
    | 'landing'
    | 'folding'
    | 'closing'
    | 'returning';
}

export type FoldAction =
  | { type: 'request'; to: Fold; animate: boolean }
  | { type: 'end' }
  | { type: 'reset'; to: Fold };

export const foldRest = (drawn: Fold): FoldMotion => ({
  drawn,
  phase: 'idle',
});

export function foldMotion(state: FoldMotion, action: FoldAction): FoldMotion {
  switch (action.type) {
    case 'reset':
      return foldRest(action.to);
    case 'request': {
      // a motion plays to its end; asking again meanwhile does nothing
      if (state.phase !== 'idle' || action.to === state.drawn) return state;
      if (!action.animate) return foldRest(action.to);
      // folding starts with the layout of the open device: it changes at the vertical, not now
      return action.to === 'open'
        ? { drawn: 'folded', phase: 'sliding' }
        : { drawn: 'open', phase: 'folding' };
    }
    case 'end':
      switch (state.phase) {
        case 'sliding':
          return { drawn: 'folded', phase: 'swinging' };
        case 'swinging':
          return { drawn: 'open', phase: 'landing' };
        case 'landing':
          return foldRest('open');
        case 'folding':
          return { drawn: 'folded', phase: 'closing' };
        case 'closing':
          return { drawn: 'folded', phase: 'returning' };
        case 'returning':
          return foldRest('folded');
        case 'idle':
          return state;
      }
  }
}

/** The fold the device is going to, or is in: what the Fold button says. */
export const foldTarget = (state: FoldMotion): Fold =>
  state.phase === 'sliding' ||
  state.phase === 'swinging' ||
  state.phase === 'landing'
    ? 'open'
    : state.phase === 'idle'
      ? state.drawn
      : 'folded';

type Moving = Exclude<FoldMotion['phase'], 'idle'>;

/**
 * How each phase ends (`css/device.css`): `event` is the CSS animation whose end is the end of the phase, `ms` how long that takes; a phase with
 * no `event` is handed over by the clock after `ms`, a little before what it plays has quite ended: the swing is one animation of 380 ms that
 * runs through `swinging` and `landing` (the layout changes 120 ms into it, a little before the half is at the vertical), the swing back is one animation that runs through
 * `folding` and `closing` (the layout changes 160 ms into it, when the screen has dimmed and the half is 60 degrees from closed), and the end of a swing back is so slow that the slide would seem to wait for it.
 */
export const PHASES: Record<Moving, { ms: number; event?: string }> = {
  sliding: { ms: 180, event: 'ph-fold-slide-display' },
  swinging: { ms: 120 },
  landing: { ms: 260, event: 'ph-fold-open-flap' },
  folding: { ms: 160 },
  closing: { ms: 150 },
  returning: { ms: 180, event: 'ph-fold-return-display' },
};

/** When a phase is ended by the clock: on time for one with no event, a little late for one whose animation did not say that it ended. */
export const phaseWait = (phase: Moving): number =>
  PHASES[phase].event ? PHASES[phase].ms + 400 : PHASES[phase].ms;

/** Whether the animation that has just ended is the one that ends the phase in progress (a late event of the one before is not). */
export const endsPhase = (state: FoldMotion, animationName: string): boolean =>
  state.phase !== 'idle' && PHASES[state.phase].event === animationName;
