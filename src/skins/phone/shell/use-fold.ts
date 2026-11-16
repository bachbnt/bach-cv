/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useCallback, useEffect, useReducer } from 'react';
import { flushSync } from 'react-dom';
import { useLatest } from '@/hooks/use-latest';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import type { Fold, WindowMode } from '@/skins/phone/shell/fold-mode';
import {
  endsPhase,
  foldMotion,
  foldRest,
  foldTarget,
  phaseWait,
  type FoldAction,
  type FoldMotion,
} from '@/skins/phone/shell/fold-motion';
import { readFold, writeFold } from '@/skins/phone/shell/fold-storage';

/** The name the display carries while its box changes, and the attribute of `<html>` that says which way (the CSS of the transition is in `css/device.css`). */
const DISPLAY_TRANSITION = 'ph-display';
const FOLD_ATTRIBUTE = 'data-ph-fold';

/**
 * The fold of the device: what the screen is laid out for (`drawn`), the part of the motion that plays (`phase`), the fold the device is
 * going to (`target`) and the way to fold or unfold (`set`), which also remembers the choice. The layout changes in one update, made inside
 * a view transition when the browser has them, so the old layout is a picture that cross-fades into the new one while the box of the
 * display changes size; without view transitions it swaps at once. Reduced motion and a window without a device swap at once and do not
 * move. `end(name)` is called by the device when an animation ends; a timer ends a phase if that never comes.
 */
export function useFold(
  mode: WindowMode,
  display: HTMLElement | null,
): FoldMotion & {
  target: Fold;
  set: (fold: Fold) => void;
  end: (animationName: string) => void;
} {
  const reduced = useReducedMotion();
  const [state, dispatch] = useReducer(foldMotion, undefined, () =>
    foldRest(readFold()),
  );
  const latest = useLatest(state);
  const device = mode === 'device';
  const animating = device && !reduced;

  /** Applies an action; one that changes the layout goes through a view transition. */
  const run = useCallback(
    (action: FoldAction) => {
      const now = latest.current;
      const next = foldMotion(now, action);
      if (next === now) return;
      if (
        !animating ||
        !display ||
        !document.startViewTransition ||
        next.drawn === now.drawn
      ) {
        dispatch(action);
        return;
      }
      const html = document.documentElement;
      html.setAttribute(FOLD_ATTRIBUTE, next.drawn);
      display.style.setProperty('view-transition-name', DISPLAY_TRANSITION);
      const transition = document.startViewTransition(() => {
        flushSync(() => dispatch(action));
      });
      void transition.finished
        .catch(() => undefined)
        .finally(() => {
          html.removeAttribute(FOLD_ATTRIBUTE);
          display.style.removeProperty('view-transition-name');
        });
    },
    [latest, animating, display],
  );

  const set = useCallback(
    (fold: Fold) => {
      // a motion plays to its end, so what is stored is always what the device ends up as
      if (latest.current.phase !== 'idle' || fold === latest.current.drawn)
        return;
      writeFold(fold);
      run({ type: 'request', to: fold, animate: animating });
    },
    [latest, run, animating],
  );
  const end = useCallback(
    (animationName: string) => {
      if (endsPhase(latest.current, animationName)) run({ type: 'end' });
    },
    [latest, run],
  );

  // a window that changes size (the device appears or goes) starts again from what was chosen
  useEffect(() => {
    dispatch({ type: 'reset', to: readFold() });
  }, [mode]);

  // a phase with no animation to end it is handed over by the clock, and one whose animation never says that it ended is, a little late
  useEffect(() => {
    if (state.phase === 'idle') return;
    const timer = setTimeout(
      () => run({ type: 'end' }),
      phaseWait(state.phase),
    );
    return () => clearTimeout(timer);
  }, [state.phase, run]);

  return { ...state, target: foldTarget(state), set, end };
}
