/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useRouter } from 'next/navigation';
import { MbButton } from '@/skins/moba/ui/mb-button';

/** "Go back": the previous page if there is one, otherwise the home page. */
export function MbGoBack({ children }: { children: string }) {
  const router = useRouter();
  return (
    <MbButton
      onClick={() =>
        window.history.length > 1 ? router.back() : router.push('/')
      }
    >
      {children}
    </MbButton>
  );
}
