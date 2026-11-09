/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import {
  COLLECTION_NAMES,
  LANGS,
  type CollectionName,
} from '@/lib/content/schema';
import { pageOfPath, PAGE_META } from '@/lib/pages';
import { SKIN_IDS } from '@/lib/skin/skins';
import { COMMANDS } from '@/skins/dev/shell/terminal/run-command';

/**
 * The typed events of the dev log, and the one place that turns them into text. Nothing else writes a line.
 *
 * The log is shown to the public, so it holds metadata only: names from a fixed list, counts, timings, public paths. An event
 * carries no free text: the few fields that arrive as `string` or `unknown` (a query key, an error, a path, a typed command) are
 * reduced here to a name from an allow-list, or to a fallback. Never a message, a stack, a value, a URL or what a visitor typed.
 */

export type Level = 'I' | 'D' | 'W' | 'E';

/** What the visitor does that is worth a line; the words are fixed. */
const UI_ACTIONS = [
  'cv opened',
  'connect opened',
  'chat opened',
  'viewer opened',
  'copied',
] as const;
export type UiAction = (typeof UI_ACTIONS)[number];

export type SettingName = 'language' | 'theme' | 'skin';

export type DevLogEvent =
  | { kind: 'ready'; ms: number }
  | { kind: 'route'; path: string }
  | { kind: 'ttfb'; ms: number }
  | { kind: 'vitals'; lcpMs?: number; cls?: number }
  | {
      kind: 'query-read';
      /** the first parts of the query key */
      key: readonly unknown[];
      /** the number of documents, when the query reads a collection */
      docs?: number;
      ms?: number;
      /** the data came from the browser's cache of an earlier visit */
      cached?: boolean;
    }
  | { kind: 'query-retry'; key: readonly unknown[]; attempt: number }
  | { kind: 'query-failed'; key: readonly unknown[]; error: unknown }
  | { kind: 'setting'; name: SettingName; value: unknown }
  | { kind: 'ui'; action: UiAction }
  /** `name` is the first word the visitor typed; only the commands of the terminal are kept */
  | { kind: 'command'; name: unknown }
  | { kind: 'runtime'; source: 'error' | 'rejection'; error: unknown };

type ProblemCode = 'query-failed' | 'query-retried' | 'uncaught' | 'rejection';

/** What a problem is: grouped by `code` and `subject`, the row says how often it happened. */
export interface ProblemInfo {
  severity: 'error' | 'warning';
  source: 'query' | 'runtime';
  code: ProblemCode;
  /** a collection or an error name: always from an allow-list */
  subject: string;
}

interface BuiltEntry {
  level: Level;
  tag: string;
  text: string;
  problem?: ProblemInfo;
}

export interface LogEntry {
  id: number;
  /** epoch milliseconds */
  time: number;
  level: Level;
  tag: string;
  text: string;
}

export const MAX_TEXT = 80;

/** The names `Error.name` may have in the log: the built-in ones and the few a browser or Firebase raises. */
const ERROR_NAMES = [
  'Error',
  'TypeError',
  'RangeError',
  'SyntaxError',
  'ReferenceError',
  'EvalError',
  'URIError',
  'NetworkError',
  'AbortError',
  'TimeoutError',
  'SecurityError',
  'NotAllowedError',
  'QuotaExceededError',
  'FirebaseError',
] as const;

/** The type of an error, from the allow-list; anything else (or something that is not an error) is `Error`. Never its message. */
export function errorName(error: unknown): string {
  try {
    if (typeof error === 'object' && error !== null) {
      const name = (error as { name?: unknown }).name;
      if (typeof name === 'string') {
        const known = ERROR_NAMES.find((candidate) => candidate === name);
        if (known) return known;
      }
    }
  } catch {
    // a getter that throws: it is just an error
  }
  return 'Error';
}

const SAFE = /^[a-z0-9._/-]+$/;

/**
 * Free text reduced to a safe name: lower case, only `a-z 0-9 . _ / -`, at most 80 characters. Text that has anything else in it
 * (an `@`, a space, `?`, `:`, `=`) is not cut into something that still looks like the original: it is dropped for the fallback.
 * So are long digit runs (phone and account numbers) and long unbroken tokens (keys, ids).
 */
export function safeName(value: unknown, fallback: string): string {
  if (typeof value !== 'string') return fallback;
  const name = value.toLowerCase();
  if (name.length === 0 || name.length > MAX_TEXT) return fallback;
  if (!SAFE.test(name)) return fallback;
  if (/\d{6,}/.test(name) || /[a-z0-9]{25,}/.test(name)) return fallback;
  return name;
}

const isCollection = (name: unknown): name is CollectionName =>
  COLLECTION_NAMES.includes(name as CollectionName);

const SITE_DOCS = ['live', 'profile', 'settings'] as const;

/**
 * The name of what a query reads, from its key: `projects` for a collection, `site/live` for a document of `site`. Only names the
 * site itself defines get through; anything else is `unknown`.
 */
export function queryName(key: readonly unknown[]): string {
  const [root, name] = key;
  if (root === 'content' && isCollection(name)) return name;
  if (
    root === 'site' &&
    SITE_DOCS.includes(name as (typeof SITE_DOCS)[number])
  ) {
    return `site/${name as string}`;
  }
  return 'unknown';
}

