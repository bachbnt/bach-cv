/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useEffect } from 'react';
import { useChat } from '@/components/chat/chat-provider';
import { useLatest } from '@/hooks/use-latest';
import { usePhOverlays } from '@/skins/phone/shell/overlay-context';
import {
  resetScreen,
  useScreenPower,
} from '@/skins/phone/shell/use-screen-power';
import { putVolumeAway } from '@/skins/phone/shell/use-volume';

/**
 * What goes with the power of the screen: when it turns off, everything that was open over the page (the shade, the sheets, the viewer, the chat) closes
 * and the volume HUD goes; when the skin goes away (or the window stops being a device) the screen is on again for the next visit. It renders nothing.
 */
export function PhPowerGuard() {
  const power = useScreenPower();
  const overlays = usePhOverlays();
  const { closeChat } = useChat();
  const close = useLatest(() => {
    overlays.closeSettings();
    overlays.closeCv();
    overlays.closeConnect();
    overlays.closeViewer();
    closeChat();
  });
  useEffect(() => {
    if (power !== 'off') return;
    close.current();
    putVolumeAway();
  }, [power, close]);
  useEffect(
    () => () => {
      resetScreen();
      putVolumeAway();
    },
    [],
  );
  return null;
}
