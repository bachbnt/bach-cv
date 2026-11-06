/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { ComponentType, ReactNode } from 'react';
import type { Maintenance } from '@/components/use-maintenance';
import type { PageKey } from '@/lib/content/schema';
import type { SkinId } from '@/lib/skin/skins';

/** What a skin (a look of the site) provides. */
export interface SkinDefinition {
  id: SkinId;
  /** The frame around every page (the header and footer, or the window of an editor). */
  Frame: ComponentType<{ page: PageKey | null; children: ReactNode }>;
  /** The content of each page, composed of the skin's own blocks. They read data through the hooks of `lib/query`. */
  pages: Record<PageKey, ComponentType>;
  /** The screen for a path that is not a page (inside the frame). */
  NotFound: ComponentType;
  /** The screen that replaces the whole site while maintenance is on (no frame). */
  Maintenance: ComponentType<Pick<Maintenance, 'message' | 'email'>>;
}
