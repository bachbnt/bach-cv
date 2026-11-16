/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { chatCopy } from '@/content/copy/chat';
import type { Suggestion } from '@/lib/chat/suggestions';
import { useCopy } from '@/lib/i18n/copy';
import { cn } from '@/lib/utils';

/**
 * The questions not asked yet, as quick-reply chips. While the conversation is empty they `wrap` in rows under the greeting, inside the
 * messages; once it has begun they are one `row` above the box that scrolls sideways and fades at its edges (a long list never pushes the
 * answer off a small screen, and no border ever cuts a chip).
 */
export function PhChatSuggestions({
  suggestions,
  onPick,
  layout,
}: {
  suggestions: Suggestion[];
  onPick: (text: string) => void;
  layout: 'wrap' | 'row';
}) {
  const copy = useCopy(chatCopy);
  return (
    <div
      role='group'
      aria-label={copy.suggestionsLabel}
      className={cn(
        'flex gap-2',
        layout === 'wrap'
          ? 'flex-wrap pl-10'
          : 'ph-overlay-fade-x shrink-0 overflow-x-auto overscroll-contain px-4 py-1.5 [scrollbar-width:none]',
      )}
    >
      {suggestions.map((s) => (
        <button
          key={s.id}
          type='button'
          onClick={() => onPick(s.text)}
          className={cn(
            'min-h-10 cursor-pointer rounded-full border border-ph-line bg-ph-sheet px-4 py-1.5 text-left text-[15px]/[1.35] font-semibold text-ph-accent-ink transition-[scale,background-color] duration-100 hover:bg-ph-sheet-2 active:scale-[0.97] pointer-coarse:min-h-11',
            layout === 'row'
              ? 'w-max shrink-0 whitespace-nowrap'
              : 'max-w-full wrap-anywhere',
          )}
        >
          {s.text}
        </button>
      ))}
    </div>
  );
}
