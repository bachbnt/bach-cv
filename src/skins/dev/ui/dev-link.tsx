/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { cva } from 'class-variance-authority';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

/**
 * An underlined-on-hover text link of the cards and lists. As an anchor it keeps the ink of the surrounding text and the code font; as
 * a button it is blue and takes the font of its paragraph (the look these links have always had in the skin).
 */
export const devLinkVariants = cva(
  'inline-flex cursor-pointer items-center gap-[5px] border-0 border-b border-b-transparent bg-transparent p-0 hover:border-b-sky',
  {
    variants: {
      element: {
        anchor: 'font-code text-[13.5px] leading-[normal] font-medium text-ink',
        button: 'text-sky [font:inherit]',
      },
    },
  },
);

/** A text link (an anchor). */
export function DevLink({ className, ...props }: ComponentProps<'a'>) {
  return (
    <a
      data-slot='dev-link'
      className={cn(devLinkVariants({ element: 'anchor' }), className)}
      {...props}
    />
  );
}

/** A text link that runs an action (a button). */
export function DevLinkButton({
  className,
  type = 'button',
  ...props
}: ComponentProps<'button'>) {
  return (
    <button
      data-slot='dev-link'
      type={type}
      className={cn(devLinkVariants({ element: 'button' }), className)}
      {...props}
    />
  );
}
