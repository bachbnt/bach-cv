/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useState, type ReactNode } from 'react';
import { DocumentTitle } from '@/components/document-title';
import type { PageKey } from '@/lib/content/schema';
import { MapStage } from '@/skins/moba/map/map-stage';
import { ChampionBar } from '@/skins/moba/shell/champion-bar';
import { FxProvider } from '@/skins/moba/shell/fx-context';
import {
  GameProvider,
  useAttach,
  useGame,
} from '@/skins/moba/shell/game-context';
import { MenuDrawer } from '@/skins/moba/shell/menu-drawer';
import { OverlayProvider } from '@/skins/moba/shell/overlay-context';
import { Overlays } from '@/skins/moba/shell/overlays';
import { PagePanel } from '@/skins/moba/shell/page-panel';
import { PingWheel } from '@/skins/moba/shell/ping-wheel';
import { PlacesList } from '@/skins/moba/shell/places-list';
import { TopBar } from '@/skins/moba/shell/top-bar';
import { useHotkeys } from '@/skins/moba/shell/use-hotkeys';
import { useHudData } from '@/skins/moba/shell/use-hud-data';
import { MbRoot } from '@/skins/moba/ui/mb-root';

function Arena({ children }: { children: ReactNode }) {
  const { current } = useGame();
  const placeStage = useAttach('stage');
  const data = useHudData();
  const [menuOpen, setMenuOpen] = useState(false);
  const [minimapOpen, setMinimapOpen] = useState(true);
  useHotkeys(data, () => setMinimapOpen((open) => !open));
  return (
    <MbRoot ref={placeStage} data-page={current}>
      <DocumentTitle page={current} />
      <MapStage />
      <div className='pointer-events-none absolute top-[56px] bottom-[176px] left-0 z-20 w-[84px] pt-3 pl-2 max-[1099px]:hidden'>
        <div className='pointer-events-auto'>
          <PlacesList layout='rail' />
        </div>
      </div>
      <PagePanel>{children}</PagePanel>
      <TopBar
        data={data}
        onMenu={() => setMenuOpen(true)}
        menuOpen={menuOpen}
      />
      <ChampionBar
        data={data}
        minimapOpen={minimapOpen}
        onToggleMinimap={() => setMinimapOpen((open) => !open)}
      />
      <PingWheel />
      <MenuDrawer open={menuOpen} onOpenChange={setMenuOpen} />
      <Overlays />
    </MbRoot>
  );
}

/**
 * The frame of the Moba skin: the arena. A map fills the window and the champion walks it; the page is a panel over the map; the
 * HUD (top bar with the scoreboard, list of places, champion bar, minimap) sits on its edges, and the windows float above.
 */
export function MobaShell({
  page,
  children,
}: {
  page: PageKey | null;
  children: ReactNode;
}) {
  return (
    <OverlayProvider>
      <GameProvider page={page}>
        <FxProvider>
          <Arena>{children}</Arena>
        </FxProvider>
      </GameProvider>
    </OverlayProvider>
  );
}
