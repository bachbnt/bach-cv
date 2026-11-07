/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type FocusEvent as ReactFocusEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import {
  advance,
  DEFAULT_SPEED,
  nextSpeed,
  sceneOf,
  yearAt,
  type CareerSpanInput,
  type Speed,
} from '@/skins/stream/blocks/career-chapters';
import { useReducedMotion } from '@/skins/stream/blocks/career-use-reduced-motion';

const subscribeVisibility = (notify: () => void) => {
  document.addEventListener('visibilitychange', notify);
  return () => document.removeEventListener('visibilitychange', notify);
};
const tabVisible = () => document.visibilityState === 'visible';

/**
 * The clock of the career player. `jobs` are the roles from the oldest to the newest and must keep their identity between renders.
 * It runs only while the player is on screen, the tab is visible, the visitor has not paused it, nothing holds it (the pointer or the
 * keyboard focus on the player) and the visitor did not ask for less motion. The progress inside the scene is written to the
 * `--sm-cp` property of the player element (no render for it); a render happens only when the scene or the year changes.
 */
export interface CareerPlayerState {
  /** the callback that hands the element of the player to the clock */
  attach: (element: HTMLElement | null) => void;
  scene: number;
  /** whether the clock is going right now (a test waits for this to change before it moves the time) */
  running: boolean;
  year: number;
  speed: Speed;
  cycleSpeed: () => void;
  /** the play button shows Pause while the career is meant to be playing, even if the pointer holds it for now */
  playing: boolean;
  ended: boolean;
  reducedMotion: boolean;
  /** `pointer` ends the hold of the pointer and the focus, so the career goes on while the pointer is still there */
  seek: (to: number, pointer?: boolean) => void;
  toggle: () => void;
  hold: {
    onPointerEnter: (e: ReactPointerEvent) => void;
    onPointerLeave: () => void;
    onFocus: (e: ReactFocusEvent) => void;
    onBlur: (e: ReactFocusEvent) => void;
  };
}

export function useCareerPlayer(
  jobs: readonly CareerSpanInput[],
  now: Date,
): CareerPlayerState {
  const count = jobs.length;
  const reducedMotion = useReducedMotion();
  const visible = useSyncExternalStore(
    subscribeVisibility,
    tabVisible,
    () => true,
  );
  const [root, setRoot] = useState<HTMLElement | null>(null);
  const [inView, setInView] = useState(false);
  const [index, setIndex] = useState(0);
  const [year, setYear] = useState<number | null>(null);
  const [speed, setSpeed] = useState<Speed>(DEFAULT_SPEED);
  const [paused, setPaused] = useState(false);
  const [ended, setEnded] = useState(false);
  const [hoverHold, setHoverHold] = useState(false);
  const [focusHold, setFocusHold] = useState(false);
  const pos = useRef(0);

  const running =
    inView &&
    visible &&
    !paused &&
    !ended &&
    !hoverHold &&
    !focusHold &&
    !reducedMotion &&
    count > 0;

  // with reduced motion a scene is shown whole, so its bar is full
  const writeProgress = useCallback(
    (at: number) => {
      const progress = reducedMotion ? 1 : at - sceneOf(at, count);
      root?.style.setProperty('--sm-cp', String(Math.min(1, progress)));
    },
    [root, count, reducedMotion],
  );

  const paint = useCallback(
    (at: number) => {
      writeProgress(at);
      setIndex(sceneOf(at, count));
      setYear(yearAt(jobs, at, now));
    },
    [writeProgress, count, jobs, now],
  );

  useEffect(() => writeProgress(pos.current), [writeProgress]);

  useEffect(() => {
    if (!root) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.3 },
    );
    observer.observe(root);
    return () => observer.disconnect();
  }, [root]);

  useEffect(() => {
    if (!running) return;
    let frame = 0;
    let last = performance.now();
    const tick = (time: number) => {
      const step = advance(pos.current, time - last, speed, count);
      last = time;
      pos.current = step.pos;
      paint(step.pos);
      if (step.ended) setEnded(true);
      else frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [running, speed, count, paint]);

  /** A press on a control ends the hold of the pointer and the focus, so the career goes on while the pointer is still there. */
  const release = () => {
    setHoverHold(false);
    setFocusHold(false);
  };

  const seek = (to: number, pointer = false) => {
    const at = Math.min(Math.max(0, to), Math.max(0, count - 1));
    pos.current = at;
    setEnded(false);
    paint(at);
    if (pointer) release();
  };

  const toggle = () => {
    release();
    if (ended) {
      pos.current = 0;
      setEnded(false);
      setPaused(false);
      paint(0);
      return;
    }
    setPaused((on) => !on);
  };

  return {
    attach: setRoot,
    scene: sceneOf(index, count),
    running,
    year: year ?? yearAt(jobs, index, now),
    speed,
    cycleSpeed: () => setSpeed(nextSpeed),
    playing: !paused && !ended,
    ended,
    reducedMotion,
    seek,
    toggle,
    hold: {
      onPointerEnter: (e: ReactPointerEvent) => {
        if (e.pointerType !== 'touch') setHoverHold(true);
      },
      onPointerLeave: () => setHoverHold(false),
      onFocus: (e: ReactFocusEvent) => {
        if (e.target.matches(':focus-visible')) setFocusHold(true);
      },
      onBlur: (e: ReactFocusEvent) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null))
          setFocusHold(false);
      },
    },
  };
}
