/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { readdirSync, readFileSync } from 'node:fs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { devOutputCopy } from '@/content/copy/dev-output';
import { announceCopied, COPIED_EVENT } from '@/lib/copied-event';
import {
  buildEntry,
  commandName,
  errorName,
  formatCls,
  formatEntry,
  formatMs,
  formatSeconds,
  formatTime,
  queryName,
  routeName,
  safeName,
  settingValue,
  MAX_TEXT,
  type DevLogEvent,
} from '@/skins/dev/shell/devlog/events';
import {
  clearEntries,
  emit,
  getState,
  MAX_ENTRIES,
  resetLog,
} from '@/skins/dev/shell/devlog/store';

const text = (event: DevLogEvent) => formatEntry(buildEntry(event));

/** Things that must never reach the log: what a visitor types, what a document holds, what a URL carries. */
const SECRETS = [
  'bach@example.com',
  '+84 912 345 678',
  '0912345678',
  '1234567890123',
  'https://firestore.googleapis.com/v1/projects/my-secret-project/databases/(default)/documents/projects?key=AIzaSyFAKE0123456789abcdefghijk',
  '/about?token=abc123&email=a@b.co',
  'AIzaSyFAKE0123456789abcdefghijk',
  'Failed to fetch https://x.test/a?b=c',
  'hunter2 my password',
  '<script>alert(1)</script>',
];

describe('errorName', () => {
  it('keeps a name from the allow-list', () => {
    expect(errorName(new TypeError('secret message'))).toBe('TypeError');
    expect(errorName(new RangeError('x'))).toBe('RangeError');
    expect(errorName({ name: 'NetworkError' })).toBe('NetworkError');
    expect(errorName({ name: 'FirebaseError', message: 'm' })).toBe(
      'FirebaseError',
    );
  });

  it('turns anything else into Error', () => {
    expect(errorName({ name: 'SecretProjectError' })).toBe('Error');
    expect(errorName({ name: 'bach@example.com' })).toBe('Error');
    expect(errorName('a string that was thrown')).toBe('Error');
    expect(errorName(undefined)).toBe('Error');
    expect(errorName(null)).toBe('Error');
    expect(errorName(42)).toBe('Error');
    expect(errorName({ name: 5 })).toBe('Error');
  });

  it('survives a name that throws', () => {
    const hostile = {
      get name(): string {
        throw new Error('boom');
      },
    };
    expect(errorName(hostile)).toBe('Error');
  });
});

describe('safeName', () => {
  it('keeps a plain name and lower-cases it', () => {
    expect(safeName('projects', 'x')).toBe('projects');
    expect(safeName('Site/Live', 'x')).toBe('site/live');
    expect(safeName('a.b_c-d/e', 'x')).toBe('a.b_c-d/e');
  });

  it('drops text with anything outside a-z 0-9 . _ / - instead of cutting it', () => {
    for (const secret of SECRETS)
      expect(safeName(secret, 'fallback')).toBe('fallback');
    expect(safeName('a b', 'fallback')).toBe('fallback');
    expect(safeName('a?b=c', 'fallback')).toBe('fallback');
    expect(safeName('', 'fallback')).toBe('fallback');
    expect(safeName(undefined, 'fallback')).toBe('fallback');
  });

  it('drops long digit runs and long tokens, and anything over 80 characters', () => {
    expect(safeName('0912345678', 'fallback')).toBe('fallback');
    expect(safeName('abc123456', 'fallback')).toBe('fallback');
    expect(safeName('a'.repeat(25), 'fallback')).toBe('fallback');
    expect(safeName('a-'.repeat(41), 'fallback')).toBe('fallback');
    expect(safeName('a-'.repeat(39).slice(0, MAX_TEXT), 'fallback')).not.toBe(
      'fallback',
    );
  });
});

