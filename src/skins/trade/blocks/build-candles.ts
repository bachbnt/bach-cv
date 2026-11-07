/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { isCurrent } from '@/lib/derive/current-job';

/** One weekly candle of the career chart. The prices are index points of a decoration: they are not a quote and mean nothing. */
export interface Candle {
  /** the first day of the week, in milliseconds */
  t: number;
  o: number;
  h: number;
  l: number;
  c: number;
  /** the height of the bar under the candle */
  v: number;
}

/** What the chart needs of an experience document. */
export interface CareerEntry {
  id: string;
  company: string;
  role: string;
  /** `YYYY-MM` */
  startMonth: string;
  /** `YYYY-MM`, or `null` for the job I am in now */
  endMonth: string | null;
}

/** A flag of the chart: a real job at the week it started. */
export interface CareerMarker {
  /** the index of the candle of the week the job started (on the weekly chart; `chart/intervals.ts` moves it for the other intervals) */
  index: number;
  /** the first day of the job, in milliseconds */
  start: number;
  id: string;
  company: string;
  role: string;
  current: boolean;
}

/** What the chart needs of a degree to build the series: the months it began and ended. */
export interface DegreeSpan {
  /** `YYYY-MM` */
  startMonth: string;
  /** `YYYY-MM`, or `null` while it goes on */
  endMonth: string | null;
}

export interface CareerCandles {
  candles: Candle[];
  markers: CareerMarker[];
}

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const FLOOR = 12;
/** how many closing candles the final rally may use to reach the top */
const RALLY = 6;

