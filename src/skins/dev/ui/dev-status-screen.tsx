/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { commonCopy } from '@/content/copy/common';
import { errorsCopy } from '@/content/copy/errors';
import { useGoBack } from '@/hooks/use-go-back';
import { recover } from '@/lib/error/recover';
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

/** The 404, Coming soon and error screens: a terminal card with the Standard words and the same two ways out. */
export function DevStatusScreen({
  variant,
}: {
  variant: 'notFound' | 'soon' | 'error';
}) {
  const copy = useCopy(commonCopy);
  const errors = useCopy(errorsCopy).dev;
  const goBack = useGoBack();
  const failed = variant === 'error';
  const text = failed ? errors : copy.status[variant];
  return (
    <DevTerm className='mt-[34px] mb-1'>
      <DevTermBar />
      <DevTermBody>
        <DevStatusCode aria-hidden='true'>
          {failed ? '500' : variant === 'soon' ? copy.soon : '404'}
        </DevStatusCode>
        <h1 className='text-[length:clamp(34px,5vw,58px)]'>{text.title}</h1>
        <DevLead>{text.body}</DevLead>
        <DevButtonGroup>
          {failed ? (
            <>
              <DevButton variant='solid' onClick={recover}>
                {errors.retry}
              </DevButton>
              <DevButtonLink href='/'>{errors.home}</DevButtonLink>
            </>
          ) : (
            <>
              <DevButtonLink variant='solid' href='/'>
                {copy.status.home}
              </DevButtonLink>
              <DevButton onClick={goBack}>{copy.status.back}</DevButton>
            </>
          )}
        </DevButtonGroup>
      </DevTermBody>
    </DevTerm>
  );
}
