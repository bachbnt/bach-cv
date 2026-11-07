/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { Menu as MenuPrimitive } from '@base-ui/react/menu';
import { Check, Eye, EyeOff, Magnet, Trash2 } from 'lucide-react';
import {
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
  type ReactElement,
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
import { chartStore, useChartStore } from '@/skins/trade/chart/chart-store';
import { HintTip } from '@/skins/trade/chart/hint-tip';
import {
  FIRST_USED,
  SHORTCUT,
  entryOf,
  groupOf,
  isCursorMode,
  remember,
  type EntryId,
  type ToolGroup,
} from '@/skins/trade/chart/tool-groups';
import { GROUPS } from '@/skins/trade/chart/tool-groups';
import { ToolIcon } from '@/skins/trade/chart/tool-icons';
import { useWide } from '@/skins/trade/shell/use-wide';

const base =
  'relative grid size-9 shrink-0 cursor-pointer place-items-center rounded text-tv-mute transition-colors hover:bg-tv-hover hover:text-tv-ink active:bg-tv-hover disabled:pointer-events-none disabled:opacity-35 aria-pressed:bg-tv-hover aria-pressed:text-tv-accent-ink data-popup-open:bg-tv-hover pointer-coarse:size-11 [&_svg]:size-5 [&_svg]:stroke-[1.5]';

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

const Divider = () => (
  <span
    aria-hidden='true'
    className='my-1 h-px w-6 shrink-0 bg-tv-line max-[1100px]:mx-1 max-[1100px]:my-0 max-[1100px]:h-6 max-[1100px]:w-px'
  />
);

function RailButton({
  label,
  tip,
  active,
  disabled,
  onClick,
  children,
}: {
  label: string;
  tip?: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: ReactElement;
}) {
  const side = useWide() ? 'right' : 'bottom';
  const button = (
    <button
      type='button'
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={base}
    >
      {children}
    </button>
  );
  // a disabled button gets no pointer events, so a tip on it would never show
  return disabled ? (
    button
  ) : (
    <HintTip label={label} shortcut={tip} side={side}>
      {button}
    </HintTip>
  );
}

/**
 * One group of tools, as one button: it shows the tool of the group used last and a click uses it. A small triangle in the corner (and a
 * right click, a long press, or the arrow right and down keys) opens a flyout with every tool of the group, each with its name and keys;
 * the arrows move, Enter picks, Escape closes and the focus comes back to the button. A tool that is double-clicked stays on after each
 * drawing (the sticky tool of a chart terminal).
 */
function ToolGroupButton({
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
  const drawing = !isCursorMode(shown) && shown !== 'eraser';
  const stop = () => window.clearTimeout(timer.current);

  const onPointerDown = (event: PointerEvent) => {
    if (!several || event.pointerType === 'mouse') return;
    held.current = false;
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
        if (drawing) chartStore.setTool(shown as never, true);
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
      className={cn(base, 'size-full')}
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

/**
 * The tools down the left edge of the chart (a strip above it on a phone), grouped as a chart terminal groups them: cursors (cross,
 * dot, arrow, eraser), lines (trend line, ray, horizontal and vertical line), Fibonacci, rectangle, text note and measure, then the
 * magnet that snaps points to candles and the buttons that hide or remove every drawing. Undo and redo are in the top toolbar.
 * They change what the chart's pointer does; the drawings live in the chart.
 */
export function ToolRail() {
  const copy = useCopy(tradeChartCopy).tools;
  const tool = useChartStore((s) => s.tool);
  const cursor = useChartStore((s) => s.cursor);
  const magnet = useChartStore((s) => s.magnet);
  const hidden = useChartStore((s) => s.hidden);
  const hasDrawings = useChartStore((s) => s.history.present.length > 0);
  const [last, setLast] = useState(FIRST_USED);
  const now = entryOf(tool, cursor);
  // the tool in use (a key, a menu or a button picked it) is the one its group shows from now on
  const remembered = remember(last, now);
  if (remembered !== last) setLast(remembered);

  return (
    <div
      role='toolbar'
      aria-label={copy.label}
      aria-orientation='vertical'
      className='flex items-center gap-0.5 overflow-auto border-tv-line bg-tv-bg py-2 text-tv-dim max-[1100px]:h-11 max-[1100px]:flex-row max-[1100px]:border-b max-[1100px]:px-1 max-[1100px]:py-0 min-[1101px]:col-1 min-[1101px]:row-[2/6] min-[1101px]:flex-col min-[1101px]:border-r'
    >
      {GROUPS.map((group) => (
        <ToolGroupButton
          key={group.id}
          group={group}
          shown={remembered[group.id]}
          active={groupOf(now).id === group.id}
          tool={tool}
        />
      ))}
      <Divider />
      <RailButton
        label={copy.magnet}
        active={magnet}
        onClick={chartStore.toggleMagnet}
      >
        <Magnet aria-hidden='true' />
      </RailButton>
      <RailButton
        label={hidden ? copy.show : copy.hide}
        active={hidden}
        disabled={!hasDrawings && !hidden}
        onClick={() => chartStore.setHidden(!hidden)}
      >
        {hidden ? <EyeOff aria-hidden='true' /> : <Eye aria-hidden='true' />}
      </RailButton>
      <RailButton
        label={copy.clear}
        disabled={!hasDrawings}
        onClick={chartStore.clear}
      >
        <Trash2 aria-hidden='true' />
      </RailButton>
    </div>
  );
}