/** A non-negative whole number of at most 9 digits, else `undefined`. Counts and timings are numbers, never text. */
function whole(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
    ? Math.min(Math.round(value), 999_999_999)
    : undefined;
}

/** `82 ms`. */
export const formatMs = (ms: number): string => `${whole(ms) ?? 0} ms`;

/** `1.2 s`. */
export const formatSeconds = (ms: number): string =>
  `${((whole(ms) ?? 0) / 1000).toFixed(1)} s`;

/** `0.04`. */
export const formatCls = (cls: number): string =>
  (Number.isFinite(cls) && cls >= 0 ? Math.min(cls, 99) : 0).toFixed(2);

/** The path of a page of the site, or `/not-found` for anything else: a visitor may have typed anything in the address bar. */
export function routeName(path: unknown): string {
  if (typeof path !== 'string') return '/not-found';
  const page = pageOfPath(path.split(/[?#]/)[0]);
  return page ? safeName(PAGE_META[page].href, '/not-found') : '/not-found';
}

/** The terminal command (`ls`), when it is one of the commands of the terminal, else `unknown`. */
export function commandName(value: unknown): string {
  const word = typeof value === 'string' ? value.trim().toLowerCase() : '';
  return COMMANDS.find((command) => command === word) ?? 'unknown';
}

const SETTING_VALUES: Record<SettingName, readonly string[]> = {
  language: LANGS,
  theme: ['system', 'light', 'dark'],
  skin: SKIN_IDS,
};

/** The value of a setting, when it is one of the values the site offers, else `unknown`. */
export function settingValue(name: SettingName, value: unknown): string {
  return SETTING_VALUES[name].find((option) => option === value) ?? 'unknown';
}

const line = (level: Level, tag: string, text: string): BuiltEntry => ({
  level,
  tag,
  text,
});

/** The line (and the problem, if it is one) for an event. Every piece of text in it is fixed, a number, or from an allow-list. */
export function buildEntry(event: DevLogEvent): BuiltEntry {
  switch (event.kind) {
    case 'ready':
      return line('I', 'Portfolio', `ready (+${formatMs(event.ms)})`);
    case 'route':
      return line('I', 'Router', routeName(event.path));
    case 'ttfb':
      return line('I', 'Perf', `TTFB ${formatMs(event.ms)}`);
    case 'vitals': {
      const parts = [
        event.lcpMs === undefined ? '' : `LCP ${formatSeconds(event.lcpMs)}`,
        event.cls === undefined ? '' : `CLS ${formatCls(event.cls)}`,
      ].filter(Boolean);
      return line('I', 'Perf', parts.join(' · ') || 'no data');
    }
    case 'query-read': {
      const docs = whole(event.docs);
      const ms = whole(event.ms);
      const details = [
        docs === undefined ? '' : `${docs} ${docs === 1 ? 'doc' : 'docs'}`,
        ms === undefined ? '' : formatMs(ms),
      ].filter(Boolean);
      const verb = event.cached ? 'cached' : 'read';
      return line(
        'D',
        'Query',
        `${queryName(event.key)} ${verb}${details.length ? ` (${details.join(', ')})` : ''}`,
      );
    }
    case 'query-retry': {
      const subject = queryName(event.key);
      return {
        ...line('W', 'Query', `${subject} retry ${whole(event.attempt) ?? 1}`),
        problem: {
          severity: 'warning',
          source: 'query',
          code: 'query-retried',
          subject,
        },
      };
    }
    case 'query-failed': {
      const subject = queryName(event.key);
      return {
        ...line('E', 'Query', `${subject} failed (${errorName(event.error)})`),
        problem: {
          severity: 'error',
          source: 'query',
          code: 'query-failed',
          subject,
        },
      };
    }
    case 'setting':
      return line(
        'I',
        'Settings',
        `${event.name} -> ${settingValue(event.name, event.value)}`,
      );
    case 'ui':
      return line(
        'I',
        'UI',
        UI_ACTIONS.find((action) => action === event.action) ?? 'unknown',
      );
    case 'command':
      return line('I', 'Terminal', commandName(event.name));
    case 'runtime': {
      const name = errorName(event.error);
      const uncaught = event.source === 'error';
      return {
        ...line(
          'E',
          'Runtime',
          `${uncaught ? 'uncaught' : 'unhandled rejection'} (${name})`,
        ),
        problem: {
          severity: 'error',
          source: 'runtime',
          code: uncaught ? 'uncaught' : 'rejection',
          subject: name,
        },
      };
    }
  }
}

/** `09:05:07.042` in the visitor's time zone. */
export function formatTime(time: number): string {
  const date = new Date(time);
  const pad = (n: number, width = 2) => String(n).padStart(width, '0');
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}.${pad(date.getMilliseconds(), 3)}`;
}

/** The line as the log prints it: `I/Router: /about`. */
export const formatEntry = (entry: Pick<LogEntry, 'level' | 'tag' | 'text'>) =>
  `${entry.level}/${entry.tag}: ${entry.text}`;
