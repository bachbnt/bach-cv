/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

/** "Go back": the previous page if there is one, otherwise the home page. */
export function GoBackButton({ children }: { children: string }) {
  const router = useRouter();
  return (
    <Button
      variant='outline'
      size='lg'
      onClick={() =>
        window.history.length > 1 ? router.back() : router.push('/')
      }
    >
      {children}
    </Button>
  );
}
