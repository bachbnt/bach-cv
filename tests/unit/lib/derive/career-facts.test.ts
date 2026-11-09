/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { describe, expect, it } from 'vitest';
import { careerFacts } from '@/lib/derive/career-facts';

const NOW = new Date(2026, 10, 7);

const job = (
  startMonth: string,
  endMonth: string,
  role = 'Dev',
  company = 'Acme',
) => ({ startMonth, endMonth, role, company });
const skill = (category: 'ai' | 'mobile' | 'web' | 'tools', listed = true) => ({
  category,
  listed,
});

describe('careerFacts', () => {
  it('has no facts of its own without jobs or skills', () => {
    expect(careerFacts([], [], NOW)).toEqual({
      years: null,
      first: null,
      current: null,
      areas: [],
    });
  });

  it('takes the years and the first role from the earliest job, whatever the order', () => {
    const facts = careerFacts(
      [
        job('2022-05', '', 'Lead', 'Now Inc'),
        job('2019-06', '2022-04', 'Junior', 'First Ltd'),
      ],
      [],
      NOW,
    );
    expect(facts.years).toBe(7);
    expect(facts.first).toEqual({
      year: 2019,
      role: 'Junior',
      company: 'First Ltd',
    });
  });

  it('names the job that is not over as the current one, the latest when several are', () => {
    const facts = careerFacts(
      [
        job('2020-01', '2021-01', 'Old', 'A'),
        job('2021-02', '', 'Mid', 'B'),
        job('2023-03', '', 'New', 'C'),
      ],
      [],
      NOW,
    );
    expect(facts.current).toEqual({ role: 'New', company: 'C' });
  });

  it('has no current job when every job has an end', () => {
    expect(
      careerFacts([job('2020-01', '2021-01')], [], NOW).current,
    ).toBeNull();
  });

  it('lists the areas in the order Mobile, Web, AI, only those with a listed skill, and never tools', () => {
    const facts = careerFacts(
      [],
      [skill('ai'), skill('tools'), skill('mobile'), skill('web', false)],
      NOW,
    );
    expect(facts.areas).toEqual(['mobile', 'ai']);
  });

  it('does not change the jobs it is given', () => {
    const jobs = [job('2022-05', ''), job('2019-06', '2022-04')];
    careerFacts(jobs, [], NOW);
    expect(jobs.map((j) => j.startMonth)).toEqual(['2022-05', '2019-06']);
  });
});
