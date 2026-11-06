/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useCallback, useSyncExternalStore } from 'react';

export type DevTool = 'problems' | 'output' | 'terminal';

/** What the editor chrome remembers between pages and between windows. */
export interface DevUi {
  /** the Explorer is shown */
  explorer: boolean;
  /** the project folder in the Explorer is open */
  workspace: boolean;
  /** folders of the Explorer that were opened (`true`) or shut (`false`) by the visitor, by path */
  folders: Record<string, boolean>;
  /** the bottom panel: which tool it shows, or none */
  panel: DevTool | null;
}

/** A change of the chrome: the fields to set, or a function that reads the current state and returns them. */
export type DevUiUpdate = (
  patch: Partial<DevUi> | ((current: DevUi) => Partial<DevUi>),
) => void;

const KEY = 'bach-cv-dev-ui';
const TOOLS: readonly DevTool[] = ['problems', 'output', 'terminal'];
const DEFAULTS: DevUi = {
  explorer: true,
  workspace: true,
  folders: {},
  panel: null,
};

const isFlags = (value: unknown): value is Record<string, boolean> =>
  typeof value === 'object' &&
  value !== null &&
  !Array.isArray(value) &&
  Object.values(value).every((flag) => typeof flag === 'boolean');

/** The stored string as a `DevUi`: a field that is missing or has the wrong type takes its default (the storage is the visitor's to edit). */
function parse(raw: string): DevUi {
  const stored: unknown = JSON.parse(raw);
  if (typeof stored !== 'object' || stored === null) return DEFAULTS;
  const fields = stored as Record<string, unknown>;
  return {
    explorer:
      typeof fields.explorer === 'boolean'
        ? fields.explorer
        : DEFAULTS.explorer,
    workspace:
      typeof fields.workspace === 'boolean'
        ? fields.workspace
        : DEFAULTS.workspace,
    folders: isFlags(fields.folders) ? fields.folders : DEFAULTS.folders,
    panel: TOOLS.find((tool) => tool === fields.panel) ?? null,
  };
}

// one parsed copy per stored string, so React sees the same object until the storage really changes
let cachedRaw: string | null | undefined;
let cached: DevUi = DEFAULTS;
const listeners = new Set<() => void>();

function read(): DevUi {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(KEY);
  } catch {
    // storage blocked: the defaults are used
  }
  if (raw === cachedRaw) return cached;
  cachedRaw = raw;
  try {
    cached = raw ? parse(raw) : DEFAULTS;
  } catch {
    cached = DEFAULTS;
  }
  return cached;
}

function emit() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  // another window changed it
  const onStorage = (event: StorageEvent) => {
    if (event.key === KEY) listener();
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', onStorage);
  };
}

/** The state of the editor chrome (Explorer, folders, panel), kept in the browser so it is the same on every page and in every window. */
export function useDevUi(): [DevUi, DevUiUpdate] {
  const ui = useSyncExternalStore(subscribe, read, () => DEFAULTS);
  const update = useCallback<DevUiUpdate>((patch) => {
    const current = read();
    const next = {
      ...current,
      ...(typeof patch === 'function' ? patch(current) : patch),
    };
    try {
      window.localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      // storage blocked: the change lasts until the page closes (`read` sees the same `null` and keeps `cached`)
      cachedRaw = null;
      cached = next;
    }
    emit();
  }, []);
  return [ui, update];
}
