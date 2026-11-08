/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { Button } from '@/components/ui/button';
import { useGoBack } from '@/hooks/use-go-back';

/** "Go back": the previous page if there is one, otherwise the home page. */
export function GoBackButton({ children }: { children: string }) {
  const goBack = useGoBack();
  return (
    <Button variant='outline' size='lg' onClick={goBack}>
      {children}
    </Button>
  );
}
