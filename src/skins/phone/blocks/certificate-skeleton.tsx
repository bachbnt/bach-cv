/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { cn } from '@/lib/utils';
import { CertificateSkeletonCard } from '@/skins/phone/blocks/certificate-skeleton-card';
import { CERTIFICATE_GRID } from '@/skins/phone/blocks/certificate-layout';
import { HINGE_PANES } from '@/skins/phone/blocks/hinge-panes';

/** The lines of the name of each pass (the second has a longer one), which is what makes the faces of a row unequal. */
const NAME_LINES = [1, 2, 1] as const;

/** The three passes of the Wallet that are not there yet, in the grid of the loaded gallery: face, picture (4:3) and the block under it. */
export function CertificateSkeleton() {
  return (
    <div aria-hidden='true' className={cn(CERTIFICATE_GRID, HINGE_PANES)}>
      {NAME_LINES.map((lines, index) => (
        <CertificateSkeletonCard
          key={index}
          lines={lines}
          latest={index === 0}
          wide={index === 0 && NAME_LINES.length % 2 === 1}
        />
      ))}
    </div>
  );
}
