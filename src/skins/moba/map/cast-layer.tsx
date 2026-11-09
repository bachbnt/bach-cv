/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { AlertTriangle, Footprints, LifeBuoy, Undo2 } from 'lucide-react';
import type { CSSProperties } from 'react';
import { useFx, type CastFx } from '@/skins/moba/shell/fx-context';
import { useGame } from '@/skins/moba/shell/game-context';
import { NOVA_RADIUS } from '@/skins/moba/world/abilities';
import type { PingKind } from '@/skins/moba/world/pings';

const ICONS = {
  alert: AlertTriangle,
  onMyWay: Footprints,
  retreat: Undo2,
  assist: LifeBuoy,
} as const satisfies Record<PingKind, unknown>;

function Cast({ fx, scale }: { fx: CastFx; scale: number }) {
  const len = fx.length * scale;
  const style = {
    '--c': fx.color,
    '--len': `${len}px`,
    transform: `translate(${fx.from.x * scale}px, ${fx.from.y * scale}px)`,
  } as CSSProperties;
  if (fx.kind === 'aura')
    return (
      <span className='mb-fx' style={style}>
        <span className='mb-fx-aura' />
        <span className='mb-fx-aura mb-fx-late' />
        <span className='mb-fx-glow' />
      </span>
    );
  if (fx.kind === 'nova') {
    const size = NOVA_RADIUS * 2 * scale;
    return (
      <span className='mb-fx' style={style}>
        <span className='mb-fx-glow' />
        <span className='mb-fx-nova' style={{ width: size, height: size }} />
        <span
          className='mb-fx-nova mb-fx-late'
          style={{ width: size, height: size }}
        />
      </span>
    );
  }
  const turn = { rotate: `${fx.angle}rad` } as CSSProperties;
  return (
    <>
      <span className='mb-fx' style={style}>
        <span className='absolute top-0 left-0 origin-left' style={turn}>
          {fx.kind === 'bolt' ? (
            <span className='mb-fx-bolt' />
          ) : (
            <span className='mb-fx-trail' />
          )}
        </span>
      </span>
      {fx.kind === 'bolt' && (
        <span
          className='mb-fx'
          style={
            {
              '--c': fx.color,
              transform: `translate(${fx.to.x * scale}px, ${fx.to.y * scale}px)`,
            } as CSSProperties
          }
        >
          <span className='mb-fx-impact' />
        </span>
      )}
    </>
  );
}

/**
 * The shows of the key skills and the markers of the pings, over the map. They are decoration (the map is `aria-hidden`): a cast says
 * nothing about the owner, and what a ping does (walk, chat, recall) is also a button elsewhere.
 */
export function CastLayer() {
  const { casts, pings } = useFx();
  const { scale } = useGame();
  return (
    <>
      {casts.map((fx) => (
        <Cast key={fx.id} fx={fx} scale={scale} />
      ))}
      {pings.map((mark) => {
        const Icon = ICONS[mark.kind];
        return (
          <span
            key={mark.id}
            className='mb-pm pointer-events-none absolute z-10'
            data-ping={mark.kind}
            style={{ left: mark.at.x * scale, top: mark.at.y * scale }}
          >
            <span className='mb-pm-ring' />
            <span className='mb-pm-ring mb-fx-late' />
            <span className='mb-pm-badge mb-hex'>
              <Icon aria-hidden='true' className='size-4' />
            </span>
          </span>
        );
      })}
    </>
  );
}
