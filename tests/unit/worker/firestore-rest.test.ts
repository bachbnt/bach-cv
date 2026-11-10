/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  decodeDocument,
  decodeQueryResult,
  decodeValue,
  fetchDocument,
  fetchVisible,
} from '../../../worker/src/firestore';

afterEach(() => vi.unstubAllGlobals());

describe('decodeValue', () => {
  it('reads the scalar types', () => {
    expect(decodeValue({ stringValue: 'hi' })).toBe('hi');
    expect(decodeValue({ stringValue: '' })).toBe('');
    expect(decodeValue({ booleanValue: true })).toBe(true);
    expect(decodeValue({ booleanValue: false })).toBe(false);
    expect(decodeValue({ nullValue: null })).toBeNull();
    expect(decodeValue({ integerValue: '42' })).toBe(42);
    expect(decodeValue({ integerValue: '-7' })).toBe(-7);
    expect(decodeValue({ doubleValue: 1.5 })).toBe(1.5);
    expect(decodeValue({ doubleValue: 0 })).toBe(0);
    expect(decodeValue({ doubleValue: 'Infinity' })).toBe(Infinity);
    expect(decodeValue({ doubleValue: 'NaN' })).toBeNaN();
  });

  it('keeps timestamps, references and bytes as strings and reads a geo point', () => {
    expect(decodeValue({ timestampValue: '2026-01-02T03:04:05Z' })).toBe(
      '2026-01-02T03:04:05Z',
    );
    expect(decodeValue({ referenceValue: 'projects/p/documents/a/b' })).toBe(
      'projects/p/documents/a/b',
    );
    expect(decodeValue({ bytesValue: 'AAEC' })).toBe('AAEC');
    expect(
      decodeValue({ geoPointValue: { latitude: 10.5, longitude: 106.7 } }),
    ).toEqual({ latitude: 10.5, longitude: 106.7 });
  });

  it('reads arrays and maps, nested, and an empty array or map', () => {
    expect(
      decodeValue({
        arrayValue: {
          values: [{ stringValue: 'a' }, { integerValue: '2' }],
        },
      }),
    ).toEqual(['a', 2]);
    // Firestore leaves out `values` / `fields` when they are empty
    expect(decodeValue({ arrayValue: {} })).toEqual([]);
    expect(decodeValue({ mapValue: {} })).toEqual({});
    expect(
      decodeValue({
        mapValue: {
          fields: {
            vi: {
              mapValue: {
                fields: {
                  bullets: {
                    arrayValue: { values: [{ stringValue: 'x' }] },
                  },
                },
              },
            },
          },
        },
      }),
    ).toEqual({ vi: { bullets: ['x'] } });
  });

  it('turns anything it does not know into null instead of throwing', () => {
    expect(decodeValue({ somethingNew: 1 })).toBeNull();
    expect(decodeValue(null)).toBeNull();
    expect(decodeValue('text')).toBeNull();
    expect(decodeValue({ integerValue: 'abc' })).toBeNull();
    expect(decodeValue({ arrayValue: { values: 'no' } })).toEqual([]);
  });
});

describe('decodeDocument and decodeQueryResult', () => {
  const raw = {
    name: 'projects/p/databases/(default)/documents/skills/react',
    fields: {
      name: { stringValue: 'React' },
      visible: { booleanValue: true },
      sort: { integerValue: '3' },
    },
    createTime: '2026-01-01T00:00:00Z',
  };

  it('gives the id from the last part of the name and the decoded fields', () => {
    expect(decodeDocument(raw)).toEqual({
      id: 'react',
      data: { name: 'React', visible: true, sort: 3 },
    });
  });

  it('gives an empty data object for a document without fields', () => {
    expect(
      decodeDocument({ name: 'projects/p/databases/(default)/documents/a/b' }),
    ).toEqual({ id: 'b', data: {} });
  });

  it('is null for something that is not a document', () => {
    expect(decodeDocument(null)).toBeNull();
    expect(decodeDocument({ fields: {} })).toBeNull();
    expect(decodeDocument({ error: { code: 403 } })).toBeNull();
  });

  it('reads a runQuery answer, where an empty result has no document', () => {
    expect(decodeQueryResult([{ readTime: 'x' }])).toEqual([]);
    expect(
      decodeQueryResult([{ document: raw, readTime: 'x' }, { readTime: 'y' }]),
    ).toHaveLength(1);
    expect(decodeQueryResult({ error: 'no' })).toEqual([]);
  });
});

describe('the requests', () => {
  it('asks for a collection with the visible filter the rules require', async () => {
    const fetchMock = vi.fn(async () => Response.json([{ readTime: 'x' }]));
    vi.stubGlobal('fetch', fetchMock);
    await fetchVisible('bachbntdev', 'skills');
    const [url, init] = fetchMock.mock.calls[0] as unknown as [
      string,
      RequestInit,
    ];
    expect(url).toBe(
      'https://firestore.googleapis.com/v1/projects/bachbntdev/databases/(default)/documents:runQuery',
    );
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body as string).structuredQuery).toMatchObject({
      from: [{ collectionId: 'skills' }],
      where: {
        fieldFilter: {
          field: { fieldPath: 'visible' },
          op: 'EQUAL',
          value: { booleanValue: true },
        },
      },
    });
  });

  it('reads a single document, and a missing one (404) is null, not an error', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        Response.json({
          name: 'projects/p/databases/(default)/documents/site/profile',
          fields: { location: { stringValue: 'Ho Chi Minh City' } },
        }),
      )
      .mockResolvedValueOnce(new Response('{}', { status: 404 }));
    vi.stubGlobal('fetch', fetchMock);
    expect(await fetchDocument('bachbntdev', 'site/profile')).toEqual({
      id: 'profile',
      data: { location: 'Ho Chi Minh City' },
    });
    expect(await fetchDocument('bachbntdev', 'site/profile')).toBeNull();
    expect((fetchMock.mock.calls[0] as unknown as [string])[0]).toBe(
      'https://firestore.googleapis.com/v1/projects/bachbntdev/databases/(default)/documents/site/profile',
    );
  });

  it('throws a short code for any other failure, never the body', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('secret body', { status: 403 })),
    );
    await expect(fetchDocument('bachbntdev', 'site/shell')).rejects.toThrow(
      'firestore_403',
    );
    await expect(fetchVisible('bachbntdev', 'skills')).rejects.toThrow(
      'firestore_403',
    );
  });

  it('never puts a strange project id in a URL', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    await expect(
      fetchDocument('evil.example/x?', 'site/shell'),
    ).rejects.toThrow('firestore_not_configured');
    await expect(fetchVisible('../x', 'skills')).rejects.toThrow(
      'firestore_not_configured',
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
