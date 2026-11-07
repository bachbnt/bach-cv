/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { describe, expect, it } from 'vitest';
import {
  buildCandles,
  careerAt,
  type Candle,
  type CareerEntry,
} from '@/skins/trade/blocks/build-candles';
import { careerYears } from '@/lib/derive/career-years';
import {
  shortSchool,
  onChart,
  studiesOf,
  studyAt,
  studyText,
  type Degree,
} from '@/skins/trade/chart/education';
import { WEEK_MS } from '@/skins/trade/chart/intervals';

const school =
  'University of Science - Vietnam National University Ho Chi Minh City';
const degrees: Degree[] = [
  {
    id: 'master',
    degree: 'Master of Science',
    school,
    major: 'Physics and Informatics',
    startMonth: '2020-12',
    endMonth: '2023-06',
  },
  {
    id: 'bachelor',
    degree: 'Bachelor of Science',
    school,
    major: 'Physics and Informatics',
    startMonth: '2016-09',
    endMonth: '2020-09',
  },
];
const vietnamese: Degree[] = [
  { ...degrees[0], degree: 'Thạc sĩ Khoa học', major: 'Vật lý và Tin học' },
  { ...degrees[1], degree: 'Cử nhân Khoa học', major: 'Vật lý và Tin học' },
];
const jobs: CareerEntry[] = [
  {
    id: 'a',
    company: 'A',
    role: 'Junior',
    startMonth: '2020-03',
    endMonth: '2022-04',
  },
  {
    id: 'c',
    company: 'FPT Software',
    role: 'Team Lead',
    startMonth: '2022-05',
    endMonth: null,
  },
];
const now = new Date(2026, 10, 6);

describe('the short name of a school', () => {
  it('names a school without the university it belongs to', () => {
    expect(shortSchool(school)).toBe('University of Science');
    expect(shortSchool('Hanoi University, Vietnam')).toBe('Hanoi University');
    expect(shortSchool('Open Campus')).toBe('Open Campus');
  });
});

describe('the degrees on the chart', () => {
  it('are in order of their start, with the flag on the last day of the end month', () => {
    const studies = studiesOf(degrees);
    expect(studies.map((s) => s.id)).toEqual(['bachelor', 'master']);
    const [bachelor, master] = studies;
    expect(bachelor.label).toBe('BSc');
    expect(bachelor.start).toBe(new Date(2016, 8, 1).getTime());
    expect(bachelor.end).toBe(new Date(2020, 9, 1).getTime());
    expect(new Date(bachelor.flagAt).getMonth()).toBe(8);
    expect(new Date(bachelor.flagAt).getDate()).toBe(30);
    expect(master.label).toBe('MSc');
  });

  it('read the degrees of the visitor language and say the same', () => {
    expect(studiesOf(vietnamese).map((s) => s.label)).toEqual(['BSc', 'MSc']);
    expect(studiesOf(vietnamese)[1].degree).toBe('Thạc sĩ Khoa học');
  });

  it('put the flag of a degree that goes on at its start, and leave out a month that is not one', () => {
    const [going] = studiesOf([{ ...degrees[0], endMonth: null }]);
    expect(going.end).toBeNull();
    expect(going.flagAt).toBe(going.start);
    expect(studiesOf([{ ...degrees[0], startMonth: 'soon' }])).toEqual([]);
    expect(studiesOf([])).toEqual([]);
  });

  it('are in progress between their start and the end of their last month, the newest when two overlap', () => {
    const studies = studiesOf(degrees);
    expect(studyAt(studies, new Date(2018, 0, 1).getTime())?.id).toBe(
      'bachelor',
    );
    expect(studyAt(studies, new Date(2020, 8, 30).getTime())?.id).toBe(
      'bachelor',
    );
    expect(studyAt(studies, new Date(2020, 10, 1).getTime())).toBeNull();
    expect(studyAt(studies, new Date(2021, 5, 1).getTime())?.id).toBe('master');
    expect(studyAt(studies, new Date(2023, 6, 1).getTime())).toBeNull();
    expect(studyAt(studies, new Date(2015, 0, 1).getTime())).toBeNull();
    const overlap = studiesOf([
      degrees[1],
      { ...degrees[0], startMonth: '2019-01' },
    ]);
    expect(studyAt(overlap, new Date(2019, 5, 1).getTime())?.id).toBe('master');
    expect(studyAt(overlap, new Date(2017, 5, 1).getTime())?.id).toBe(
      'bachelor',
    );
  });

  it('are told in the legend beside the job of the bar, when one is in progress', () => {
    const studies = studiesOf(degrees);
    const t = new Date(2021, 5, 1).getTime();
    const job = careerAt(jobs, t);
    expect(job && `${job.role} · ${job.company}`).toBe('Junior · A');
    expect(studyText(studyAt(studies, t))).toBe('MSc · University of Science');
    // a job and a degree at once are two items, not one
    const later = new Date(2022, 7, 1).getTime();
    const lead = careerAt(jobs, later);
    expect(lead && `${lead.role} · ${lead.company}`).toBe(
      'Team Lead · FPT Software',
    );
    expect(studyText(studyAt(studies, later))).toBe(
      'MSc · University of Science',
    );
    expect(studyText(studyAt(studies, new Date(2025, 0, 1).getTime()))).toBe(
      '',
    );
    expect(studyText(null)).toBe('');
  });
});