/** A small deterministic pseudo-random generator (mulberry32): the same seed always gives the same chart. */
export function seeded(seed: number): () => number {
  let a = seed | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** The first day of a `YYYY-MM` month, or `NaN` when it is not one. */
export function monthStart(month: string): number {
  const [year, m] = month.split('-').map(Number);
  if (!Number.isFinite(year) || !Number.isFinite(m)) return Number.NaN;
  return new Date(year, m - 1, 1).getTime();
}

/**
 * The decoration behind the chart: one candle per week from the first job to `now`, drawn from a seeded generator. The trend is
 * gentle and upward but it has real pullbacks (about 53 % of the weeks are green), and the last candle ends near the top. The
 * flags are the jobs of `entries`, each at the week it started. With no jobs there is nothing to draw (no candles, no flags).
 * The chart starts at the first job. `degrees` give no flag here and change no price: they only make the volume rise a little in the
 * weeks where one began or ended, as the jobs make it spike where one began.
 */
export function buildCandles(
  entries: CareerEntry[],
  seed: number,
  now: Date,
  degrees: DegreeSpan[] = [],
): CareerCandles {
  const starts = entries.map((e) => monthStart(e.startMonth));
  const first = Math.min(...starts.filter(Number.isFinite));
  if (!Number.isFinite(first) || first > now.getTime())
    return { candles: [], markers: [] };

  const count = Math.floor((now.getTime() - first) / WEEK_MS) + 1;
  const random = seeded(seed);
  const candles: Candle[] = [];
  let price = 100;
  for (let i = 0; i < count; i++) {
    // the share of green weeks swings around 53 %: a few good months, then a few bad ones
    const up = random() < 0.535 + 0.22 * Math.sin(i / 6.5);
    const body = up ? 0.5 + random() * 3.4 : 0.5 + random() * 2.6;
    const open = price;
    const close = Math.max(FLOOR, up ? open + body : open - body);
    candles.push(candle(first + i * WEEK_MS, open, close, random));
    price = close;
  }
  rally(candles, random);

  const markers = entries
    .flatMap((e, k) => {
      const start = starts[k];
      if (!Number.isFinite(start) || start > now.getTime()) return [];
      const index = Math.min(
        count - 1,
        Math.max(0, Math.floor((start - first) / WEEK_MS)),
      );
      return [
        {
          index,
          start,
          id: e.id,
          company: e.company,
          role: e.role,
          current: isCurrent(e),
        },
      ];
    })
    .sort((a, b) => a.index - b.index);
  const weekOf = (month: string | null) => {
    const t = month === null ? Number.NaN : monthStart(month);
    return Number.isFinite(t) ? Math.floor((t - first) / WEEK_MS) : null;
  };
  volume(
    candles,
    markers.map((m) => m.index),
    degrees.flatMap((d) => [weekOf(d.startMonth), weekOf(d.endMonth)]),
    seed,
  );
  return { candles, markers };
}

function candle(t: number, o: number, c: number, random: () => number): Candle {
  return {
    t,
    o,
    c,
    h: Math.max(o, c) + 0.3 + random() * 2.2,
    l: Math.max(FLOOR - 1, Math.min(o, c) - 0.3 - random() * 2.2),
    v: 0,
  };
}

/** If the chart does not end near its top, the last weeks climb there: a chart that ends on a slump would say the wrong thing. */
function rally(candles: Candle[], random: () => number): void {
  const n = candles.length;
  const steps = Math.min(RALLY, n - 1);
  if (steps < 1) return;
  const from = n - steps;
  const peak = Math.max(...candles.slice(0, from).map((k) => k.c));
  const start = candles[from - 1].c;
  const target = peak * 1.01;
  if (candles[n - 1].c >= peak * 0.99 || target <= start) return;
  const weights = Array.from({ length: steps }, () => 0.6 + random());
  const total = weights.reduce((a, b) => a + b, 0);
  let price = start;
  for (let k = 0; k < steps; k++) {
    const close = price + ((target - start) * weights[k]) / total;
    candles[from + k] = candle(candles[from + k].t, price, close, random);
    price = close;
  }
}

/**
 * The job I had in a week, for the line of the legend: the entry that had started and not ended, the newest one when two overlap.
 * `null` before the first job.
 */
export function careerAt(
  entries: CareerEntry[],
  t: number,
): CareerEntry | null {
  let found: CareerEntry | null = null;
  let foundStart = Number.NEGATIVE_INFINITY;
  for (const e of entries) {
    const start = monthStart(e.startMonth);
    const end = e.endMonth ? monthStart(e.endMonth) : Number.POSITIVE_INFINITY;
    // the end month is a whole month: the job lasts until the first day of the next one
    const endExclusive = Number.isFinite(end)
      ? new Date(
          new Date(end).getFullYear(),
          new Date(end).getMonth() + 1,
          1,
        ).getTime()
      : end;
    if (t >= start && t < endExclusive && start > foundStart) {
      found = e;
      foundStart = start;
    }
  }
  return found;
}

/** The last candle with a small wobble, as if the market were still moving: a pure function of the step, so it can be tested. */
export function tickCandle(last: Candle, step: number): Candle {
  const wobble = (seeded(step * 7919 + 13)() - 0.5) * 1.4;
  const c = Math.max(last.l + 0.5, Math.min(last.h + 2, last.c + wobble));
  return { ...last, c, h: Math.max(last.h, c), l: Math.min(last.l, c) };
}

/** What a typical week trades, in index units: about 50 thousand, so the legend reads "46.3K". Decoration, not a quantity of anything. */
const BASE_VOLUME = 22_000;

/**
 * The volume of every candle, a decoration that behaves like a real one: it follows what the candle did (a long candle trades more, a
 * flat week less), drifts slowly up through the career, spikes in the weeks a job began (and rises a little where a degree began or
 * ended), and has a little noise. It is drawn from its own seeded generator, so the prices are the same whatever the volume does.
 */
function volume(
  candles: Candle[],
  jobs: number[],
  degrees: (number | null)[],
  seed: number,
): void {
  const n = candles.length;
  if (n === 0) return;
  const random = seeded(seed ^ 0x9e3779b9);
  const ranges = candles.map((k) => k.h - k.l);
  const bodies = candles.map((k) => Math.abs(k.c - k.o));
  const range = ranges.reduce((a, b) => a + b, 0) / n || 1;
  const body = bodies.reduce((a, b) => a + b, 0) / n || 1;
  // a spike at a week, falling away on both sides (a job: strong and quick; a degree: gentle and slower)
  const bump = (i: number, week: number, height: number, reach: number) =>
    height * Math.exp(-Math.abs(i - week) / reach);
  candles.forEach((k, i) => {
    // quiet stretches and busy ones, a few months long: the bars of a month are not all alike either
    const regime = Math.exp(
      0.65 * (Math.sin(i / 7.3 + 1.1) + 0.6 * Math.sin(i / 19 + 0.4)),
    );
    const drift = 0.7 + 0.6 * (i / n);
    const activity =
      (0.15 + 0.85 * (ranges[i] / range) + 0.7 * (bodies[i] / body)) ** 1.3;
    let events = 1;
    for (const week of jobs) events += bump(i, week, 2.4, 2);
    for (const week of degrees)
      if (week !== null) events += bump(i, week, 0.5, 3);
    // now and then a week the market talks about: a spike of its own
    if (random() < 0.05) events += 1.2 + random() * 1.8;
    k.v =
      BASE_VOLUME * drift * regime * activity * events * (0.8 + random() * 0.4);
  });
}
