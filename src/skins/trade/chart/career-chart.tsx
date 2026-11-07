/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import dynamic from 'next/dynamic';
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { tradeChartCopy } from '@/content/copy/trade-chart';
import { fill } from '@/lib/chat/fill';
import { shell } from '@/lib/content/shell';
import { formatPeriod } from '@/lib/format';
import { useCopy } from '@/lib/i18n/copy';
import { useLang } from '@/lib/i18n/language';
import { useContentQuery } from '@/lib/query/use-content';
import { cn } from '@/lib/utils';
import {
  buildCandles,
  careerAt,
  tickCandle,
  type Candle,
  type CareerEntry,
  type CareerMarker,
} from '@/skins/trade/blocks/build-candles';
import { CANDLE_SEED, RANGES, type RangeKey } from '@/skins/trade/config';
import { chartStore, useChartStore } from '@/skins/trade/chart/chart-store';
import { ChartToolbar } from '@/skins/trade/chart/chart-toolbar';
import {
  HintPill,
  MeasureLabel,
  NoteInput,
} from '@/skins/trade/chart/chart-overlays';
import { barLabeler } from '@/skins/trade/chart/bar-label';
import { measure } from '@/skins/trade/chart/drawings';
import {
  onChart,
  studiesOf,
  studyAt,
  studyText,
  type Degree,
  type Study,
} from '@/skins/trade/chart/education';
import { DrawingLayer, MeasureBox } from '@/skins/trade/chart/drawing-layer';
import { spreadFlags } from '@/skins/trade/chart/flag-spread';
import { FlagsLayer, type FlagView } from '@/skins/trade/chart/flags';
import { buildFrame, type Frame } from '@/skins/trade/chart/frame';
import { GridLayer } from '@/skins/trade/chart/grid-layer';
import {
  availableIndicators,
  computeIndicators,
} from '@/skins/trade/chart/indicators';
import {
  barAtTime,
  barsOf,
  markersOn,
  rangeBars,
  type Bars,
} from '@/skins/trade/chart/intervals';
import { Legend } from '@/skins/trade/chart/legend';
import {
  MacdPane,
  OverlayLayer,
  RsiPane,
} from '@/skins/trade/chart/overlay-layer';
import {
  CrosshairLayer,
  LastPriceLine,
  LastPriceTag,
  PlayheadLayer,
} from '@/skins/trade/chart/price-layers';
import { ReplayBar } from '@/skins/trade/chart/replay-bar';
import { barsDue, flagsPassed, flagsUpTo } from '@/skins/trade/chart/replay';
import { isLineType, seriesFor } from '@/skins/trade/chart/series';
import {
  SeriesLayer,
  VolumeLayer,
  VolumeTag,
} from '@/skins/trade/chart/series-layer';
import type { ChartType, Interval } from '@/skins/trade/chart/chart-types';
import { makeAxis, type TimeAxis } from '@/skins/trade/chart/time-axis';
import {
  useChartKeyboard,
  useChartShortcuts,
} from '@/skins/trade/chart/use-chart-keys';
import { useChartView } from '@/skins/trade/chart/use-chart-view';
import { useCoarse } from '@/skins/trade/chart/use-coarse';
import {
  usePointerGestures,
  type Hover,
} from '@/skins/trade/chart/use-pointer-gestures';
import {
  activeRange,
  axisLabels,
  centerView,
  followView,
  limitsOf,
  rangeView,
  retargetView,
  toolbarHeight,
  zoomView,
  type Limits,
  type View,
} from '@/skins/trade/chart/view';
import { CHART_CONTROLS_ID } from '@/skins/trade/shell/toolbar';
import { useOnceTrue } from '@/skins/trade/shell/use-once-true';
import { useReducedMotion } from '@/skins/trade/shell/use-reduced-motion';
import { TvSkeleton } from '@/skins/trade/ui/tv-skeleton';

const IndicatorsDialog = dynamic(
  () => import('@/skins/trade/chart/indicators-dialog'),
  { ssr: false },
);
const ShortcutsDialog = dynamic(
  () => import('@/skins/trade/chart/shortcuts-dialog'),
  { ssr: false },
);

const TICK_MS = 2000;
const INTRO_MS = 2400;
const TYPE_MS = 240;
/** the old candles fade out this long when the interval changes */
const INTERVAL_MS = 240;
const HINT_ID = 'tv-chart-hint';

