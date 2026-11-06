/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { Fragment } from 'react';
import type { PageKey } from '@/lib/content/schema';
import { DEV_FILES, DEV_PROJECT } from '@/skins/dev/config';
import { DevIcon } from '@/skins/dev/icons/dev-icon';

/** The breadcrumb under the tabs: project, folders, file and the symbol of the page. */
export function Crumbs({ page }: { page: PageKey }) {
  const file = DEV_FILES[page];
  const parts = [DEV_PROJECT, ...file.folder, file.name];
  return (
    <div
      className='flex h-[22px] items-center gap-1.5 overflow-hidden bg-editor pr-3.5 pl-5 font-sans text-[12px] leading-[normal] whitespace-nowrap text-mute max-[900px]:hidden'
      aria-hidden='true'
    >
      {parts.map((part, index) => (
        <Fragment key={`${part}-${index}`}>
          <span>{part}</span>
          <span className='inline-flex text-dim'>
            <DevIcon name='chevron-right' className='size-3' />
          </span>
        </Fragment>
      ))}
      <b className='font-medium text-ink'>{file.symbol}</b>
    </div>
  );
}
