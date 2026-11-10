/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { readFileSync } from 'node:fs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { buildSystemPrompt } from '@/lib/chat/system-prompt';
import {
  parseDoc,
  profileSchema,
  shellSchema,
  type CollectionName,
  type Doc,
} from '@/lib/content/schema';
import {
  decodeDocument,
  type FirestoreDoc,
} from '../../../worker/src/firestore';
import {
  buildPrompt,
  clearPromptMemory,
  contextFromDocs,
  fallbackPrompt,
  getSystemPrompt,
  type PromptCache,
} from '../../../worker/src/prompt';

const seed = JSON.parse(
  readFileSync('tests/fixtures/seed.json', 'utf8'),
) as Record<string, Record<string, unknown>>;

/** A plain value as a Firestore REST typed value: the shape the Worker reads. */
const encode = (value: unknown): unknown => {
  if (value === null || value === undefined) return { nullValue: null };
  if (typeof value === 'string') return { stringValue: value };
  if (typeof value === 'boolean') return { booleanValue: value };
  if (typeof value === 'number')
    return Number.isInteger(value)
      ? { integerValue: String(value) }
      : { doubleValue: value };
  if (Array.isArray(value))
    return { arrayValue: value.length ? { values: value.map(encode) } : {} };
  const entries = Object.entries(value as object);
  return {
    mapValue: entries.length
      ? {
          fields: Object.fromEntries(entries.map(([k, v]) => [k, encode(v)])),
        }
      : {},
  };
};

const restDoc = (path: string, data: unknown) => ({
  name: `projects/bachbntdev/databases/(default)/documents/${path}`,
  fields: (encode(data) as { mapValue: { fields: object } }).mapValue.fields,
});

const CHAT = [
  'skills',
  'experience',
  'education',
  'projects',
  'certificates',
  'services',
  'contacts',
] as const;

/** What Firestore REST would answer for the seed: documents by path, and `runQuery` by collection (visible ones only). */
const firestoreFor = (hidden: string[] = []) =>
  vi.fn(async (url: string, init?: RequestInit) => {
    if (url.endsWith(':runQuery')) {
      const name = JSON.parse(init?.body as string).structuredQuery.from[0]
        .collectionId as string;
      const rows = Object.entries(seed[name] ?? {})
        .filter(
          ([id, d]) =>
            (d as { visible?: boolean }).visible !== false &&
            !hidden.includes(`${name}/${id}`),
        )
        .map(([id, d]) => ({
          document: restDoc(`${name}/${id}`, d),
          readTime: 'x',
        }));
      return Response.json(rows.length ? rows : [{ readTime: 'x' }]);
    }
    const path = url.split('/documents/')[1];
    const [collection, id] = path.split('/');
    const data = seed[collection]?.[id];
    return data
      ? Response.json(restDoc(path, data))
      : new Response('{}', { status: 404 });
  });

const env = { FIREBASE_PROJECT_ID: 'bachbntdev' };

/** The same prompt the browser used to build, straight from the seed with the schemas. */
const promptFromSeed = (lang: 'en' | 'vi') => {
  const docs = <N extends CollectionName>(name: N): Doc<N>[] =>
    Object.entries(seed[name]).flatMap(([id, d]) => {
      // the browser asks for the visible documents only, and so does the Worker
      const doc =
        (d as { visible?: boolean }).visible === false
          ? null
          : parseDoc(name, id, d);
      return doc ? [doc] : [];
    });
  const shell = shellSchema.parse(seed.site.shell);
  return buildSystemPrompt(
    {
      shell,
      profile: profileSchema.parse(seed.site.profile),
      skills: docs('skills'),
      experience: docs('experience'),
      education: docs('education'),
      projects: docs('projects'),
      certificates: docs('certificates'),
      services: docs('services'),
      contacts: docs('contacts'),
    },
    lang,
  );
};

beforeEach(clearPromptMemory);
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('contextFromDocs', () => {
  it('parses decoded documents with the site schemas and leaves out a malformed one', () => {
    const skill = (data: Record<string, unknown>): FirestoreDoc => ({
      id: 'react',
      data,
    });
    const context = contextFromDocs(
      {
        shell: decodeDocument(restDoc('site/shell', { name: 'Bach Bui' })),
        collections: {
          skills: [
            skill({ name: 'React', category: 'web' }),
            { id: 'broken', data: { name: 'X', category: 'nonsense' } },
          ],
        },
      },
      {},
    );
    expect(context.shell.name).toBe('Bach Bui');
    expect(context.skills?.map((s) => s.name)).toEqual(['React']);
    expect(context.skills?.[0].visible).toBe(true);
    expect(context.experience).toBeUndefined();
  });

  it('takes the owner name from the Worker setting when the shell document is missing', () => {
    const context = contextFromDocs(
      { collections: {} },
      { OWNER_NAME: 'Ada', OWNER_HEADLINE: 'Engineer' },
    );
    expect(context.shell).toMatchObject({ name: 'Ada', headline: 'Engineer' });
  });
});

