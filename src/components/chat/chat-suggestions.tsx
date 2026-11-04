/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { chatCopy } from '@/content/copy/chat';
import { useCopy } from '@/lib/i18n/copy';
import type { Suggestion } from '@/lib/chat/suggestions';
import styles from './chat-widget.module.css';

/**
 * Suggested questions, wrapped as chips at the end of the conversation (as in the design mockup). The panel passes
 * only the ones not asked yet, so after each answer the rest are offered again and none covers a message.
 */
export function ChatSuggestions({
  suggestions,
  disabled,
  onPick,
}: {
  suggestions: Suggestion[];
  disabled: boolean;
  onPick: (text: string) => void;
}) {
  const copy = useCopy(chatCopy);
  return (
    <div
      role='group'
      aria-label={copy.suggestionsLabel}
      className='flex flex-wrap gap-2 pt-0.5'
    >
      {suggestions.map((s) => (
        <button
          key={s.id}
          type='button'
          disabled={disabled}
          onClick={() => onPick(s.text)}
          className={`${styles.chip} rounded-full border-[1.5px] bg-card px-3 py-2 text-left text-[13.5px] font-medium transition-colors hover:border-foreground hover:bg-background active:bg-secondary disabled:pointer-events-none disabled:opacity-50 pointer-coarse:min-h-11`}
        >
          {s.text}
        </button>
      ))}
    </div>
  );
}
