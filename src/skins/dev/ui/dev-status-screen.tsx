/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { commonCopy } from '@/content/copy/common';
import { useGoBack } from '@/hooks/use-go-back';
import { useCopy } from '@/lib/i18n/copy';
import {
  DevButton,
  DevButtonGroup,
  DevButtonLink,
} from '@/skins/dev/ui/dev-button';
import { DevStatusCode } from '@/skins/dev/ui/dev-status-code';
import { DevLead } from '@/skins/dev/ui/dev-lead';
import { DevTerm, DevTermBody } from '@/skins/dev/ui/dev-term';
import { DevTermBar } from '@/skins/dev/ui/dev-term-bar';

/** The 404 and Coming soon screens: a terminal card with the Standard words and the same two ways out. */
export function DevStatusScreen({ variant }: { variant: 'notFound' | 'soon' }) {
  const copy = useCopy(commonCopy);
  const goBack = useGoBack();
  const text = copy.status[variant];
  return (
    <DevTerm className='mt-[34px] mb-1'>
      <DevTermBar />
      <DevTermBody>
        <DevStatusCode aria-hidden='true'>
          {variant === 'soon' ? copy.soon : '404'}
        </DevStatusCode>
        <h1 className='text-[length:clamp(34px,5vw,58px)]'>{text.title}</h1>
        <DevLead>{text.body}</DevLead>
        <DevButtonGroup>
          <DevButtonLink variant='solid' href='/'>
            {copy.status.home}
          </DevButtonLink>
          <DevButton onClick={goBack}>{copy.status.back}</DevButton>
        </DevButtonGroup>
      </DevTermBody>
    </DevTerm>
  );
}
