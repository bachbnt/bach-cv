/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import Image from 'next/image';
import { jobBadge } from '@/lib/derive/job-badge';
import { cn } from '@/lib/utils';

/** The logo of a company, or the few letters of its name when it has none, in a rounded tile. Decoration: the company is named next to it. */
export function ResumeRoleMark({
  job,
  className,
}: {
  job: { company: string; shortName: string; logo: string };
  className?: string;
}) {
  return job.logo ? (
    <Image
      src={job.logo}
      alt=''
      width={128}
      height={128}
      className={cn(
        'size-12 shrink-0 rounded-ph-inner bg-ph-sheet-3 object-cover',
        className,
      )}
    />
  ) : (
    <span
      aria-hidden='true'
      className={cn(
        'grid size-12 shrink-0 place-items-center rounded-ph-inner bg-ph-sheet-3 text-[14px] font-bold',
        className,
      )}
    >
      {jobBadge(job)}
    </span>
  );
}