/** What was drawn last: kept so that it can fade out, with its own frame, when the interval changes. */
interface Drawn {
  type: ChartType;
  shown: Candle[];
  frame: Frame;
  baseline: number;
}

/** What a flag stands for: a job (its marker) or a degree, on the bar it falls on. */
type Flag =
  | { kind: 'job'; index: number; marker: CareerMarker }
  | { kind: 'degree'; index: number; study: Study };

/** The width a flag takes: two jobs on one bar sit side by side so that both stay reachable. */
const FLAG_STEP = 24;

const weeksOf = (range: RangeKey) =>
  RANGES.find((r) => r.key === range)?.weeks ?? null;

/**
 * The career as a real working chart (a terminal in the style of TradingView, drawn by hand in SVG, no chart library). One candle
 * for each week (or month, quarter or year, the visitor picks) from my first job; the flags are the jobs themselves. The values are an illustrative index derived from those jobs:
 * a decoration that is not a quote and not financial data, and the chart says so in its name. This part loads the jobs, measures the
 * box and shows the skeleton, the empty chart or the scene.
 */
export function CareerChart({
  range,
  onOpenJob,
  onOpenDegree,
}: {
  /** the window the chart opens on (the range buttons change it afterwards) */
  range: RangeKey;
  /** a flag was activated: show that job on the Resume page */
  onOpenJob: (id: string) => void;
  /** a graduation flag was activated: show the education on the Resume page */
  onOpenDegree: () => void;
}) {
  const copy = useCopy(tradeChartCopy).chart;
  const query = useContentQuery('experience');
  const schooling = useContentQuery('education');
  const [now] = useState(() => new Date());
  const box = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) =>
      setSize({
        width: Math.round(entry.contentRect.width),
        height: Math.round(entry.contentRect.height),
      }),
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const entries = useMemo<CareerEntry[]>(
    () =>
      (query.data ?? []).map((job) => ({
        id: job.id,
        company: job.company,
        role: job.role,
        startMonth: job.startMonth,
        endMonth: job.endMonth,
      })),
    [query.data],
  );
  const degrees = useMemo<Degree[]>(
    () =>
      (schooling.data ?? []).map((d) => ({
        id: d.id,
        degree: d.degree,
        school: d.school,
        major: d.major,
        startMonth: d.startMonth,
        endMonth: d.endMonth,
      })),
    [schooling.data],
  );
  const studies = useMemo(() => studiesOf(degrees), [degrees]);
  // the chart starts at the first job; the degrees only shape the volume a little
  const { candles, markers } = useMemo(
    () => buildCandles(entries, CANDLE_SEED, now, degrees),
    [entries, degrees, now],
  );
  // the volume depends on both, so the chart is not drawn until both have arrived (the bars would change when the degrees came)
  const pending = query.isPending || schooling.isPending;

  return (
    <div ref={box} className='absolute inset-0 overflow-hidden'>
      {pending ||
      candles.length === 0 ||
      size.width === 0 ||
      size.height === 0 ? (
        <>
          {pending && <TvSkeleton className='absolute inset-0 border-0' />}
          {!pending && (
            <div
              role='img'
              aria-label={copy.empty}
              className='absolute inset-0'
            />
          )}
        </>
      ) : (
        <ChartBody
          candles={candles}
          markers={markers}
          entries={entries}
          studies={studies}
          width={size.width}
          height={size.height}
          initialRange={range}
          onOpenJob={onOpenJob}
          onOpenDegree={onOpenDegree}
        />
      )}
    </div>
  );
}

