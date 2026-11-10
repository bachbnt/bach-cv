/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { commonCopy } from '@/content/copy/common';
import { useNow } from '@/hooks/use-now';
import { shell } from '@/lib/content/shell';
import { useCopy } from '@/lib/i18n/copy';

/** The line of rights at the foot of the board, above the ledge: the one of Standard's footer (year, name, rights), in chalk. */
export function Footer() {
  const copy = useCopy(commonCopy);
  const year = useNow().getFullYear();
  return (
    <footer className='mx-auto max-w-[1120px] px-5 pb-8 text-center font-ac-note text-[16px]/[1.4] text-ac-mute max-[760px]:px-3.5'>
      <p>
        &copy; {year} {shell.name}. {copy.footer.rights}
      </p>
    </footer>
  );
}
