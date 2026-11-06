/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useId, useState } from 'react';
import { DevIcon } from '@/skins/dev/icons/dev-icon';

/**
 * The responsibilities of a role: a button and a list that slides open (`grid-template-rows` 0fr to 1fr). Shut, the list is
 * inert, so the keyboard and screen readers only reach the button.
 */
export function DevResponsibilities({
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
    <>
      <button
        type='button'
        data-slot='dev-toggle'
        className='group/toggle mt-3.5 inline-flex cursor-pointer gap-1.5 border-0 bg-transparent py-1.5 text-sky focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal active:opacity-70'
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? hide : show}
        <DevIcon
          name='chevron-down'
          className='inline-block transition-[transform] duration-300 ease-[ease] group-aria-expanded/toggle:[transform:rotate(180deg)]'
        />
      </button>
      <div
        id={id}
        data-open={open}
        inert={!open}
        className='grid grid-rows-[0fr] transition-[grid-template-rows] duration-[350ms] ease-[ease] data-[open=true]:grid-rows-[1fr]'
      >
        <div className='overflow-hidden'>
          <ul className='mt-2 rounded-[0_6px_6px_0] border-l-2 border-[color:color-mix(in_srgb,var(--dv-accent)_40%,var(--line-2))] bg-[color:color-mix(in_srgb,var(--dv-accent)_4%,var(--bg))] py-1'>
            {bullets.map((bullet) => (
              <li
                key={bullet}
                className='relative py-1.5 pr-3.5 pl-[34px] font-sans text-[14.5px]/[1.65] font-normal text-ink transition-[background,color] duration-200 ease-[ease] before:absolute before:left-3.5 before:font-bold before:text-[color:color-mix(in_srgb,var(--dv-accent)_70%,var(--dv-muted))] before:content-["+"] hover:bg-[color:color-mix(in_srgb,var(--dv-accent)_8%,transparent)] hover:text-head'
              >
                {bullet}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
