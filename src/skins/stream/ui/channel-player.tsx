/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * The dark player a system screen plays in, as a video site shows a video that cannot be played: 16:9 (taller where the words need the
 * room), black in both themes, with the scrubber along its foot. The scrubber is decoration: `wait` has a red segment that goes back
 * and forth (Coming soon), `idle` stands still (404, maintenance). `stage` adds the red and blue glow of the Home player.
 */
export function ChannelPlayer({
  scrubber,
  stage = false,
  className,
  children,
}: {
  scrubber: 'idle' | 'wait';
  stage?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        'relative grid min-h-[220px] w-full aspect-video place-items-center overflow-hidden bg-black px-6 pt-8 pb-12 text-center text-white min-[701px]:rounded-xl',
        stage && 'sm-stage',
        className,
      )}
    >
      {children}
      <div
        aria-hidden='true'
        className='absolute inset-x-0 bottom-0 bg-linear-to-t from-black/70 to-transparent px-3 pt-8 pb-3'
      >
        <div className='relative h-[3px] overflow-hidden rounded-sm bg-white/25'>
          {scrubber === 'wait' && (
            <i className='absolute inset-y-0 left-0 block w-1/4 animate-[sm-wait-sweep_2.2s_ease-in-out_infinite] rounded-sm bg-sm-red' />
          )}
        </div>
      </div>
    </div>
  );
}