describe('names from allow-lists', () => {
  it('queryName knows the collections and the documents of site', () => {
    expect(queryName(['content', 'projects'])).toBe('projects');
    expect(queryName(['content', 'payments'])).toBe('payments');
    expect(queryName(['site', 'live'])).toBe('site/live');
    expect(queryName(['site', 'profile'])).toBe('site/profile');
  });

  it('queryName reduces anything else to unknown', () => {
    expect(queryName(['content', 'my-secret-project'])).toBe('unknown');
    expect(queryName(['content', { email: 'bach@example.com' }])).toBe(
      'unknown',
    );
    expect(queryName(['other', 'projects'])).toBe('unknown');
    expect(queryName(['site', 'anything'])).toBe('unknown');
    expect(queryName([])).toBe('unknown');
  });

  it('routeName gives the path of a page and nothing else', () => {
    expect(routeName('/')).toBe('/');
    expect(routeName('/about')).toBe('/about');
    expect(routeName('/about/')).toBe('/about');
    expect(routeName('/about?token=abc&email=a@b.co')).toBe('/about');
    expect(routeName('/about#section')).toBe('/about');
    expect(routeName('/payment')).toBe('/payment');
  });

  it('routeName hides a path that is not a page', () => {
    expect(routeName('/secret-token-9f8e7d6c5b4a')).toBe('/not-found');
    expect(routeName('/a@b.co')).toBe('/not-found');
    expect(routeName(null)).toBe('/not-found');
  });

  it('commandName keeps only the commands of the terminal', () => {
    expect(commandName('ls')).toBe('ls');
    expect(commandName(' CD ')).toBe('cd');
    expect(commandName('hunter2')).toBe('unknown');
    expect(commandName('bach@example.com')).toBe('unknown');
    expect(commandName(undefined)).toBe('unknown');
  });

  it('settingValue keeps the values the site offers', () => {
    expect(settingValue('language', 'vi')).toBe('vi');
    expect(settingValue('theme', 'dark')).toBe('dark');
    expect(settingValue('skin', 'dev')).toBe('dev');
    expect(settingValue('language', 'fr')).toBe('unknown');
    expect(settingValue('theme', 'bach@example.com')).toBe('unknown');
  });
});

describe('formatting', () => {
  it('formats times and numbers', () => {
    expect(formatMs(82.4)).toBe('82 ms');
    expect(formatSeconds(1234)).toBe('1.2 s');
    expect(formatSeconds(800)).toBe('0.8 s');
    expect(formatCls(0)).toBe('0.00');
    expect(formatCls(0.1234)).toBe('0.12');
    expect(formatMs(Number.NaN)).toBe('0 ms');
    expect(formatMs(-5)).toBe('0 ms');
  });

  it('formats a time as HH:MM:SS.mmm', () => {
    expect(formatTime(new Date(2026, 0, 1, 9, 5, 7, 42).getTime())).toBe(
      '09:05:07.042',
    );
  });
});

