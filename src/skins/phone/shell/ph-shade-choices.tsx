/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { cn } from '@/lib/utils';

export interface ShadeChoice {
  value: string;
  label: string;
  hint?: string;
  lang?: string;
}

/** The choices of the quick setting that is open, as a radio group with the one in use checked. */
export function PhShadeChoices({
  id,
  title,
  value,
  choices,
  onChoose,
  onPreview,
}: {
  id: string;
  title: string;
  value: string;
  choices: ShadeChoice[];
  onChoose: (value: string) => void;
  onPreview?: (value: string) => void;
}) {
  return (
    <div
      id={id}
      role='radiogroup'
      aria-label={title}
      className='overflow-hidden rounded-ph-panel bg-ph-sheet-2'
    >
      {choices.map((choice) => {
        const on = choice.value === value;
        return (
          <button
            key={choice.value}
            type='button'
            role='radio'
            aria-checked={on}
            lang={choice.lang}
            onClick={() => onChoose(choice.value)}
            onPointerEnter={() => onPreview?.(choice.value)}
            onFocus={() => onPreview?.(choice.value)}
            className={cn(
              'flex min-h-12 w-full cursor-pointer items-center justify-between gap-3 border-b border-ph-line px-4 py-2 text-left text-[16px] font-medium transition-[background-color] duration-100 last:border-b-0 hover:bg-ph-sheet-3',
              on && 'text-ph-accent-ink',
            )}
          >
            <span className='flex flex-col'>
              {choice.label}
              {choice.hint && (
                <small className='text-[13px] font-normal text-ph-mute'>
                  {choice.hint}
                </small>
              )}
            </span>
            <span
              aria-hidden='true'
              className={cn(
                'size-5 shrink-0 rounded-full border-2 border-ph-line',
                on && 'border-[6px] border-ph-accent',
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
