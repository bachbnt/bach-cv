/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import type { FormEvent, KeyboardEvent, Ref } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { chatCopy } from '@/content/copy/chat';
import { useCopy } from '@/lib/i18n/copy';
import { DevIcon } from '@/skins/dev/icons/dev-icon';
import { devButtonVariants } from '@/skins/dev/ui/dev-button';
import { cn } from '@/lib/utils';

/** The message box and its send button. Enter sends, Shift+Enter adds a line. */
export function DevChatComposer({
  value,
  onChange,
  onSend,
  maxLength,
  disabled,
  canSend,
  textareaRef,
}: {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  maxLength: number;
  /** the assistant cannot be reached at all */
  disabled: boolean;
  /** a question may be sent now (not waiting for an answer) */
  canSend: boolean;
  textareaRef: Ref<HTMLTextAreaElement>;
}) {
  const copy = useCopy(chatCopy);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (canSend) onSend();
  };
  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (
      event.key === 'Enter' &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing
    ) {
      event.preventDefault();
      if (canSend) onSend();
    }
  };

  return (
    <form
      className='flex items-start gap-2 border-t border-line bg-chrome px-3 pt-2 pb-[6px]'
      onSubmit={submit}
    >
      <span
        className='flex-none py-[6px] font-code text-[14px]/[1.5] font-bold text-signal select-none'
        aria-hidden='true'
      >
        ❯
      </span>
      <Textarea
        className='max-h-24 min-h-0 min-w-0 flex-1 resize-none rounded-none border-0 border-b bg-transparent px-0 py-[6px] font-code text-[13.5px]/[1.5] text-head caret-signal placeholder:text-dim placeholder:opacity-100 focus:outline-none! focus-visible:ring-0 disabled:bg-transparent disabled:opacity-60 md:text-[13.5px]/[1.5] dark:bg-transparent dark:disabled:bg-transparent pointer-coarse:text-[16px]'
        ref={textareaRef}
        rows={1}
        value={value}
        maxLength={maxLength}
        disabled={disabled}
        autoComplete='off'
        placeholder={copy.placeholder}
        aria-label={copy.messageLabel}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={onKeyDown}
      />
      <Button
        type='submit'
        variant='brand'
        data-slot='dev-button'
        className={cn(
          devButtonVariants({ variant: 'solid' }),
          'min-h-[38px] w-[38px] flex-none justify-center gap-[10px] self-end p-0 text-[16px]/[1.25] disabled:cursor-default disabled:opacity-50 disabled:[filter:saturate(0.7)]',
        )}
        aria-label={copy.send}
        disabled={disabled || !canSend || !value.trim()}
      >
        <DevIcon name='send' />
      </Button>
    </form>
  );
}
