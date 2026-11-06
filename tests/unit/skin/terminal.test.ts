/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { describe, expect, it } from 'vitest';
import { devTerminalCopy } from '@/content/copy/dev-terminal';
import { PAGES, type PageKey } from '@/lib/content/schema';
import { DEV_FILES } from '@/skins/dev/config';
import {
  COMMANDS,
  complete,
  runCommand,
  type TerminalEnv,
} from '@/skins/dev/shell/terminal/run-command';

type State = 'on' | 'soon' | 'hidden';

/** The environment of a terminal: every page on, unless said otherwise, and every feature on. */
const envOf = (
  states: Partial<Record<PageKey, State>> = {},
  features: Partial<TerminalEnv['features']> = {},
  lang: 'en' | 'vi' = 'en',
): TerminalEnv => ({
  copy: devTerminalCopy[lang],
  pages: PAGES.map((key) => ({
    key,
    file: DEV_FILES[key].name,
    state: states[key] ?? 'on',
  })),
  features: { cv: true, connect: true, ask: true, ...features },
});

const text = (input: string, env = envOf()) =>
  runCommand(input, env).lines.map((l) => l.text);

describe('runCommand', () => {
  it('does nothing for an empty line', () => {
    expect(runCommand('', envOf())).toEqual({ lines: [], action: null });
    expect(runCommand('   ', envOf())).toEqual({ lines: [], action: null });
  });

  it('lists every command in help', () => {
    const out = text('help').join('\n');
    for (const name of COMMANDS) expect(out).toContain(name);
  });

  it('lists the files of the visible pages in ls, marking the ones that are soon', () => {
    const env = envOf({ payment: 'hidden', services: 'soon' });
    const [row] = text('ls', env);
    expect(row).toContain('Home.java');
    expect(row).toContain('About.js');
    expect(row).toContain('Services.ts (soon)');
    expect(row).not.toContain('Payment.swift');
  });

  describe('cd', () => {
    const goes = (input: string, page: PageKey, env = envOf()) =>
      expect(runCommand(input, env).action).toEqual({ type: 'go', page });

    it('accepts the key, the file name, the name without its extension, in any case', () => {
      goes('cd about', 'about');
      goes('cd About.js', 'about');
      goes('cd about.JS', 'about');
      goes('cd ABOUT', 'about');
      goes('cd About', 'about');
      goes('cd projects/', 'projects');
      goes('  cd   resume  ', 'resume');
    });

    it('goes home for ~, .., / and no argument', () => {
      goes('cd', 'home');
      goes('cd ~', 'home');
      goes('cd ..', 'home');
      goes('cd /', 'home');
      goes('cd Home.java', 'home');
    });

    it('says no such file for an unknown page', () => {
      const result = runCommand('cd nowhere', envOf());
      expect(result.action).toBeNull();
      expect(result.lines).toEqual([
        { tone: 'error', text: 'cd: no such file or directory: nowhere' },
      ]);
    });

    it('cannot reach a hidden page, not even by its file name', () => {
      const env = envOf({ payment: 'hidden' });
      for (const input of ['cd payment', 'cd Payment.swift']) {
        const result = runCommand(input, env);
        expect(result.action).toBeNull();
        expect(result.lines[0].text).toContain('no such file or directory');
      }
    });

    it('does not enter a page that is coming soon', () => {
      const result = runCommand('cd services', envOf({ services: 'soon' }));
      expect(result.action).toBeNull();
      expect(result.lines).toEqual([
        { tone: 'error', text: 'cd: services: coming soon' },
      ]);
    });

    it('cannot go home when home is hidden', () => {
      const result = runCommand('cd ~', envOf({ home: 'hidden' }));
      expect(result.action).toBeNull();
      expect(result.lines[0].text).toBe('cd: no such file or directory: ~');
    });

    it('refuses more than one argument', () => {
      const result = runCommand('cd about resume', envOf());
      expect(result.action).toBeNull();
      expect(result.lines[0].text).toBe('cd: too many arguments');
    });
  });

  describe('the windows', () => {
    it.each([
      ['cv', 'opening cv…'],
      ['connect', 'opening connect…'],
      ['ask', 'opening BB Bot…'],
    ] as const)('%s confirms and asks for the window', (name, said) => {
      const result = runCommand(name, envOf());
      expect(result.action).toEqual({ type: name });
      expect(result.lines.map((l) => l.text)).toEqual([said]);
    });

    it.each([
      ['cv', { cv: false }],
      ['connect', { connect: false }],
      ['ask', { ask: false }],
    ] as const)(
      '%s says it is not available when its switch is off',
      (name, features) => {
        const result = runCommand(name, envOf({}, features));
        expect(result.action).toBeNull();
        expect(result.lines).toEqual([
          { tone: 'error', text: `${name}: not available` },
        ]);
      },
    );
  });

  it('clear and exit are actions without output', () => {
    expect(runCommand('clear', envOf())).toEqual({
      lines: [],
      action: { type: 'clear' },
    });
    expect(runCommand('exit', envOf())).toEqual({
      lines: [],
      action: { type: 'exit' },
    });
  });

  it('says command not found, with a hint, for anything else', () => {
    const result = runCommand('sudo rm -rf /', envOf());
    expect(result.action).toBeNull();
    expect(result.lines.map((l) => l.text)).toEqual([
      'zsh: command not found: sudo',
      'Type help to see the commands.',
    ]);
    // commands are case-sensitive, as in a real shell
    expect(text('HELP')[0]).toBe('zsh: command not found: HELP');
  });

  it('answers in Vietnamese', () => {
    const env = envOf({}, { cv: false }, 'vi');
    expect(text('cd nowhere', env)[0]).toBe(
      'cd: không có tệp hoặc thư mục: nowhere',
    );
    expect(text('cv', env)[0]).toBe('cv: không khả dụng');
    expect(text('foo', env)[0]).toBe('zsh: không tìm thấy lệnh: foo');
    expect(text('help', env)[0]).toBe('Các lệnh:');
  });
});

