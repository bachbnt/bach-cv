/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { PhIconTile } from '@/skins/phone/ui/ph-icon-tile';

/**
 * One line of the conversation: the visitor's messages hug the right edge; the assistant's sit on the left in a slot as wide as its avatar,
 * which shows the avatar beside the last bubble of a run (`show`) and stays empty beside the others (`space`), as a messenger does.
 * A message that follows one of the same side sits closer (`joined`).
 */
export function PhChatRow({
  side,
  avatar,
  joined,
  children,
}: {
  side: 'left' | 'right';
  avatar?: 'show' | 'space';
  joined?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        'flex min-w-0 items-end gap-2',
        side === 'right'
          ? 'max-w-[82%] self-end'
          : 'max-w-[calc(82%+2.5rem)] self-start',
        joined && '-mt-1',
      )}
    >
      {side === 'left' && (
        <span className='size-8 shrink-0'>
          {avatar === 'show' && (
            <PhIconTile
              tile='chat'

              className='size-8'
            />
          )}
        </span>
      )}
      {children}
    </div>
  );
}
