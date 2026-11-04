/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { describe, expect, it } from 'vitest';
import { projectsCopy } from '@/content/copy/projects';
import {
  fillCopy,
  initialsOf,
  kindsPresent,
  linkLabel,
  skillsOf,
} from '@/components/projects/project-helpers';
import type { Doc } from '@/lib/content/schema';

const en = projectsCopy.en.links;
const vi = projectsCopy.vi.links;

describe('linkLabel', () => {
  it('names the known stores', () => {
    expect(
      linkLabel(
        {
          kind: 'site',
          label: 'Website',
          url: 'https://apps.apple.com/vn/app/venus-ai/id1',
        },
        en,
      ),
    ).toBe('App Store');
    expect(
      linkLabel(
        {
          kind: 'site',
          label: 'Website',
          url: 'https://play.google.com/store/apps/details?id=a',
        },
        en,
      ),
    ).toBe('Google Play');
  });

  it('uses the generic name for the link kind otherwise', () => {
    expect(
      linkLabel({ kind: 'site', label: 'Website', url: 'https://a.dev/' }, en),
    ).toBe('Visit site');
    expect(
      linkLabel(
        {
          kind: 'github',
          label: 'GitHub',
          url: 'https://github.com/a',
        },
        en,
      ),
    ).toBe('GitHub');
    expect(
      linkLabel(
        {
          kind: 'releases',
          label: 'x',
          url: 'https://github.com/a/r',
        },
        en,
      ),
    ).toBe('Releases');
  });

  it('speaks Vietnamese when given the Vietnamese names', () => {
    expect(
      linkLabel({ kind: 'site', label: 'Website', url: 'https://a.dev/' }, vi),
    ).toBe('Xem website');
    expect(
      linkLabel({ kind: 'releases', label: 'x', url: 'https://a.dev/r' }, vi),
    ).toBe('Bản phát hành');
    // brand names stay as they are
    expect(
      linkLabel(
        { kind: 'site', label: '', url: 'https://apps.apple.com/a' },
        vi,
      ),
    ).toBe('App Store');
  });

  it('keeps the stored label for an "other" link, and survives a bad url', () => {
    expect(
      linkLabel({ kind: 'other', label: 'Press', url: 'not a url' }, en),
    ).toBe('Press');
    expect(linkLabel({ kind: 'other', label: '', url: '' }, en)).toBe('Link');
  });
});

describe('fillCopy', () => {
  it('fills the slots and leaves unknown ones', () => {
    expect(
      fillCopy(projectsCopy.en.dialog.counter, { current: 2, total: 6 }),
    ).toBe('Screenshot 2 of 6');
    expect(
      fillCopy(projectsCopy.vi.dialog.counter, { current: 2, total: 6 }),
    ).toBe('Ảnh 2 / 6');
    expect(fillCopy('{name} {x}', { name: 'A' })).toBe('A {x}');
  });
});

describe('copy', () => {
  it('has Vietnamese for every English string', () => {
    const keys = (o: unknown, prefix = ''): string[] =>
      typeof o === 'object' && o !== null
        ? Object.entries(o).flatMap(([k, v]) => keys(v, `${prefix}${k}.`))
        : [prefix];
    expect(keys(projectsCopy.vi)).toEqual(keys(projectsCopy.en));
  });
});

describe('initialsOf', () => {
  it('takes the first letters of the words', () => {
    expect(initialsOf('FinHub MCP')).toBe('FM');
    expect(initialsOf('Good Morning Coffee & Tea')).toBe('GM');
  });

  it('splits a single camel-case word', () => {
    expect(initialsOf('DevPad')).toBe('DP');
    expect(initialsOf('bachbntdev')).toBe('B');
  });

  it('is empty for an empty name', () => {
    expect(initialsOf('  ')).toBe('');
  });
});

describe('kindsPresent', () => {
  it('lists only the kinds in use, in chip order', () => {
    expect(
      kindsPresent([
        { kind: 'freelance' },
        { kind: 'personal' },
        { kind: 'freelance' },
      ]),
    ).toEqual(['personal', 'freelance']);
    expect(kindsPresent([])).toEqual([]);
  });
});

describe('skillsOf', () => {
  it('keeps the project order and drops ids with no visible skill', () => {
    const flutter = { id: 'flutter', name: 'Flutter' } as Doc<'skills'>;
    const firebase = { id: 'firebase', name: 'Firebase' } as Doc<'skills'>;
    const map = new Map([
      ['flutter', flutter],
      ['firebase', firebase],
    ]);
    expect(skillsOf(['firebase', 'gone', 'flutter'], map)).toEqual([
      firebase,
      flutter,
    ]);
  });
});
