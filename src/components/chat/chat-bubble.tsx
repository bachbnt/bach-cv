/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { chatCopy } from '@/content/copy/chat';
import { useCopy } from '@/lib/i18n/copy';
import { cn } from '@/lib/utils';

/** One message. `error` is the red note (with "Try again" when the question can be sent again). */
export function ChatBubble({
  role,
  children,
  onRetry,
}: {
  role: 'user' | 'bot' | 'error';
  children: string;
  onRetry?: () => void;
}) {
  const copy = useCopy(chatCopy);
  return (
    <div
      className={cn(
        'bb-bubble',
        'max-w-[86%] rounded-2xl px-3.5 py-2.5 text-[15px] leading-normal wrap-break-word whitespace-pre-wrap',
        role === 'bot' && 'self-start rounded-bl-[6px] border bg-card',
        role === 'user' && 'self-end rounded-br-[6px] bg-night text-white',
        role === 'error' &&
          'self-start rounded-bl-[6px] border border-[#e9b8ae] bg-[#f8e4df] text-[#7a1f13]',
      )}
    >
      {children}
      {role === 'error' && onRetry && (
        <button
          type='button'
          onClick={onRetry}
          className='mt-1.5 block rounded-sm text-sm font-semibold underline underline-offset-[3px] pointer-coarse:min-h-11 pointer-coarse:py-2'
        >
          {copy.errors.tryAgain}
        </button>
      )}
    </div>
  );
}
