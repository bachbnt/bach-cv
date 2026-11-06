/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { devTerminalCopy } from '@/content/copy/dev-terminal';
import { useCopy } from '@/lib/i18n/copy';
import { PANEL_BODY } from '@/skins/dev/shell/panel-body';
import { TerminalLog } from '@/skins/dev/shell/terminal/terminal-log';
import { TerminalPrompt } from '@/skins/dev/shell/terminal/terminal-prompt';
import { useTerminal } from '@/skins/dev/shell/terminal/use-terminal';
import { useTerminalActions } from '@/skins/dev/shell/terminal/use-terminal-actions';
import { useTerminalEnv } from '@/skins/dev/shell/terminal/use-terminal-env';

/**
 * The Terminal tab of the bottom panel: a small shell that runs a few commands (`help`, `ls`, `cd`, `cv`, `connect`, `ask`, `clear`,
 * `exit`). It is always mounted (the panel only hides it), so the scrollback and the history last while the page is open.
 * The one place where the Dev skin does something Standard does not.
 */
export function DevTerminal({
  hidden,
  focusToken,
  onConnect,
  onExit,
}: {
  hidden: boolean;
  /** goes up each time the visitor opens the tab: the line takes the focus then (never on page load) */
  focusToken: number;
  /** opens the Connect palette */
  onConnect: () => void;
  /** closes the panel */
  onExit: () => void;
}) {
  const copy = useCopy(devTerminalCopy);
  const env = useTerminalEnv();
  const perform = useTerminalActions({ onConnect, onExit });
  const { entries, value, onChange, onKeyDown } = useTerminal(env, perform);
  const screen = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (focusToken > 0) input.current?.focus({ preventScroll: true });
  }, [focusToken]);

  // the newest line is always in view
  useEffect(() => {
    const element = screen.current;
    if (element) element.scrollTop = element.scrollHeight;
  }, [entries, hidden]);

  return (
    <div
      ref={screen}
      hidden={hidden}
      data-slot='dev-terminal'
      className={PANEL_BODY}
      // a click anywhere on the screen goes to the line, unless the visitor is selecting text to copy
      onClick={() => {
        if (!window.getSelection()?.toString()) input.current?.focus();
      }}
    >
      <TerminalLog entries={entries} hint={copy.hint} label={copy.label} />
      <div className='flex items-center'>
        <TerminalPrompt />
        <Input
          ref={input}
          value={value}
          aria-label={copy.inputLabel}
          autoComplete='off'
          autoCapitalize='off'
          autoCorrect='off'
          spellCheck={false}
          enterKeyHint='go'
          onChange={onChange}
          onKeyDown={onKeyDown}
          className='h-[1.65em] flex-1 rounded-none border-0 bg-transparent p-0 font-code text-[12.5px] text-ink caret-signal focus-visible:ring-0 focus-visible:outline-none! md:text-[12.5px] pointer-coarse:text-base pointer-coarse:md:text-base dark:bg-transparent'
        />
      </div>
    </div>
  );
}
