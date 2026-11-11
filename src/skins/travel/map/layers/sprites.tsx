/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { memo, type CSSProperties } from 'react';
import { travelMapCopy } from '@/content/copy/travel-map';
import { toWorld, worldOf } from '@/skins/travel/map/iso';
import { project, haversineKm } from '@/skins/travel/map/projection';
import { BOATS } from '@/skins/travel/map/scenery';
import { ART_BOX, SightArt } from '@/skins/travel/map/sprites/sight-art';
import { CableCabin } from '@/skins/travel/map/sprites/cable-cabin';
import { BoatArt } from '@/skins/travel/map/sprites/nature-art';
import {
  CABLE_CAR,
  CITY_CENTRE,
  EDGE_SIGNS,
  SIGHTS,
} from '@/skins/travel/map/sights';
import { cn } from '@/lib/utils';

type Words = (typeof travelMapCopy)['en'];

/** The better known a place, the earlier its name chooses its place when tags would lie on each other (then the bigger drawing first). */
const RANK = new Map(
  [...SIGHTS]
    .sort((a, b) => a.fame - b.fame || b.scale - a.scale)
    .map((sight, index) => [sight.id, index] as const),
);

interface Placed {
  left: number;
  top: number;
}
const at = (lat: number, lng: number): Placed => {
  const w = worldOf(lat, lng);
  return { left: w.x, top: w.y };
};

const CABLE = (() => {
  const a = toWorld(project(CABLE_CAR.from.lat, CABLE_CAR.from.lng));
  const b = toWorld(project(CABLE_CAR.to.lat, CABLE_CAR.to.lng));
  return { a, b, path: `path('M0 0 L${b.x - a.x} ${b.y - a.y}')` };
})();

/** Everything that stands up on the map and is only scenery: the sights, boats, the cable car and the signs at the edge. */
export const Sprites = memo(function Sprites({ words }: { words: Words }) {
  return (
    <>
      <svg
        aria-hidden='true'
        focusable='false'
        className='tl-cable-line absolute top-0 left-0 overflow-visible'
        width='1'
        height='1'
      >
        <line
          x1={CABLE.a.x}
          y1={CABLE.a.y - 30}
          x2={CABLE.b.x}
          y2={CABLE.b.y - 46}
        />
      </svg>
      {/* two cabins, one going up while the other comes down, like the real cable car */}
      {[false, true].map((back) => (
        <div
          key={String(back)}
          aria-hidden='true'
          className={cn('tl-gondola absolute', back && 'tl-gondola-back')}
          style={
            {
              left: CABLE.a.x,
              top: CABLE.a.y - 30,
              '--tl-dx': `${CABLE.b.x - CABLE.a.x}px`,
              '--tl-dy': `${CABLE.b.y - CABLE.a.y - 16}px`,
            } as CSSProperties
          }
        >
          <div className='tl-gondola-in'>
            <CableCabin />
          </div>
        </div>
      ))}
      {SIGHTS.map((sight) => {
        const p = at(sight.lat, sight.lng);
        return (
          <div
            key={sight.id}
            aria-hidden='true'
            data-sight={sight.id}
            className='tl-sprite tl-sight'
            style={
              {
                left: p.left,
                top: p.top,
                zIndex: Math.round(p.top) + 1000,
                '--tl-art': sight.scale,
              } as CSSProperties
            }
          >
            {/* where the pointer finds the sight: it shows its card, and the drawing is lifted (the map reads `data-hit`) */}
            <div data-hit={sight.id} className='tl-hit' />
            <div
              className='tl-art'
              style={{
                width: ART_BOX * sight.scale,
                height: ART_BOX * sight.scale,
              }}
            >
              <SightArt art={sight.art} />
            </div>
          </div>
        );
      })}
      {/* the name tags are a layer of their own above every drawing, so no drawing stands in front of a name */}
      {SIGHTS.map((sight) => {
        const p = at(sight.lat, sight.lng);
        return (
          <div
            key={sight.id}
            aria-hidden='true'
            data-label={sight.id}
            data-rank={RANK.get(sight.id)}
            data-fame={sight.fame}
            data-side={sight.tag}
            className={cn('tl-sprite tl-label', `tl-tag-${sight.tag}`)}
            style={
              {
                left: p.left,
                top: p.top,
                zIndex: Math.round(p.top) + 4500,
                '--tl-art': sight.scale,
              } as CSSProperties
            }
          >
            <span className='tl-name'>{words.sights[sight.id].name}</span>
          </div>
        );
      })}
      {BOATS.map((boat) => {
        const p = at(boat.lat, boat.lng);
        return (
          <div
            key={`${boat.lat}-${boat.lng}`}
            aria-hidden='true'
            className='tl-sprite tl-boat'
            style={
              {
                left: p.left,
                top: p.top,
                zIndex: Math.round(p.top) + 500,
                '--tl-dur': `${boat.seconds}s`,
              } as CSSProperties
            }
          >
            <BoatArt scale={boat.scale} flip={boat.flip} />
          </div>
        );
      })}
      {EDGE_SIGNS.map((sign) => {
        const km = Math.round(haversineKm(CITY_CENTRE, sign));
        return (
          <span key={sign.id} className='tl-edge' data-edge={sign.id}>
            {words.edges[sign.id]} ·{' '}
            {words.kmFromCentre.replace('{n}', String(km))}
          </span>
        );
      })}
    </>
  );
});
