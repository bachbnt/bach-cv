/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { Download } from 'lucide-react';
import { useLive } from '@/hooks/use-live';
import { cn } from '@/lib/utils';
import { useTrade } from '@/skins/trade/shell/trade-context';
import { TvButton } from '@/skins/trade/ui/tv-button';

/**
 * Opens the CV window (the Standard one). Gone when the `cvDownload` switch is off. `label` is the Standard button text, which is
 * its accessible name; on a narrow screen only the icon stays.
 */
export function DownloadCvButton({
  label,
  size,
  className,
}: {
  label: string;
  size?: 'default' | 'lg';
  className?: string;
}) {
  const { features } = useLive();
  const { openCv } = useTrade();
  if (!features.cvDownload) return null;
  return (
    <TvButton
      variant='primary'
      size={size}
      aria-haspopup='dialog'
      aria-label={label}
      className={cn('font-semibold', className)}
      onClick={openCv}
    >
      <Download aria-hidden='true' />
      <span aria-hidden='true' className='max-[480px]:hidden'>
        {label}
      </span>
    </TvButton>
  );
}
