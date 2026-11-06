/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { DevTerminalCopy } from '@/content/copy/dev-terminal';
import { fill } from '@/lib/chat/fill';
import type { Live, PageKey } from '@/lib/content/schema';

/** The commands of the terminal, in the order `help` lists them. */
export const COMMANDS = [
  'help',
  'ls',
  'cd',
  'cv',
  'connect',
  'ask',
  'clear',
  'exit',
] as const;

type PageState = Live['pages'][PageKey];

/** A page as the terminal sees it: its key, its file name in the editor and its state in `site/live`. */
export interface TerminalPage {
  key: PageKey;
  /** the file name of its tab (`About.js`) */
  file: string;
  state: PageState;
}

/** Everything a command depends on. The caller builds it from the live switches and the visitor's language. */
export interface TerminalEnv {
  copy: DevTerminalCopy;
  /** every page, in the order of the tabs; the hidden ones are left out here */
  pages: readonly TerminalPage[];
  /** the feature switches of `site/live`: the CV window, the Connect menu and BB Bot */
  features: { cv: boolean; connect: boolean; ask: boolean };
}

export type OutputTone = 'plain' | 'dim' | 'error';

export interface OutputLine {
  tone: OutputTone;
  text: string;
}

/** What the command asks the page to do, after its output is printed. */
export type TerminalAction =
  | { type: 'go'; page: PageKey }
  | { type: 'cv' }
  | { type: 'connect' }
  | { type: 'ask' }
  | { type: 'clear' }
  | { type: 'exit' };

export interface CommandResult {
  lines: OutputLine[];
  action: TerminalAction | null;
}

const line = (text: string, tone: OutputTone = 'plain'): OutputLine => ({
  text,
  tone,
});
const done = (
  lines: OutputLine[],
  action: TerminalAction | null = null,
): CommandResult => ({ lines, action });

/** The pages a visitor can see: the hidden ones do not exist. */
const visible = (env: TerminalEnv) =>
  env.pages.filter((page) => page.state !== 'hidden');

/** `About.js` -> `about`, `about` -> `about`. */
const stem = (name: string) => name.replace(/\.[^./]+$/, '').toLowerCase();

/** The page `cd` means by `arg` (a key, a file name with or without its extension, any case), or `undefined`. */
function pageNamed(env: TerminalEnv, arg: string): TerminalPage | undefined {
  const name = arg.replace(/\/+$/, '');
  if (name === '~' || name === '..' || name === '') {
    return visible(env).find((page) => page.key === 'home');
  }
  const wanted = name.toLowerCase();
  return visible(env).find(
    (page) =>
      page.key === wanted ||
      page.file.toLowerCase() === wanted ||
      stem(page.file) === wanted,
  );
}

function cd(args: string[], env: TerminalEnv): CommandResult {
  const { errors } = env.copy;
  if (args.length > 1) return done([line(errors.tooManyArgs, 'error')]);
  const arg = args[0] ?? '~';
  const page = pageNamed(env, arg);
  if (!page) {
    return done([line(fill(errors.noSuchFile, { arg }), 'error')]);
  }
  // a page that is "soon" has a tab that cannot be opened: neither can it be entered from here
  if (page.state === 'soon') {
    return done([line(fill(errors.comingSoon, { arg }), 'error')]);
  }
  return done([], { type: 'go', page: page.key });
}

function ls(env: TerminalEnv): CommandResult {
  const names = visible(env).map((page) =>
    page.state === 'soon' ? `${page.file} ${env.copy.soon}` : page.file,
  );
  return done([line(names.join('  '))]);
}

function help(env: TerminalEnv): CommandResult {
  const { title, commands } = env.copy.help;
  const width = Math.max(...COMMANDS.map((name) => name.length)) + 2;
  return done([
    line(title),
    ...COMMANDS.map((name) => line(`  ${name.padEnd(width)}${commands[name]}`)),
  ]);
}

/** A command that opens a window: it says so, then asks for it, or says it is not available when its switch is off. */
function opener(
  name: 'cv' | 'connect' | 'ask',
  env: TerminalEnv,
): CommandResult {
  if (!env.features[name]) {
    return done([
      line(fill(env.copy.errors.unavailable, { command: name }), 'error'),
    ]);
  }
  return done([line(env.copy.opening[name], 'dim')], { type: name });
}

/** Runs one line the visitor typed: the lines to print and what to do next. An empty line does nothing. */
export function runCommand(input: string, env: TerminalEnv): CommandResult {
  const words = input.trim().split(/\s+/).filter(Boolean);
  const [command, ...args] = words;
  if (!command) return done([]);
  switch (command) {
    case 'help':
      return help(env);
    case 'ls':
      return ls(env);
    case 'cd':
      return cd(args, env);
    case 'cv':
    case 'connect':
    case 'ask':
      return opener(command, env);
    case 'clear':
      return done([], { type: 'clear' });
    case 'exit':
      return done([], { type: 'exit' });
    default:
      return done([
        line(fill(env.copy.errors.notFound, { command }), 'error'),
        line(env.copy.errors.notFoundHint, 'dim'),
      ]);
  }
}

export interface Completion {
  /** the new text of the line (the same when nothing could be added) */
  line: string;
  /** the names to list under the line, when several match and nothing more could be added (like zsh) */
  options: string[];
}

/** The longest start the names share, in the case of the first one. */
function commonStart(names: string[]): string {
  const [first = '', ...rest] = names;
  let length = first.length;
  for (const name of rest) {
    while (
      length > 0 &&
      name.slice(0, length).toLowerCase() !==
        first.slice(0, length).toLowerCase()
    ) {
      length -= 1;
    }
  }
  return first.slice(0, length);
}

/** Finishes the word at the end of the line: a command, or the page after `cd`. */
function finish(
  before: string,
  word: string,
  names: string[],
  tail: string,
): Completion {
  const matches = names.filter((name) =>
    name.toLowerCase().startsWith(word.toLowerCase()),
  );
  if (matches.length === 0) return { line: before + word, options: [] };
  if (matches.length === 1) {
    return { line: before + matches[0] + tail, options: [] };
  }
  const start = commonStart(matches);
  if (start.length > word.length) return { line: before + start, options: [] };
  return { line: before + word, options: matches };
}

/**
 * Tab: completes a command at the start of the line, or a page name after `cd` (a key such as `ab` or a file name such as `Ab`,
 * completed to the file name). One match is completed; several are completed as far as they agree, and listed when they do not.
 */
export function complete(input: string, env: TerminalEnv): Completion {
  const unchanged: Completion = { line: input, options: [] };
  const command = /^(\s*)(\S+)$/.exec(input);
  if (command) {
    return finish(command[1], command[2], [...COMMANDS], ' ');
  }
  const argument = /^(\s*cd\s+)(\S*)$/.exec(input);
  if (!argument) return unchanged;
  // every file name starts with its key (`About.js`, `about`), so matching the file name also matches the key
  const files = visible(env)
    .filter((page) => page.state === 'on')
    .map((page) => page.file);
  return finish(argument[1], argument[2], files, '');
}
