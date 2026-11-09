/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { ArrowUpRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

const ROW =
  'group/item flex min-h-10 items-center gap-2.5 rounded px-2 py-1.5 pointer-coarse:min-h-11';

/**
 * One row of a list of links of Connect: the icon (in the brand's colour), the name and, under it, the handle, and an arrow that shows
 * on hover. With no `href` it is a plain row (the place I live). The popover of the rail and the links of About share it.
 */
export function TvLinkRow({
  href,
  external = false,
  icon,
  color,
  title,
  detail,
}: {
  href?: string;
  /** opens in a new tab (the social links), not a `mailto:` or `tel:` */
  external?: boolean;
  icon: ReactNode;
  /** the brand colour of the icon */
  color?: string;
  title: ReactNode;
  detail?: string;
}) {
  const body = (
    <>
      <span
        aria-hidden='true'
        style={color ? { color } : undefined}
        className='grid flex-none place-items-center text-tv-mute [&_svg]:size-4'
      >
        {icon}
      </span>
      <span className='flex min-w-0 flex-1 flex-col'>
        <span className='text-[13px] font-semibold'>{title}</span>
        {detail && (
          <span className='truncate text-xs text-tv-mute'>{detail}</span>
        )}
      </span>
      {href && (
        <ArrowUpRight
          aria-hidden='true'
          className='size-3.5 flex-none text-tv-mute opacity-0 group-hover/item:opacity-100 group-focus-visible/item:opacity-100'
        />
      )}
    </>
  );
  if (!href) return <div className={ROW}>{body}</div>;
  return (
    <a
      href={href}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className={cn(
        ROW,
        'transition-colors duration-100 hover:bg-tv-hover focus-visible:bg-tv-hover active:bg-tv-hover',
      )}
    >
      {body}
    </a>
  );
}
