/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useIsFetching } from '@tanstack/react-query';
import { useRef, useState } from 'react';
import { devCopy } from '@/content/copy/dev';
import { devOutputCopy } from '@/content/copy/dev-output';
import { fill } from '@/lib/chat/fill';
import type { PageKey } from '@/lib/content/schema';
import { useCopy } from '@/lib/i18n/copy';
import { cn } from '@/lib/utils';
import { DEV_FILES, DEV_PROJECT, GIT_PENDING } from '@/skins/dev/config';
import { DevIcon } from '@/skins/dev/icons/dev-icon';
import { OutputLog } from '@/skins/dev/shell/devlog/output-log';
import { ProblemsList } from '@/skins/dev/shell/devlog/problems-list';
import { clearEntries } from '@/skins/dev/shell/devlog/store';
import { useDevLog } from '@/skins/dev/shell/devlog/use-devlog';
import type { Caret } from '@/skins/dev/shell/editor-frame';
import { DevTerminal } from '@/skins/dev/shell/terminal/dev-terminal';
import { useBumps } from '@/skins/dev/shell/use-bumps';
import type { DevTool, DevUi } from '@/skins/dev/shell/use-dev-ui';

/** A tab of the panel (Problems, Output, Terminal): a grey caption, white with a green line under it when it is open. */
const PANEL_TAB =
  'h-full cursor-pointer border-b border-b-transparent bg-transparent px-0.5 text-mute uppercase hover:text-ink aria-pressed:border-b-signal aria-pressed:text-head';

/** A button (or a plain item) of the status bar: white on the red bar, lighter when pointed at or on. */
const STATUS_BUTTON =
  'inline-flex h-full cursor-pointer items-center gap-[5px] bg-transparent px-[9px] text-white hover:bg-[rgba(255,255,255,0.14)] aria-pressed:bg-[rgba(255,255,255,0.2)] focus-visible:-outline-offset-2!';
const STATUS_ITEM =
  'inline-flex h-full cursor-pointer items-center gap-[5px] px-[9px]';

