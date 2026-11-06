/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useEffect, useRef } from 'react';

/** The colour classes of the code tokens (dev.css). The class of a line (`dv-l`) is not one of them. */
const TOKENS = ['kw', 'str', 'num', 'fn', 'tg', 'at', 'cmt'].map(
  (name) => `dv-${name}`,
);
const TOKEN_SELECTOR = TOKENS.map((name) => `.${name}`).join(',');

const tokenClass = (el: Element) =>
  TOKENS.find((name) => el.classList.contains(name));

/**
 * "Highlight occurrences", like the word highlight of VS Code: with a mouse over a token, every token of the same window with the same
 * text and the same colour class gets `data-hit` (dev.css / code-window.tsx style it). One delegated listener on the window, no state: the
 * DOM attribute is the only thing that changes, so nothing re-renders. Touch and pen do nothing, and the markup that assistive
 * technology sees is untouched.
 */
export function useTokenHighlight<T extends HTMLElement>() {
  const root = useRef<T>(null);

  useEffect(() => {
    const box = root.current;
    if (!box) return;
    let hits: Element[] = [];

    const clear = () => {
      for (const el of hits) el.removeAttribute('data-hit');
      hits = [];
    };

    const onOver = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      const token =
        event.target instanceof Element
          ? event.target.closest(TOKEN_SELECTOR)
          : null;
      if (token && hits.includes(token)) return;
      clear();
      if (!token || !box.contains(token)) return;
      const kind = tokenClass(token);
      if (!kind) return;
      const text = token.textContent;
      hits = [...box.querySelectorAll(`.${kind}`)].filter(
        (el) => el.textContent === text,
      );
      for (const el of hits) el.setAttribute('data-hit', '');
    };

    box.addEventListener('pointerover', onOver);
    box.addEventListener('pointerleave', clear);
    return () => {
      box.removeEventListener('pointerover', onOver);
      box.removeEventListener('pointerleave', clear);
      clear();
    };
  }, []);

  return root;
}
