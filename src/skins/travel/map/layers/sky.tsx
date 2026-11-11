/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { memo } from 'react';
import { BIRDS, CLOUDS, STARS } from '@/skins/travel/map/scenery';

/** Sky, sun and moon, stars, far hills, clouds and birds: one static layer behind the map (decoration, screen space). */
export const Sky = memo(function Sky() {
  return (
    <div
      aria-hidden='true'
      className='tl-sky pointer-events-none absolute inset-0 overflow-hidden'
    >
      <div className='tl-sun' />
      <div className='tl-moon' />
      <div className='tl-stars'>
        {STARS.map((star, i) => (
          <i
            key={i}
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: star.size,
              height: star.size,
              animationDuration: `${star.seconds}s`,
            }}
          />
        ))}
      </div>
      <svg
        className='tl-far tl-far-1'
        viewBox='0 0 1600 300'
        preserveAspectRatio='none'
      >
        <path d='M0 300V180l120-70 90 50 130-110 120 90 110-60 140 100 120-80 150 90 110-70 160 110 120-70 130 90 70-40V300z' />
      </svg>
      <svg
        className='tl-far tl-far-2'
        viewBox='0 0 1600 300'
        preserveAspectRatio='none'
      >
        <path d='M0 300V210l90-40 120 60 100-70 140 80 110-50 150 70 120-60 130 70 110-40 160 60 150-50 120 40V300z' />
      </svg>
      {CLOUDS.map((cloud) => (
        <span
          key={cloud.y}
          className='tl-cloud'
          style={{
            top: `${cloud.y}%`,
            width: cloud.width,
            animationDuration: `${cloud.seconds}s`,
            animationDelay: `${cloud.delay}s`,
          }}
        />
      ))}
      {BIRDS.map((bird) => (
        // the bird flies by its box (a div): the same animation on the drawing, an svg root, is not done by the compositor, and the main
        // thread would draw a frame at every refresh
        <div
          key={bird.y}
          className='tl-bird'
          style={{
            top: `${bird.y}%`,
            animationDuration: `${bird.seconds}s`,
            animationDelay: `${bird.delay}s`,
          }}
        >
          <svg
            viewBox='0 0 40 16'
            width={34 * bird.scale}
            height={14 * bird.scale}
            className='block'
          >
            <path
              d='M2 12 Q10 -2 20 10 Q30 -2 38 12'
              className='fill-none stroke-tl-ink'
              strokeWidth='2.4'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
          </svg>
        </div>
      ))}
      <div className='tl-haze' />
    </div>
  );
});
