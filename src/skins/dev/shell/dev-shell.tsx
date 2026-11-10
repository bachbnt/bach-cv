/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  ViewTransition,
  type ReactNode,
} from 'react';
import type { PageKey } from '@/lib/content/schema';
import { cn } from '@/lib/utils';
import { FileIconDefs } from '@/skins/dev/icons/file-icon';
import { ConnectPalette } from '@/skins/dev/shell/connect-palette';
import { ActivityBar } from '@/skins/dev/shell/activity-bar';
import { BottomBar } from '@/skins/dev/shell/bottom-bar';
import { Crumbs } from '@/skins/dev/shell/crumbs';
import { DevOverlayProvider } from '@/skins/dev/shell/dev-overlay-context';
import { LogSources } from '@/skins/dev/shell/devlog/log-sources';
import { DevOverlays } from '@/skins/dev/shell/dev-overlays';
import { DevToast } from '@/skins/dev/shell/dev-toast';
import { EditorFrame, type Caret } from '@/skins/dev/shell/editor-frame';
import { Explorer } from '@/skins/dev/shell/explorer';
import { Minimap } from '@/skins/dev/shell/minimap';
import { TabBar } from '@/skins/dev/shell/tab-bar';
import { TitleBar } from '@/skins/dev/shell/title-bar';
import { useDevReveal } from '@/skins/dev/shell/use-dev-reveal';
import { useDevUi } from '@/skins/dev/shell/use-dev-ui';
import { DevRoot } from '@/skins/dev/ui/dev-root';

/**
 * The frame of the Dev skin: the window of a code editor (title bar, tabs, breadcrumb, activity bar, Explorer, editor area with line
 * numbers, minimap, bottom panel and status bar) with the overlays above it.
 */
export function DevShell({
  page,
  children,
}: {
  page: PageKey | null;
  children: ReactNode;
}) {
  const current: PageKey = page ?? 'home';
  const [ui, setUi] = useDevUi();
  const [caret, setCaret] = useState<Caret>({ line: 1, column: 1 });
  const [accountOpen, setAccountOpen] = useState(false);
  // Zen mode (the yellow light): the chrome around the page is hidden, only the title bar and the page stay; Esc leaves it
  const [zen, setZen] = useState(false);
  // the phone drawer: it belongs to the page it was opened on, so going to another page shuts it
  const [nav, setNav] = useState({ open: false, page: current });
  const navOpen = nav.open && nav.page === current;
  const root = useRef<HTMLDivElement>(null);
  useDevReveal(root);

  const closeNav = useCallback(
    () => setNav({ open: false, page: current }),
    [current],
  );
  const closeAccount = useCallback(() => setAccountOpen(false), []);

  useEffect(() => {
    if (!zen) return;
    const onKey = (event: KeyboardEvent) => {
      // a window or a menu that is open (the chat, a viewer, the palette, a title bar menu) takes Esc first
      if (
        event.key === 'Escape' &&
        !document.querySelector('[role="dialog"], [role="menu"]')
      )
        setZen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [zen]);

  useEffect(() => {
    if (!navOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeNav();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [navOpen, closeNav]);

  return (
    <DevOverlayProvider>
      <DevRoot
        ref={root}
        data-nav-open={navOpen || undefined}
        data-zen={zen || undefined}
        data-panel={ui.panel && !zen ? 'open' : undefined}
        // the bottom panel (220px) is above the status bar: everything that sits above the status bar (the activity bar and its account
        // button, the Explorer, the minimap, the chat button) rises over it
        className={cn(
          'dv-js data-[panel=open]:[--bottom:242px] min-[901px]:data-[zen]:[--bottom:0px] min-[901px]:data-[zen]:[--top:30px]',
          navOpen && 'max-[900px]:overflow-hidden',
        )}
      >
        <LogSources connectOpen={accountOpen} />
        <FileIconDefs />
        <header className='sticky top-0 z-60 border-b border-line bg-chrome [view-transition-name:top]'>
          <TitleBar
            navOpen={navOpen}
            onToggleNav={() => setNav({ open: !navOpen, page: current })}
            zen={zen}
            onToggleZen={() => setZen((on) => !on)}
          />
          <TabBar page={current} />
          <Crumbs page={current} />
        </header>
        <div className='dv-ide flex items-start'>
          <ActivityBar
            explorerOpen={ui.explorer}
            onToggleExplorer={() => setUi({ explorer: !ui.explorer })}
            accountOpen={accountOpen}
            onToggleAccount={() => setAccountOpen((v) => !v)}
          />
          <Explorer
            page={current}
            ui={ui}
            onChange={setUi}
            onCloseDrawer={closeNav}
            onOpenConnect={() => {
              closeNav();
              setAccountOpen(true);
            }}
          />
          <EditorFrame onCaret={setCaret}>
            {/* a page change: the page fades out and the next one rises in, the window around it stays (classes in dev.css) */}
            <ViewTransition
              key={current}
              enter='dv-vt-in'
              exit='dv-vt-out'
              default='none'
            >
              <div>{children}</div>
            </ViewTransition>
          </EditorFrame>
        </div>
        <Minimap />
        <BottomBar
          page={current}
          ui={ui}
          onChange={setUi}
          caret={caret}
          onOpenConnect={() => setAccountOpen(true)}
        />
        <ConnectPalette
          open={accountOpen}
          raised={ui.panel !== null}
          onClose={closeAccount}
        />
        <div
          className='pointer-events-none fixed inset-x-0 top-(--top) bottom-0 z-96 hidden bg-[rgba(1,4,9,0.6)] opacity-0 backdrop-blur-[2px] transition-opacity duration-[280ms] group-data-[nav-open]/dv:pointer-events-auto group-data-[nav-open]/dv:opacity-100 max-[900px]:block'
          onClick={closeNav}
        />
        <DevOverlays />
        <DevToast />
      </DevRoot>
    </DevOverlayProvider>
  );
}
