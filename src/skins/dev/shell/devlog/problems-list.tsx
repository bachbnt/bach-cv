/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { devCopy } from '@/content/copy/dev';
import { devOutputCopy, type DevOutputCopy } from '@/content/copy/dev-output';
import { fill } from '@/lib/chat/fill';
import { useCopy } from '@/lib/i18n/copy';
import { cn } from '@/lib/utils';
import { DevIcon } from '@/skins/dev/icons/dev-icon';
import { PANEL_BODY } from '@/skins/dev/shell/panel-body';
import type { Problem } from '@/skins/dev/shell/devlog/store';
import { useDevLog } from '@/skins/dev/shell/devlog/use-devlog';

const TEXT: Record<Problem['code'], keyof DevOutputCopy['problems']> = {
  'query-failed': 'queryFailed',
  'query-retried': 'queryRetried',
  uncaught: 'uncaught',
  rejection: 'rejection',
};

/** The Problems tab: a row for each error or warning (icon, text, its source, how often), or the words for none. */
export function ProblemsList() {
  const { panel } = useCopy(devCopy);
  const copy = useCopy(devOutputCopy).problems;
  const problems = useDevLog((state) => state.problems);

  if (problems.length === 0) {
    return (
      <div className={PANEL_BODY}>
        <p>{panel.noProblems}</p>
      </div>
    );
  }
  return (
    <div className={PANEL_BODY} tabIndex={0}>
      <ul aria-label={copy.label}>
        {problems.map((problem) => {
          const error = problem.severity === 'error';
          return (
            <li key={problem.key} className='flex items-center gap-2'>
              <DevIcon
                name={error ? 'error' : 'warning'}
                className={cn(
                  'size-3.5 flex-none',
                  error ? 'text-err' : 'text-gold',
                )}
              />
              <span className='sr-only'>
                {error ? copy.error : copy.warning}:{' '}
              </span>
              <span className='text-ink'>
                {fill(copy[TEXT[problem.code]], { subject: problem.subject })}
              </span>
              <span className='text-mute'>{problem.source}</span>
              {problem.count > 1 && (
                <span
                  className='rounded-full bg-hov px-1.5 text-[11px] text-ink'
                  aria-label={fill(copy.times, { n: problem.count })}
                >
                  {problem.count}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
