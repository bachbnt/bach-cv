/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useRouter } from 'next/navigation';
import { useChat } from '@/components/chat/chat-provider';
import { PAGE_META } from '@/lib/pages';
import { useDevOverlays } from '@/skins/dev/shell/dev-overlay-context';
import type { TerminalPerform } from '@/skins/dev/shell/terminal/use-terminal';

/**
 * What the commands do to the page, with the same calls the buttons and tabs use: Next.js navigation for `cd`, the overlay context
 * for `cv`, the shared chat state for `ask`. `connect` and `exit` belong to the shell, which owns the Connect palette and the panel.
 */
export function useTerminalActions({
  onConnect,
  onExit,
}: {
  onConnect: () => void;
  onExit: () => void;
}): TerminalPerform {
  const router = useRouter();
  const { openChat } = useChat();
  const { openCv } = useDevOverlays();

  return (action) => {
    switch (action.type) {
      case 'go':
        router.push(PAGE_META[action.page].href);
        break;
      case 'cv':
        openCv();
        break;
      case 'connect':
        onConnect();
        break;
      case 'ask':
        openChat();
        break;
      case 'exit':
        onExit();
        break;
    }
  };
}
