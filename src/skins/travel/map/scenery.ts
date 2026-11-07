/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

/** Boats of the bay (decoration): real water positions, how big they are, which way they face and how long a drift takes. */
export const BOATS: readonly {
  lat: number;
  lng: number;
  scale: number;
  flip: boolean;
  seconds: number;
}[] = [
  { lat: 12.238, lng: 109.218, scale: 1, flip: false, seconds: 26 },
  { lat: 12.256, lng: 109.226, scale: 0.9, flip: true, seconds: 31 },
  { lat: 12.224, lng: 109.212, scale: 0.8, flip: false, seconds: 24 },
  { lat: 12.198, lng: 109.248, scale: 1, flip: true, seconds: 34 },
  { lat: 12.187, lng: 109.262, scale: 0.9, flip: false, seconds: 29 },
  { lat: 12.172, lng: 109.285, scale: 1, flip: true, seconds: 36 },
  { lat: 12.292, lng: 109.222, scale: 0.9, flip: false, seconds: 27 },
  { lat: 12.31, lng: 109.246, scale: 1, flip: true, seconds: 33 },
  { lat: 12.205, lng: 109.222, scale: 0.8, flip: true, seconds: 22 },
  { lat: 12.17, lng: 109.262, scale: 0.9, flip: false, seconds: 30 },
];

/** A seeded random in [0, 1): the stars and clouds are the same for everybody. */
export function seeded(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = seeded(11);
/** Stars (visible at night): position in percent, size in px, twinkle length in seconds. */
export const STARS = Array.from({ length: 46 }, () => ({
  x: Math.round(rand() * 1000) / 10,
  y: Math.round(rand() * 520) / 10,
  size: 1 + Math.round(rand() * 20) / 10,
  seconds: 2 + Math.round(rand() * 30) / 10,
}));

/** Clouds: height in percent of the sky, width in px, seconds for one drift across, and a head start. */
export const CLOUDS = [
  { y: 9, width: 150, seconds: 150, delay: -20 },
  { y: 18, width: 110, seconds: 190, delay: -90 },
  { y: 5, width: 190, seconds: 230, delay: -140 },
  { y: 26, width: 130, seconds: 170, delay: -60 },
] as const;

export const BIRDS = [
  { y: 14, seconds: 38, delay: -4, scale: 1 },
  { y: 20, seconds: 46, delay: -22, scale: 0.8 },
  { y: 11, seconds: 52, delay: -35, scale: 0.7 },
] as const;
