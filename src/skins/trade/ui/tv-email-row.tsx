/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { BrandIcon } from '@/components/brand-icon';
import { commonCopy } from '@/content/copy/common';
import { useClipboard } from '@/hooks/use-clipboard';
import { useCopy } from '@/lib/i18n/copy';
import { cn } from '@/lib/utils';
import { HintTip } from '@/skins/trade/chart/hint-tip';
import { TvButton } from '@/skins/trade/ui/tv-button';
import { TvCopyIcon } from '@/skins/trade/ui/tv-copy-icon';

/**
 * The email of Connect as ONE joined control: the word Email and the address (a mailto link) and, in the same block and the same
 * height, the button that copies it. The popover of the rail and the links of About use this one, so the address looks and behaves the
 * same wherever it is.
 */
export function TvEmailRow({
  email,
  className,
}: {
  email: { url: string; label: string };
  className?: string;
}) {
  const text = useCopy(commonCopy).connect;
  const { copied, copy } = useClipboard();
  return (
    <div
      className={cn(
        'flex h-9 overflow-hidden rounded bg-tv-accent pointer-coarse:h-11',
        className,
      )}
    >
      <a
        href={email.url}
        className='flex min-w-0 flex-1 items-center gap-2 px-3 text-[13px] font-semibold text-white transition-colors duration-100 hover:bg-tv-accent-hover focus-visible:bg-tv-accent-hover focus-visible:outline-white active:bg-tv-accent-hover'
      >
        <BrandIcon platform='email' className='size-4 flex-none' />
        <span className='flex-none text-[11px] font-bold tracking-wide uppercase opacity-80'>
          {text.email}
        </span>
        <span className='truncate'>{email.label}</span>
      </a>
      <HintTip label={copied ? text.copied : text.copy} side='top'>
        <TvButton
          variant='joined'
          size='join'
          aria-label={text.copy}
          onClick={() => void copy(email.label)}
        >
          <TvCopyIcon copied={copied} />
        </TvButton>
      </HintTip>
      <span role='status' className='sr-only'>
        {copied ? text.copied : ''}
      </span>
    </div>
  );
}
