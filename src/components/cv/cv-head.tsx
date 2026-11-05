/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { CvModel } from '@/lib/cv/build-cv';
import { CONTACT_ICON_PATHS } from '@/lib/cv/icon-paths';

/** Name, headline and contact lines at the top of the first sheet. */
export function CvHead({ cv }: { cv: CvModel }) {
  return (
    <header className='mb-[22px] flex justify-between gap-6'>
      <div>
        <h1 className='text-[30px] leading-[1.1]'>{cv.name}</h1>
        {cv.headline && (
          <p className='mt-2 mb-0 text-[15px] text-body'>{cv.headline}</p>
        )}
      </div>
      {cv.contacts.length > 0 && (
        <ul className='m-0 flex min-w-[250px] list-none flex-col gap-[7px] border-l-[3px] border-brand p-0 pl-3.5'>
          {cv.contacts.map((contact) => {
            return (
              <li key={contact.kind} className='flex items-center gap-[9px]'>
                <svg
                  viewBox='0 0 24 24'
                  aria-hidden='true'
                  className='size-[13px] flex-none text-brand-ink'
                >
                  <path
                    d={CONTACT_ICON_PATHS[contact.kind]}
                    fill='currentColor'
                  />
                </svg>
                <span>{contact.value}</span>
              </li>
            );
          })}
        </ul>
      )}
    </header>
  );
}