describe('buildEntry', () => {
  it('writes the lines of the spec', () => {
    expect(text({ kind: 'ready', ms: 812 })).toBe(
      'I/Portfolio: ready (+812 ms)',
    );
    expect(text({ kind: 'route', path: '/about' })).toBe('I/Router: /about');
    expect(text({ kind: 'ttfb', ms: 80 })).toBe('I/Perf: TTFB 80 ms');
    expect(text({ kind: 'vitals', lcpMs: 1200, cls: 0 })).toBe(
      'I/Perf: LCP 1.2 s · CLS 0.00',
    );
    expect(text({ kind: 'vitals', cls: 0.04 })).toBe('I/Perf: CLS 0.04');
    expect(
      text({
        kind: 'query-read',
        key: ['content', 'projects'],
        docs: 6,
        ms: 82,
      }),
    ).toBe('D/Query: projects read (6 docs, 82 ms)');
    expect(
      text({ kind: 'query-read', key: ['content', 'skills'], docs: 1, ms: 5 }),
    ).toBe('D/Query: skills read (1 doc, 5 ms)');
    expect(text({ kind: 'query-read', key: ['site', 'live'], ms: 40 })).toBe(
      'D/Query: site/live read (40 ms)',
    );
    expect(
      text({
        kind: 'query-read',
        key: ['content', 'skills'],
        docs: 3,
        cached: true,
      }),
    ).toBe('D/Query: skills cached (3 docs)');
    expect(
      text({
        kind: 'query-failed',
        key: ['content', 'projects'],
        error: new TypeError('Failed to fetch'),
      }),
    ).toBe('E/Query: projects failed (TypeError)');
    expect(
      text({ kind: 'query-retry', key: ['content', 'projects'], attempt: 1 }),
    ).toBe('W/Query: projects retry 1');
    expect(text({ kind: 'setting', name: 'language', value: 'vi' })).toBe(
      'I/Settings: language -> vi',
    );
    expect(text({ kind: 'setting', name: 'theme', value: 'dark' })).toBe(
      'I/Settings: theme -> dark',
    );
    expect(text({ kind: 'setting', name: 'skin', value: 'dev' })).toBe(
      'I/Settings: skin -> dev',
    );
    expect(text({ kind: 'ui', action: 'cv opened' })).toBe('I/UI: cv opened');
    expect(text({ kind: 'ui', action: 'copied' })).toBe('I/UI: copied');
    expect(text({ kind: 'command', name: 'ls' })).toBe('I/Terminal: ls');
    expect(
      text({ kind: 'runtime', source: 'error', error: new RangeError('x') }),
    ).toBe('E/Runtime: uncaught (RangeError)');
    expect(text({ kind: 'runtime', source: 'rejection', error: 'nope' })).toBe(
      'E/Runtime: unhandled rejection (Error)',
    );
  });

  it('marks errors and warnings as problems, and nothing else', () => {
    const failed = buildEntry({
      kind: 'query-failed',
      key: ['content', 'projects'],
      error: new Error('x'),
    });
    expect(failed.problem).toEqual({
      severity: 'error',
      source: 'query',
      code: 'query-failed',
      subject: 'projects',
    });
    expect(
      buildEntry({ kind: 'query-retry', key: ['site', 'live'], attempt: 1 })
        .problem?.severity,
    ).toBe('warning');
    expect(
      buildEntry({ kind: 'runtime', source: 'error', error: null }).problem,
    ).toMatchObject({ source: 'runtime', code: 'uncaught', subject: 'Error' });
    expect(buildEntry({ kind: 'route', path: '/' }).problem).toBeUndefined();
    expect(
      buildEntry({ kind: 'query-read', key: ['content', 'skills'], docs: 2 })
        .problem,
    ).toBeUndefined();
  });

  it('never lets a secret through, whatever an event is given', () => {
    const lines: string[] = [];
    for (const secret of SECRETS) {
      const hostile = Object.assign(new Error(secret), {
        name: secret,
        stack: secret,
        cause: secret,
        url: secret,
      });
      const events: DevLogEvent[] = [
        { kind: 'route', path: secret },
        {
          kind: 'query-read',
          key: ['content', secret],
          // @ts-expect-error a number is expected: a document must not get through as the count
          docs: { title: secret },
          // @ts-expect-error a number is expected
          ms: secret,
        },
        { kind: 'query-read', key: [secret, secret] },
        { kind: 'query-failed', key: ['content', secret], error: hostile },
        { kind: 'query-failed', key: ['content', 'projects'], error: hostile },
        { kind: 'query-retry', key: [secret], attempt: 1 },
        { kind: 'runtime', source: 'error', error: hostile },
        { kind: 'runtime', source: 'rejection', error: hostile },
        { kind: 'runtime', source: 'rejection', error: secret },
        { kind: 'setting', name: 'language', value: secret },
        { kind: 'setting', name: 'theme', value: secret },
        { kind: 'command', name: secret },
        // @ts-expect-error the action is one of a fixed list
        { kind: 'ui', action: secret },
        // @ts-expect-error a number is expected
        { kind: 'ttfb', ms: secret },
        // @ts-expect-error a number is expected
        { kind: 'vitals', lcpMs: secret, cls: secret },
        // @ts-expect-error a number is expected
        { kind: 'ready', ms: secret },
      ];
      for (const event of events) {
        const built = buildEntry(event);
        lines.push(
          formatEntry(built),
          built.problem?.subject ?? '',
          built.problem?.code ?? '',
        );
      }
    }
    const all = lines.join('\n');
    for (const needle of [
      'example.com',
      'bach@',
      '912',
      '345',
      'https',
      'googleapis',
      'secret-project',
      'AIza',
      'token',
      'password',
      'hunter2',
      'script',
      'fetch',
      '?',
      '@',
    ]) {
      expect(all).not.toContain(needle);
    }
    // every line is made of the fixed words, names and numbers: nothing else can be in it
    for (const line of lines.filter(Boolean)) {
      expect(line).toMatch(/^[A-Za-z0-9 /:.()+>\-·]*$/);
      expect(line.length).toBeLessThanOrEqual(MAX_TEXT + 40);
    }
  });

  it('keeps every line short even for an absurd number', () => {
    expect(text({ kind: 'ttfb', ms: 1e30 }).length).toBeLessThan(40);
  });
});

