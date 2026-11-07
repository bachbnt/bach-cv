/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { SkinId } from '@/lib/skin/skins';
import type { SkinDefinition } from '@/skins/types';

/** A skin other than the default one is loaded when it is chosen, so the code and the CSS of a look nobody uses are never sent. */
type Loader = () => Promise<{ default: SkinDefinition }>;

/** Where each skin's module is. */
export const SKIN_LOADERS: Record<Exclude<SkinId, 'standard'>, Loader> = {
  dev: () => import('@/skins/dev/skin'),
  trade: () => import('@/skins/trade/skin'),
  moba: () => import('@/skins/moba/skin'),
};

export const hasLoader = (id: SkinId): id is keyof typeof SKIN_LOADERS =>
  id in SKIN_LOADERS;

/** Starts loading a skin (for example while the pointer is over its menu item), so choosing it is quick. */
export function preloadSkin(id: SkinId): void {
  if (hasLoader(id)) void SKIN_LOADERS[id]();
}
