/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { SitePage } from '@/components/site-page';
import { StatusScreen } from '@/components/status-screen';

export default function NotFound() {
  return (
    <SitePage page='neutral'>
      <main className='flex flex-col'>
        <StatusScreen variant='notFound' />
      </main>
    </SitePage>
  );
}
