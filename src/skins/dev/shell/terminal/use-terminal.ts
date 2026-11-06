/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useRef, useState, type ChangeEvent, type KeyboardEvent } from 'react';
import { emit } from '@/skins/dev/shell/devlog/store';
import {
  complete,
  runCommand,
  type OutputTone,
  type TerminalAction,
  type TerminalEnv,
} from '@/skins/dev/shell/terminal/run-command';

/** One line of the scrollback: a command the visitor ran (with its prompt), or a line of its output. */
export interface Entry {
  id: number;
  kind: 'command' | 'output';
  tone: OutputTone;
  text: string;
}

/** What the scrollback keeps: the oldest lines go when a visitor has run a great many commands. */
const MAX_ENTRIES = 300;
const MAX_LINE = 200;

/** What the page does for a command; `clear` is the terminal's own business. */
export type TerminalPerform = (
  action: Exclude<TerminalAction, { type: 'clear' }>,
) => void;

/**
 * The state of the terminal: the scrollback, the text being typed and the history of the lines run (Arrow up and down), and the
 * keys of the line (Enter, Tab, Ctrl+L). What a command does outside the terminal is `perform`. Nothing is stored: it lasts as long
 * as the page is open.
 */
export function useTerminal(env: TerminalEnv, perform: TerminalPerform) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [value, setValue] = useState('');
  const nextId = useRef(0);
  const history = useRef<string[]>([]);
  // where Arrow up has got to in the history (`null`: not browsing) and what was being typed before
  const cursor = useRef<number | null>(null);
  const draft = useRef('');

  const append = (items: Omit<Entry, 'id'>[]) =>
    setEntries((current) =>
      [
        ...current,
        ...items.map((item) => ({ ...item, id: nextId.current++ })),
      ].slice(-MAX_ENTRIES),
    );

  const submit = () => {
    const result = runCommand(value, env);
    const text = value.trim();
    if (text && history.current.at(-1) !== text) history.current.push(text);
    cursor.current = null;
    setValue('');
    // only the name of the command goes to the dev log, never what follows it
    if (text) emit({ kind: 'command', name: text.split(/\s+/)[0] });
    if (result.action?.type === 'clear') {
      setEntries([]);
      return;
    }
    append([
      { kind: 'command', tone: 'plain', text: value },
      ...result.lines.map((line) => ({ kind: 'output' as const, ...line })),
    ]);
    if (result.action) perform(result.action);
  };

  const browse = (step: -1 | 1) => {
    const lines = history.current;
    if (cursor.current === null) {
      if (step === 1 || lines.length === 0) return;
      draft.current = value;
    }
    const from = cursor.current ?? lines.length;
    const to = Math.min(Math.max(from + step, 0), lines.length);
    cursor.current = to === lines.length ? null : to;
    setValue(to === lines.length ? draft.current : lines[to]);
  };

  /** Tab: completes the word, and lists the names when several fit. With nothing to complete the key is left alone (it moves on). */
  const tab = (event: KeyboardEvent<HTMLInputElement>) => {
    const result = complete(value, env);
    if (result.line === value && result.options.length === 0) return;
    event.preventDefault();
    setValue(result.line);
    if (result.options.length > 0) {
      append([
        { kind: 'command', tone: 'plain', text: value },
        { kind: 'output', tone: 'plain', text: result.options.join('  ') },
      ]);
    }
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.nativeEvent.isComposing) return;
    if (event.key === 'Enter') {
      event.preventDefault();
      submit();
    } else if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault();
      browse(event.key === 'ArrowUp' ? -1 : 1);
    } else if (event.key === 'Tab' && !event.shiftKey) {
      tab(event);
    } else if (
      event.key.toLowerCase() === 'l' &&
      event.ctrlKey &&
      !event.metaKey &&
      !event.altKey
    ) {
      event.preventDefault();
      setEntries([]);
    }
  };

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    cursor.current = null;
    setValue(event.target.value.slice(0, MAX_LINE));
  };

  return { entries, value, onChange, onKeyDown };
}
