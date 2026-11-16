/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { Send } from 'lucide-react';
import type { FormEvent, KeyboardEvent, Ref } from 'react';
import { chatCopy } from '@/content/copy/chat';
import { useCopy } from '@/lib/i18n/copy';
import { PhButton } from '@/skins/phone/ui/ph-button';

/**
 * The message box, like a messenger's: a pill with the send button inside it on the right. Enter sends (the keyboard of a phone says
 * Send), Shift+Enter adds a line, the box grows with the text up to four lines and then scrolls, and the button wakes up when there is
 * something to send. The text is 16 px, so a phone does not zoom into the field; writing assistants of the browser are told to leave it
 * alone (they draw their icon over the field).
 */
export function PhChatComposer({
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
    <form onSubmit={submit} className='shrink-0 px-3 pt-2'>
      <div className='flex items-end gap-1 rounded-ph-panel border border-ph-line bg-ph-sheet-2 p-0.5 pl-4 transition-[border-color] duration-100 focus-within:border-ph-accent focus-within:ring-1 focus-within:ring-ph-accent'>
        <textarea
          ref={textareaRef}
          rows={1}
          enterKeyHint='send'
          data-gramm='false'
          data-gramm_editor='false'
          data-enable-grammarly='false'
          value={value}
          maxLength={maxLength}
          disabled={disabled}
          placeholder={copy.placeholder}
          aria-label={copy.messageLabel}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={onKeyDown}
          className='field-sizing-content max-h-[calc(4lh+1.25rem)] min-h-11 min-w-0 flex-1 resize-none overflow-y-auto bg-transparent py-2.5 text-[16px]/[1.4] text-ph-ink outline-none placeholder:text-ph-mute disabled:opacity-60'
        />
        <PhButton
          type='submit'
          variant='solid'
          size='icon'
          aria-label={copy.send}
          disabled={disabled || !canSend || !value.trim()}
          className='disabled:bg-ph-sheet-3 disabled:text-ph-mute disabled:opacity-100'
        >
          <Send aria-hidden='true' className='size-5' strokeWidth={2.2} />
        </PhButton>
      </div>
    </form>
  );
}
