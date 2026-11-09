/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { Crosshair, Minus, Plus } from 'lucide-react';
import type { travelMapCopy } from '@/content/copy/travel-map';
import { ROTATION } from '@/skins/travel/map/iso';

/** Zoom and recentre buttons and the compass: real buttons with names, so the map can be driven without the pointer. */
export function MapControls({
  words,
  onZoom,
  onRecentre,
}: {
  words: (typeof travelMapCopy)['en'];
  onZoom: (factor: number) => void;
  onRecentre: () => void;
}) {
  const turn = (ROTATION * 180) / Math.PI;
  return (
    <div className='tl-controls'>
      <button
        type='button'
        className='tl-compass'
        aria-label={words.compass}
        onClick={onRecentre}
      >
        <svg viewBox='0 0 40 40' aria-hidden='true' focusable='false'>
          <circle
            cx='20'
            cy='20'
            r='18'
            className='fill-none stroke-tl-ink'
            opacity='0.2'
          />
          <g
            style={{
              transform: `rotate(${turn}deg)`,
              transformOrigin: '20px 20px',
            }}
          >
            <path d='M20 4l5 16h-10z' className='fill-tl-coral' />
            <path d='M20 36l5-16h-10z' className='fill-tl-ink' opacity='0.35' />
          </g>
          <circle
            cx='20'
            cy='20'
            r='2'
            className='fill-tl-solid stroke-tl-ink'
            strokeWidth='1'
          />
        </svg>
      </button>
      <div className='tl-zoom'>
        <button
          type='button'
          aria-label={words.zoomIn}
          onClick={() => onZoom(1.4)}
        >
          <Plus aria-hidden='true' />
        </button>
        <button
          type='button'
          aria-label={words.zoomOut}
          onClick={() => onZoom(1 / 1.4)}
        >
          <Minus aria-hidden='true' />
        </button>
        <button type='button' aria-label={words.recentre} onClick={onRecentre}>
          <Crosshair aria-hidden='true' />
        </button>
      </div>
    </div>
  );
}
