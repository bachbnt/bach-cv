/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { ReactNode } from 'react';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';

/** Label above, control in the middle, the error text (and an optional counter) below. */
export function FormField({
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
  return (
    <Field
      className='grid content-start gap-1.5 *:w-auto'
      data-invalid={!!error}
    >
      {/* a real <label for>: the decorative "val " is kept out of the accessible name */}
      <FieldLabel
        htmlFor={id}
        className='block w-auto font-code text-[12.5px] leading-[inherit] font-medium text-mute before:text-kw before:content-["val_"/""]'
      >
        {label}
      </FieldLabel>
      {children}
      <div className='min-h-[1lh] font-code text-[12.5px] leading-[normal]'>
        <FieldError
          id={`${id}-error`}
          role={undefined}
          className='min-h-[1em] font-code text-[12.5px] leading-[normal] text-err'
        >
          {error}
        </FieldError>
      </div>
      {aside}
    </Field>
  );
}
