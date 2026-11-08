/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { User } from 'lucide-react';
import Image from 'next/image';
import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** One line of the conversation: an avatar and a name over the text, left-aligned, no bubble. The text can be selected. */
export function ChatRow({
  who,
  name,
  tone = 'plain',
  children,
}: {
  who: 'bot' | 'visitor';
  name: string;
  tone?: 'plain' | 'error';
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        'tv-rise grid grid-cols-[24px_minmax(0,1fr)] gap-x-2.5 px-3.5 py-2 transition-[background-color] duration-100 hover:bg-tv-hover/60',
        tone === 'error' && 'border-l-2 border-l-tv-down bg-tv-down-bg pl-3',
      )}
    >
      <span
        aria-hidden='true'
        className='grid size-6 place-items-center overflow-hidden rounded-full bg-tv-hover text-tv-mute'
      >
        {who === 'bot' ? (
          <Image
            src='/logo.png'
            alt=''
            width={16}
            height={15}
            className='h-auto w-4'
          />
        ) : (
          <User className='size-3.5' />
        )}
      </span>
      <div className='min-w-0 select-text'>
        <p className='text-xs leading-6 font-bold'>{name}</p>
        <div className='text-[13px]/[1.55] wrap-break-word whitespace-pre-wrap'>
          {children}
        </div>
      </div>
    </div>
  );
}
