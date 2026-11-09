/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { describe, expect, it } from 'vitest';
import { timelineRows, timelineYears } from '@/lib/derive/career-timeline';

const job = (
  id: string,
  startMonth: string,
  endMonth: string | null,
  kind: 'full-time' | 'part-time' = 'full-time',
) => ({
  id,
  kind,
  role: `role ${id}`,
  company: `co ${id}`,
  startMonth,
  endMonth,
});
const degree = (
  id: string,
  startMonth: string,
  endMonth: string | null,
  major = `major ${id}`,
) => ({
  id,
  degree: `degree ${id}`,
  major,
  school: `school ${id}`,
  startMonth,
  endMonth,
});

describe('timelineRows', () => {
  it('puts the roles and the degrees on one line, the one that started first on top', () => {
    const rows = timelineRows(
      [job('b', '2022-05', null), job('a', '2019-06', '2022-04')],
      [degree('s', '2016-09', '2020-06')],
    );
    expect(rows.map((row) => row.id)).toEqual(['s', 'a', 'b']);
  });

  it('says what each row is and names it', () => {
    const [first, second] = timelineRows(
      [job('a', '2019-06', '2022-04', 'part-time')],
      [degree('s', '2016-09', '2020-06')],
    );
    expect(first).toMatchObject({
      kind: 'degree',
      title: 'degree s',
      subtitle: 'major s',
    });
    expect(second).toMatchObject({
      kind: 'part-time',
      title: 'role a',
      subtitle: 'co a',
    });
  });

  it('names a degree by its school when it has no major', () => {
    const [row] = timelineRows([], [degree('s', '2016-09', '2020-06', '')]);
    expect(row.subtitle).toBe('school s');
  });

  it('marks the rows that have no end as current', () => {
    const rows = timelineRows(
      [job('b', '2022-05', null)],
      [degree('s', '2016-09', '2020-06')],
    );
    expect(rows.find((row) => row.id === 'b')?.current).toBe(true);
    expect(rows.find((row) => row.id === 's')?.current).toBe(false);
  });

  it('puts the row that ended first above one that started the same month, and one with no end last', () => {
    const rows = timelineRows(
      [job('open', '2020-01', null), job('short', '2020-01', '2020-06')],
      [degree('mid', '2020-01', '2021-01')],
    );
    expect(rows.map((row) => row.id)).toEqual(['short', 'mid', 'open']);
  });

  it('is empty with nothing to show', () => {
    expect(timelineRows([], [])).toEqual([]);
  });
});

describe('timelineYears', () => {
  const now = new Date(2026, 10, 9);
  it('runs from the year of the first row to this year', () => {
    const rows = timelineRows(
      [job('a', '2019-06', null)],
      [degree('s', '2016-09', '2020-06')],
    );
    expect(timelineYears(rows, now)).toEqual({ from: 2016, to: 2026 });
  });

  it('is null with no row', () => {
    expect(timelineYears([], now)).toBeNull();
  });
});
