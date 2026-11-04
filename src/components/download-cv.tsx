/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { Download } from 'lucide-react';
import { useState } from 'react';
import { CvDialog } from '@/components/cv/cv-dialog';
import { buttonVariants } from '@/components/ui/button';
import { useLive } from '@/hooks/use-live';
import { cn } from 'cn';

/** The CV button. It opens the CV preview, and disappears when the switch is off. */
export function DownloadCv({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  const live = useLive();
  const [open, setOpen] = useState(false);
  if (!live.features.cvDownload) return null;

  return (
    <>
      <button
        type='button'
        aria-haspopup='dialog'
        onClick={() => setOpen(true)}
        className={cn(
          buttonVariants({ variant: 'brand', size: 'lg' }),
          'cursor-pointer',
          className,
        )}
      >
        <Download aria-hidden='true' />
        {label}
      </button>
      <CvDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
