/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { DEV_PROJECT } from '@/skins/dev/config';
import { DevTermHead } from '@/skins/dev/ui/dev-term';
import { WindowDots } from '@/skins/dev/ui/window-dots';

/** The head every terminal card of the skin has: the window lights and the shell title (decoration). */
export function DevTermBar() {
  return (
    <DevTermHead>
      <WindowDots />
      <span aria-hidden='true'>{DEV_PROJECT}: ~ — zsh</span>
    </DevTermHead>
  );
}
