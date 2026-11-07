/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import Image from 'next/image';
import { cn } from '@/lib/utils';

/**
 * The stage of a picture window: the picture on the grey desk, at the ratio it has. At zoom 1 it fits (a height that follows the window,
 * so nothing scrolls); more than that makes it a share of the width of the stage and the stage scrolls. The viewer and the QR window
 * share it, so a picture sits the same way in both. `fitClassName` sets the largest height on a phone, where the stage is the room
 * left by the other parts of the window.
 */
export function TvZoomStage({
  image,
  zoom,
  fitClassName,
  imageClassName,
  testId,
}: {
  image: { src: string; alt: string; width?: number; height?: number };
  zoom: number;
  fitClassName?: string;
  imageClassName?: string;
  testId?: string;
}) {
  return (
    <div className='flex h-[min(60dvh,620px)] min-h-0 flex-none overflow-auto bg-tv-hover max-[700px]:h-auto max-[700px]:flex-1'>
      <div className='m-auto grid min-h-full min-w-full place-items-center p-4'>
        <Image
          key={image.src}
          src={image.src}
          alt={image.alt}
          width={image.width ?? 1200}
          height={image.height ?? 900}
          unoptimized
          data-testid={testId}
          style={zoom === 1 ? undefined : { width: `${zoom * 100}%` }}
          className={cn(
            'block h-auto animate-in bg-white shadow-[0_6px_24px_rgba(0,0,0,.35)] duration-150 fade-in-0 motion-reduce:animate-none',
            zoom === 1
              ? cn(
                  'max-h-[calc(min(60dvh,620px)-32px)] w-auto max-w-full',
                  fitClassName,
                )
              : 'max-w-none',
            imageClassName,
          )}
        />
      </div>
    </div>
  );
}
