/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { describe, expect, it } from 'vitest';
import { streamLibraryCopy } from '@/content/copy/stream-library';
import {
  countOfKind,
  initialOf,
  tiersOf,
} from '@/skins/stream/blocks/library-model';

const method = (
  id: string,
  kind: 'bank' | 'wallet',
  highlight: number | null = null,
  qr = 'qr.png',
) => ({ id, kind, highlight, qr });

describe('tiersOf', () => {
  const methods = [
    method('a', 'bank', 1),
    method('b', 'wallet'),
    method('c', 'bank', null, ''),
    method('d', 'wallet'),
  ];

  it('splits the featured methods from the rest and offers the kinds that the rest has', () => {
    const t = tiersOf(methods, 'all');
    expect(t.featured.map((m) => m.id)).toEqual(['a']);
    expect(t.rest.map((m) => m.id)).toEqual(['b', 'c', 'd']);
    expect(t.kinds).toEqual(['bank', 'wallet']);
    expect(t.shown).toHaveLength(3);
  });

  it('filters only the rest, never the featured ones', () => {
    const t = tiersOf(methods, 'wallet');
    expect(t.featured.map((m) => m.id)).toEqual(['a']);
    expect(t.shown.map((m) => m.id)).toEqual(['b', 'd']);
  });

  it('lists the methods with a QR code in the order the viewer steps through them', () => {
    expect(tiersOf(methods, 'bank').withQr.map((m) => m.id)).toEqual([
      'a',
      'b',
      'd',
    ]);
  });

  it('makes a single method with no highlight the featured one', () => {
    const t = tiersOf([method('only', 'wallet')], 'all');
    expect(t.featured.map((m) => m.id)).toEqual(['only']);
    expect(t.rest).toEqual([]);
    expect(t.kinds).toEqual([]);
  });

  it('offers no kind that has no method among the rest', () => {
    const t = tiersOf([method('a', 'bank', 1), method('b', 'bank')], 'all');
    expect(t.kinds).toEqual(['bank']);
  });

  it('handles no methods', () => {
    const t = tiersOf([], 'all');
    expect(t).toEqual({
      featured: [],
      rest: [],
      kinds: [],
      shown: [],
      withQr: [],
    });
  });
});

describe('countOfKind', () => {
  const rest = [
    { kind: 'bank' as const },
    { kind: 'wallet' as const },
    { kind: 'wallet' as const },
  ];
  it('counts all of them, or one kind', () => {
    expect(countOfKind(rest, 'all')).toBe(3);
    expect(countOfKind(rest, 'bank')).toBe(1);
    expect(countOfKind(rest, 'wallet')).toBe(2);
  });
});

describe('initialOf', () => {
  it('is the first letter in capitals', () => {
    expect(initialOf('ada')).toBe('A');
    expect(initialOf('  linh')).toBe('L');
  });
  it('keeps a letter with a mark and a letter outside the basic plane whole', () => {
    expect(initialOf('đức')).toBe('Đ');
    expect(initialOf('𝒜da')).toBe('𝒜');
  });
  it('is empty for an empty name', () => {
    expect(initialOf('')).toBe('');
    expect(initialOf('   ')).toBe('');
  });
});

describe('the copy of the library pages', () => {
  it('counts the certificates in both languages', () => {
    const { en, vi } = streamLibraryCopy;
    expect(en.playlist.count(1)).toBe('1 certificate');
    expect(en.playlist.count(3)).toBe('3 certificates');
    expect(vi.playlist.count(3)).toBe('3 chứng chỉ');
  });
  it('names the service in the label of Ask about this', () => {
    expect(streamLibraryCopy.en.community.askAboutLabel('Blog Writing')).toBe(
      'Ask about Blog Writing',
    );
    expect(streamLibraryCopy.vi.community.askAboutLabel('Viết blog')).toBe(
      'Hỏi về Viết blog',
    );
  });
});
