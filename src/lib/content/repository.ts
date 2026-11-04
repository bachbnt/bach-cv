/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 *
 * The only door to the data. The app imports these interfaces and never a Firestore or SQL client,
 * so changing the database means writing one adapter, not touching a page.
 *
 *   Today   ShellSource: Admin SDK at build time.  ContentRepository: `firebase/firestore/lite` in the browser.
 *   Later   ShellSource: SQL at build time.        ContentRepository: calls a small read API (a Worker or a route),
 *           because a browser cannot hold database credentials.
 */

import type {
  CollectionName,
  Doc,
  Live,
  MessageInput,
  Profile,
  Settings,
  Shell,
} from './schema.ts';

/** Build time only. The one small document embedded in the page. */
export interface ShellSource {
  loadShell(): Promise<Shell>;
}

/**
 * Run time, in the browser. Every method is a one-shot read (no listeners), so the lite SDK is enough.
 * Wrap each call in TanStack Query: it owns caching, deduplication and the persisted cache.
 */
export interface ContentRepository {
  /** The first read. Falls back to `liveSchema.parse({})` if it fails (fail-open). */
  loadLive(): Promise<Live>;

  loadProfile(): Promise<Profile>;

  /** Read when the chat or the contact form first opens, not on page load. */
  loadSettings(): Promise<Settings>;

  /**
   * Visible documents of one collection, unsorted. Firestore: `where('visible', '==', true)`,
   * which the rules require. Sort with `resolveItems`. Each document is one billed read.
   */
  list<N extends CollectionName>(name: N): Promise<Doc<N>[]>;

  /** Contact form. The caller has already validated with `messageSchema`. */
  createMessage(input: MessageInput): Promise<void>;
}