/** The bottom of the editor: the panel (Problems, Output, Terminal) when a tool is open, and the status bar. */
export function BottomBar({
  page,
  ui,
  onChange,
  caret,
  onOpenConnect,
}: {
  page: PageKey;
  ui: DevUi;
  onChange: (patch: Partial<DevUi>) => void;
  caret: Caret;
  /** opens the Connect palette (the `connect` command of the terminal) */
  onOpenConnect: () => void;
}) {
  const copy = useCopy(devCopy);
  const output = useCopy(devOutputCopy);
  const errors = useDevLog((state) => state.errors);
  const warnings = useDevLog((state) => state.warnings);
  // the sync icon turns while the page is reading data, and the problem count nudges when a problem is added
  const fetching = useIsFetching() > 0;
  const bumps = useBumps(errors + warnings);
  const file = DEV_FILES[page];
  const tools: { tool: DevTool; label: string }[] = [
    { tool: 'problems', label: copy.panel.problems },
    { tool: 'output', label: copy.panel.output },
    { tool: 'terminal', label: copy.panel.terminal },
  ];
  // goes up each time the visitor opens the Terminal tab, so its line takes the focus (never on page load, where the panel may open by itself)
  const [terminalFocus, setTerminalFocus] = useState(0);
  const statusTerminal = useRef<HTMLButtonElement>(null);
  const toggle = (tool: DevTool) => {
    const opening = ui.panel !== tool;
    onChange({ panel: opening ? tool : null });
    if (opening && tool === 'terminal') setTerminalFocus((n) => n + 1);
  };

  return (
    <div className='fixed inset-x-0 bottom-0 z-70 [view-transition-name:bottom] min-[901px]:group-data-[zen]/dv:hidden'>
      <div
        data-slot='dev-panel'
        className='flex h-[220px] flex-col border-t border-line-2 bg-editor not-[[hidden]]:animate-[dv-panelin_0.2s_ease-out_both]'
        hidden={!ui.panel}
      >
        <div className='flex h-8 flex-none items-center gap-[18px] px-3.5 font-sans text-[11px] leading-[normal] tracking-[0.04em]'>
          {tools.map(({ tool, label }) => (
            <button
              key={tool}
              type='button'
              className={PANEL_TAB}
              aria-pressed={ui.panel === tool}
              onClick={() => toggle(tool)}
            >
              {label}
            </button>
          ))}
          <span className='flex-1' />
          {ui.panel === 'output' && (
            <button
              type='button'
              className={cn(
                PANEL_TAB,
                'inline-grid size-[22px] place-items-center rounded-[5px] hover:bg-hov',
              )}
              aria-label={output.output.clear}
              title={output.output.clear}
              onClick={clearEntries}
            >
              <DevIcon name='clear-all' />
            </button>
          )}
          <button
            type='button'
            className={cn(
              PANEL_TAB,
              'inline-grid size-[22px] place-items-center rounded-[5px] hover:bg-hov',
            )}
            aria-label={copy.panel.close}
            onClick={() => onChange({ panel: null })}
          >
            <DevIcon name='close' />
          </button>
        </div>
        {ui.panel === 'problems' && <ProblemsList />}
        {ui.panel === 'output' && <OutputLog />}
        <DevTerminal
          hidden={ui.panel !== 'terminal'}
          focusToken={terminalFocus}
          onConnect={onOpenConnect}
          onExit={() => {
            onChange({ panel: null });
            statusTerminal.current?.focus();
          }}
        />
      </div>
      <div className='flex h-[22px] items-center overflow-hidden bg-status font-sans text-[12px] leading-[normal] whitespace-nowrap text-white'>
        <span className={STATUS_ITEM} aria-hidden='true'>
          <DevIcon name='remote' className='size-3.5' />
          {DEV_PROJECT}
        </span>
        <button
          type='button'
          className={STATUS_BUTTON}
          tabIndex={-1}
          aria-hidden='true'
        >
          <DevIcon name='source-control' className='size-3.5' />
          main*
        </button>
        <button
          type='button'
          className={STATUS_BUTTON}
          tabIndex={-1}
          aria-hidden='true'
          data-fetching={fetching || undefined}
        >
          <DevIcon
            name='sync'
            className={cn('size-3.5', fetching && 'animate-spin')}
          />
          0↓ {GIT_PENDING}↑
        </button>
        <button
          type='button'
          className={STATUS_BUTTON}
          aria-pressed={ui.panel === 'problems'}
          aria-label={fill(output.status, { errors, warnings })}
          onClick={() => toggle('problems')}
        >
          <span
            key={bumps}
            className={cn(
              'inline-flex items-center gap-[5px]',
              bumps > 0 && 'animate-[dv-bump_0.45s_ease-out]',
            )}
          >
            <DevIcon name='error' className='size-3.5' />
            {errors} &nbsp;
            <DevIcon name='warning' className='size-3.5' />
            {warnings}
          </span>
        </button>
        <button
          type='button'
          className={STATUS_BUTTON}
          aria-pressed={ui.panel === 'output'}
          onClick={() => toggle('output')}
        >
          <DevIcon name='output' className='size-3.5' />
          {copy.panel.output}
        </button>
        <button
          ref={statusTerminal}
          type='button'
          className={STATUS_BUTTON}
          aria-pressed={ui.panel === 'terminal'}
          onClick={() => toggle('terminal')}
        >
          <DevIcon name='terminal' className='size-3.5' />
          {copy.panel.terminal}
        </button>
        <span className='flex-1' />
        <span className={cn(STATUS_ITEM, 'max-[900px]:hidden')}>
          {copy.status.line} {caret.line}, {copy.status.column} {caret.column}
        </span>
        <span className={cn(STATUS_ITEM, 'max-[900px]:hidden')}>
          {copy.status.spaces}: 4
        </span>
        <span
          className={cn(STATUS_ITEM, 'max-[900px]:hidden')}
          aria-hidden='true'
        >
          UTF-8
        </span>
        <span
          className={cn(STATUS_ITEM, 'max-[900px]:hidden')}
          aria-hidden='true'
        >
          LF
        </span>
        <span className={STATUS_ITEM} aria-hidden='true'>
          {`{ } ${file.language}`}
        </span>
        <span className={STATUS_ITEM} aria-hidden='true'>
          <DevIcon name='check' className='size-3.5' />
          Prettier
        </span>
        <span className={STATUS_ITEM} aria-hidden='true'>
          <DevIcon name='bell' className='size-3.5' />
        </span>
      </div>
    </div>
  );
}
