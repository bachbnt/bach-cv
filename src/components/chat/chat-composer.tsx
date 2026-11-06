/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { ArrowRight } from 'lucide-react';
import type { FormEvent, KeyboardEvent, Ref } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { chatCopy } from '@/content/copy/chat';
import { useCopy } from '@/lib/i18n/copy';

/** The message box and its send button. Enter sends, Shift+Enter adds a line. */
export function ChatComposer({
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
      onSubmit={submit}
      className='flex flex-none items-end gap-2 border-t bg-card p-3'
    >
      <Textarea
        ref={textareaRef}
        rows={1}
        value={value}
        maxLength={maxLength}
        disabled={disabled}
        placeholder={copy.placeholder}
        aria-label={copy.messageLabel}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={onKeyDown}
        className='max-h-24 min-h-10 resize-none rounded-xl border-[1.5px] px-3 py-2 max-[720px]:min-h-11 pointer-coarse:min-h-11 text-[15px] leading-[1.4] focus-visible:border-foreground focus-visible:ring-0 pointer-coarse:text-base md:text-[15px]'
      />
      <Button
        type='submit'
        variant='brand'
        size='icon'
        aria-label={copy.send}
        disabled={disabled || !canSend || !value.trim()}
        className='rounded-xl disabled:opacity-35 pointer-coarse:size-11'
      >
        <ArrowRight strokeWidth={2.2} aria-hidden='true' />
      </Button>
    </form>
  );
}