describe('buildPrompt from Firestore documents', () => {
  it('is the same prompt the site builds from the same content, in both languages', async () => {
    vi.stubGlobal('fetch', firestoreFor());
    for (const lang of ['en', 'vi'] as const) {
      const built = await buildPrompt(env, lang);
      expect(built.prompt).toBe(promptFromSeed(lang));
      expect(built.prompt).toContain('FPT Software');
      expect(built.prompt.length).toBeLessThanOrEqual(8000);
    }
  });

  it('reads only what the rules let anyone read, and never the payments', async () => {
    const fetchMock = firestoreFor();
    vi.stubGlobal('fetch', fetchMock);
    await buildPrompt(env, 'en');
    const asked = fetchMock.mock.calls.map(([url, init]) =>
      url.endsWith(':runQuery')
        ? `query:${JSON.parse(init?.body as string).structuredQuery.from[0].collectionId}`
        : url.split('/documents/')[1],
    );
    expect(asked.sort()).toEqual(
      [
        'site/shell',
        'site/profile',
        ...CHAT.map((name) => `query:${name}`),
      ].sort(),
    );
    expect(asked.join()).not.toContain('payments');
    expect(asked.join()).not.toContain('settings');
  });

  it('leaves out an item that is switched off', async () => {
    const [key] = Object.keys(seed.experience);
    const { company } = seed.experience[key] as { company: string };
    expect(promptFromSeed('en')).toContain(`- ${company} |`);
    vi.stubGlobal('fetch', firestoreFor([`experience/${key}`]));
    const { prompt } = await buildPrompt(env, 'en');
    expect(prompt).not.toContain(`- ${company} |`);
  });

  it('uses the short fallback when Firestore cannot be read at all', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('denied', { status: 403 })),
    );
    const built = await buildPrompt(env, 'en');
    expect(built.prompt).toBe(fallbackPrompt(env, 'en'));
    expect(built.ttlMs).toBeLessThan(5 * 60_000);
    expect(built.prompt).toContain('Bach Bui');
    expect(built.prompt.length).toBeLessThan(600);
  });

  it('uses the fallback when no project is set, without any request', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const built = await buildPrompt({ OWNER_NAME: 'Ada' }, 'vi');
    expect(built.prompt).toContain('Ada');
    expect(built.prompt).toContain('answer in Vietnamese');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('keeps what could be read when only some reads fail, for a short time', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const ok = firestoreFor();
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string, init?: RequestInit) =>
        url.endsWith(':runQuery') && String(init?.body).includes('"skills"')
          ? new Response('{}', { status: 500 })
          : ok(url, init),
      ),
    );
    const built = await buildPrompt(env, 'en');
    expect(built.prompt).toContain('## Work Experience');
    expect(built.prompt).not.toContain('## Skills');
    expect(built.ttlMs).toBeLessThan(5 * 60_000);
  });
});

describe('getSystemPrompt and the cache', () => {
  const memoryCache = (): PromptCache & { stored: Map<string, string> } => {
    const stored = new Map<string, string>();
    return {
      stored,
      match: async (request) => {
        const text = stored.get(request.url);
        return text === undefined ? undefined : new Response(text);
      },
      put: async (request, response) =>
        void stored.set(request.url, await response.text()),
    };
  };

  it('builds once and serves the next requests from memory for five minutes', async () => {
    const fetchMock = firestoreFor();
    vi.stubGlobal('fetch', fetchMock);
    const cache = memoryCache();
    const first = await getSystemPrompt(env, 'en', { cache, now: 0 });
    const calls = fetchMock.mock.calls.length;
    expect(calls).toBe(2 + CHAT.length);
    expect(await getSystemPrompt(env, 'en', { cache, now: 4 * 60_000 })).toBe(
      first,
    );
    expect(fetchMock.mock.calls.length).toBe(calls);
    await getSystemPrompt(env, 'en', { cache, now: 6 * 60_000 });
    // memory expired, the Cache API still has it: still no new read
    expect(fetchMock.mock.calls.length).toBe(calls);
  });

  it('puts the prompt in the Cache API with a five minute lifetime, one entry per language', async () => {
    vi.stubGlobal('fetch', firestoreFor());
    const put = vi.fn();
    const cache: PromptCache = {
      match: async () => undefined,
      put: async (request, response) => put(request.url, response.headers),
    };
    await getSystemPrompt(env, 'en', { cache, now: 0 });
    await getSystemPrompt(env, 'vi', { cache, now: 0 });
    expect(put).toHaveBeenCalledTimes(2);
    expect(put.mock.calls[0][0]).not.toBe(put.mock.calls[1][0]);
    expect((put.mock.calls[0][1] as Headers).get('Cache-Control')).toBe(
      'max-age=300',
    );
  });

  it('serves a prompt another instance cached, without reading Firestore', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const cache: PromptCache = {
      match: async () => new Response('cached prompt'),
      put: async () => undefined,
    };
    expect(await getSystemPrompt(env, 'en', { cache, now: 0 })).toBe(
      'cached prompt',
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('answers with the fallback, and does not cache it, when Firestore is down', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('offline');
      }),
    );
    const cache = memoryCache();
    const prompt = await getSystemPrompt(env, 'en', { cache, now: 0 });
    expect(prompt).toBe(fallbackPrompt(env, 'en'));
    expect(cache.stored.size).toBe(0);
  });

  it('survives a Cache API that throws', async () => {
    vi.stubGlobal('fetch', firestoreFor());
    const cache: PromptCache = {
      match: async () => {
        throw new Error('cache down');
      },
      put: async () => {
        throw new Error('cache down');
      },
    };
    expect(await getSystemPrompt(env, 'en', { cache, now: 0 })).toBe(
      promptFromSeed('en'),
    );
  });

  it('shares one build between requests that arrive together', async () => {
    const fetchMock = firestoreFor();
    vi.stubGlobal('fetch', fetchMock);
    const cache = memoryCache();
    await Promise.all([
      getSystemPrompt(env, 'en', { cache, now: 0 }),
      getSystemPrompt(env, 'en', { cache, now: 0 }),
      getSystemPrompt(env, 'en', { cache, now: 0 }),
    ]);
    expect(fetchMock.mock.calls.length).toBe(2 + CHAT.length);
  });
});
