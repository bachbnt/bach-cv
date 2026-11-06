/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import {
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
} from 'react';
import { commonCopy } from '@/content/copy/common';
import { shell } from '@/lib/content/shell';
import { useCopy } from '@/lib/i18n/copy';
import { cn } from '@/lib/utils';

/** The height of a line of the editor (`h-6` on a line number). */
const LINE = 24;
/** Space above the first line. */
const TOP = 8;
/** The width of a character in the editor font, to turn a click position into a column. */
const CHAR = 8.1;

export interface Caret {
  line: number;
  column: number;
}

/**
 * The editor area: line numbers in the gutter, the page as the content. The number of the line under the pointer is lit; a click
 * moves the caret of the status bar (Ln, Col). The line itself is never lit.
 */
export function EditorFrame({
  children,
  onCaret,
}: {
  children: ReactNode;
  onCaret: (caret: Caret) => void;
}) {
  const copy = useCopy(commonCopy);
  const editor = useRef<HTMLDivElement>(null);
  const wrap = useRef<HTMLElement>(null);
  const frame = useRef(0);
  const [hover, setHover] = useState<number | null>(null);
  const [lines, setLines] = useState(60);

  // there is a line number for every line of content
  useEffect(() => {
    const box = editor.current;
    if (!box) return;
    const count = () =>
      setLines(Math.max(1, Math.ceil(box.scrollHeight / LINE)));
    count();
    const observer = new ResizeObserver(count);
    observer.observe(box);
    if (wrap.current) observer.observe(wrap.current);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame.current);
    };
  }, []);

  const lineAt = (clientY: number) => {
    const top = editor.current?.getBoundingClientRect().top ?? 0;
    return Math.max(
      1,
      Math.min(lines, Math.floor((clientY - top - TOP) / LINE) + 1),
    );
  };

  const onMove = (event: PointerEvent) => {
    const y = event.clientY;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => setHover(lineAt(y)));
  };

  const onClick = (event: MouseEvent) => {
    if (
      (event.target as Element).closest(
        'a,button,input,textarea,select,summary,label,[role=button]',
      )
    )
      return;
    const line = lineAt(event.clientY);
    const left = wrap.current?.getBoundingClientRect().left ?? 0;
    onCaret({
      line,
      column: Math.max(1, Math.floor((event.clientX - left) / CHAR) + 1),
    });
  };

  return (
    <div
      className='relative min-w-0 flex-1 pr-[112px] pb-10 pl-[74px] max-[900px]:px-[18px] max-[900px]:pb-[30px] max-[1180px]:pr-7'
      ref={editor}
      onPointerMove={onMove}
      onPointerLeave={() => setHover(null)}
      onClick={onClick}
    >
      <div
        className='pointer-events-none absolute top-0 bottom-0 left-0 w-[58px] overflow-hidden bg-editor pt-2 pr-3.5 text-right font-code text-[13px]/6 text-dim select-none max-[900px]:hidden'
        aria-hidden='true'
      >
        {Array.from({ length: lines }, (_, i) => (
          <span
            key={i}
            className={cn(
              'block h-6 transition-colors duration-[120ms]',
              hover === i + 1 && 'text-ink',
            )}
          >
            {i + 1}
          </span>
        ))}
      </div>
      <main className='relative z-1 max-w-[1120px]' ref={wrap}>
        {children}
        <footer className='pt-[30px] pb-1.5 font-code text-[13px] leading-[normal] text-mute'>
          &copy; {new Date().getFullYear()} {shell.name}. {copy.footer.rights}
        </footer>
      </main>
    </div>
  );
}
