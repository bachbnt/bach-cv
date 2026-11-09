/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useId, useState } from 'react';
import { cn } from '@/lib/utils';
import { AcIcon } from '@/skins/academic/ui/ac-icon';

/**
 * The responsibilities of a role: a button and a list that slides open (the first role is open). Shut, the list is hidden from the keyboard
 * and from screen readers (`inert`), so only the button can be reached.
 */
export function ResumeResponsibilities({
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
    <div className='mt-4'>
      <button
        type='button'
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((value) => !value)}
        className='inline-flex min-h-9 cursor-pointer items-center gap-2 font-ac-note text-[17px] text-ac-link underline underline-offset-4 pointer-coarse:min-h-11'
      >
        {open ? hide : show}
        <AcIcon
          name='chevronDown'
          className={cn(
            'size-5 transition-transform duration-300',
            open && 'rotate-180',
          )}
        />
      </button>
      <div
        id={id}
        data-open={open}
        inert={!open}
        className='grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 ease-out data-[open=true]:grid-rows-[1fr]'
      >
        <div className='overflow-hidden'>
          <ul className='m-0 flex list-disc flex-col gap-2.5 pt-3 pl-5 text-[0.97em]/[1.55] marker:text-ac-md'>
            {bullets.map((bullet) => (
              <li key={bullet}>{bullet}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
