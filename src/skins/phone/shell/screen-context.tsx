/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import {
  createContext,
  useContext,
  useCallback,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from 'react';

interface Screen {
  /**
   * The layer over the screen where sheets, popovers, the viewer, the chat and the toast are put (the `container` of a Base UI portal). It is
   * as big as the screen, never bigger, and it has layout containment, so what is inside it is positioned against the layer and not the
   * window: use `absolute inset-0` (or `fixed`, which here means the same) in it. A container (`@container`) alone does NOT do this: a
   * `position: fixed` box inside a plain container is fixed to the window. The layer is itself a container of the same width as the
   * screen, so container queries work inside it. `null` until the shell has mounted.
   */
  root: HTMLElement | null;
  /** the element that scrolls the page when the screen has one of its own (a device, a tablet layout); in a phone's window the document scrolls and this does not */
  scroller: HTMLElement | null;
  /** the width of the screen in px, `0` until it has been measured */
  width: number;
}

const ScreenContext = createContext<Screen>({
  root: null,
  scroller: null,
  width: 0,
});

/**
 * What the pages of the Phone skin know of the screen they are on. The layout does not follow the window but the screen: on a phone the
 * two are the same, on a desktop the screen is the inside of a device that can be folded, so everything that depends on a width is a
 * container query (`@min-[900px]:`) or, in a script, `useScreenAtLeast`.
 */
export function PhScreenProvider({
  root,
  scroller,
  children,
}: {
  root: HTMLElement | null;
  scroller: HTMLElement | null;
  children: ReactNode;
}) {
  const subscribe = useCallback(
    (notify: () => void) => {
      if (!root) return () => undefined;
      const observer = new ResizeObserver(notify);
      observer.observe(root);
      return () => observer.disconnect();
    },
    [root],
  );
  // read from the element as the page is drawn, not from an observer a frame later: when the shell changes the size of the screen (a fold) the CSS
  // and the scripts (`useScreenAtLeast`) see the new width in the same update, and the layout is made once
  const width = useSyncExternalStore(
    subscribe,
    () => (root ? root.offsetWidth : 0),
    () => 0,
  );
  const value = useMemo(
    () => ({ root, scroller, width }),
    [root, scroller, width],
  );
  return <ScreenContext value={value}>{children}</ScreenContext>;
}

export const usePhScreen = (): Screen => useContext(ScreenContext);

/** Whether the screen is at least `px` wide: the container query of a script. `false` until the screen has been measured (a phone is assumed). */
export const useScreenAtLeast = (px: number): boolean =>
  usePhScreen().width >= px;
