/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { cn } from '@/lib/utils';
import { TerminalPrompt } from '@/skins/dev/shell/terminal/terminal-prompt';
import type { Entry } from '@/skins/dev/shell/terminal/use-terminal';

const TONE = {
  plain: 'text-ink',
  dim: 'text-mute',
  error: 'text-err',
} as const;

/** The scrollback: the commands that were run (with their prompt) and what they printed. A polite live region, so the output is read out. */
export function TerminalLog({
  entries,
  hint,
  label,
}: {
  entries: Entry[];
  /** shown while nothing has been run */
  hint: string;
  label: string;
}) {
  return (
    <div role='log' aria-live='polite' aria-label={label}>
      {entries.length === 0 && <p className='text-mute'>{hint}</p>}
      {entries.map((entry) => (
        <p
          key={entry.id}
          className={cn(
            'min-h-[1.65em] break-words whitespace-pre-wrap',
            entry.kind === 'command' ? 'text-ink' : TONE[entry.tone],
          )}
        >
          {entry.kind === 'command' && <TerminalPrompt />}
          {entry.text}
        </p>
      ))}
    </div>
  );
}
