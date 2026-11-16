/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { commonCopy } from '@/content/copy/common';
import { errorsCopy } from '@/content/copy/errors';
import { useGoBack } from '@/hooks/use-go-back';
import { recover } from '@/lib/error/recover';
import { useCopy } from '@/lib/i18n/copy';
import { PhButton, PhButtonLink } from '@/skins/phone/ui/ph-button';
import { PhCard } from '@/skins/phone/ui/ph-card';

/**
 * The 404, Coming soon and error screens: an alert card in the middle of the app, with the code, the Standard words and the same two ways
 * out. A page that threw says 500 and offers "Try again" (it forgets what the browser kept, then loads the page again).
 */
export function PhStatusScreen({
  variant,
}: {
  variant: 'notFound' | 'soon' | 'error';
}) {
  const copy = useCopy(commonCopy);
  const errors = useCopy(errorsCopy).phone;
  const goBack = useGoBack();
  const failed = variant === 'error';
  const text = failed ? errors : copy.status[variant];
  return (
    <main className='mx-auto flex w-full max-w-[560px] flex-1 flex-col justify-center px-5 py-12'>
      <PhCard className='animate-ph-rise p-7 text-center'>
        <p
          aria-hidden='true'
          className='text-[clamp(56px,16vw,88px)]/none font-extrabold tracking-tight text-ph-accent-ink'
        >
          {failed ? '500' : variant === 'soon' ? copy.soon : '404'}
        </p>
        <h1 className='mt-4 text-[26px]/[1.15] font-bold'>{text.title}</h1>
        <p className='mt-2 text-ph-mute'>{text.body}</p>
        <div className='mt-6 flex flex-wrap justify-center gap-2.5'>
          {failed ? (
            <>
              <PhButton variant='solid' onClick={recover}>
                {errors.retry}
              </PhButton>
              <PhButtonLink href='/'>{errors.home}</PhButtonLink>
            </>
          ) : (
            <>
              <PhButtonLink variant='solid' href='/'>
                {copy.status.home}
              </PhButtonLink>
              <PhButton onClick={goBack}>{copy.status.back}</PhButton>
            </>
          )}
        </div>
      </PhCard>
    </main>
  );
}
