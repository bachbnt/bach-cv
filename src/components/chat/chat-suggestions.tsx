/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { chatCopy } from '@/content/copy/chat';
import { useCopy } from '@/lib/i18n/copy';
import type { Suggestion } from '@/lib/chat/suggestions';
import styles from './chat-widget.module.css';

/**
 * Suggested questions. Before the first question they wrap under the greeting (nothing else is on screen).
 * After that they become one scrolling row of their own, between the messages and the input, so they
 * never cover a message and stay available after one has been used.
 */
export function ChatSuggestions({
  suggestions,
  layout,
  disabled,
  onPick,
}: {
  suggestions: Suggestion[];
  layout: 'wrap' | 'strip';
  disabled: boolean;
  onPick: (text: string) => void;
}) {
  const copy = useCopy(chatCopy);
  return (
    <div
      role='group'
      aria-label={copy.suggestionsLabel}
      className={
        layout === 'strip'
          ? 'flex flex-none snap-x gap-2 overflow-x-auto overscroll-x-contain border-t bg-background px-3 py-2 [scrollbar-width:thin]'
          : 'flex flex-wrap gap-2 pt-0.5'
      }
    >
      {suggestions.map((s) => (
        <button
          key={s.id}
          type='button'
          disabled={disabled}
          onClick={() => onPick(s.text)}
          className={`${styles.chip} shrink-0 snap-start rounded-full border-[1.5px] bg-card px-3 py-2 text-left text-[13.5px] font-medium whitespace-nowrap transition-colors hover:border-foreground hover:bg-background active:bg-secondary disabled:pointer-events-none disabled:opacity-50 pointer-coarse:min-h-11`}
        >
          {s.text}
        </button>
      ))}
    </div>
  );
}
