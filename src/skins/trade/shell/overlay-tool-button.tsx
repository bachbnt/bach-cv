/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';
import { HintTip } from '@/skins/trade/chart/hint-tip';
import { TOOL_BUTTON } from '@/skins/trade/shell/overlay-tools';

/** An icon-only button of a window's toolbar. `label` is its accessible name and its tooltip. */
export function TvToolButton({
  label,
  className,
  ...props
}: Omit<ComponentProps<'button'>, 'aria-label' | 'title'> & { label: string }) {
  return (
    <HintTip label={label}>
      <button
        type='button'
        aria-label={label}
        className={cn(TOOL_BUTTON, className)}
        {...props}
      />
    </HintTip>
  );
}
