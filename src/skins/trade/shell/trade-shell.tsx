/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { PanelBottomOpen } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  ViewTransition,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { useChat } from '@/components/chat/chat-provider';
import { tradeShellCopy } from '@/content/copy/trade-shell';
import { useLive } from '@/hooks/use-live';
import type { PageKey } from '@/lib/content/schema';
import { useCopy } from '@/lib/i18n/copy';
import { cn } from '@/lib/utils';
import {
  DEFAULT_LAYOUT,
  RANGE_BAR,
  SIDE_DEFAULT,
  SIDE_MAX,
  SIDE_MIN,
  TAPE_HEIGHT,
  chartBounds,
  chartHeight,
  clampSide,
  defaultChartHeight,
  splitOf,
} from '@/skins/trade/blocks/shell-layout';
import { DEFAULT_RANGE, type RangeKey } from '@/skins/trade/config';
import { BottomNav } from '@/skins/trade/shell/bottom-nav';
import { ChartSlot } from '@/skins/trade/shell/chart-slot';
import { IconRail } from '@/skins/trade/shell/icon-rail';
import { RangeBar } from '@/skins/trade/shell/range-bar';
import { revealById } from '@/skins/trade/shell/reveal';
import { Splitter } from '@/skins/trade/shell/splitter';
import { TickerTape } from '@/skins/trade/shell/ticker-tape';
import { Toolbar } from '@/skins/trade/shell/toolbar';
import { ToolRail } from '@/skins/trade/shell/tool-rail';
import { TradeProvider, useTrade } from '@/skins/trade/shell/trade-context';
import { TradeOverlays } from '@/skins/trade/shell/trade-overlays';
import { useDocumentHidden } from '@/skins/trade/shell/use-document-hidden';
import { useSearchHotkey } from '@/skins/trade/shell/use-search-hotkey';
import { useReducedMotion } from '@/skins/trade/shell/use-reduced-motion';
import { useScrollToPage } from '@/skins/trade/shell/use-scroll-to-page';
import { useViewportHeight } from '@/skins/trade/shell/use-viewport-height';
import { useWide } from '@/skins/trade/shell/use-wide';
import { Watchlist } from '@/skins/trade/shell/watchlist';
import { TvButton } from '@/skins/trade/ui/tv-button';
import { TvRoot } from '@/skins/trade/ui/tv-root';

/** The width of the tool rail and of the icon rail, and the height of the toolbar (the workspace is what is under it). */
const TOOL_RAIL = 52;
const ICON_RAIL = 46;
const TOOLBAR = 40;
/** How long a move by a key or a reset takes (a splitter dragged by hand does not animate). */
const EASE_MS = 240;

/**
 * The frame of the Trade skin: a chart terminal. One toolbar on top, a column of tools on the left, the career chart with its range
 * buttons and, under them, the ticker tape (a thin strip the Layout menu can turn off), the page in the bottom panel, the watchlist (the navigation) on the right and an icon rail with the chat and
 * Connect. The Layout menu turns the tool rail, the watchlist and the panel on and off. On a phone there are no rails: the chart comes
 * first, then the page, then the watchlist, with a bar of the main pages below.
 */
export function TradeShell({
  page,
  children,
}: {
  page: PageKey | null;
  children: ReactNode;
}) {
  return (
    <TradeProvider>
      <Terminal page={page}>{children}</Terminal>
    </TradeProvider>
  );
}

