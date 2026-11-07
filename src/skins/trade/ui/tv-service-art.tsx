/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { JSX } from 'react';
import type { Service } from '@/lib/content/schema';
import { cn } from '@/lib/utils';
import { TvArtApp } from '@/skins/trade/ui/tv-art-app';
import { TvArtGeneric } from '@/skins/trade/ui/tv-art-generic';
import { TvArtOss } from '@/skins/trade/ui/tv-art-oss';
import { TvArtTeaching } from '@/skins/trade/ui/tv-art-teaching';
import { TvArtWeb } from '@/skins/trade/ui/tv-art-web';
import { TvArtWriting } from '@/skins/trade/ui/tv-art-writing';

const DRAWINGS: Record<Service['art'], () => JSX.Element> = {
  app: TvArtApp,
  web: TvArtWeb,
  oss: TvArtOss,
  teaching: TvArtTeaching,
  writing: TvArtWriting,
  generic: TvArtGeneric,
};

/**
 * The picture of a service in the catalogue: a drawing in the language of the terminal (a phone of candles for the app, a dashboard with an
 * order book for the web, a commit graph with a diff for open source, an annotated lesson chart for teaching, a research note for writing,
 * an empty chart for anything else), in SVG with the skin's tokens, so it follows the theme. It is chosen by the `art` of the service. The
 * frame keeps an 11:8 ratio, so the row does not move while the page loads. Decorative: the heading of the row names the service.
 */
export function TvServiceArt({
  art,
  className,
}: {
  art: Service['art'];
  className?: string;
}) {
  const Drawing = DRAWINGS[art] ?? TvArtGeneric;
  return (
    <div
      aria-hidden='true'
      data-testid='tv-service-art'
      data-art={art}
      className={cn(
        'relative aspect-[11/8] w-full overflow-hidden rounded border border-tv-line bg-tv-bg',
        className,
      )}
    >
      <svg
        viewBox='0 0 176 128'
        focusable='false'
        className='size-full origin-center transition-transform duration-500 ease-out group-hover/row:scale-[1.04]'
      >
        <Drawing />
      </svg>
    </div>
  );
}
