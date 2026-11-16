/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import {
  PhGlyphFrame,
  type PhGlyphProps,
} from '@/skins/phone/ui/ph-glyph-frame';

/*
 * The glyphs of the app icons: one bold pictogram each, of solid shapes with round joins, drawn on a 48 x 48 box and sharing one weight (a
 * line is 4.5 to 5.5 units, a corner 4 to 6). Two tones at most: white, and one detail in the dark end of the tile's own gradient at about
 * half strength (`ph-tile-<name>-b`) or white at 45%. The class names are spelled out in full so that the build finds them; no colour is
 * written here, only tokens.
 */

/** A shape of the glyph: solid white; a round stroke of the same colour rounds every corner of a polygon. */
const SOLID = 'fill-ph-on-tile stroke-ph-on-tile';
const FILL = 'fill-ph-on-tile';
const LINE = 'stroke-ph-on-tile';

export function HomeGlyph({ className }: PhGlyphProps) {
  return (
    <PhGlyphFrame className={className}>
      <path
        d='M24 9 40 22.5V39H8V22.5z'
        strokeWidth='4'
        strokeLinejoin='round'
        className={SOLID}
      />
      <path
        d='M19.5 42v-7.5a4.5 4.5 0 0 1 9 0V42z'
        className='fill-ph-tile-home-b/50'
      />
    </PhGlyphFrame>
  );
}

export function AboutGlyph({ className }: PhGlyphProps) {
  return (
    <PhGlyphFrame className={className}>
      <circle cx='24' cy='15' r='9' className={FILL} />
      <path
        d='M9.5 40.5c0-7.5 6.5-12.5 14.5-12.5s14.5 5 14.5 12.5z'
        strokeWidth='4'
        strokeLinejoin='round'
        className={SOLID}
      />
    </PhGlyphFrame>
  );
}

export function ResumeGlyph({ className }: PhGlyphProps) {
  return (
    <PhGlyphFrame className={className}>
      <path
        d='M15 5h12.5L38 15.5V39a4 4 0 0 1-4 4H15a4 4 0 0 1-4-4V9a4 4 0 0 1 4-4z'
        className={FILL}
      />
      <path
        d='M27.5 5v6.5a4 4 0 0 0 4 4H38z'
        className='fill-ph-tile-resume-b/50'
      />
      <rect
        x='17'
        y='24'
        width='16'
        height='4'
        rx='2'
        className='fill-ph-tile-resume-b/50'
      />
      <rect
        x='17'
        y='32'
        width='10'
        height='4'
        rx='2'
        className='fill-ph-tile-resume-b/50'
      />
    </PhGlyphFrame>
  );
}

export function ProjectsGlyph({ className }: PhGlyphProps) {
  return (
    <PhGlyphFrame className={className}>
      <path
        d='M4 13a4.5 4.5 0 0 1 4.5-4.5h8.2a4.5 4.5 0 0 1 3.4 1.5L23 13.2h16.5A4.5 4.5 0 0 1 44 17.7V36a4.5 4.5 0 0 1-4.5 4.5h-31A4.5 4.5 0 0 1 4 36z'
        className='fill-ph-on-tile/45'
      />
      <path
        d='M4 22a4.5 4.5 0 0 1 4.5-4.5h31A4.5 4.5 0 0 1 44 22v14a4.5 4.5 0 0 1-4.5 4.5h-31A4.5 4.5 0 0 1 4 36z'
        className={FILL}
      />
    </PhGlyphFrame>
  );
}

export function CertificatesGlyph({ className }: PhGlyphProps) {
  return (
    <PhGlyphFrame className={className}>
      <path
        d='M14 27v17l10-6.5L34 44V27z'
        strokeWidth='3'
        strokeLinejoin='round'
        className='fill-ph-on-tile/45 stroke-ph-on-tile/45'
      />
      <path
        fillRule='evenodd'
        d='M24 4.5a14 14 0 1 0 0 28 14 14 0 1 0 0-28zM24 12.5a6 6 0 1 1 0 12 6 6 0 1 1 0-12z'
        className={FILL}
      />
    </PhGlyphFrame>
  );
}

