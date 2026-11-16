/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import {
  createContext,
  type Dispatch,
  type SetStateAction,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { largeTitleOpacity } from '@/skins/phone/shell/bar-scroll';
import { usePhScreen } from '@/skins/phone/shell/screen-context';

interface TitleState {
  /** whether the page has scrolled, so that there is content under the app bar */
  scrolled: boolean;
  /** the title of the open app, `''` when it has none (a status screen) */
  title: string;
  /** whether the large title has scrolled up under the app bar, so the bar shows the small one */
  collapsed: boolean;
}

interface TitleContextValue extends TitleState {
  setState: Dispatch<SetStateAction<TitleState>>;
  /** the app bar: where the large title has to go to count as gone */
  bar: HTMLElement | null;
  setBar: (bar: HTMLElement | null) => void;
}

const TitleContext = createContext<TitleContextValue | null>(null);

/** Carries the title of the open app from its page to the app bar, and whether it has been scrolled away. */
export function PhTitleProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<TitleState>({
    title: '',
    collapsed: false,
    scrolled: false,
  });
  const [bar, setBar] = useState<HTMLElement | null>(null);
  const value = useMemo(
    () => ({ ...state, setState, bar, setBar }),
    [state, bar],
  );
  return <TitleContext value={value}>{children}</TitleContext>;
}

const useTitleContext = (): TitleContextValue => {
  const value = useContext(TitleContext);
  if (!value)
    throw new Error('the title hooks must be used inside <PhTitleProvider>');
  return value;
};

/** The title the app bar shows once the large one has left, and the ref callback of the app bar. */
export const useAppBarTitle = () => {
  const { title, collapsed, scrolled, bar, setBar } = useTitleContext();
  return { title, collapsed, scrolled, bar, barRef: setBar };
};

/** The steps at which the observer reports how much of the title is visible: fine enough for the fade to follow the scroll. */
const STEPS = Array.from({ length: 21 }, (_, index) => index / 20);

/**
 * Hands the large heading of a page to the app bar: the returned `ref` goes on the `h1`. An observer (no scroll listener) says how much of
 * the heading is still below the app bar, which is measured from the root it scrolling in: the screen's own scroller if it has one, the
 * window otherwise, less the bar. The heading (and the line under it, `data-ph-lead`) fades in proportion to what is hidden, by an inline
 * opacity written without a render, and the bar's small title comes in as the heading goes (`--ph-large-r` on the screen), so the two are never
 * both legible and nothing is drawn behind the text of the bar. It is made again when the screen changes width, because the bars change height
 * with the layout. `collapsed` is whether less than half of the heading is left.
 */
export function useLargeTitle(title: string): {
  ref: (node: HTMLElement | null) => void;
  collapsed: boolean;
} {
  const { setState, bar, collapsed } = useTitleContext();
  const { scroller, width } = usePhScreen();
  const [heading, setHeading] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!heading) return;
    setState((now) => ({ ...now, title, collapsed: false }));
    const screen = heading.closest<HTMLElement>('[data-ph-screen]');
    const lead =
      heading.parentElement?.querySelector<HTMLElement>('[data-ph-lead]');
    const root =
      scroller && getComputedStyle(scroller).overflowY === 'auto'
        ? scroller
        : null;
    // where the app bar ends, from its own sticky top and height, so that a bar that has slid away does not change the answer
    const under = bar
      ? Math.round(parseFloat(getComputedStyle(bar).top) + bar.offsetHeight)
      : 0;
    const options = {
      root,
      rootMargin: `-${under}px 0px 0px 0px`,
      threshold: STEPS,
    };
    const observers = [
      new IntersectionObserver(([entry]) => {
        const visible = entry.intersectionRatio;
        heading.style.setProperty(
          'opacity',
          String(largeTitleOpacity(visible)),
        );
        screen?.style.setProperty('--ph-large-r', String(visible));
        setState((now) =>
          now.collapsed === visible < 0.5
            ? now
            : { ...now, title, collapsed: visible < 0.5 },
        );
      }, options),
    ];
    observers[0].observe(heading);
    if (lead) {
      const second = new IntersectionObserver(([entry]) => {
        lead.style.setProperty(
          'opacity',
          String(largeTitleOpacity(entry.intersectionRatio)),
        );
      }, options);
      second.observe(lead);
      observers.push(second);
    }
    return () => {
      observers.forEach((observer) => observer.disconnect());
      heading.style.removeProperty('opacity');
      lead?.style.removeProperty('opacity');
      screen?.style.removeProperty('--ph-large-r');
      setState((now) => ({ ...now, title: '', collapsed: false }));
    };
  }, [heading, title, scroller, bar, width, setState]);

  return { ref: setHeading, collapsed };
}

/**
 * The ref of a hairline at the top of the page: an observer says when it has scrolled away, and `scrolled` is then true for the app bar. It
 * looks in the scroller of the screen if the screen has one and in the window otherwise, like the large title.
 */
export function useScrollEdge(): (node: HTMLElement | null) => void {
  const { setState } = useTitleContext();
  const { scroller } = usePhScreen();
  const [edge, setEdge] = useState<HTMLElement | null>(null);
  useEffect(() => {
    if (!edge) return;
    const root =
      scroller && getComputedStyle(scroller).overflowY === 'auto'
        ? scroller
        : null;
    const observer = new IntersectionObserver(
      ([entry]) =>
        setState((now) => ({ ...now, scrolled: !entry.isIntersecting })),
      { root },
    );
    observer.observe(edge);
    return () => {
      observer.disconnect();
      setState((now) => ({ ...now, scrolled: false }));
    };
  }, [edge, scroller, setState]);
  return setEdge;
}
