/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { User } from 'lucide-react';
import { initialOf } from '@/skins/stream/blocks/library-model';
import { cn } from '@/lib/utils';

/** The round avatar of whoever writes: the first letter of the name they typed, or a person until they type one (decoration). */
export function LibraryVisitorAvatar({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const initial = initialOf(name);
  return (
    <span
      aria-hidden='true'
      className={cn(
        'grid size-10 flex-none place-items-center rounded-full bg-sm-blue text-base font-medium text-sm-bg',
        className,
      )}
    >
      {initial || <User className='size-5' />}
    </span>
  );
}