export function ServicesGlyph({ className }: PhGlyphProps) {
  return (
    <PhGlyphFrame className={className}>
      <path
        d='M17.5 14V11a4 4 0 0 1 4-4h5a4 4 0 0 1 4 4v3'
        strokeWidth='4.5'
        strokeLinecap='round'
        strokeLinejoin='round'
        className={LINE}
      />
      <rect x='4' y='13' width='40' height='29' rx='6' className={FILL} />
      <rect
        x='4'
        y='25'
        width='40'
        height='4'
        className='fill-ph-tile-services-b/45'
      />
      <rect x='20' y='22.5' width='8' height='9' rx='2.5' className={FILL} />
    </PhGlyphFrame>
  );
}

export function PaymentGlyph({ className }: PhGlyphProps) {
  return (
    <PhGlyphFrame className={className}>
      <rect x='4' y='9' width='40' height='30' rx='6' className={FILL} />
      <rect
        x='4'
        y='16'
        width='40'
        height='7'
        className='fill-ph-tile-payment-b/50'
      />
      <rect
        x='10'
        y='29'
        width='11'
        height='4'
        rx='2'
        className='fill-ph-tile-payment-b/50'
      />
    </PhGlyphFrame>
  );
}

export function SettingsGlyph({ className }: PhGlyphProps) {
  return (
    <PhGlyphFrame className={className}>
      <circle
        cx='24'
        cy='24'
        r='16.5'
        pathLength='80'
        strokeDasharray='5.2 4.8'
        strokeDashoffset='2.6'
        strokeWidth='7'
        className={LINE}
      />
      <path
        fillRule='evenodd'
        d='M24 9a15 15 0 1 0 0 30 15 15 0 1 0 0-30zM24 18a6 6 0 1 1 0 12 6 6 0 1 1 0-12z'
        className={FILL}
      />
    </PhGlyphFrame>
  );
}

export function ChatGlyph({ className }: PhGlyphProps) {
  return (
    <PhGlyphFrame className={className}>
      <path
        d='M14 6h20a10 10 0 0 1 10 10v8a10 10 0 0 1-10 10H25l-10 9v-9h-1A10 10 0 0 1 4 24v-8A10 10 0 0 1 14 6z'
        className={FILL}
      />
      <circle cx='14' cy='20' r='3' className='fill-ph-tile-chat-b/50' />
      <circle cx='24' cy='20' r='3' className='fill-ph-tile-chat-b/50' />
      <circle cx='34' cy='20' r='3' className='fill-ph-tile-chat-b/50' />
    </PhGlyphFrame>
  );
}

export function ConnectGlyph({ className }: PhGlyphProps) {
  return (
    <PhGlyphFrame className={className}>
      <path
        d='M11 24 36 11M11 24l25 13'
        strokeWidth='4.5'
        strokeLinecap='round'
        className={LINE}
      />
      <circle cx='11' cy='24' r='7.5' className={FILL} />
      <circle cx='36' cy='11' r='7.5' className={FILL} />
      <circle cx='36' cy='37' r='7.5' className={FILL} />
    </PhGlyphFrame>
  );
}

export function CvGlyph({ className }: PhGlyphProps) {
  return (
    <PhGlyphFrame className={className}>
      <path
        d='M24 6v22M14 19.5 24 29.5l10-10'
        strokeWidth='5.5'
        strokeLinecap='round'
        strokeLinejoin='round'
        className={LINE}
      />
      <path
        d='M7 31v5a6 6 0 0 0 6 6h22a6 6 0 0 0 6-6v-5'
        strokeWidth='5.5'
        strokeLinecap='round'
        strokeLinejoin='round'
        className={LINE}
      />
    </PhGlyphFrame>
  );
}
