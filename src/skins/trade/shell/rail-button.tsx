/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import type { ReactElement } from 'react';
import { HintTip } from '@/skins/trade/chart/hint-tip';
import { useWide } from '@/skins/trade/shell/use-wide';
import { RAIL_BUTTON } from '@/skins/trade/shell/rail-button-style';

export function RailButton({
  label,
  tip,
  active,
  disabled,
  onClick,
  children,
}: {
  label: string;
  tip?: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: ReactElement;
}) {
  const side = useWide() ? 'right' : 'bottom';
  const button = (
    <button
      type='button'
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={RAIL_BUTTON}
    >
      {children}
    </button>
  );
  // a disabled button gets no pointer events, so a tip on it would never show
  return disabled ? (
    button
  ) : (
    <HintTip label={label} shortcut={tip} side={side}>
      {button}
    </HintTip>
  );
}
