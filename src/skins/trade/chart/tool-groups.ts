/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { CursorMode, ToolId } from '@/skins/trade/chart/chart-types';

/** Everything the tool rail can pick: a cursor, or a tool of the chart (the eraser is a tool, the cursors are modes of the cursor tool). */
export type EntryId =
  | CursorMode
  | 'eraser'
  | 'trend'
  | 'ray'
  | 'hline'
  | 'vline'
  | 'fib'
  | 'rect'
  | 'text'
  | 'measure';

export type GroupId =
  'cursors' | 'lines' | 'fib' | 'shapes' | 'text' | 'measure';

export interface ToolGroup {
  id: GroupId;
  /** the tools of the flyout, the first one is the one the button shows until another is used */
  entries: readonly EntryId[];
}

/** The groups of the rail, in the order of the rail (as a chart terminal groups them). A group of one tool has no flyout. */
export const GROUPS: readonly ToolGroup[] = [
  { id: 'cursors', entries: ['cross', 'dot', 'arrow', 'eraser'] },
  { id: 'lines', entries: ['trend', 'ray', 'hline', 'vline'] },
  { id: 'fib', entries: ['fib'] },
  { id: 'shapes', entries: ['rect'] },
  { id: 'text', entries: ['text'] },
  { id: 'measure', entries: ['measure'] },
];

/** The keys of the tools that have one, as the tooltip and the flyout write them (the keys themselves are in `use-chart-keys.ts`). */
export const SHORTCUT: Partial<Record<EntryId, string>> = {
  trend: 'Alt+T',
  hline: 'Alt+H',
  vline: 'Alt+V',
  rect: 'Alt+R',
  fib: 'Alt+F',
  measure: 'Alt+M',
};

export const isCursorMode = (id: EntryId): id is CursorMode =>
  id === 'cross' || id === 'dot' || id === 'arrow';

/** The entry that is in use now: the cursor mode while the cursor tool is on, else the tool. */
export function entryOf(tool: ToolId, cursor: CursorMode): EntryId {
  return tool === 'cursor' ? cursor : tool;
}

export function groupOf(id: EntryId): ToolGroup {
  return GROUPS.find((g) => g.entries.includes(id)) ?? GROUPS[0];
}

/** What each button shows: the tool used last in its group, or the first one. */
export type LastUsed = Record<GroupId, EntryId>;

export const FIRST_USED: LastUsed = Object.fromEntries(
  GROUPS.map((g) => [g.id, g.entries[0]]),
) as LastUsed;

/** `last` with the entry now in use remembered in its group (the same object when it already was). */
export function remember(last: LastUsed, now: EntryId): LastUsed {
  const group = groupOf(now);
  return last[group.id] === now ? last : { ...last, [group.id]: now };
}
