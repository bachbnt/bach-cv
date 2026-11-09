/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { useId, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** The colour of a margin note: chalk (or marker) in one of four hues. */
const noteVariants = cva(
  'relative min-w-0 origin-top-left py-[3px] pb-1.5 font-ac-note text-[17px]/[1.32] min-[900px]:-rotate-[0.8deg] max-[899px]:mt-0.5 max-[899px]:mb-[18px] max-[899px]:border-l-[3px] max-[899px]:border-current max-[899px]:py-1.5 max-[899px]:pl-3',
  {
    variants: {
      tone: {
        a: 'text-ac-ma',
        b: 'text-ac-mb',
        c: 'text-ac-mc',
        d: 'text-ac-md',
      },
      sticky: {
        true: 'min-[900px]:sticky min-[900px]:top-[calc(var(--ac-frame-w,14px)+14px)]',
        false: '',
      },
    },
    defaultVariants: { tone: 'a', sticky: false },
  },
);

type NoteVariants = VariantProps<typeof noteVariants>;

/** The arrow from a note to the words it is about (it only decorates: the words are tied to the note by `aria-describedby`). */
function Lead() {
  return (
    <svg
      aria-hidden='true'
      viewBox='0 0 32 14'
      className='absolute top-2 -left-[33px] h-3.5 w-8 overflow-visible fill-none stroke-current stroke-[2.2] [stroke-linecap:round] [stroke-linejoin:round] max-[899px]:hidden'
    >
      <path d='M1 7 H30 M7 2 L1 7 L7 12' />
    </svg>
  );
}

/**
 * Some words and their note in the margin. On a wide screen the note stands in the right margin, tied to the words by a bracket and an arrow;
 * on a narrow one it folds under them as a quoted line. Either way it is real text, and the words it belongs to are described by it.
 */
export function AcRow({
  note,
  tone,
  sticky,
  className,
  children,
}: NoteVariants & {
  /** the note; without one the row is only its content */
  note?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  const id = useId();
  if (!note) return <div className={cn('min-w-0', className)}>{children}</div>;
  return (
    <div
      className={cn(
        'grid min-w-0 grid-cols-1 items-start min-[900px]:grid-cols-[minmax(0,1fr)_262px] min-[900px]:gap-x-[46px]',
        className,
      )}
    >
      <div
        aria-describedby={id}
        className={cn(
          'relative min-w-0 min-[900px]:after:absolute min-[900px]:after:top-[0.3em] min-[900px]:after:-right-[15px] min-[900px]:after:bottom-[0.3em] min-[900px]:after:w-[9px] min-[900px]:after:rounded-r-[7px] min-[900px]:after:border-2 min-[900px]:after:border-l-0 min-[900px]:after:border-solid min-[900px]:after:opacity-85 min-[900px]:after:content-[""]',
          tone === 'b'
            ? 'after:border-ac-mb'
            : tone === 'c'
              ? 'after:border-ac-mc'
              : tone === 'd'
                ? 'after:border-ac-md'
                : 'after:border-ac-ma',
        )}
      >
        {children}
      </div>
      <aside id={id} className={noteVariants({ tone, sticky })}>
        <Lead />
        {note}
      </aside>
    </div>
  );
}

/** A big word in a note (`6 y 9 mo`), in chalk. */
export function AcNoteBig({ children }: { children: ReactNode }) {
  return (
    <span className='block font-ac-chalk text-[34px]/none font-normal'>
      {children}
    </span>
  );
}

/** The small line under a big word in a note. */
export function AcNoteCap({ children }: { children: ReactNode }) {
  return <span className='mt-[3px] block text-[16.5px]/[1.3]'>{children}</span>;
}
