/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { ServiceGrid } from '@/skins/dev/blocks/service-grid';
import { DevSkeleton } from '@/skins/dev/ui/dev-skeleton';

/** Card-shaped placeholders in the grid of the real cards, so the page does not jump when the services arrive. */
export function ServiceListSkeleton() {
  return (
    <ServiceGrid>
      {Array.from({ length: 3 }, (_, i) => (
        <DevSkeleton key={i} className='h-[240px]' />
      ))}
    </ServiceGrid>
  );
}
