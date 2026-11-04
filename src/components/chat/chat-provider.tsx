/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

interface ChatContextValue {
  /** whether the chat panel is open */
  isOpen: boolean;
  openChat: () => void;
  closeChat: () => void;
}

const ChatContext = createContext<ChatContextValue | null>(null);

/**
 * Holds the open state of the BB Bot panel so any button on any page can open it.
 * The panel and its floating button are rendered by `ChatWidget` (mounted in the root layout).
 */
export function ChatProvider({ children }: { children: ReactNode }) {
  const [isOpen, setOpen] = useState(false);
  const openChat = useCallback(() => setOpen(true), []);
  const closeChat = useCallback(() => setOpen(false), []);
  const value = useMemo(
    () => ({ isOpen, openChat, closeChat }),
    [isOpen, openChat, closeChat],
  );
  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat(): ChatContextValue {
  const value = useContext(ChatContext);
  if (!value) throw new Error('useChat must be used inside <ChatProvider>');
  return value;
}
