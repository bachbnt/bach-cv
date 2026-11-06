/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import {
  buildEntry,
  type DevLogEvent,
  type LogEntry,
  type ProblemInfo,
} from '@/skins/dev/shell/devlog/events';

/** What the log keeps: the oldest lines go first. */
export const MAX_ENTRIES = 200;
/** How many different problems the list keeps (they are grouped, so this is rarely reached). */
const MAX_PROBLEMS = 50;

/** A problem and how many times it happened. */
export interface Problem extends ProblemInfo {
  key: string;
  count: number;
}

export interface DevLogState {
  entries: readonly LogEntry[];
  problems: readonly Problem[];
  /** the number of different errors and warnings (like the status bar of an editor, not the number of times) */
  errors: number;
  warnings: number;
}

const EMPTY: DevLogState = {
  entries: [],
  problems: [],
  errors: 0,
  warnings: 0,
};

/**
 * The log of the editor: in this page's memory and nowhere else (never stored, never sent). Module-level, so it lasts while the
 * page is open, also when the visitor switches skin and comes back. Lines are made only by `buildEntry` from typed events.
 */
let state: DevLogState = EMPTY;
let nextId = 0;
const listeners = new Set<() => void>();

const notify = () => listeners.forEach((listener) => listener());

export const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const getState = (): DevLogState => state;
export const getServerState = (): DevLogState => EMPTY;

const problemKey = (info: ProblemInfo) => `${info.code}:${info.subject}`;

function addProblem(
  problems: readonly Problem[],
  info: ProblemInfo,
): readonly Problem[] {
  const key = problemKey(info);
  const found = problems.find((problem) => problem.key === key);
  if (found) {
    return problems.map((problem) =>
      problem === found ? { ...problem, count: problem.count + 1 } : problem,
    );
  }
  return [...problems, { ...info, key, count: 1 }].slice(-MAX_PROBLEMS);
}

/** Adds one line, and its problem when it is an error or a warning. `time` is for tests. */
export function emit(event: DevLogEvent, time: number = Date.now()): void {
  const built = buildEntry(event);
  const entry: LogEntry = {
    id: nextId++,
    time,
    level: built.level,
    tag: built.tag,
    text: built.text,
  };
  const problems = built.problem
    ? addProblem(state.problems, built.problem)
    : state.problems;
  state = {
    entries: [...state.entries, entry].slice(-MAX_ENTRIES),
    problems,
    errors: problems.filter((p) => p.severity === 'error').length,
    warnings: problems.filter((p) => p.severity === 'warning').length,
  };
  notify();
}

/** Empties the Output. The problems stay: they are still true. */
export function clearEntries(): void {
  if (state.entries.length === 0) return;
  state = { ...state, entries: [] };
  notify();
}

/** Back to nothing (tests). */
export function resetLog(): void {
  state = EMPTY;
  nextId = 0;
  notify();
}
