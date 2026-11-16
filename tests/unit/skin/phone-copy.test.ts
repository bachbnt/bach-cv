/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { phoneCopy } from '@/content/copy/phone';

/** The strings of a copy object, with the path of each. */
const strings = (value: unknown, path = ''): [string, string][] =>
  typeof value === 'string'
    ? [[path, value]]
    : value && typeof value === 'object'
      ? Object.entries(value).flatMap(([k, v]) =>
          strings(v, path ? `${path}.${k}` : k),
        )
      : [];

/** Every copy file of the skin: the shell's own and one for each area. */
const FILES = [
  'phone',
  'phone-home',
  'phone-projects',
  'phone-pay',
  'phone-overlays',
];

describe('the words of the Phone skin', () => {
  it.each(FILES.filter((name) => existsSync(`src/content/copy/${name}.ts`)))(
    'are in both languages, none empty, the same keys in %s',
    async (name) => {
      const copies = (await import(
        /* @vite-ignore */ join(process.cwd(), 'src/content/copy', `${name}.ts`)
      )) as Record<string, { en: unknown; vi: unknown }>;
      for (const copy of Object.values(copies)) {
        const en = strings(copy.en);
        const vi = strings(copy.vi);
        expect(vi.map(([path]) => path)).toEqual(en.map(([path]) => path));
        for (const [path, text] of [...en, ...vi])
          expect(text.trim(), path).not.toBe('');
      }
    },
  );

  it('names the system and the home screen', () => {
    expect(phoneCopy.en.os).toBe('BachOS');
    expect(phoneCopy.vi.settings).not.toBe(phoneCopy.en.settings);
  });

  it('has no word that nothing reads (a key of the shell or of the overlays that no component names)', async () => {
    const files = (dir: string): string[] =>
      readdirSync(dir).flatMap((name) => {
        const path = join(dir, name);
        return statSync(path).isDirectory()
          ? files(path)
          : /\.tsx?$/.test(name)
            ? [path]
            : [];
      });
    const source = files('src/skins/phone')
      .map((file) => readFileSync(file, 'utf8'))
      .join('\n');
    const leaves = (value: unknown): string[] =>
      value && typeof value === 'object'
        ? Object.entries(value).flatMap(([key, child]) =>
            child && typeof child === 'object' ? leaves(child) : [key],
          )
        : [];
    const { phoneOverlaysCopy } = await import('@/content/copy/phone-overlays');
    const unused = [
      ...leaves(phoneCopy.en),
      ...leaves(phoneOverlaysCopy.en),
    ].filter((key) => !new RegExp(`\\.${key}\\b`).test(source));
    expect(unused).toEqual([]);
  });
});
