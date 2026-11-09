/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { Menu as MenuPrimitive } from '@base-ui/react/menu';
import { Check } from 'lucide-react';
import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from 'react';
import { tradeChartCopy } from '@/content/copy/trade-chart';
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { fill } from '@/lib/chat/fill';
import { useCopy } from '@/lib/i18n/copy';
import { cn } from '@/lib/utils';
import { TV_MENU_ITEM, TV_POPUP } from '@/skins/trade/ui/tv-menu';
import { chartStore } from '@/skins/trade/chart/chart-store';
import { HintTip } from '@/skins/trade/chart/hint-tip';
import {
  SHORTCUT,
  isCursorMode,
  isDrawingTool,
  type EntryId,
  type ToolGroup,
} from '@/skins/trade/chart/tool-groups';
import { ToolIcon } from '@/skins/trade/chart/tool-icons';
import { useWide } from '@/skins/trade/shell/use-wide';
import { RAIL_BUTTON } from '@/skins/trade/shell/rail-button-style';

/** How long a finger must stay down to open the flyout of a group. */
const LONG_PRESS_MS = 500;

/** Picks a tool of the rail: a cursor mode, or a tool of the chart (`sticky` keeps it on after each drawing). */
function pick(id: EntryId, sticky = false) {
  if (isCursorMode(id)) chartStore.setCursor(id);
  else chartStore.setTool(id, sticky);
}

/** A click on a button of a group: the tool again turns it off (back to the cursor), as the buttons always did. */
function press(id: EntryId, tool: string) {
  if (!isCursorMode(id) && tool === id) chartStore.setTool('cursor');
  else pick(id);
}

/**
 * One group of tools, as one button: it shows the tool of the group used last and a click uses it. A small triangle in the corner (and a
 * right click, a long press, or the arrow right and down keys) opens a flyout with every tool of the group, each with its name and keys;
 * the arrows move, Enter picks, Escape closes and the focus comes back to the button. A tool that is double-clicked stays on after each
 * drawing (the sticky tool of a chart terminal).
 */
export function ToolGroupButton({
  group,
  shown,
  active,
  tool,
}: {
  group: ToolGroup;
  shown: EntryId;
  active: boolean;
  tool: string;
}) {
  const copy = useCopy(tradeChartCopy).tools;
  const wide = useWide();
  const [open, setOpen] = useState(false);
  const wrapper = useRef<HTMLDivElement>(null);
  const main = useRef<HTMLButtonElement>(null);
  const timer = useRef(0);
  const held = useRef(false);
  const several = group.entries.length > 1;
  const drawing = isDrawingTool(shown);
  const stop = () => window.clearTimeout(timer.current);
  // a press that is still being held when the rail goes away must not open a flyout of a button that is gone
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const onPointerDown = (event: PointerEvent) => {
    if (!several || event.pointerType === 'mouse') return;
    held.current = false;
    stop();
    timer.current = window.setTimeout(() => {
      held.current = true;
      setOpen(true);
    }, LONG_PRESS_MS);
  };
  const onKeyDown = (event: KeyboardEvent) => {
    if (!several || (event.key !== 'ArrowRight' && event.key !== 'ArrowDown'))
      return;
    event.preventDefault();
    setOpen(true);
  };

  const button = (
    <button
      ref={main}
      type='button'
      aria-label={copy[shown]}
      aria-pressed={active}
      aria-haspopup={several ? 'menu' : undefined}
      aria-expanded={several ? open : undefined}
      data-group={group.id}
      data-sticky={
        drawing && active && chartStore.get().sticky ? '' : undefined
      }
      onClick={() => {
        if (held.current) {
          held.current = false;
          return;
        }
        press(shown, tool);
      }}
      onDoubleClick={() => {
        if (isDrawingTool(shown)) chartStore.setTool(shown, true);
      }}
      onContextMenu={(event) => {
        if (!several) return;
        event.preventDefault();
        setOpen(true);
      }}
      onPointerDown={onPointerDown}
      onPointerUp={stop}
      onPointerCancel={stop}
      onPointerLeave={stop}
      onKeyDown={onKeyDown}
      className={cn(RAIL_BUTTON, 'size-full')}
    >
      <ToolIcon id={shown} />
    </button>
  );

  return (
    <div
      ref={wrapper}
      className='relative size-9 shrink-0 pointer-coarse:size-11'
    >
      <HintTip
        label={copy[shown]}
        shortcut={SHORTCUT[shown]}
        note={drawing ? copy.keep : undefined}
        side={wide ? 'right' : 'bottom'}
      >
        {button}
      </HintTip>
      {several && (
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger
            aria-label={fill(copy.more, { name: copy[shown] })}
            tabIndex={-1}
            // 20px on touch, not more: a bigger corner would cover the middle of the 44px button, where a long press opens this same flyout
            className='absolute right-0 bottom-0 grid size-4 cursor-pointer place-items-center text-tv-mute hover:text-tv-ink pointer-coarse:size-5'
          >
            <svg aria-hidden='true' viewBox='0 0 8 8' className='size-2'>
              <path d='M8 3v5H3z' fill='currentColor' />
            </svg>
          </DropdownMenuTrigger>
          <MenuPrimitive.Portal>
            <MenuPrimitive.Positioner
              anchor={wrapper}
              side={wide ? 'right' : 'bottom'}
              align='start'
              sideOffset={6}
              className='isolate z-50 outline-none'
            >
              <MenuPrimitive.Popup
                finalFocus={main}
                className={cn(
                  'min-w-[210px] origin-(--transform-origin) text-tv-ink outline-none',
                  TV_POPUP,
                )}
              >
                {group.entries.map((id) => (
                  <DropdownMenuItem
                    key={id}
                    data-entry={id}
                    onClick={() => pick(id)}
                    className={cn(TV_MENU_ITEM, 'pr-2.5')}
                  >
                    <ToolIcon id={id} />
                    <span>{copy[id]}</span>
                    <span className='ml-auto flex items-center gap-2 pl-4'>
                      {SHORTCUT[id] && (
                        <kbd className='rounded border border-tv-line bg-tv-hover px-1.5 py-px font-sans text-[11px] text-tv-mute'>
                          {SHORTCUT[id]}
                        </kbd>
                      )}
                      <Check
                        aria-hidden='true'
                        className={cn(
                          'size-3.5 text-tv-accent-ink',
                          id !== shown && 'invisible',
                        )}
                      />
                    </span>
                  </DropdownMenuItem>
                ))}
              </MenuPrimitive.Popup>
            </MenuPrimitive.Positioner>
          </MenuPrimitive.Portal>
        </DropdownMenu>
      )}
    </div>
  );
}
