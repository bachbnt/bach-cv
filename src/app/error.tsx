/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useEffect } from 'react';
import { SitePage } from '@/components/site-page';
import { StatusScreen } from '@/components/status-screen';

/**
 * A page of Standard that threw while it rendered: the screen of Standard for an error inside its own header and footer. A skin has its own
 * (`SkinDefinition.PageError`); an error of the header or of a provider goes to `global-error.tsx`.
 */
export default function PageError({ error }: { error: Error }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <SitePage page='neutral'>
      <main className='flex flex-col'>
        <StatusScreen variant='error' />
      </main>
    </SitePage>
  );
}
