/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { commonCopy } from '@/content/copy/common';
import { useGoBack } from '@/hooks/use-go-back';
import { useCopy } from '@/lib/i18n/copy';
import { AcButton, AcButtonLink } from '@/skins/academic/ui/ac-button';
import { AcPaper } from '@/skins/academic/ui/ac-paper';

/** The 404 and Coming soon screens: a note pinned to the board with the Standard words and the same two ways out. */
export function AcStatusScreen({ variant }: { variant: 'notFound' | 'soon' }) {
  const copy = useCopy(commonCopy);
  const goBack = useGoBack();
  const text = copy.status[variant];
  return (
    <AcPaper kind='pinned' className='mx-auto mt-10 max-w-[620px] px-9 py-9'>
      <p
        aria-hidden='true'
        className='font-ac-chalk text-[clamp(60px,12vw,110px)]/none font-normal text-ac-accent'
      >
        {variant === 'soon' ? copy.soon : '404'}
      </p>
      <h1 className='mt-3 font-ac-chalk text-[clamp(30px,5vw,44px)]/[1.1] font-normal'>
        {text.title}
      </h1>
      <p className='mt-3 text-ac-mute'>{text.body}</p>
      <div className='mt-6 flex flex-wrap gap-3'>
        <AcButtonLink href='/'>{copy.status.home}</AcButtonLink>
        <AcButton variant='quiet' onClick={goBack}>
          {copy.status.back}
        </AcButton>
      </div>
    </AcPaper>
  );
}
