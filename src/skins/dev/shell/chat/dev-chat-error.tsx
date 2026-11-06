/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { chatCopy } from '@/content/copy/chat';
import { useCopy } from '@/lib/i18n/copy';
import { cn } from '@/lib/utils';
import { ChatPrompt, LINE, SPEAKER } from '@/skins/dev/shell/chat/chat-line';

/**
 * A system note as a log line: `error:` (red) for a failure, `warn:` (yellow) for a limit. "Try again" is a keycap when the
 * question can be sent again.
 */
export function DevChatError({
  level = 'error',
  children,
  onRetry,
}: {
  level?: 'warn' | 'error';
  children: string;
  onRetry?: () => void;
}) {
  const copy = useCopy(chatCopy);
  return (
    <Alert className={cn(LINE, 'flex w-full flex-wrap', SPEAKER[level])}>
      <ChatPrompt>{level}:</ChatPrompt>
      <AlertDescription className='min-w-0 flex-[1_1_12em] text-[14px]/[1.6] text-ink text-wrap whitespace-pre-wrap md:text-wrap'>
        {children}
      </AlertDescription>
      {onRetry && (
        <Button
          type='button'
          variant='outline'
          data-slot='dev-chat-cap'
          className='h-auto flex-none cursor-pointer gap-[6px] rounded-[5px] border border-b-2 border-line-2 bg-chrome px-2 pt-px pb-0 font-code text-[12px]/[1.5] font-semibold text-ink hover:border-signal hover:bg-chrome hover:text-signal max-[720px]:h-auto pointer-coarse:h-auto pointer-coarse:min-h-11'
          onClick={onRetry}
        >
          <span aria-hidden='true'>↻</span>
          {copy.errors.tryAgain}
        </Button>
      )}
    </Alert>
  );
}
