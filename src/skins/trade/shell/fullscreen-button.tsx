/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { Maximize, Minimize } from 'lucide-react';
import { tradeShellCopy } from '@/content/copy/trade-shell';
import { useCopy } from '@/lib/i18n/copy';
import { cn } from '@/lib/utils';
import { HintTip } from '@/skins/trade/chart/hint-tip';
import { useFullscreen } from '@/hooks/use-fullscreen';
import { TvButton } from '@/skins/trade/ui/tv-button';

/** Full screen on and off. Where the browser does not allow it (an iPhone) the button is grey and says why in its name. */
export function FullscreenButton() {
  const copy = useCopy(tradeShellCopy).toolbar.fullscreen;
  const { supported, active, toggle } = useFullscreen();
  const label = !supported ? copy.unavailable : active ? copy.exit : copy.enter;
  const Icon = active ? Minimize : Maximize;
  const button = (
    <TvButton
      size='icon'
      aria-label={label}
      aria-pressed={supported ? active : undefined}
      disabled={!supported}
      onClick={toggle}
      className={cn(active && 'bg-tv-hover text-tv-accent-ink')}
    >
      <Icon aria-hidden='true' />
    </TvButton>
  );
  // a disabled button gets no pointer events, so a tip on it would never show
  return supported ? <HintTip label={label}>{button}</HintTip> : button;
}
