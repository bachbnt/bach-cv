/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

// The system prompt is built here, never taken from the browser: a prompt the visitor could write would turn the endpoint into a
// free LLM for anyone. It is the same `buildSystemPrompt` as the site's, over the same Zod schemas, from the public Firestore content.

import { buildSystemPrompt, type ChatContext } from '@/lib/chat/system-prompt';
import {
  parseDoc,
  profileSchema,
  shellSchema,
  type CollectionName,
  type Doc,
  type Lang,
} from '@/lib/content/schema';
import { fetchDocument, fetchVisible, type FirestoreDoc } from './firestore';

/** The collections the assistant may know. `payments` is public by the rules but never goes to a model. */
const CHAT_COLLECTIONS = [
  'skills',
  'experience',
  'education',
  'projects',
  'certificates',
  'services',
  'contacts',
] as const satisfies readonly CollectionName[];

const FULL_TTL_MS = 5 * 60_000;
/** A prompt built from less than everything (Firestore failed in part or whole) is tried again sooner. */
const DEGRADED_TTL_MS = 60_000;

/** The part of the Worker environment that the prompt needs. */
export interface PromptEnv {
  /** the Firebase project whose public content is read, e.g. `bachbntdev` */
  FIREBASE_PROJECT_ID?: string;
  /** the name and headline of the short fallback prompt, used while Firestore cannot be read */
  OWNER_NAME?: string;
  OWNER_HEADLINE?: string;
}

/** The part of the Cache API that is used (so tests can pass a plain object). */
export interface PromptCache {
  match(request: Request): Promise<Response | undefined>;
  put(request: Request, response: Response): Promise<void>;
}

export const DEFAULT_OWNER_NAME = 'Bach Bui';
export const DEFAULT_OWNER_HEADLINE = 'Software Engineer';

/** The short fixed prompt: the site's own prompt with only a name and a headline. */
export const fallbackPrompt = (env: PromptEnv, lang: Lang): string =>
  buildSystemPrompt(
    {
      shell: {
        name: env.OWNER_NAME?.trim() || DEFAULT_OWNER_NAME,
        headline: env.OWNER_HEADLINE?.trim() || DEFAULT_OWNER_HEADLINE,
      },
    },
    lang,
  );

const docsOf = <N extends CollectionName>(
  name: N,
  rows: FirestoreDoc[] | undefined,
): Doc<N>[] | undefined =>
  rows?.flatMap((row) => {
    const doc = parseDoc(name, row.id, row.data);
    return doc ? [doc] : [];
  });

/**
 * The decoded documents as the context the prompt is built from, parsed with the site's schemas (a malformed document is left out).
 * `undefined` means "not read"; the prompt builder treats it as no section.
 */
export const contextFromDocs = (
  docs: {
    shell?: FirestoreDoc | null;
    profile?: FirestoreDoc | null;
    collections: Partial<
      Record<(typeof CHAT_COLLECTIONS)[number], FirestoreDoc[]>
    >;
  },
  env: PromptEnv,
): ChatContext => {
  const shell = shellSchema.parse(docs.shell?.data ?? {});
  return {
    shell: {
      name: shell.name || env.OWNER_NAME?.trim() || DEFAULT_OWNER_NAME,
      headline:
        shell.headline || env.OWNER_HEADLINE?.trim() || DEFAULT_OWNER_HEADLINE,
      l10n: shell.l10n,
    },
    profile: docs.profile ? profileSchema.parse(docs.profile.data) : undefined,
    skills: docsOf('skills', docs.collections.skills),
    experience: docsOf('experience', docs.collections.experience),
    education: docsOf('education', docs.collections.education),
    projects: docsOf('projects', docs.collections.projects),
    certificates: docsOf('certificates', docs.collections.certificates),
    services: docsOf('services', docs.collections.services),
    contacts: docsOf('contacts', docs.collections.contacts),
  };
};

interface Built {
  prompt: string;
  /** how long it may be reused */
  ttlMs: number;
}