describe('the series with the degrees', () => {
  const plain = buildCandles(jobs, 7, now);
  const withDegrees = buildCandles(jobs, 7, now, degrees);
  const prices = (list: { candles: Candle[] }) =>
    list.candles.map(({ t, o, h, l, c }) => ({ t, o, h, l, c }));

  it('starts at the first job, whatever the degrees: nothing reaches the chart back to the education', () => {
    expect(plain.candles[0].t).toBe(new Date(2020, 2, 1).getTime());
    expect(withDegrees.candles[0].t).toBe(plain.candles[0].t);
    expect(withDegrees.candles).toHaveLength(plain.candles.length);
    expect(withDegrees.candles[1].t - withDegrees.candles[0].t).toBe(WEEK_MS);
    // it still ends this week
    expect(now.getTime() - withDegrees.candles.at(-1)!.t).toBeLessThan(WEEK_MS);
  });

  it('has the same prices and flags with or without degrees: they only shape the volume', () => {
    expect(prices(withDegrees)).toEqual(prices(plain));
    expect(withDegrees.markers).toEqual(plain.markers);
    expect(buildCandles(jobs, 7, now, [])).toEqual(plain);
    expect(
      prices(
        buildCandles(jobs, 7, now, [
          { startMonth: 'not a month', endMonth: null },
        ]),
      ),
    ).toEqual(prices(plain));
  });

  it('is deterministic, gentle and ends near its top', () => {
    expect(buildCandles(jobs, 7, now, degrees)).toEqual(withDegrees);
    const { candles } = withDegrees;
    const green = candles.filter((k) => k.c >= k.o).length / candles.length;
    expect(green).toBeGreaterThan(0.44);
    expect(green).toBeLessThan(0.62);
    const peak = Math.max(...candles.map((k) => k.c));
    expect(candles.at(-1)!.c).toBeGreaterThanOrEqual(peak * 0.97);
    for (const k of candles) expect(k.l).toBeGreaterThan(0);
  });

  it('keeps the flags of the jobs on the weeks they started', () => {
    expect(withDegrees.markers.map((m) => m.id)).toEqual(['a', 'c']);
    for (const m of withDegrees.markers) {
      const week = withDegrees.candles[m.index];
      expect(week.t).toBeLessThanOrEqual(m.start);
      expect(m.start - week.t).toBeLessThan(WEEK_MS);
    }
    // with no job, degrees alone draw nothing
    expect(buildCandles([], 7, now, degrees)).toEqual({
      candles: [],
      markers: [],
    });
  });

  it('leaves the years in software to the jobs, and the degrees change no count', () => {
    const starts = jobs.map((j) => j.startMonth);
    expect(careerYears(starts, now)).toBe(7);
    expect(careerYears([], now)).toBeNull();
  });
});

describe('the marks of the degrees on the chart', () => {
  const { candles } = buildCandles(jobs, 7, now, degrees);
  const first = candles[0].t;
  const last = candles.at(-1)!.t + WEEK_MS;
  const [bachelor, master] = studiesOf(degrees);

  it('are at the end month of a finished degree, inside the chart', () => {
    // the Bachelor ended in September 2020 and the Master in June 2023, both after March 2020
    expect(onChart(bachelor.flagAt, first, last)).toBe(true);
    expect(onChart(master.flagAt, first, last)).toBe(true);
    expect(new Date(bachelor.flagAt).getFullYear()).toBe(2020);
    expect(new Date(master.flagAt).getMonth()).toBe(5);
  });

  it('are at the start of a degree that goes on, when that is inside the chart', () => {
    const [going] = studiesOf([
      { ...degrees[0], startMonth: '2024-02', endMonth: null },
    ]);
    expect(going.flagAt).toBe(new Date(2024, 1, 1).getTime());
    expect(onChart(going.flagAt, first, last)).toBe(true);
  });

  it('are not drawn when they fall before the first candle or after the last', () => {
    const [early] = studiesOf([
      { ...degrees[0], startMonth: '2014-09', endMonth: '2018-06' },
    ]);
    expect(onChart(early.flagAt, first, last)).toBe(false);
    const [begun] = studiesOf([
      { ...degrees[0], startMonth: '2019-09', endMonth: null },
    ]);
    expect(onChart(begun.flagAt, first, last)).toBe(false);
    const [later] = studiesOf([
      { ...degrees[0], startMonth: '2027-01', endMonth: '2028-06' },
    ]);
    expect(onChart(later.flagAt, first, last)).toBe(false);
    // the end of the chart is not on it: the first instant of the next week is not a candle
    expect(onChart(last, first, last)).toBe(false);
    expect(onChart(first, first, last)).toBe(true);
  });
});
