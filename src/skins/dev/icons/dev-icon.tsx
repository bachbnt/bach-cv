/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { cn } from '@/lib/utils';
import { CODICONS, type CodiconName } from '@/skins/dev/icons/codicons';

/** A Codicon (the icon set of VS Code) drawn inline. */
export function DevIcon({
  name,
  className,
}: {
  name: CodiconName;
  className?: string;
}) {
  const icon = CODICONS[name];
  return (
    <svg
      aria-hidden='true'
      focusable='false'
      viewBox={`0 0 ${icon.size} ${icon.size}`}
      width='1em'
      height='1em'
      fill='currentColor'
      className={cn('dv-codicon', `dv-codicon-${name}`, className)}
    >
      {icon.paths.map((d) => (
        <path key={d} d={d} fillRule='evenodd' clipRule='evenodd' />
      ))}
    </svg>
  );
}
