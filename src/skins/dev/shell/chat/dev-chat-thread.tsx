/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { ArrowDown } from 'lucide-react';
import { useState } from 'react';
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from '@/components/ui/message-scroller';
import { chatCopy } from '@/content/copy/chat';
import { devOverlaysCopy } from '@/content/copy/dev-overlays';
import { fill } from '@/lib/chat/fill';
import type { ChatEntry } from '@/lib/chat/messages';
import type { Suggestion } from '@/lib/chat/suggestions';
import { useCopy } from '@/lib/i18n/copy';
import {
  chatErrorLevel,
  chatErrorText,
} from '@/skins/dev/shell/chat/chat-error-text';
import { DevChatBubble } from '@/skins/dev/shell/chat/dev-chat-bubble';
import { DevChatError } from '@/skins/dev/shell/chat/dev-chat-error';
import { DevChatSuggestions } from '@/skins/dev/shell/chat/dev-chat-suggestions';
import { DevChatTyping } from '@/skins/dev/shell/chat/dev-chat-typing';
import { DevChatTypewriter } from '@/skins/dev/shell/chat/dev-chat-typewriter';

/**
 * The conversation: the greeting, what was said, the typing dots and the questions not asked yet, in a `MessageScroller` that
 * follows the answer. Only an answer that arrives while this is mounted is typed out; what was said before (the panel opened
 * again, the window unfolded) is shown at once.
 */
export function DevChatThread({
  botName,
  available,
  entries,
  isSending,
  suggestions,
  onPick,
  onRetry,
}: {
  botName: string;
  available: boolean;
  entries: ChatEntry[];
  isSending: boolean;
  /** the questions to offer after the last message; none hides the row */
  suggestions: Suggestion[];
  onPick: (text: string) => void;
  onRetry: () => void;
}) {
  const copy = useCopy(chatCopy);
  const extra = useCopy(devOverlaysCopy).chat;
  const [earlierIds] = useState(() => new Set(entries.map((e) => e.id)));
  const lastIndex = entries.length - 1;

  return (
    <MessageScrollerProvider autoScroll>
      <MessageScroller className='h-auto flex-[1_1_0] bg-editor'>
        <MessageScrollerViewport
          aria-label={extra.messages}
          className='[scrollbar-gutter:auto] focus-visible:-outline-offset-2!'
        >
          <MessageScrollerContent className='gap-3 p-[14px] [&>[data-slot=message-scroller-item]]:[content-visibility:visible]'>
            <MessageScrollerItem messageId='greeting'>
              {available ? (
                <DevChatBubble role='bot' speaker={botName}>
                  {fill(copy.greeting, { name: botName })}
                </DevChatBubble>
              ) : (
                <DevChatError>{copy.unavailable}</DevChatError>
              )}
            </MessageScrollerItem>
            {entries.map((entry, i) => (
              <MessageScrollerItem
                key={entry.id}
                messageId={entry.id}
                scrollAnchor={entry.role === 'user'}
              >
                {entry.role === 'error' ? (
                  <DevChatError
                    level={chatErrorLevel(entry.content)}
                    onRetry={
                      i === lastIndex && !isSending ? onRetry : undefined
                    }
                  >
                    {chatErrorText(copy, entry.content)}
                  </DevChatError>
                ) : (
                  <DevChatBubble
                    role={entry.role}
                    speaker={entry.role === 'user' ? extra.you : botName}
                  >
                    {entry.role === 'bot' && !earlierIds.has(entry.id) ? (
                      <DevChatTypewriter text={entry.content} />
                    ) : (
                      entry.content
                    )}
                  </DevChatBubble>
                )}
              </MessageScrollerItem>
            ))}
            {isSending && (
              <MessageScrollerItem messageId='typing'>
                <DevChatTyping botName={botName} />
              </MessageScrollerItem>
            )}
            {suggestions.length > 0 && (
              <MessageScrollerItem messageId='suggestions'>
                <DevChatSuggestions suggestions={suggestions} onPick={onPick} />
              </MessageScrollerItem>
            )}
          </MessageScrollerContent>
        </MessageScrollerViewport>
        <MessageScrollerButton className='size-[30px] border border-line-2 bg-chrome text-ink shadow-[0_4px_14px_rgba(0,0,0,0.35)] hover:bg-chrome hover:text-ink max-[720px]:size-[30px] pointer-coarse:size-[30px] data-[direction=end]:bottom-[10px] rounded-full'>
          <ArrowDown aria-hidden='true' className='size-4' />
          <span className='sr-only'>{extra.latest}</span>
        </MessageScrollerButton>
      </MessageScroller>
    </MessageScrollerProvider>
  );
}
