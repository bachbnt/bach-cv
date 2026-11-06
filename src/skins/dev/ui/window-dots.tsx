/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import type { ReactNode } from 'react';
import { devCopy } from '@/content/copy/dev';
import { useCopy } from '@/lib/i18n/copy';
import { cn } from '@/lib/utils';

type Key = 'close' | 'min' | 'max';

/** What each light looks like: its colour and the mark that shows when the pointer is over the lights. */
const LIGHTS: Record<
  Key,
  { colour: string; mark: (state: State) => ReactNode }
> = {
  close: {
    colour: 'bg-[#ff5f57]',
    mark: () => (
      <path
        d='M3.7 3.7l4.6 4.6M8.3 3.7L3.7 8.3'
        stroke='#4c0002'
        strokeWidth='1.4'
        strokeLinecap='round'
      />
    ),
  },
  min: {
    colour: 'bg-[#febc2e]',
    mark: ({ folded }) => (
      <path
        d={folded ? 'M3.2 6h5.6M6 3.2v5.6' : 'M3.2 6h5.6'}
        stroke='#5b3a00'
        strokeWidth='1.4'
        strokeLinecap='round'
      />
    ),
  },
  max: {
    colour: 'bg-[#28c840]',
    mark: ({ maximized }) => (
      <path
        d={
          maximized
            ? 'M2.6 5.5h2.9V2.6zM9.4 6.5H6.5v2.9z'
            : 'M3.5 3.5h3.2L3.5 6.7zM8.5 8.5H5.3l3.2-3.2z'
        }
        fill='#023a0b'
      />
    ),
  },
};

type State = { maximized: boolean; folded: boolean };

/** The colour of a light that does nothing in a window whose other lights work (macOS draws it grey). */
const DISABLED = 'bg-[color-mix(in_srgb,var(--dv-muted)_45%,transparent)]';

/**
 * The three lights of a macOS window. A light with an action shows its mark and reacts to the pointer. A light without one, in a
 * window whose other lights work, is grey and does not react. When none has an action the lights are decoration (the editor, the
 * terminal cards): they keep their colours and look and react to the pointer as usual, but nothing can be pressed.
 */
export function WindowDots({
  onClose,
  onMinimize,
  onMaximize,
  maximized = false,
  folded = false,
  closeLabel,
  minimizeLabel,
  maximizeLabel,
  className,
}: {
  onClose?: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  maximized?: boolean;
  folded?: boolean;
  closeLabel?: string;
  minimizeLabel?: string;
  maximizeLabel?: string;
  className?: string;
}) {
  const copy = useCopy(devCopy).windowLights;
  const state = { maximized, folded };
  const decorative = !onClose && !onMinimize && !onMaximize;
  const light = (
    handler: (() => void) | undefined,
    label: string,
    key: Key,
  ) => {
    const { colour, mark } = LIGHTS[key];
    const delay = { close: '', min: 'delay-[30ms]', max: 'delay-[60ms]' }[key];
    const className = cn(
      'relative block size-3 rounded-full',
      handler || decorative ? colour : DISABLED,
      (handler || decorative) &&
        'transition-[filter] duration-150 hover:brightness-[1.12]',
      handler &&
        'cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal active:brightness-[.8]',
    );
    const markShape = (handler || decorative) && (
      <svg
        aria-hidden='true'
        focusable='false'
        viewBox='0 0 12 12'
        className={cn(
          'absolute inset-0 size-full scale-[.55] opacity-0 transition-[opacity,transform] duration-[150ms,180ms] ease-[ease,cubic-bezier(0.3,1.5,0.5,1)] group-hover/dots:scale-100 group-hover/dots:opacity-100',
          delay,
        )}
      >
        {mark(state)}
      </svg>
    );
    return handler ? (
      <button
        type='button'
        data-light={key}
        aria-label={label}
        title={label}
        className={className}
        onClick={handler}
      >
        {markShape}
      </button>
    ) : (
      <i aria-hidden='true' data-light={key} className={className}>
        {markShape}
      </i>
    );
  };

  return (
    <div
      data-slot='dev-dots'
      className={cn('group/dots flex gap-2', className)}
      data-maximized={maximized || undefined}
      data-folded={folded || undefined}
    >
      {light(onClose, closeLabel ?? copy.close, 'close')}
      {light(onMinimize, minimizeLabel ?? copy.minimize, 'min')}
      {light(
        onMaximize,
        maximizeLabel ?? (maximized ? copy.restore : copy.maximize),
        'max',
      )}
    </div>
  );
}