/** Reads the content and builds the prompt. Never throws: a failed read gives the fallback (or less content) and a short lifetime. */
export const buildPrompt = async (
  env: PromptEnv,
  lang: Lang,
): Promise<Built> => {
  const project = env.FIREBASE_PROJECT_ID?.trim();
  if (!project)
    return { prompt: fallbackPrompt(env, lang), ttlMs: DEGRADED_TTL_MS };

  let failed = 0;
  const read = <T>(promise: Promise<T>): Promise<T | undefined> =>
    promise.catch((error: unknown) => {
      failed += 1;
      // the reason is a short code (`firestore_403`), never a response body
      console.error('prompt_read_failed', (error as Error).message);
      return undefined;
    });

  const [shell, profile, ...lists] = await Promise.all([
    read(fetchDocument(project, 'site/shell')),
    read(fetchDocument(project, 'site/profile')),
    ...CHAT_COLLECTIONS.map((name) => read(fetchVisible(project, name))),
  ]);
  const total = 2 + CHAT_COLLECTIONS.length;
  if (failed === total)
    return { prompt: fallbackPrompt(env, lang), ttlMs: DEGRADED_TTL_MS };

  const collections = Object.fromEntries(
    CHAT_COLLECTIONS.map((name, i) => [name, lists[i]]),
  );
  return {
    prompt: buildSystemPrompt(
      contextFromDocs({ shell, profile, collections }, env),
      lang,
    ),
    ttlMs: failed === 0 ? FULL_TTL_MS : DEGRADED_TTL_MS,
  };
};

/** The Cache API of the Worker, when there is one. It does nothing on a `workers.dev` address, so a copy in memory comes first. */
const defaultCache = (): PromptCache | undefined =>
  (globalThis as unknown as { caches?: { default?: PromptCache } }).caches
    ?.default;

const memory = new Map<string, { prompt: string; until: number }>();
const pending = new Map<string, Promise<string>>();

/** Forgets the copies in memory (tests). */
export const clearPromptMemory = (): void => {
  memory.clear();
  pending.clear();
};

const cacheRequest = (project: string, lang: Lang): Request =>
  new Request(
    `https://prompt.chat-proxy.invalid/${encodeURIComponent(project)}/${lang}`,
  );

/**
 * The system prompt for a language: from memory, else from the Cache API, else built from Firestore (and kept for about five
 * minutes). It always answers: if Firestore cannot be read the short fallback prompt is used.
 */
export const getSystemPrompt = async (
  env: PromptEnv,
  lang: Lang,
  options: { cache?: PromptCache; now?: number } = {},
): Promise<string> => {
  const now = options.now ?? Date.now();
  const key = `${env.FIREBASE_PROJECT_ID ?? ''}/${lang}`;
  const hit = memory.get(key);
  if (hit && hit.until > now) return hit.prompt;

  const inflight = pending.get(key);
  if (inflight) return inflight;

  const work = (async (): Promise<string> => {
    const cache = options.cache ?? defaultCache();
    const request = cacheRequest(env.FIREBASE_PROJECT_ID ?? '', lang);
    try {
      const cached = await cache?.match(request);
      const prompt = cached ? await cached.text() : '';
      if (prompt) {
        memory.set(key, { prompt, until: now + FULL_TTL_MS });
        return prompt;
      }
    } catch {
      // a cache that cannot be read is the same as an empty one
    }

    const built = await buildPrompt(env, lang);
    memory.set(key, { prompt: built.prompt, until: now + built.ttlMs });
    if (cache && built.ttlMs === FULL_TTL_MS) {
      try {
        await cache.put(
          request,
          new Response(built.prompt, {
            headers: { 'Cache-Control': `max-age=${FULL_TTL_MS / 1000}` },
          }),
        );
      } catch {
        // not cached: the next request builds it again
      }
    }
    return built.prompt;
  })();
  pending.set(key, work);
  try {
    return await work;
  } finally {
    pending.delete(key);
  }
};
