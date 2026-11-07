/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import dynamic from 'next/dynamic';
import { useState, ViewTransition, type ReactNode } from 'react';
import type { PageKey } from '@/lib/content/schema';
import { StreamChatProvider } from '@/skins/stream/chat/stream-chat-provider';
import { WIDE_QUERY } from '@/skins/stream/config';
import { BottomNav } from '@/skins/stream/shell/bottom-nav';
import { SideNav } from '@/skins/stream/shell/side-nav';
import { TopBar } from '@/skins/stream/shell/top-bar';
import { useMediaQuery } from '@/skins/stream/shell/use-media-query';
import { StreamRoot } from '@/skins/stream/ui/stream-root';

// the drawer only opens on a tap, so its code waits until then
const NavDrawer = dynamic(
  () => import('@/skins/stream/shell/nav-drawer').then((m) => m.NavDrawer),
  { ssr: false },
);

/**
 * The frame of the Stream skin: the top bar, the sidebar (a drawer on a narrow screen, the bottom navigation on a phone) and the
 * page. The conversation of the chat lives here, so it lasts from one page to the next.
 */
export function StreamShell({
  page,
  children,
}: {
  page: PageKey | null;
  children: ReactNode;
}) {
  const wide = useMediaQuery(WIDE_QUERY);
  // the burger folds the sidebar on a wide screen and opens the drawer on a narrow one
  const [sidebar, setSidebar] = useState(true);
  const [drawer, setDrawer] = useState(false);

  return (
    <StreamChatProvider>
      <StreamRoot>
        <TopBar
          menuExpanded={wide ? sidebar : drawer}
          onToggleMenu={() =>
            wide ? setSidebar((on) => !on) : setDrawer((on) => !on)
          }
        />
        <div className='flex items-start'>
          {wide && sidebar && (
            <aside className='sticky top-14 h-[calc(100dvh-56px)] w-60 flex-none overflow-y-auto [view-transition-name:sm-side]'>
              <SideNav current={page} />
            </aside>
          )}
          <main className='min-w-0 flex-1 pb-[72px] min-[701px]:p-6'>
            {/* a page change: the page fades out and the next one in, the top bar, the sidebar and the bottom navigation stay (classes in stream.css) */}
            <ViewTransition
              key={page ?? 'not-found'}
              enter='sm-vt-in'
              exit='sm-vt-out'
              default='none'
            >
              <div>{children}</div>
            </ViewTransition>
          </main>
        </div>
        <BottomNav current={page} />
        {drawer && !wide && (
          <NavDrawer open={drawer} onOpenChange={setDrawer} current={page} />
        )}
      </StreamRoot>
    </StreamChatProvider>
  );
}
