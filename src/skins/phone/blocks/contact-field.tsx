/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * The class of a text control of the form: 56 px high with room for the label that floats above the text, 16 px so a phone does not zoom in, a
 * strong edge, a clear edge on focus and a red one when it is wrong. The control has an empty placeholder so the `placeholder-shown` state knows when
 * it is empty. The `md:` is the one of the shadcn input, which it overrides.
 */
export const contactControl =
  'peer h-14 rounded-ph-inner border-[1.5px] border-ph-mute/50 bg-ph-sheet px-4 pt-5 pb-1 text-[16px] text-ph-ink placeholder:text-transparent focus-visible:border-ph-accent focus-visible:ring-0 aria-invalid:border-ph-danger aria-invalid:ring-0 md:text-[16px] dark:bg-ph-sheet dark:aria-invalid:border-ph-danger dark:aria-invalid:ring-0';

/**
 * A field of the form like the ones of a phone's settings: the label sits in the control and floats up when it is focused or has text, then
 * come the error text (announced as it appears) and an optional counter below. The control comes first so its state drives the label.
 */
export function ContactField({
  id,
  label,
  error,
  aside,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  aside?: ReactNode;
  children: ReactNode;
}) {
  const errorLine = (
    <span
      id={`${id}-error`}
      className='min-h-5 text-[14px]/[1.4] font-medium text-ph-danger'
    >
      {error && <span role='alert'>{error}</span>}
    </span>
  );
  return (
    <div className='flex flex-col gap-1.5'>
      <div className='relative'>
        {children}
        <label
          htmlFor={id}
          className={cn(
            'pointer-events-none absolute top-0 left-4 flex h-14 origin-top-left items-center text-[16px] text-ph-mute transition-[translate,scale] duration-[180ms]',
            'peer-focus:-translate-y-2.5 peer-focus:scale-[0.78] peer-focus:font-semibold peer-focus:text-ph-accent-ink',
            'peer-[&:not(:placeholder-shown)]:-translate-y-2.5 peer-[&:not(:placeholder-shown)]:scale-[0.78]',
            'peer-autofill:-translate-y-2.5 peer-autofill:scale-[0.78]',
            'peer-aria-invalid:text-ph-danger',
          )}
        >
          {label}
        </label>
      </div>
      {aside ? (
        <div className='flex justify-between gap-3 text-[13px] text-ph-mute'>
          {errorLine}
          {aside}
        </div>
      ) : (
        errorLine
      )}
    </div>
  );
}
