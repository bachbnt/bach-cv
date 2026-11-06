/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { SKILL_ICONS } from '@/components/skills/skill-icons';
import type { FileKind } from '@/skins/dev/config';
import { DRAWN_FILE_ICONS } from '@/skins/dev/icons/file-icons';

/** Which brand mark (key of `SKILL_ICONS`) stands for a file kind that has one. */
const BRAND_KEY: Partial<Record<FileKind, string>> = {
  kt: 'kotlin',
  dart: 'dart',
  py: 'python',
  swift: 'swift',
  ts: 'typescript',
  tsx: 'react',
};

/** The icon of a file in the tabs and the Explorer: the brand mark of the language when the site has one, else a small drawing. */
export function FileIcon({ kind }: { kind: FileKind }) {
  const brand = BRAND_KEY[kind];
  const svg =
    (brand ? SKILL_ICONS[brand] : undefined) ?? DRAWN_FILE_ICONS[kind] ?? '';
  return (
    <i
      aria-hidden='true'
      className={`dv-fi dv-${kind}`}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

/** Gradients that the Kotlin and Python marks refer to (`fill: url(#g-kt)` in the Dev CSS). Rendered once by the shell. */
export function FileIconDefs() {
  return (
    <svg
      width='0'
      height='0'
      aria-hidden='true'
      focusable='false'
      className='absolute'
    >
      <defs>
        <linearGradient id='g-kt' x1='1' y1='0' x2='0' y2='1'>
          <stop offset='0' stopColor='#7f52ff' />
          <stop offset='.5' stopColor='#c711e1' />
          <stop offset='1' stopColor='#e44857' />
        </linearGradient>
        <linearGradient id='g-py' x1='0' y1='0' x2='1' y2='1'>
          <stop offset='.5' stopColor='#3776ab' />
          <stop offset='.5' stopColor='#ffd43b' />
        </linearGradient>
      </defs>
    </svg>
  );
}
