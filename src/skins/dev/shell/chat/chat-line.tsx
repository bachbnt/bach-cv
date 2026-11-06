/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

/** The colour of each speaker of the log, in `--spk`: it paints the rule and the prompt of a line. */
export const SPEAKER = {
  you: '[--spk:var(--dv-accent)]',
  bot: '[--spk:var(--blue)]',
  warn: '[--spk:var(--yellow)]',
  error: '[--spk:var(--red)]',
} as const;

/** A message is a line of a terminal log: a rule and a prompt in the colour of the speaker, then the text. */
export const LINE =
  'flex-row items-baseline gap-[10px] rounded-none border-0 border-l-2 border-l-(--spk) bg-transparent py-px pr-0 pl-[10px] font-sans text-[14px]/[1.6] text-ink animate-[dv-bbpop_0.3s_cubic-bezier(0.2,0.8,0.2,1)_both] **:data-slot:self-start';

/** The prompt in front of a line (`you ❯`). Decoration: `aria-hidden`; a screen reader hears the speaker in a `sr-only` span. */
export function ChatPrompt({ className, ...props }: ComponentProps<'span'>) {
  return (
    <span
      aria-hidden='true'
      className={cn(
        'w-[8ch] flex-none font-code text-[12px]/[1.6] font-semibold whitespace-nowrap text-(--spk) select-none',
        className,
      )}
      {...props}
    />
  );
}
