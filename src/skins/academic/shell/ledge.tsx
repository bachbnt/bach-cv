/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { academicCopy } from '@/content/copy/academic';
import { chatCopy } from '@/content/copy/chat';
import { useChat } from '@/components/chat/chat-provider';
import { useLive } from '@/hooks/use-live';
import { useCopy } from '@/lib/i18n/copy';
import { AcIcon } from '@/skins/academic/ui/ac-icon';

/** A stick of chalk lying on the ledge: a rounded bar with the light on its top, a chipped end and a shadow. `chipped` breaks the end. */
function Chalk({
  color,
  width,
  tilt,
  chipped,
}: {
  color: string;
  width: number;
  tilt: number;
  chipped?: boolean;
}) {
  const w = width;
  const end = chipped
    ? `L${w - 3} 3.6 L${w - 4.6} 6.2 L${w - 2.8} 8.4 L${w - 4} 11.2`
    : `Q${w - 1.4} 2.2 ${w - 1.6} 5 L${w - 2} 11.4`;
  return (
    <svg
      viewBox={`0 0 ${w} 16`}
      width={w}
      height={16}
      aria-hidden='true'
      className='-ml-1 first:ml-0'
      style={{ color, transform: `rotate(${tilt}deg)` }}
    >
      <ellipse
        cx={w / 2}
        cy='15'
        rx={w / 2 - 2}
        ry='1.7'
        fill='var(--ac-shade-dark)'
        opacity='.4'
      />
      <path
        d={`M3.5 4 Q3 1.6 6 1.4 L${w - 5} 1.8 ${end} Q${w - 2.2} 14 ${w - 5} 14 L6 14.2 Q2.6 14.2 2.8 10.4 Z`}
        fill='currentColor'
      />
      <path
        d={`M6 3.2 L${w - 8} 3.5`}
        stroke='var(--ac-shade-light)'
        strokeOpacity='.5'
        strokeWidth='1.2'
        strokeLinecap='round'
      />
      <path
        d={`M3.5 4 Q3 1.6 6 1.4 L${w - 5} 1.8 Q${w - 1.4} 2.2 ${w - 1.6} 5 L${w - 2} 11.4 Q${w - 2.2} 14 ${w - 5} 14 L6 14.2 Q2.6 14.2 2.8 10.4 Z`}
        fill='url(#ac-shade)'
      />
    </svg>
  );
}

/** A marker lying on the aluminium tray (the whiteboard): a coloured cap, a white body with a band, a felt tip. */
function Marker({ color, tilt }: { color: string; tilt: number }) {
  return (
    <svg
      viewBox='0 0 86 16'
      width={86}
      height={16}
      aria-hidden='true'
      className='-ml-1 first:ml-0'
      style={{ color, transform: `rotate(${tilt}deg)` }}
    >
      <ellipse
        cx='43'
        cy='15'
        rx='40'
        ry='1.7'
        fill='var(--ac-shade-dark)'
        opacity='.3'
      />
      <rect x='2' y='2' width='26' height='12' rx='3.5' fill='currentColor' />
      <rect
        x='26'
        y='3'
        width='52'
        height='10'
        rx='2.5'
        fill='var(--ac-marker-body)'
        stroke='var(--ac-marker-edge)'
        strokeWidth='.8'
      />
      <rect
        x='40'
        y='3.6'
        width='22'
        height='8.8'
        fill='currentColor'
        opacity='.85'
      />
      <path
        d='M78 4.5 L84 7 Q85.4 8 84 9 L78 11.5 Z'
        fill='currentColor'
        opacity='.8'
      />
      <rect x='2' y='2' width='26' height='12' rx='3.5' fill='url(#ac-shade)' />
      <rect
        x='26'
        y='3'
        width='52'
        height='10'
        rx='2.5'
        fill='url(#ac-shade)'
        opacity='.7'
      />
    </svg>
  );
}

/** The board eraser at rest on the ledge: a block with its felt underneath. */
function EraserAtRest() {
  return (
    <svg
      viewBox='0 0 74 34'
      width={74}
      height={34}
      aria-hidden='true'
      className='mr-3.5'
    >
      <ellipse
        cx='38'
        cy='32'
        rx='35'
        ry='2.2'
        fill='var(--ac-shade-dark)'
        opacity='.45'
      />
      <path d='M6 14 L14 5 L68 5 L72 14 Z' fill='var(--ac-er-top)' />
      <path d='M6 14 L72 14 L72 23 L6 23 Z' fill='var(--ac-er-front)' />
      <path
        d='M6 23 L72 23 L72 31 Q72 32 70 32 L8 32 Q6 32 6 31 Z'
        fill='var(--ac-er-felt)'
      />
      <path
        d='M6 23 L72 23'
        stroke='var(--ac-shade-dark)'
        strokeOpacity='.35'
      />
      <path d='M14 5 L68 5' stroke='var(--ac-shade-light)' strokeOpacity='.4' />
      <g fill='var(--ac-shade-light)' opacity='.6'>
        <circle cx='18' cy='28' r='1.1' />
        <circle cx='31' cy='27' r='.9' />
        <circle cx='47' cy='29' r='1.2' />
        <circle cx='62' cy='27.5' r='.9' />
      </g>
      <path
        d='M6 14 L72 14 L72 23 L6 23 Z'
        fill='url(#ac-shade)'
        opacity='.5'
      />
    </svg>
  );
}

