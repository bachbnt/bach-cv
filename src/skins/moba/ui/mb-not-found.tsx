/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import Link from 'next/link';
import { commonCopy } from '@/content/copy/common';
import { mobaCopy } from '@/content/copy/moba';
import { useCopy } from '@/lib/i18n/copy';
import { mbButton } from '@/skins/moba/ui/mb-button';
import { MbGoBack } from '@/skins/moba/ui/mb-go-back';
import { MbStateScreen } from '@/skins/moba/ui/mb-state-screen';

/** The screen for a path that is not a page: the champion is out of bounds. It has the words of the Standard 404. */
export function MbNotFound() {
  const copy = useCopy(commonCopy).status;
  const mb = useCopy(mobaCopy).states;
  return (
    <MbStateScreen
      code='404'
      kicker={mb.notFoundKicker}
      title={copy.notFound.title}
      body={copy.notFound.body}
      tone='red'
    >
      <Link href='/' className={mbButton({ variant: 'gold' })}>
        {copy.home}
      </Link>
      <MbGoBack>{copy.back}</MbGoBack>
    </MbStateScreen>
  );
}
