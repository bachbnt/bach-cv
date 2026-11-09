/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import {
  Award,
  Castle,
  Coins,
  ScrollText,
  Store,
  Swords,
  Target,
  type LucideIcon,
} from 'lucide-react';
import { PAGES, type PageKey } from '@/lib/content/schema';

/** The icon and the key of a page in the list of places. Every page is also a real link, whatever its key. */
export const PLACE: Record<PageKey, { icon: LucideIcon; key: string }> = {
  home: { icon: Castle, key: 'B' },
  about: { icon: ScrollText, key: 'H' },
  resume: { icon: Swords, key: 'S' },
  projects: { icon: Target, key: 'J' },
  certificates: { icon: Award, key: 'C' },
  services: { icon: Store, key: 'P' },
  payment: { icon: Coins, key: 'O' },
};

/** The order of the list of places: Home first, then the pages as the Standard menu lists them. */
export const PLACE_ORDER: readonly PageKey[] = PAGES;

/** The four key skills are the keys Q W E R, as in the game. */
export const ABILITY_KEYS = ['Q', 'W', 'E', 'R'] as const;

/** Hold it to open the ping wheel and let go on a ping; a quick press leaves the wheel open. */
export const PING_KEY = 'V';

/** The key that does something other than open a place. */
export const SPELL_KEYS = { connect: 'D', chat: 'F', cv: '4' } as const;

/** The keys that open a page, by upper-case letter. */
export const PAGE_BY_KEY: Record<string, PageKey> = Object.fromEntries(
  PAGES.map((page) => [PLACE[page].key, page]),
);

/** The size the page panel takes on a wide screen, in pixels; below this width the panel covers the stage. */
export const WIDE = 1100;
export const PANEL_WIDTH = 'min(780px, 54vw)';
