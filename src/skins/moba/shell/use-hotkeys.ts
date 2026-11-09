/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useEffect, useRef } from 'react';
import { useChat } from '@/components/chat/chat-provider';
import { useLive } from '@/hooks/use-live';
import {
  ABILITY_KEYS,
  PAGE_BY_KEY,
  PING_KEY,
  SPELL_KEYS,
} from '@/skins/moba/config';
import { SKILL_COLORS } from '@/components/skills/skill-icons';
import { useFx } from '@/skins/moba/shell/fx-context';
import { useGame } from '@/skins/moba/shell/game-context';
import { useOverlays } from '@/skins/moba/shell/overlay-context';
import type { useHudData } from '@/skins/moba/shell/use-hud-data';
import type { Direction } from '@/skins/moba/world/walker';

const ARROWS: Record<string, Direction> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
};

/** Where a key press is meant for the page or a control, not for the arena. */
const OWN_KEYS =
  'input, textarea, select, [contenteditable="true"], [role="menu"], [role="listbox"]';

/**
 * The keys of the arena (Q W E R, D, F, B, the page keys, 1 to 6, M, ?, Esc and the arrows). They are shortcuts only: every page and
 * action is also a button or a link. Nothing happens while a window is open, in a field, with Ctrl, Cmd or Alt held, or on a key that is
 * held down. Tab and Enter are never touched, so the keyboard keeps working as it does everywhere.
 */
export function useHotkeys(
  data: ReturnType<typeof useHudData>,
  toggleMinimap: () => void,
) {
  const game = useGame();
  const fx = useFx();
  const overlays = useOverlays();
  const chat = useChat();
  const live = useLive();
  const latest = useRef({
    game,
    fx,
    overlays,
    chat,
    features: live.features,
    data,
    toggleMinimap,
  });
  useEffect(() => {
    latest.current = {
      game,
      fx,
      overlays,
      chat,
      features: live.features,
      data,
      toggleMinimap,
    };
  });

  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      const target = event.target instanceof Element ? event.target : null;
      if (target?.closest(OWN_KEYS)) return;
      // a window (the viewer, the CV, the keys, a menu) takes its own keys; the chat only takes the ones typed in its box
      if (document.querySelector('[role="dialog"]:not([data-mb-chat])')) return;
      const {
        game: g,
        fx: f,
        overlays: o,
        chat: c,
        features,
        data: d,
        toggleMinimap: toggle,
      } = latest.current;

      const arrow = ARROWS[event.key];
      if (arrow) {
        // with the page open the arrows scroll it, unless nothing in it has the focus
        const free =
          !g.panelOpen || target === document.body || target === null;
        if (!free) return;
        event.preventDefault();
        g.steer(arrow, true);
        return;
      }
      if (event.repeat) return;
      if (event.key === 'Escape') {
        if (f.wheel) f.closeWheel();
        else if (g.ability !== null) g.setAbility(null);
        else if (c.isOpen) c.closeChat();
        else if (g.panelOpen) g.setPanelOpen(false);
        return;
      }
      if (event.key === '?') {
        o.setKeysOpen(true);
        return;
      }
      const key = event.key.length === 1 ? event.key.toUpperCase() : '';
      if (!key) return;

      const slot = ABILITY_KEYS.indexOf(key as (typeof ABILITY_KEYS)[number]);
      if (slot >= 0) {
        const skill = d.key[slot];
        if (skill) f.pressSkill(slot, SKILL_COLORS[skill.icon]);
        return;
      }
      if (key === PING_KEY) {
        if (f.wheel) f.closeWheel();
        else f.openWheel();
        return;
      }
      if (key === SPELL_KEYS.connect) {
        if (features.connectMenu) o.setConnectOpen(!o.connectOpen);
      } else if (key === SPELL_KEYS.chat) {
        if (features.chat) {
          if (c.isOpen) c.closeChat();
          else c.openChat();
        }
      } else if (key === SPELL_KEYS.cv) {
        if (features.cvDownload) o.openCv();
      } else if (key === 'B') g.recall();
      else if (key === 'M') toggle();
      else if (/^[1-6]$/.test(key)) {
        const certificate = d.certificates[Number(key) - 1];
        if (certificate) g.showCertificate(certificate.id);
      } else if (PAGE_BY_KEY[key]) g.goToPage(PAGE_BY_KEY[key]);
    };
    const up = (event: KeyboardEvent) => {
      if (event.key.toUpperCase() === PING_KEY)
        latest.current.fx.releaseWheel();
      const arrow = ARROWS[event.key];
      if (arrow) latest.current.game.steer(arrow, false);
    };
    const release = () => {
      for (const direction of Object.values(ARROWS))
        latest.current.game.steer(direction, false);
    };
    document.addEventListener('keydown', down);
    document.addEventListener('keyup', up);
    window.addEventListener('blur', release);
    return () => {
      document.removeEventListener('keydown', down);
      document.removeEventListener('keyup', up);
      window.removeEventListener('blur', release);
    };
  }, []);
}
