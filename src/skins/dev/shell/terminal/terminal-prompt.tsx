/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { DEV_PROJECT } from '@/skins/dev/config';

/** The prompt of the shell (`➜ bachbntdev git:(main) `). Decoration: a screen reader hears the command, not the prompt. */
export function TerminalPrompt() {
  return (
    <span
      data-slot='dev-terminal-prompt'
      aria-hidden='true'
      className='flex-none whitespace-pre select-none'
    >
      <span className='text-signal'>➜</span>{' '}
      <span className='font-semibold text-head'>{DEV_PROJECT}</span>{' '}
      <span className='text-sky'>git:(</span>
      <span className='text-err'>main</span>
      <span className='text-sky'>)</span>{' '}
    </span>
  );
}
