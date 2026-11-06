/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { CSSProperties } from 'react';
import { BrandIcon } from '@/components/brand-icon';

/** A brand in a small tile of its own colour (`--c`). */
export function ConnectTile({
  platform,
  color,
}: {
  platform: string;
  color: string;
}) {
  return (
    <span
      className='grid size-7 place-items-center rounded-[7px] bg-[color-mix(in_srgb,var(--c)_14%,transparent)] text-[color-mix(in_srgb,var(--c)_78%,var(--head))] [&_svg]:size-4'
      style={{ '--c': color } as CSSProperties}
    >
      <BrandIcon platform={platform} />
    </span>
  );
}
