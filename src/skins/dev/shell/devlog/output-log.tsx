/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useLayoutEffect, useRef } from 'react';
import { devOutputCopy } from '@/content/copy/dev-output';
import { useCopy } from '@/lib/i18n/copy';
import {
  formatEntry,
  formatTime,
  type Level,
} from '@/skins/dev/shell/devlog/events';
import { PANEL_BODY } from '@/skins/dev/shell/panel-body';
import { useDevLog } from '@/skins/dev/shell/devlog/use-devlog';

/** The colour of a line by its level, like the levels of logcat. */
const LEVEL: Record<Level, string> = {
  I: 'text-ink',
  D: 'text-mute',
  W: 'text-gold',
  E: 'text-err',
};

/** How near the bottom counts as "at the bottom": the log keeps following the newest line from there. */
const NEAR_BOTTOM = 24;

/**
 * The Output tab: the dev log, one line each (`I/Router: /about`), the newest at the bottom. A polite live region. It follows the
 * newest line unless the visitor has scrolled up to read, and starts following again when they scroll back down.
 */
export function OutputLog() {
  const copy = useCopy(devOutputCopy).output;
  const entries = useDevLog((state) => state.entries);
  const screen = useRef<HTMLDivElement>(null);
  const following = useRef(true);

  useLayoutEffect(() => {
    const element = screen.current;
    if (element && following.current) element.scrollTop = element.scrollHeight;
  }, [entries]);

  return (
    <div
      ref={screen}
      role='log'
      tabIndex={0}
      aria-live='polite'
      aria-label={copy.label}
      data-slot='dev-output'
      className={PANEL_BODY}
      onScroll={(event) => {
        const el = event.currentTarget;
        following.current =
          el.scrollHeight - el.scrollTop - el.clientHeight <= NEAR_BOTTOM;
      }}
    >
      {entries.length === 0 && <p className='text-mute'>{copy.empty}</p>}
      {entries.map((entry) => (
        <p key={entry.id} className='break-words whitespace-pre-wrap'>
          <span aria-hidden='true' className='mr-2 text-mute/70 select-none'>
            {formatTime(entry.time)}
          </span>
          <span className={LEVEL[entry.level]}>{formatEntry(entry)}</span>
        </p>
      ))}
    </div>
  );
}
