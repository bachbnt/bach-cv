/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { CircleAlert } from 'lucide-react';
import Image from 'next/image';
import type { ReactNode } from 'react';
import { chatCopy } from '@/content/copy/chat';
import { streamCopy } from '@/content/copy/stream';
import { useCopy } from '@/lib/i18n/copy';
import { cn } from '@/lib/utils';

/** The round picture before a line: the logo for the assistant, an initial for the visitor, an alert mark for an error. */
function Avatar({ role }: { role: 'user' | 'bot' | 'error' }) {
  const you = useCopy(streamCopy).chat.you;
  if (role === 'bot')
    return (
      <span
        aria-hidden='true'
        className='grid size-6 flex-none place-items-center rounded-full bg-white'
      >
        <Image
          src='/logo.png'
          alt=''
          width={16}
          height={16}
          className='size-4 object-contain'
        />
      </span>
    );
  if (role === 'error')
    return (
      <span
        aria-hidden='true'
        className='grid size-6 flex-none place-items-center text-sm-red-ink'
      >
        <CircleAlert className='size-5' />
      </span>
    );
  return (
    <span
      aria-hidden='true'
      className='grid size-6 flex-none place-items-center rounded-full bg-sm-blue text-[11px] font-bold text-sm-bg'
    >
      {you.charAt(0)}
    </span>
  );
}

/**
 * One line of the chat, the way a live chat shows it: the picture, the name and the text. The assistant is the owner of the channel
 * (yellow name); an error is a red line, with Try again when the question can be sent again.
 */
export function ChatLine({
  role,
  name,
  onRetry,
  children,
}: {
  role: 'user' | 'bot' | 'error';
  name?: string;
  onRetry?: () => void;
  children: ReactNode;
}) {
  const copy = useCopy(chatCopy);
  return (
    <div className='flex items-start gap-2 text-[13px]/[1.45]'>
      <Avatar role={role} />
      <div className='min-w-0 flex-1 wrap-break-word whitespace-pre-wrap'>
        {name && (
          <span
            className={cn(
              'mr-1.5 inline-block rounded-full px-1.5 font-medium',
              role === 'bot' ? 'bg-sm-owner text-sm-owner-ink' : 'text-sm-blue',
            )}
          >
            {name}
          </span>
        )}
        <span className={cn(role === 'error' && 'text-sm-red-ink')}>
          {children}
        </span>
        {role === 'error' && onRetry && (
          <button
            type='button'
            onClick={onRetry}
            className='mt-1 block cursor-pointer rounded-sm text-sm font-medium text-sm-blue underline underline-offset-[3px] pointer-coarse:min-h-11'
          >
            {copy.errors.tryAgain}
          </button>
        )}
      </div>
    </div>
  );
}
