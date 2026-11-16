/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { cva } from 'class-variance-authority';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { PhChatRow } from '@/skins/phone/shell/ph-chat-row';

/**
 * The corner at the foot of the sender's side is always tight (the tail of a messenger bubble) and, when the message before is the same
 * sender's, so is the corner at the top of that side, so a run of messages reads as one stack.
 */
const bubbleVariants = cva(
  'min-w-0 rounded-ph-panel px-4 py-2.5 text-[16px]/[1.5] wrap-anywhere whitespace-pre-wrap',
  {
    variants: {
      who: {
        you: 'rounded-br-[0.3rem] bg-ph-accent text-ph-on-accent',
        bot: 'rounded-bl-[0.3rem] bg-ph-sheet-3 text-ph-ink',
        error:
          'rounded-bl-[0.3rem] border border-ph-danger/45 bg-ph-danger/10 text-ph-danger',
      },
      joined: { true: '', false: '' },
    },
    compoundVariants: [
      { who: 'you', joined: true, className: 'rounded-tr-[0.3rem]' },
      { who: 'bot', joined: true, className: 'rounded-tl-[0.3rem]' },
      { who: 'error', joined: true, className: 'rounded-tl-[0.3rem]' },
    ],
    defaultVariants: { joined: false },
  },
);

/**
 * One message: the visitor's on the right in the accent colour, the assistant's on the left beside its avatar, an error note in the danger
 * colour. `name` is said to readers before the text (the bubbles are told apart by side and colour for the eye).
 */
export function PhChatBubble({
  who,
  joined,
  avatar,
  name,
  children,
  action,
}: {
  who: 'you' | 'bot' | 'error';
  /** the message before is on the same side: the bubbles sit closer and share a tight corner */
  joined?: boolean;
  /** the avatar slot of a message on the left (see `PhChatRow`) */
  avatar?: 'show' | 'space';
  name?: string;
  children: string;
  /** what follows the text (the Try again button of an error) */
  action?: ReactNode;
}) {
  return (
    <PhChatRow
      side={who === 'you' ? 'right' : 'left'}
      avatar={avatar}
      joined={joined}
    >
      <div className={cn(bubbleVariants({ who, joined }))}>
        {name && <span className='sr-only'>{name}: </span>}
        <span>{children}</span>
        {action}
      </div>
    </PhChatRow>
  );
}
