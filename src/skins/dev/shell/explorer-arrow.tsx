/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { cn } from '@/lib/utils';
import { DevIcon } from '@/skins/dev/icons/dev-icon';

/** The arrow of a folder: it turns down when the folder is open. */
export const ExplorerArrow = ({
  open,
  folder,
}: {
  open: boolean;
  folder?: boolean;
}) => (
  <DevIcon
    name='chevron-right'
    className={cn(
      'size-3.5 transition-transform duration-150',
      folder && 'flex-none text-mute',
      open && 'rotate-90',
    )}
  />
);
