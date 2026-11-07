/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { createContext, useContext } from 'react';
import type { StreamChatPanelProps } from '@/skins/stream/chat/stream-chat-panel';

export interface StreamChatValue {
  /** the `chat` switch of the site is on */
  enabled: boolean;
  /** the panel sits beside the reel (a wide screen, the Projects page), so the sheet and the top bar button are not needed */
  docked: boolean;
  setDocked: (docked: boolean) => void;
  panel: StreamChatPanelProps;
}

export const StreamChatContext = createContext<StreamChatValue | null>(null);

export function useStreamChat(): StreamChatValue {
  const value = useContext(StreamChatContext);
  if (!value)
    throw new Error('useStreamChat must be used inside <StreamChatProvider>');
  return value;
}
