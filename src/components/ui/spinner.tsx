'use client';

import { cn } from 'cn';
import { Loader2Icon } from 'lucide-react';
import { statesCopy } from '@/content/copy/states';
import { useCopy } from '@/lib/i18n/copy';

function Spinner({ className, ...props }: React.ComponentProps<'svg'>) {
  const copy = useCopy(statesCopy);
  return (
    <Loader2Icon
      data-slot='spinner'
      role='status'
      aria-label={copy.loading}
      className={cn('size-4 animate-spin', className)}
      {...props}
    />
  );
}

export { Spinner };