function Terminal({
  page,
  children,
}: {
  page: PageKey | null;
  children: ReactNode;
}) {
  const [range, setRange] = useState<RangeKey>(DEFAULT_RANGE);
  const router = useRouter();
  const { showJob, openSearch, layout: saved, setLayout, setDock } = useTrade();
  const words = useCopy(tradeShellCopy).panelBar;
  const resize = useCopy(tradeShellCopy).resize;
  const wide = useWide();
  const panel = useRef<HTMLElement>(null);
  useScrollToPage(panel, page, !wide);
  const reduced = useReducedMotion();
  const viewport = useViewportHeight();
  // a phone has no rails, so what was chosen for the wide terminal does not apply there
  const layout = wide ? saved : DEFAULT_LAYOUT;
  // the BB Bot panel takes the place of the watchlist while it is open, and the column is there for it even when the watchlist is off
  const chatOpen = useChat().isOpen;
  const chatOn = useLive().features.chat;
  const chatDocked = chatOpen && chatOn && wide;
  const sideOn = layout.watchlist || chatDocked;
  const tall = page === 'home';
  const hidden = useDocumentHidden();
  useSearchHotkey(openSearch);

  // a page picked while the panel is hidden brings the panel back: the visitor asked for that page
  const lastPage = useRef(page);
  useEffect(() => {
    if (lastPage.current === page) return;
    lastPage.current = page;
    if (!saved.panel) setLayout({ panel: true });
  }, [page, saved.panel, setLayout]);

  // The divisions. The chart's height and the watchlist's width are kept as a share of the window and as pixels, and are always valid
  // for the window as it is now. While a splitter is dragged the size is held here (one update for each frame) and kept on release.
  const area = Math.max(0, viewport - TOOLBAR);
  const bounds = chartBounds(area, layout.tape);
  const [dragHeight, setDragHeight] = useState<number | null>(null);
  const [dragSide, setDragSide] = useState<number | null>(null);
  const [easing, setEasing] = useState(false);
  const easeTimer = useRef<number | undefined>(undefined);
  // The grid tracks animate (layout, not transform) only for a move by a key or a reset, never while dragging, and not for reduced
  // motion. The timer is kept so a second move restarts it and leaving the page cancels it.
  const openDegree = useCallback(() => {
    router.push('/resume#tv-education');
    revealById('tv-education');
  }, [router]);
  const ease = () => {
    if (reduced) return;
    window.clearTimeout(easeTimer.current);
    setEasing(true);
    easeTimer.current = window.setTimeout(() => setEasing(false), EASE_MS + 40);
  };
  useEffect(() => () => window.clearTimeout(easeTimer.current), []);
  const usual = defaultChartHeight(viewport, area, tall, layout.tape);
  const chartPx =
    dragHeight ??
    (layout.split === null
      ? usual
      : chartHeight(layout.split, area, layout.tape));
  const sidePx = dragSide ?? clampSide(layout.side ?? SIDE_DEFAULT);
  const tape = layout.tape ? TAPE_HEIGHT : 0;
  const grid: CSSProperties = {
    gridTemplateColumns: `${layout.tools ? TOOL_RAIL : 0}px minmax(0,1fr) ${sideOn ? sidePx : 0}px ${ICON_RAIL}px`,
    gridTemplateRows: layout.panel
      ? `auto ${chartPx}px ${RANGE_BAR}px ${tape}px minmax(0,1fr)`
      : `auto minmax(0,1fr) ${RANGE_BAR}px ${tape}px 36px`,
  };

  return (
    <TvRoot
      className={cn(
        'flex min-h-dvh flex-col pb-12 min-[1101px]:grid min-[1101px]:h-dvh min-[1101px]:overflow-hidden min-[1101px]:pb-0',
        'relative',
        easing &&
          'transition-[grid-template-columns,grid-template-rows] duration-240 ease-tv-out',
      )}
      style={grid}
      data-hidden={hidden ? '' : undefined}
    >
      <div className='contents min-[1101px]:col-[1/4] min-[1101px]:row-1 min-[1101px]:block min-[1101px]:min-w-0'>
        <Toolbar />
      </div>
      {layout.tools && <ToolRail />}
      <div className='relative min-w-0 bg-tv-bg min-[1101px]:col-2 min-[1101px]:row-2 min-[1101px]:overflow-hidden'>
        <div
          className={cn(
            'relative min-[1101px]:absolute min-[1101px]:inset-0 min-[1101px]:h-auto',
            tall ? 'h-[280px]' : 'h-[220px]',
          )}
        >
          <ChartSlot
            range={range}
            onOpenJob={showJob}
            onOpenDegree={openDegree}
          />
        </div>
      </div>
      <RangeBar range={range} onChange={setRange} />
      {layout.tape && (
        <TickerTape className='border-t border-b-0 border-tv-line min-[1101px]:col-2 min-[1101px]:row-4' />
      )}
      <main
        ref={panel}
        className='relative flex min-h-0 min-w-0 flex-col border-t border-tv-line min-[1101px]:col-2 min-[1101px]:row-5'
      >
        {wide && layout.panel && (
          <Splitter
            orientation='horizontal'
            label={resize.height}
            value={chartPx}
            min={bounds.min}
            max={bounds.max}
            className='absolute inset-x-0 -top-[4px]'
            onChange={(size, final) => {
              if (final) {
                ease();
                setDragHeight(null);
                setLayout({ split: splitOf(size, area) });
              } else setDragHeight(size);
            }}
            onReset={() => {
              ease();
              setDragHeight(null);
              setLayout({ split: null });
            }}
          />
        )}
        {!layout.panel && (
          <div className='flex h-9 flex-none items-center gap-3 px-3 text-xs text-tv-mute'>
            <span>{words.hidden}</span>
            <TvButton
              variant='outline'
              size='sm'
              onClick={() => setLayout({ panel: true })}
            >
              <PanelBottomOpen aria-hidden='true' />
              {words.show}
            </TvButton>
          </div>
        )}
        {/* a page change: the panel fades out and the next one comes in, the terminal around it stays (classes in trade.css) */}
        <ViewTransition
          key={page ?? 'not-found'}
          enter='tv-vt-in'
          exit='tv-vt-out'
          default='none'
        >
          <div
            inert={!layout.panel}
            className={cn(
              'flex min-h-0 flex-1 flex-col',
              !layout.panel && 'hidden',
            )}
          >
            {children}
          </div>
        </ViewTransition>
      </main>
      {chatDocked ? (
        <div
          ref={setDock}
          className='min-h-0 min-w-0 bg-tv-bg min-[1101px]:col-3 min-[1101px]:row-[2/6]'
        />
      ) : (
        layout.watchlist && (
          <Watchlist
            page={page}
            className='min-[1101px]:col-3 min-[1101px]:row-[2/6] min-[1101px]:animate-tv-slide-r'
          />
        )
      )}
      {wide && sideOn && (
        <Splitter
          orientation='vertical'
          label={resize.width}
          value={sidePx}
          min={SIDE_MIN}
          max={SIDE_MAX}
          grow={-1}
          className='absolute bottom-0'
          style={{ top: TOOLBAR, right: ICON_RAIL + sidePx - 4 }}
          onChange={(size, final) => {
            if (final) {
              ease();
              setDragSide(null);
              setLayout({ side: clampSide(size) });
            } else setDragSide(size);
          }}
          onReset={() => {
            ease();
            setDragSide(null);
            setLayout({ side: null });
          }}
        />
      )}
      <IconRail className='min-[1101px]:col-4 min-[1101px]:row-[1/6]' />
      <BottomNav page={page} />
      <TradeOverlays />
    </TvRoot>
  );
}
