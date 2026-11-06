/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { CodiconName } from '@/skins/dev/icons/codicons';
import { DevIcon } from '@/skins/dev/icons/dev-icon';
import { windowToolClass } from '@/skins/dev/shell/window-chrome';

/** A square icon button of the title bar of the viewer. */
export function DevViewerTool({
  icon,
  label,
  onClick,
}: {
  icon: CodiconName;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type='button'
      aria-label={label}
      title={label}
      onClick={onClick}
      className={windowToolClass}
    >
      <DevIcon name={icon} />
    </button>
  );
}
