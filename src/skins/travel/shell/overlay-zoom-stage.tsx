/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import Image from 'next/image';
import { cn } from '@/lib/utils';

/**
 * The stage of a picture window: the picture as a print with a white border, taped to a table, at the ratio it has. At zoom 1 it fits (a
 * height that follows the window, so nothing scrolls); more than that makes it a share of the width of the stage and the stage scrolls.
 * The viewer and the QR ticket share it, so a picture sits the same way in both. `fitClassName` sets the largest height on a phone, where
 * the stage is the room left by the other parts of the window.
 */
export function TlZoomStage({
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
  const fits = zoom === 1;
  return (
    <div className='tl-table flex h-[min(60dvh,620px)] min-h-0 flex-none overflow-auto bg-tl-chip/50 max-[700px]:h-auto max-[700px]:flex-1'>
      <div className='m-auto grid min-h-full min-w-full place-items-center p-4'>
        <figure
          style={fits ? undefined : { width: `${zoom * 100}%` }}
          className={cn(
            'tl-print relative m-0 rounded-md bg-white p-2 shadow-tl-card',
            fits ? 'max-w-full' : 'max-w-none',
          )}
        >
          {fits && <span aria-hidden='true' className='tl-tape' />}
          <Image
            key={image.src}
            src={image.src}
            alt={image.alt}
            width={image.width ?? 1200}
            height={image.height ?? 900}
            unoptimized
            data-testid={testId}
            className={cn(
              'block h-auto animate-in rounded-[3px] bg-white duration-200 fade-in-0 motion-reduce:animate-none',
              fits
                ? cn(
                    'max-h-[calc(min(60dvh,620px)-64px)] w-auto max-w-full',
                    fitClassName,
                  )
                : 'w-full max-w-none',
              imageClassName,
            )}
          />
        </figure>
      </div>
    </div>
  );
}
