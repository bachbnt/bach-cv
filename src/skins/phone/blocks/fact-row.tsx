/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { ReactNode } from 'react';
import { ROW_SEPARATOR } from '@/skins/phone/blocks/list-row';
import { cn } from '@/lib/utils';

/** A row of a list of facts (About, a role, a project), as in the Settings of a phone: the name of the fact, and its value (it wraps; on a narrow screen it goes under the name). */
export function FactRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        ROW_SEPARATOR,
        '[--inset:16px] grid gap-x-4 gap-y-1 px-4 py-3.5 @min-[380px]:grid-cols-[7.5rem_minmax(0,1fr)]',
      )}
    >
      <dt className='text-[14px]/[1.5] text-ph-mute'>{label}</dt>
      <dd className='text-[16px]/[1.5] font-semibold [overflow-wrap:anywhere]'>
        {children}
      </dd>
    </div>
  );
}