/** What stays the same while the chart is on screen: the window (zoom and pan), the replay clock and the link to the buttons outside. */
function ChartBody({
  candles: weekly,
  markers: weeklyMarkers,
  entries,
  studies,
  width,
  height,
  initialRange,
  onOpenJob,
  onOpenDegree,
}: {
  candles: Candle[];
  markers: CareerMarker[];
  entries: CareerEntry[];
  studies: Study[];
  width: number;
  height: number;
  initialRange: RangeKey;
  onOpenJob: (id: string) => void;
  onOpenDegree: () => void;
}) {
  const reduced = useReducedMotion();
  // the interval the visitor asked for, and the one on screen: they differ only until the window has been moved to the new bars
  const wanted = useChartStore((s) => s.interval);
  const [interval, showInterval] = useState(wanted);
  const bars = barsOf(weekly, interval);
  const count = bars.candles.length;
  const limits = useMemo(() => limitsOf(count, interval), [count, interval]);
  const axis = useMemo(
    () => makeAxis(bars.candles, interval),
    [bars, interval],
  );
  const markers = useMemo(
    () => markersOn(weeklyMarkers, bars),
    [weeklyMarkers, bars],
  );
  const asked = useRef<RangeKey | null>(null);
  const chartView = useChartView(
    limits,
    (l) => rangeView(l, rangeBars(weeksOf(initialRange), interval)),
    reduced,
  );
  const { view } = chartView;
  const replay = useChartStore((s) => s.replay);
  const bounds = useMemo(
    () => ({ first: weekly[0].t, last: weekly[weekly.length - 1].t }),
    [weekly],
  );

  // New bars (another interval, or the same interval of a series that starts earlier or runs longer): the window is kept on the same
  // stretch of time, never on the same bar numbers, so a zoom or a pan is not undone ("All" stays "All"), and a replay goes on from the
  // same date
  if (wanted !== interval) showInterval(wanted);
  const before = useRef({ interval, bars, axis, limits });
  useLayoutEffect(() => {
    const old = before.current;
    before.current = { interval, bars, axis, limits };
    if (old.bars === bars) return;
    chartStore.publishData(count, bounds);
    const current = chartView.ref.current;
    if (current) {
      const all =
        activeRange(current, old.limits, old.interval, asked.current) === 'all';
      chartView.set(
        all
          ? rangeView(limits, null)
          : retargetView(current, old.axis, axis, limits),
      );
    }
    const state = chartStore.get().replay;
    if (state.phase === 'ready')
      chartStore.moveReplay(
        Math.max(0, Math.round(axis.index(old.bars.ends[state.at]))),
      );
  }, [interval, bars, axis, limits, count, bounds, chartView]);

  // the buttons outside the chart (range bar, tool rail) steer the window through this
  useEffect(() => {
    const go = (target: View) => chartView.animate(target);
    const current = () => chartView.ref.current;
    chartStore.setController({
      setRange: (key) => {
        asked.current = key;
        chartStore.setAuto(true);
        go(rangeView(limits, rangeBars(weeksOf(key), interval)));
      },
      goTo: (year, month) => {
        const found = barAtTime(bars, new Date(year, month, 1).getTime());
        const view = current();
        if (view) go(centerView(view, found, limits));
      },
      fit: () => {
        chartStore.setAuto(true);
        go(rangeView(limits, null));
      },
      zoom: (factor) => {
        const view = current();
        if (view) go(zoomView(view, factor, 0.5, limits));
      },
    });
    return () => chartStore.setController(null);
  }, [chartView, bars, limits, interval]);

  useEffect(() => {
    chartStore.publishData(count, bounds);
    chartStore.publishIntervalBars({
      week: barsOf(weekly, 'week').candles.length,
      month: barsOf(weekly, 'month').candles.length,
      quarter: barsOf(weekly, 'quarter').candles.length,
      year: barsOf(weekly, 'year').candles.length,
    });
  }, [bounds, count, weekly]);

  useEffect(() => {
    if (view)
      chartStore.publishRange(
        activeRange(view, limits, interval, asked.current),
      );
  }, [view, limits, interval]);

  // the replay clock: bars come due by the time that passed, so a slow frame does not slow the replay
  const playing = replay.phase === 'ready' && replay.playing && !reduced;
  const speed = replay.speed;
  useEffect(() => {
    if (!playing) return;
    let frame = 0;
    let before = performance.now();
    let carry = 0;
    const run = (now: number) => {
      const due = barsDue(now - before + carry, speed);
      before = now;
      carry = due.rest;
      if (due.bars > 0) chartStore.stepReplay(due.bars);
      frame = requestAnimationFrame(run);
    };
    frame = requestAnimationFrame(run);
    return () => cancelAnimationFrame(frame);
  }, [playing, speed]);

  // the window follows the playhead when it reaches the right edge
  const at = replay.phase === 'ready' ? replay.at : -1;
  useEffect(() => {
    const current = chartView.ref.current;
    if (at < 0 || !current) return;
    const next = followView(current, at, limits);
    if (next !== current) chartView.set(next);
  }, [at, chartView, limits]);

  if (!view) return null;
  return (
    <ChartScene
      bars={bars}
      axis={axis}
      limits={limits}
      interval={interval}
      markers={markers}
      entries={entries}
      studies={studies}
      width={width}
      height={height}
      view={view}
      chartView={chartView}
      onOpenJob={onOpenJob}
      onOpenDegree={onOpenDegree}
    />
  );
}

