/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { CSSProperties, ReactNode } from 'react';
import type { PageKey } from '@/lib/content/schema';
import { DEV_FILES, shownPath } from '@/skins/dev/config';
import { DevButtonGroup } from '@/skins/dev/ui/dev-button';
import { DevCaret } from '@/skins/dev/ui/dev-caret';
import { DevLead } from '@/skins/dev/ui/dev-lead';
import { DevTerm, DevTermBody } from '@/skins/dev/ui/dev-term';
import { DevTermBar } from '@/skins/dev/ui/dev-term-bar';

/** The head of a page: a terminal card that "opens" the file of the page (`code …`), the title as a big heading and the intro as a comment. */
export function DevPageHead({
  page,
  title,
  intro,
  children,
}: {
  page: PageKey;
  title: string;
  intro?: string;
  children?: ReactNode;
}) {
  const command = `code ${shownPath(DEV_FILES[page])}`;
  return (
    <DevTerm className='mt-[34px] mb-1' data-reveal>
      <DevTermBar />
      <DevTermBody>
        <div aria-hidden='true'>
          <span className='text-signal'>➜</span>{' '}
          <span className='text-sky'>~</span>{' '}
          <span
            className='dv-typed'
            style={{ '--n': command.length } as CSSProperties}
          >
            {command}
          </span>
        </div>
        <h1 className='text-[length:clamp(34px,5vw,58px)]'>
          {title}
          <DevCaret />
        </h1>
        {intro && (
          <DevLead>
            <span aria-hidden='true'># </span>
            {intro}
          </DevLead>
        )}
        {children && <DevButtonGroup>{children}</DevButtonGroup>}
      </DevTermBody>
    </DevTerm>
  );
}
