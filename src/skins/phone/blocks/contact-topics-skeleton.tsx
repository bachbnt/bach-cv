/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { LoadingBlock } from '@/components/loading-block';
import { PhSkeleton } from '@/skins/phone/ui/ph-skeleton';

/** The widths of the chips of the seed's services, so the row wraps as the loaded one does. */
const WIDTHS = ['w-40', 'w-40', 'w-32', 'w-50', 'w-30'] as const;

/** The topic chips that are not there yet: one for each service, 44 px tall like `ToggleChip`, in the row of `ContactTopics`. */
export function ContactTopicsSkeleton() {
  return (
    <LoadingBlock className='flex flex-wrap gap-2.5'>
      {WIDTHS.map((width, index) => (
        <PhSkeleton key={index} className={`h-11 ${width}`} />
      ))}
    </LoadingBlock>
  );
}
