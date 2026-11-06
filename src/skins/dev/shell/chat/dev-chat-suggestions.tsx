/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { Button } from '@/components/ui/button';
import { chatCopy } from '@/content/copy/chat';
import { useCopy } from '@/lib/i18n/copy';
import type { Suggestion } from '@/lib/chat/suggestions';

/** The questions not asked yet, as command lines at the end of the conversation, so they never cover a message. */
export function DevChatSuggestions({
  suggestions,
  onPick,
}: {
  suggestions: Suggestion[];
  onPick: (text: string) => void;
}) {
  const copy = useCopy(chatCopy);
  return (
    <div
      className='flex flex-col gap-px pl-0.5'
      role='group'
      aria-label={copy.suggestionsLabel}
    >
      {suggestions.map((suggestion) => (
        <Button
          key={suggestion.id}
          type='button'
          variant='ghost'
          data-slot='dev-chat-chip'
          className='group/chip h-auto w-full animate-[dv-bbpop_0.4s_cubic-bezier(0.2,0.8,0.2,1)_both] items-baseline justify-start gap-[10px] cursor-pointer rounded-[4px] border-0 bg-transparent py-1 pr-2 pl-[10px] text-left text-base/[1.6] font-normal whitespace-normal text-ink nth-2:[animation-delay:0.07s] nth-3:[animation-delay:0.14s] nth-4:[animation-delay:0.21s] hover:bg-hov focus-visible:bg-hov focus-visible:outline-1! focus-visible:-outline-offset-1! max-[720px]:h-auto pointer-coarse:h-auto pointer-coarse:min-h-11 pointer-coarse:items-center'
          onClick={() => onPick(suggestion.text)}
        >
          <span
            className='w-[8ch] flex-none font-code text-[15px]/[1.3] font-bold text-mute transition-colors duration-150 ease-[ease] group-hover/chip:text-signal group-focus-visible/chip:text-signal'
            aria-hidden='true'
          >
            ›
          </span>
          {suggestion.text}
        </Button>
      ))}
    </div>
  );
}
