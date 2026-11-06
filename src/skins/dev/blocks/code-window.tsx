/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import type { CSSProperties, ReactNode } from 'react';
import { useTokenHighlight } from '@/skins/dev/blocks/use-token-highlight';

/** A line of code (`dv-l` is the hook of the line-by-line reveal in dev.css): its number is a counter, and a long line wraps under its own text, not under the number. */
const LINE =
  'flex pr-4 whitespace-pre before:mr-4 before:inline-block before:w-[42px] before:flex-none before:text-right before:text-dim before:content-[counter(ln)] before:[counter-increment:ln]';

/** A code window: a tab with a file name, then numbered lines. It is decoration, so it is hidden from assistive technology. With a mouse, the tokens equal to the one under the pointer are lit (`useTokenHighlight`). */
export function CodeWindow({
  icon,
  file,
  language,
  lines,
}: {
  icon: ReactNode;
  file: string;
  language: string;
  lines: ReactNode[];
}) {
  const box = useTokenHighlight<HTMLDivElement>();
  return (
    <div
      aria-hidden='true'
      ref={box}
      className='overflow-hidden rounded-[8px] border border-line-2 bg-editor shadow-[0_18px_44px_rgba(0,0,0,0.3)] [html:not(.dark)_&]:shadow-[0_14px_34px_rgba(0,0,0,0.1)]'
    >
      <div className='flex h-[35px] items-center gap-[9px] border-b border-line bg-chrome px-3 font-sans text-[13px] leading-[normal] text-mute'>
        {icon}
        <span className='text-head'>{file}</span>
        <span className='ml-auto'>{language}</span>
      </div>
      <pre className='m-0 overflow-x-auto py-3 font-code text-[13.5px] leading-[1.7] text-ink [counter-reset:ln]'>
        {lines.map((line, i) => (
          <span
            // the lines never reorder
            key={i}
            className={`dv-l ${LINE}`}
            style={{ '--k': i } as CSSProperties}
          >
            <span className='min-w-0 whitespace-pre-wrap [overflow-wrap:anywhere]'>
              {line}
            </span>
          </span>
        ))}
      </pre>
    </div>
  );
}
