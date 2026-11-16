/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { cn } from '@/lib/utils';

/** A part of the Skills section: its small chalk heading and the line that says what it holds (the loaded section and its skeleton share it). */
export function ResumeSkillsSubhead({
  title,
  lead,
  className,
  leadClassName,
}: {
  title: string;
  lead: string;
  /** the room above the heading */
  className: string;
  /** the room under the line */
  leadClassName?: string;
}) {
  return (
    <>
      <h3
        className={cn(
          'mb-0 font-ac-chalk text-[26px]/[1.15] font-normal',
          className,
        )}
      >
        {title}
      </h3>
      <p className={cn('mt-1 mb-0 text-[0.95em] text-ac-mute', leadClassName)}>
        {lead}
      </p>
    </>
  );
}
