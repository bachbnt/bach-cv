/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import Link from 'next/link';
import type { ComponentProps } from 'react';

/** The link at the end of the heading of a section or card ("See all skills", "Full resume"): 44 px high without making the heading taller. */
export function SectionLink(props: ComponentProps<typeof Link>) {
  return (
    <Link
      className='-my-2 inline-flex min-h-11 shrink-0 items-center text-[15px] font-semibold text-ph-accent-ink no-underline'
      {...props}
    />
  );
}