describe('complete', () => {
  it('completes a command that only one command starts with, and adds a space', () => {
    expect(complete('he', envOf())).toEqual({ line: 'help ', options: [] });
    expect(complete('con', envOf())).toEqual({
      line: 'connect ',
      options: [],
    });
    expect(complete('cd', envOf())).toEqual({ line: 'cd ', options: [] });
  });

  it('lists the commands when several start the same way and nothing more can be added', () => {
    const result = complete('c', envOf());
    expect(result.line).toBe('c');
    expect(result.options).toEqual(['cd', 'cv', 'connect', 'clear']);
  });

  it('completes a longer start of one command', () => {
    expect(complete('cl', envOf()).line).toBe('clear ');
  });

  it('completes a page after cd to its file name, from the key or the file', () => {
    expect(complete('cd ab', envOf())).toEqual({
      line: 'cd About.js',
      options: [],
    });
    expect(complete('cd Ab', envOf()).line).toBe('cd About.js');
    expect(complete('cd Res', envOf()).line).toBe('cd Resume.dart');
  });

  it('lists the pages that share a start', () => {
    const result = complete('cd ', envOf());
    expect(result.line).toBe('cd ');
    expect(result.options).toEqual(PAGES.map((key) => DEV_FILES[key].name));
    expect(complete('cd p', envOf()).options).toEqual([
      'Projects.py',
      'Payment.swift',
    ]);
    expect(complete('cd s', envOf())).toEqual({
      line: 'cd Services.ts',
      options: [],
    });
  });

  it('leaves out hidden and soon pages', () => {
    const env = envOf({ payment: 'hidden', services: 'soon' });
    expect(complete('cd pa', env)).toEqual({ line: 'cd pa', options: [] });
    expect(complete('cd se', env)).toEqual({ line: 'cd se', options: [] });
    expect(complete('cd ', env).options).not.toContain('Payment.swift');
    expect(complete('cd ', env).options).not.toContain('Services.ts');
  });

  it('leaves a line with nothing to complete as it is', () => {
    expect(complete('', envOf())).toEqual({ line: '', options: [] });
    expect(complete('xyz', envOf())).toEqual({ line: 'xyz', options: [] });
    expect(complete('help me', envOf())).toEqual({
      line: 'help me',
      options: [],
    });
    expect(complete('cd zzz', envOf())).toEqual({
      line: 'cd zzz',
      options: [],
    });
  });
});