describe('the store', () => {
  beforeEach(() => resetLog());
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('keeps the lines in order with their time and an id', () => {
    emit({ kind: 'route', path: '/' }, 1000);
    emit({ kind: 'route', path: '/about' }, 2000);
    const { entries } = getState();
    expect(entries.map((e) => [e.id, e.time, e.level, e.tag, e.text])).toEqual([
      [0, 1000, 'I', 'Router', '/'],
      [1, 2000, 'I', 'Router', '/about'],
    ]);
  });

  it('keeps at most 200 lines, the newest', () => {
    for (let i = 0; i < MAX_ENTRIES + 25; i += 1) {
      emit({ kind: 'ttfb', ms: i });
    }
    const { entries } = getState();
    expect(entries).toHaveLength(MAX_ENTRIES);
    expect(entries.at(-1)?.text).toBe(`TTFB ${MAX_ENTRIES + 24} ms`);
    expect(entries[0].text).toBe('TTFB 25 ms');
  });

  it('groups problems and counts errors and warnings', () => {
    expect(getState()).toMatchObject({ errors: 0, warnings: 0, problems: [] });
    const failed: DevLogEvent = {
      kind: 'query-failed',
      key: ['content', 'projects'],
      error: new Error('x'),
    };
    emit(failed);
    emit(failed);
    emit({ kind: 'query-retry', key: ['content', 'skills'], attempt: 1 });
    emit({ kind: 'runtime', source: 'error', error: new TypeError('x') });
    const state = getState();
    expect(state.errors).toBe(2);
    expect(state.warnings).toBe(1);
    expect(state.problems.map((p) => [p.code, p.subject, p.count])).toEqual([
      ['query-failed', 'projects', 2],
      ['query-retried', 'skills', 1],
      ['uncaught', 'TypeError', 1],
    ]);
  });

  it('clearing the Output keeps the problems', () => {
    emit({ kind: 'runtime', source: 'error', error: new Error('x') });
    clearEntries();
    expect(getState().entries).toEqual([]);
    expect(getState().errors).toBe(1);
  });

  it('is the same object until something is logged', () => {
    emit({ kind: 'route', path: '/' });
    const before = getState();
    clearEntries();
    clearEntries();
    expect(getState()).not.toBe(before);
    const empty = getState();
    clearEntries();
    expect(getState()).toBe(empty);
  });

  it('never stores, sends or prints anything', () => {
    const fetchSpy = vi.fn();
    const beacon = vi.fn();
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.stubGlobal('fetch', fetchSpy);
    vi.stubGlobal('navigator', { sendBeacon: beacon });
    const storage = { setItem: vi.fn(), getItem: vi.fn() };
    vi.stubGlobal('localStorage', storage);
    emit({ kind: 'runtime', source: 'error', error: new Error('secret') });
    emit({ kind: 'query-read', key: ['content', 'projects'], docs: 2 });
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(beacon).not.toHaveBeenCalled();
    expect(storage.setItem).not.toHaveBeenCalled();
    expect(log).not.toHaveBeenCalled();
  });
});

describe('the copy event', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('says only that something was copied', () => {
    const seen: Event[] = [];
    const target = new EventTarget();
    target.addEventListener(COPIED_EVENT, (event) => seen.push(event));
    vi.stubGlobal('window', target);
    announceCopied();
    expect(seen).toHaveLength(1);
    expect(Object.keys(seen[0])).not.toContain('detail');
    expect('detail' in seen[0]).toBe(false);
  });
});

describe('the words', () => {
  it('has the same shape in both languages', () => {
    const shape = (value: unknown): unknown =>
      typeof value === 'object' && value !== null
        ? Object.fromEntries(
            Object.entries(value).map(([k, v]) => [k, shape(v)]),
          )
        : typeof value;
    expect(shape(devOutputCopy.vi)).toEqual(shape(devOutputCopy.en));
  });
});

describe('the source of the log', () => {
  const dir = 'src/skins/dev/shell/devlog';

  it('has no console output, network call or storage', () => {
    const files = readdirSync(dir).filter((name) => /\.tsx?$/.test(name));
    expect(files.length).toBeGreaterThan(3);
    for (const file of files) {
      const code = readFileSync(`${dir}/${file}`, 'utf8');
      expect(code, file).not.toMatch(
        /console\.|\bfetch\(|sendBeacon|XMLHttpRequest|WebSocket|localStorage|sessionStorage|indexedDB|document\.cookie/,
      );
    }
  });
});
