/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import Link from 'next/link';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { devLinkVariants } from '@/skins/dev/ui/dev-link';
import { DevSectionBox } from '@/skins/dev/ui/dev-section-box';

/** The `##` heading. Its hint (a real count) fades in at the right of the title on hover; a phone and a touch screen have no hover. */
const HEADING =
  'flex cursor-default items-baseline gap-2.5 text-[21px] font-bold before:font-bold before:text-signal before:content-["##"/""]';
const HINT =
  'after:ml-3.5 after:flex-none after:font-sans after:text-[12.5px] after:leading-[normal] after:font-normal after:whitespace-nowrap after:text-dim after:italic after:content-[attr(data-hint)] after:opacity-0 after:-translate-x-1.5 after:transition-[opacity,translate] after:duration-[250ms] after:ease-[ease] hover:after:translate-x-0 hover:after:opacity-90 [@media(max-width:900px)]:after:hidden [@media(hover:none)]:after:hidden';

/** A section of a page: a `##` heading with a short line under it, an optional link at the right and the content. */
export function DevSection({
  id,
  title,
  sub,
  hint,
  action,
  children,
}: {
  id?: string;
  title: string;
  sub?: string;
  hint?: string;
  action?: { label: string; href: string };
  children: ReactNode;
}) {
  return (
    <DevSectionBox id={id}>
      <div className='mb-5 flex items-end justify-between gap-4'>
        <div className='min-w-0 flex-1'>
          <h2 data-hint={hint} className={cn(HEADING, hint && HINT)}>
            {title}
          </h2>
          {sub && <p className='mt-1 text-[15px] text-mute'>{sub}</p>}
        </div>
        {action && (
          <Link
            data-slot='dev-link'
            className={cn(
              devLinkVariants({ element: 'anchor' }),
              'leading-[inherit]',
            )}
            href={action.href}
          >
            {action.label}
            <span aria-hidden='true'> →</span>
          </Link>
        )}
      </div>
      {children}
    </DevSectionBox>
  );
}