/**
 * The ledge along the foot of the board, stuck to the bottom of the window: an eraser and sticks of chalk (markers on the whiteboard) lie on
 * it, a line of words runs along its front, and a paper slip leans on it that opens the chat. All of it decorates except the slip, which is the
 * Standard "Ask BB Bot" button; it is not there when the `chat` switch is off.
 */
export function Ledge() {
  const copy = useCopy(academicCopy);
  const chat = useCopy(chatCopy);
  const live = useLive();
  const { openChat } = useChat();

  return (
    <div className='sticky bottom-(--ac-frame-w,14px) z-20 mt-[22px] mr-(--ac-frame-w,14px) ml-(--ac-frame-w,14px) h-9 max-[760px]:h-[30px]'>
      <svg
        width='0'
        height='0'
        className='absolute'
        aria-hidden='true'
        focusable='false'
      >
        <defs>
          <linearGradient id='ac-shade' x1='0' y1='0' x2='0' y2='1'>
            <stop
              offset='0'
              stopColor='var(--ac-shade-light)'
              stopOpacity='.5'
            />
            <stop
              offset='.45'
              stopColor='var(--ac-shade-light)'
              stopOpacity='0'
            />
            <stop
              offset='1'
              stopColor='var(--ac-shade-dark)'
              stopOpacity='.35'
            />
          </linearGradient>
        </defs>
      </svg>
      <span className='ac-ledge' aria-hidden='true'>
        <i />
        <span className='ac-dust left-[10%] w-[90px]' />
        <span className='ac-dust left-[44%] w-[60px] opacity-70' />
        <span className='ac-dust left-[71%] w-[110px] opacity-55' />
      </span>
      <div className='pointer-events-none absolute inset-0 mx-auto max-w-[1120px]'>
        <span
          aria-hidden='true'
          className='absolute bottom-[29px] left-[26px] flex h-[30px] items-end max-[760px]:hidden'
        >
          <EraserAtRest />
          <span className='flex items-end dark:flex not-dark:hidden'>
            <Chalk
              color='var(--ac-chalk-white)'
              width={66}
              tilt={-1.2}
              chipped
            />
            <Chalk color='var(--ac-chalk-pink)' width={60} tilt={2.6} />
            <Chalk color='var(--ac-chalk-blue)' width={28} tilt={-3} chipped />
            <Chalk color='var(--ac-chalk-yellow)' width={62} tilt={1} />
          </span>
          <span className='flex items-end dark:hidden'>
            <Marker color='var(--ac-marker-blue)' tilt={-1} />
            <Marker color='var(--ac-marker-red)' tilt={1.6} />
            <Marker color='var(--ac-marker-green)' tilt={-1.8} />
          </span>
        </span>
        <span
          aria-hidden='true'
          className='absolute inset-x-0 bottom-1 h-[22px] truncate pr-5 pl-[360px] text-left font-ac-note text-[16px]/[22px] text-(--ac-ledge-ink) [text-shadow:var(--ac-ledge-text-shadow)] max-[760px]:hidden'
        >
          {copy.ledgeHint}
        </span>
        {live.features.chat && (
          <button
            type='button'
            data-ac-slip=''
            onClick={openChat}
            className='pointer-events-auto absolute right-6 bottom-7 inline-flex h-[38px] origin-bottom -rotate-[1.6deg] cursor-pointer items-center gap-2 rounded-[2px_3px_2px_4px] border-0 bg-[repeating-linear-gradient(180deg,transparent_0_18px,var(--ac-slip-line)_18px_19px),linear-gradient(180deg,var(--ac-slip-top),var(--ac-slip-bottom))] pr-4 pl-[18px] font-ac-note text-[20px]/none font-bold text-ac-sheet-ink shadow-(--ac-slip-shadow) transition-transform before:absolute before:top-0 before:bottom-0 before:left-[9px] before:w-[1.5px] before:bg-(--ac-slip-margin) before:content-[""] after:absolute after:-top-[7px] after:right-2 after:h-[13px] after:w-[34px] after:rotate-[5deg] after:bg-ac-tape after:shadow-(--ac-slip-tape-shadow) after:content-[""] hover:-translate-y-0.5 max-[760px]:right-3.5 max-[760px]:bottom-[22px] max-[760px]:h-9 max-[760px]:text-[19px] pointer-coarse:min-h-11'
          >
            <span className='pl-1.5'>{chat.askButton}</span>
            <AcIcon name='pencil' />
          </button>
        )}
      </div>
    </div>
  );
}