function ChartScene({
  bars,
  axis,
  limits,
  interval,
  markers,
  entries,
  studies,
  width,
  height,
  view,
  chartView,
  onOpenJob,
  onOpenDegree,
}: {
  bars: Bars;
  axis: TimeAxis;
  limits: Limits;
  interval: Interval;
  markers: CareerMarker[];
  entries: CareerEntry[];
  studies: Study[];
  width: number;
  height: number;
  view: View;
  chartView: ReturnType<typeof useChartView>;
  onOpenJob: (id: string) => void;
  onOpenDegree: () => void;
}) {
  const copy = useCopy(tradeChartCopy);
  const { lang } = useLang();
  const reduced = useReducedMotion();
  const coarse = useCoarse();
  // the controls go into the top toolbar of the terminal when it has a place for them; the chart then needs no strip of its own
  const [host] = useState(() => document.getElementById(CHART_CONTROLS_ID));
  const toolbar = host ? 0 : toolbarHeight(coarse);
  const id = useId().replace(/[^a-zA-Z0-9]/g, '');
  const svg = useRef<SVGSVGElement>(null);

  const type = useChartStore((s) => s.type);
  const indicators = useChartStore((s) => s.indicators);
  const tool = useChartStore((s) => s.tool);
  const sticky = useChartStore((s) => s.sticky);
  const cursor = useChartStore((s) => s.cursor);
  const drawings = useChartStore((s) => s.history.present);
  const hidden = useChartStore((s) => s.hidden);
  const selected = useChartStore((s) => s.selected);
  const log = useChartStore((s) => s.log);
  const auto = useChartStore((s) => s.auto);
  const replay = useChartStore((s) => s.replay);

  const [hover, setHover] = useState<Hover | null>(null);
  const [manual, setManual] = useState<{ lo: number; hi: number } | null>(null);
  const [step, setStep] = useState(0);
  const [intro, setIntro] = useState(true);
  const [indicatorsOpen, setIndicatorsOpen] = useState(false);
  const shortcutsOpen = useChartStore((s) => s.shortcutsOpen);
  const indicatorsLoaded = useOnceTrue(indicatorsOpen);
  const shortcutsLoaded = useOnceTrue(shortcutsOpen);

  useEffect(() => {
    const timer = setTimeout(() => setIntro(false), INTRO_MS);
    return () => clearTimeout(timer);
  }, []);

  // "auto" fits the price scale to the candles again, whatever range was dragged out before
  const dragged = auto ? null : manual;

  const candles = bars.candles;
  const count = candles.length;
  const replaying = replay.phase === 'ready';
  // the playhead of another interval can be past the end for the one render before it is moved
  const limit = replaying ? Math.min(count, replay.at + 1) : count;
  const last = limit - 1;

  // the market ticks while nothing is pointed at; "reduce motion" keeps it still (a timer, so CSS cannot do it)
  const ticking = !reduced && hover === null && replay.phase === 'off';
  useEffect(() => {
    if (!ticking) return;
    const timer = setInterval(() => setStep((n) => n + 1), TICK_MS);
    return () => clearInterval(timer);
  }, [ticking]);

  const live = useMemo(() => {
    if (step === 0 || !ticking) return candles;
    return [
      ...candles.slice(0, -1),
      tickCandle(candles[candles.length - 1], step),
    ];
  }, [candles, step, ticking]);
  const shown = useMemo(() => live.slice(0, limit), [live, limit]);
  const series = useMemo(() => seriesFor(type, shown), [type, shown]);
  const data = useMemo(
    () =>
      computeIndicators(
        candles.map((k) => k.c),
        candles.map((k) => k.v),
      ),
    [candles],
  );
  // an indicator with too few bars (a 20 bar average of 7 yearly bars) is not drawn and not listed
  const shownIndicators = useMemo(
    () => availableIndicators(indicators, data),
    [indicators, data],
  );
  const baseline = useMemo(
    () => candles.reduce((sum, k) => sum + k.c, 0) / candles.length,
    [candles],
  );

  const frame = useMemo<Frame>(
    () =>
      buildFrame({
        width,
        height,
        view,
        series,
        axis,
        type,
        indicators: shownIndicators,
        data,
        log,
        toolbar,
        manual: dragged,
      }),
    [
      width,
      height,
      view,
      series,
      axis,
      type,
      shownIndicators,
      data,
      log,
      toolbar,
      dragged,
    ],
  );

  // a change of type: the old picture fades out while the new one fades in
  const [previous, setPrevious] = useState<ChartType>(type);
  const [leaving, setLeaving] = useState<ChartType | null>(null);
  if (type !== previous) {
    setPrevious(type);
    setLeaving(previous);
  }
  useEffect(() => {
    if (leaving === null) return;
    const timer = setTimeout(() => setLeaving(null), TYPE_MS);
    return () => clearTimeout(timer);
  }, [leaving, type]);

  // a change of interval: the old candles fade out (with the geometry they had) while the new ones fade in
  const drawn = useRef<Drawn | null>(null);
  const shownInterval = useRef(interval);
  const [fading, setFading] = useState<Drawn | null>(null);
  useLayoutEffect(() => {
    if (shownInterval.current !== interval) {
      shownInterval.current = interval;
      setHover(null);
      if (!reduced && drawn.current) setFading(drawn.current);
    }
    drawn.current = { type, shown, frame, baseline };
  }, [interval, type, shown, frame, baseline, reduced]);
  useEffect(() => {
    if (!fading) return;
    const timer = setTimeout(() => setFading(null), INTERVAL_MS);
    return () => clearTimeout(timer);
  }, [fading]);

  const formats = useMemo(
    () => ({
      date: barLabeler(lang, copy.intervals.quarterDate),
      month: new Intl.DateTimeFormat(lang, { month: 'short' }),
      span: new Intl.DateTimeFormat(lang, { month: 'short', year: 'numeric' }),
    }),
    [lang, copy.intervals.quarterDate],
  );
  const monthName = useCallback(
    (month: number) => formats.month.format(new Date(2000, month, 1)),
    [formats],
  );
  const labels = useMemo(
    () => axisLabels(series, frame.start, frame.end, frame.ts.slot, interval),
    [series, frame, interval],
  );

  const gestures = usePointerGestures({
    svg,
    frame,
    candles: shown,
    limits,
    tool,
    chartView,
    setManual,
    setHover,
  });
  useChartShortcuts({ cancel: gestures.cancel });
  const onKeyDown = useChartKeyboard({
    hover,
    setHover,
    last,
    limits,
    chartView,
  });

  const shownIndex = Math.min(last, hover?.index ?? last);
  const candle = series[shownIndex];
  const real = shown[shownIndex];
  // the job of a bar is the one held at the end of it
  const job = careerAt(entries, bars.ends[shownIndex]);
  const latest = careerAt(entries, bars.ends[last]);
  const dateText = formats.date(real.t, interval);
  const jobText = job ? `${job.role} · ${job.company}` : '';
  // the degree in progress at the end of the bar, beside the job
  const studyNow = studyText(studyAt(studies, bars.ends[shownIndex]));
  const jobOf = (t: number) => {
    const found = careerAt(entries, t);
    return found ? `${found.role} · ${found.company}` : copy.measure.before;
  };

  const { layout, ts, price } = frame;
  const showCross =
    hover !== null &&
    replay.phase !== 'select' &&
    (cursor !== 'arrow' || hover.y === null) &&
    tool !== 'eraser';
  const crossY = hover?.y ?? price.y(candle.c);
  const pane =
    layout.rsi && crossY >= layout.rsi.top && crossY <= layout.rsi.bottom
      ? 'rsi'
      : layout.macd && crossY >= layout.macd.top && crossY <= layout.macd.bottom
        ? 'macd'
        : 'main';
  const scaleOf =
    pane === 'rsi' ? frame.rsi : pane === 'macd' ? frame.macd : price;
  const priceText = (scaleOf ?? price)
    .priceAt(crossY)
    .toFixed(pane === 'main' ? 2 : 1);

  const visibleDrawings = hidden
    ? []
    : gestures.dragging
      ? drawings.map((d) =>
          d.id === gestures.dragging?.id ? gestures.dragging : d,
        )
      : drawings;

  // the flags of the jobs, then the graduation flags of the degrees, each on the bar it falls on (a degree at the end of its last month,
  // or at its start while it goes on)
  const items = useMemo<Flag[]>(
    () => [
      ...markers.map((marker): Flag => ({
        kind: 'job',
        index: marker.index,
        marker,
      })),
      // a degree whose mark falls before the first candle or after the last is not on the chart (no clamping to the nearest bar)
      ...studies.flatMap((study): Flag[] =>
        onChart(study.flagAt, axis.time(-0.5), axis.time(count - 0.5))
          ? [
              {
                kind: 'degree',
                index: Math.min(
                  count - 1,
                  Math.max(0, Math.round(axis.index(study.flagAt))),
                ),
                study,
              },
            ]
          : [],
      ),
    ],
    [markers, studies, axis, count],
  );
  const flagged = replaying ? flagsUpTo(items, replay.at) : items;
  // flags that would touch (the same bar, or bars a few pixels apart) are spread, so none hides another
  const flagX = spreadFlags(
    flagged.map((item) => ts.x(item.index)),
    FLAG_STEP,
    layout.plotWidth,
  );
  const flags = flagged.flatMap((item, at): FlagView[] => {
    const k = series[item.index];
    if (!k) return [];
    const x = flagX[at];
    const y = Math.min(
      layout.main.bottom - 24,
      (isLineType(type) ? price.y(k.c) : price.y(k.l)) + 12,
    );
    const common = {
      x,
      y,
      inside: ts.x(item.index) >= 0 && ts.x(item.index) <= layout.plotWidth,
      above: y > layout.main.bottom - 90,
    };
    if (item.kind === 'degree') {
      const { study } = item;
      const period = formatPeriod(study.startMonth, study.endMonth, lang);
      return [
        {
          ...common,
          kind: 'degree' as const,
          id: study.id,
          current: false,
          label: fill(copy.chart.openDegree, {
            degree: study.degree,
            school: study.school,
          }),
          tip: [study.degree, study.major, study.school, period],
        },
      ];
    }
    const { marker } = item;
    const entry = entries.find((e) => e.id === marker.id);
    return [
      {
        ...common,
        kind: 'job' as const,
        id: marker.id,
        current: marker.current,
        label: fill(copy.chart.openJob, {
          role: marker.role,
          company: marker.company,
        }),
        tip: [
          marker.company,
          marker.role,
          entry ? formatPeriod(entry.startMonth, entry.endMonth, lang) : '',
        ],
      },
    ];
  });

  // replay: a flag is announced when the playhead passes the bar it is on
  const [said, setSaid] = useState('');
  const playedTo = useRef(-1);
  const playedOn = useRef(interval);
  useEffect(() => {
    if (!replaying) {
      playedTo.current = -1;
      return;
    }
    const from = playedTo.current;
    playedTo.current = replay.at;
    // the bars of another interval are numbered again: nothing was passed by changing it
    if (playedOn.current !== interval) {
      playedOn.current = interval;
      return;
    }
    if (from < 0) return;
    const passed = flagsPassed(items, from, replay.at);
    if (passed.length > 0)
      setSaid(
        passed
          .map((item) =>
            item.kind === 'job'
              ? fill(copy.replay.reached, {
                  company: item.marker.company,
                  role: item.marker.role,
                })
              : fill(copy.replay.graduated, {
                  degree: item.study.degree,
                  school: item.study.school,
                }),
          )
          .join('. '),
      );
  }, [
    replaying,
    replay.at,
    items,
    interval,
    copy.replay.reached,
    copy.replay.graduated,
  ]);

  const label = fill(copy.chart.label, {
    each: copy.intervals[interval].each,
    from: formats.span.format(candles[0].t),
    to: formats.span.format(bars.ends[count - 1]),
    count,
  });

  const guide =
    replay.phase === 'select'
      ? copy.hints.select
      : tool === 'cursor'
        ? ''
        : tool === 'hline' || tool === 'vline'
          ? copy.hints.one
          : tool === 'text'
            ? copy.hints.note
            : tool === 'eraser'
              ? copy.hints.eraser
              : tool === 'measure' && !gestures.measureBox
                ? copy.hints.measure
                : gestures.draft || gestures.measureBox
                  ? copy.hints.second
                  : copy.hints.first;
  const hint = guide && sticky ? `${guide} ${copy.hints.keep}` : guide;

  const box = gestures.measureBox;
  const boxStats = box ? measure(box.a, box.b) : null;
  const touchFree = tool === 'cursor' && replay.phase !== 'select';

  return (
    <>
      <ChartToolbar
        host={host}
        height={toolbar}
        type={type}
        interval={interval}
        replaying={replay.phase !== 'off'}
        onType={chartStore.setType}
        onInterval={chartStore.setInterval}
        onIndicators={() => setIndicatorsOpen(true)}
        onReplay={() =>
          replay.phase === 'off'
            ? chartStore.startReplay()
            : chartStore.exitReplay()
        }
      />
      <svg
        ref={svg}
        role='img'
        aria-label={label}
        aria-describedby={HINT_ID}
        tabIndex={0}
        viewBox={`0 0 ${width} ${height}`}
        data-testid='tv-chart'
        data-candles={frame.end - frame.start}
        data-type={type}
        data-tool={tool}
        data-cursor={cursor}
        className={cn(
          'absolute inset-0 size-full focus-visible:outline-offset-[-3px]',
          touchFree ? 'touch-pan-y' : 'touch-none',
          tool === 'cursor' && cursor === 'arrow'
            ? 'cursor-default'
            : 'cursor-crosshair',
        )}
        {...gestures.handlers}
        onKeyDown={onKeyDown}
        onBlur={() => setHover(null)}
      >
        <defs>
          <clipPath id={`${id}-reveal`}>
            <rect
              className='tv-chart-reveal'
              x={0}
              y={0}
              width={layout.plotWidth}
              height={height}
            />
          </clipPath>
          <clipPath id={`${id}-main`}>
            <rect
              x={0}
              y={layout.main.top}
              width={layout.plotWidth}
              height={layout.main.bottom - layout.main.top}
            />
          </clipPath>
          {[layout.rsi, layout.macd].map(
            (pane, k) =>
              pane && (
                <clipPath key={k} id={`${id}-sub${k}`}>
                  <rect
                    x={0}
                    y={pane.top}
                    width={layout.plotWidth}
                    height={pane.bottom - pane.top}
                  />
                </clipPath>
              ),
          )}
        </defs>
        <GridLayer frame={frame} labels={labels} monthName={monthName} />
        <g clipPath={`url(#${id}-reveal)`}>
          <g clipPath={`url(#${id}-main)`}>
            {fading && !reduced && (
              <g className='tv-chart-fade-out'>
                {indicators.volume === 'shown' && (
                  <VolumeLayer
                    candles={fading.shown}
                    frame={fading.frame}
                    average={null}
                    highlight={null}
                  />
                )}
                <SeriesLayer
                  type={fading.type}
                  series={seriesFor(fading.type, fading.shown)}
                  baseline={fading.baseline}
                  frame={fading.frame}
                  id={`${id}-prev`}
                />
              </g>
            )}
            {indicators.volume === 'shown' && (
              <g
                key={interval}
                className={fading ? 'tv-chart-fade-in' : undefined}
              >
                <VolumeLayer
                  candles={shown}
                  frame={frame}
                  average={data.volumeMa}
                  highlight={hover ? shownIndex : null}
                />
              </g>
            )}
            {leaving && !reduced && (
              <g key={leaving} className='tv-chart-fade-out'>
                <SeriesLayer
                  type={leaving}
                  series={seriesFor(leaving, shown)}
                  baseline={baseline}
                  frame={frame}
                  id={`${id}-old`}
                />
              </g>
            )}
            <g
              key={`${type}:${interval}`}
              className={leaving || fading ? 'tv-chart-fade-in' : undefined}
            >
              <SeriesLayer
                type={type}
                series={series}
                baseline={baseline}
                frame={frame}
                id={id}
              />
            </g>
            <OverlayLayer
              frame={frame}
              data={data}
              indicators={shownIndicators}
            />
            <LastPriceLine candle={series[last]} frame={frame} />
          </g>
          {layout.rsi && shownIndicators.rsi === 'shown' && (
            <g clipPath={`url(#${id}-sub0)`}>
              <RsiPane frame={frame} data={data} />
            </g>
          )}
          {layout.macd && shownIndicators.macd === 'shown' && (
            <g clipPath={`url(#${id}-sub${layout.rsi ? 1 : 0})`}>
              <MacdPane frame={frame} data={data} />
            </g>
          )}
        </g>
        {indicators.volume === 'shown' && (
          <VolumeTag candles={shown} frame={frame} />
        )}
        <LastPriceTag
          candle={series[last]}
          frame={frame}
          label={copy.chart.latest}
          tick={step}
        />
        <DrawingLayer
          drawings={visibleDrawings}
          draft={gestures.draft}
          selected={selected}
          frame={frame}
          clip={`url(#${id}-main)`}
        />
        <g clipPath={`url(#${id}-main)`}>
          {box && <MeasureBox a={box.a} b={box.b} frame={frame} />}
          {replay.phase === 'ready' && (
            <PlayheadLayer frame={frame} index={replay.at} phase='ready' />
          )}
          {replay.phase === 'select' && hover && (
            <PlayheadLayer frame={frame} index={hover.index} phase='select' />
          )}
        </g>
        {showCross && hover && (
          <CrosshairLayer
            frame={frame}
            mode={cursor}
            x={ts.x(hover.index)}
            y={crossY}
            priceText={priceText}
            dateText={dateText}
            pane={
              pane === 'rsi' && layout.rsi
                ? layout.rsi
                : pane === 'macd' && layout.macd
                  ? layout.macd
                  : layout.main
            }
          />
        )}
      </svg>
      <FlagsLayer
        flags={flags}
        intro={intro}
        onOpen={(flag) =>
          flag.kind === 'job' ? onOpenJob(flag.id) : onOpenDegree()
        }
      />
      <Legend
        name={shell.name}
        company={latest?.company ?? ''}
        candle={candle}
        date={dateText}
        job={jobText}
        study={studyNow}
        indicators={shownIndicators}
        data={data}
        index={shownIndex}
        interval={copy.intervals[interval].short}
        top={toolbar}
        panes={{ rsi: layout.rsi, macd: layout.macd }}
        onMode={chartStore.setIndicator}
      />
      {box && boxStats && (
        <MeasureLabel
          x={Math.min(
            layout.plotWidth - 110,
            Math.max(110, (frame.xAt(box.a.t) + frame.xAt(box.b.t)) / 2),
          )}
          y={Math.min(price.y(box.a.p), price.y(box.b.p)) - 8}
          below={Math.min(price.y(box.a.p), price.y(box.b.p)) < toolbar + 96}
          measure={boxStats}
          from={jobOf(box.a.t)}
          to={jobOf(box.b.t)}
          up={box.b.p >= box.a.p}
        />
      )}
      {gestures.note && (
        <NoteInput
          x={Math.min(layout.plotWidth - 180, gestures.note.x)}
          y={gestures.note.y}
          onDone={gestures.finishNote}
        />
      )}
      {hint && <HintPill text={hint} top={toolbar} />}
      {replay.phase !== 'off' && (
        <ReplayBar
          state={replay}
          reduced={reduced}
          bottom={layout.height - layout.axisY + 8}
          onSelect={chartStore.startReplay}
          onPlay={chartStore.setPlaying}
          onStep={() => chartStore.stepReplay(1)}
          onSpeed={chartStore.setSpeed}
          onRealtime={chartStore.exitReplay}
          onExit={chartStore.exitReplay}
        />
      )}
      <p id={HINT_ID} className='sr-only'>
        {copy.chart.hint}
      </p>
      <p role='status' className='sr-only'>
        {hover && hover.y === null
          ? `${dateText}${jobText ? `: ${jobText}` : ''}${studyNow ? `, ${studyNow}` : ''}`
          : ''}
      </p>
      <p
        role='status'
        aria-live='polite'
        data-testid='tv-replay-live'
        className='sr-only'
      >
        {replaying ? said : ''}
      </p>
      {indicatorsLoaded && (
        <IndicatorsDialog
          open={indicatorsOpen}
          onOpenChange={setIndicatorsOpen}
        />
      )}
      {shortcutsLoaded && (
        <ShortcutsDialog
          open={shortcutsOpen}
          onOpenChange={chartStore.setShortcutsOpen}
        />
      )}
    </>
  );
}
