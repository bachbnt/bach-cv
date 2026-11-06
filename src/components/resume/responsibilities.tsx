/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { ChevronDown } from 'lucide-react';
import { useId, useState } from 'react';
import { cn } from 'cn';

/**
 * The responsibilities of a role: a button and a list that slides open, its lines arriving one after another.
 * Closed, the list is hidden from keyboard and screen readers (inert), so only the button is reachable.
 */
export function Responsibilities({
  bullets,
  defaultOpen,
  show,
  hide,
}: {
  bullets: string[];
  defaultOpen: boolean;
  show: string;
  hide: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();

  return (
    <div className='mt-5'>
      <button
        type='button'
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((value) => !value)}
        className='flex min-h-11 cursor-pointer items-center gap-2 text-[15px] font-semibold underline underline-offset-4'
      >
        {open ? hide : show}
        <ChevronDown
          aria-hidden='true'
          className={cn(
            'size-4 transition-transform duration-300 motion-reduce:transition-none',
            open && 'rotate-180',
          )}
        />
      </button>
      <div
        id={id}
        data-open={open}
        inert={!open}
        className='group/list grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 ease-out data-[open=true]:grid-rows-[1fr] motion-reduce:transition-none'
      >
        <div className='overflow-hidden'>
          <ul className='flex list-disc flex-col gap-3 pt-4 pl-5 text-base leading-[1.6] text-body'>
            {bullets.map((bullet, index) => (
              <li
                key={bullet}
                style={{
                  transitionDelay: open
                    ? `${120 + Math.min(index, 8) * 45}ms`
                    : '0ms',
                }}
                className='translate-y-2 opacity-0 transition-[opacity,translate] duration-300 group-data-[open=true]/list:translate-y-0 group-data-[open=true]/list:opacity-100 motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none'
              >
                {bullet}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
