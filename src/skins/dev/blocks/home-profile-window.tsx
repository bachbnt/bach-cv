/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import type { ReactNode } from 'react';
import { shell } from '@/lib/content/shell';
import { useContentQuery } from '@/lib/query/use-content';
import { CodeWindow } from '@/skins/dev/blocks/code-window';
import { FileIcon } from '@/skins/dev/icons/file-icon';

/** The areas of the stack, as the Resume groups its skills; the names are words of the trade, the same in both languages. */
const STACK = [
  ['mobile', 'Mobile'],
  ['web', 'Web'],
  ['ai', 'AI'],
] as const;

const str = (value: string) => <span className='dv-str'>{`"${value}"`}</span>;
const attr = (name: string, value: ReactNode) => (
  <>
    <span className='dv-at'>{name}</span>={value}
  </>
);

/** The `Profile.tsx` window beside the title: every value is read from the data, and a value that is not there is left out. */
export function HomeProfileWindow() {
  const { data: experience = [] } = useContentQuery('experience');
  const { data: skills = [] } = useContentQuery('skills');
  const job = experience.find((j) => !j.endMonth) ?? experience[0];
  const since = experience.map((j) => j.startMonth.slice(0, 4)).sort()[0];
  const stack = STACK.filter(([category]) =>
    skills.some((s) => s.listed && s.category === category),
  ).map(([, name]) => name);

  const props: ReactNode[] = [
    attr('name', str(shell.name)),
    job && attr('role', str(job.role)),
    job && attr('company', str(job.company)),
    since &&
      attr(
        'since',
        <>
          {'{'}
          <span className='dv-num'>{since}</span>
          {'}'}
        </>,
      ),
    stack.length > 0 &&
      attr(
        'stack',
        <>
          {'{['}
          {stack.map((name, i) => (
            <span key={name}>
              {i > 0 && ', '}
              <span className='dv-str'>{`'${name}'`}</span>
            </span>
          ))}
          {']}'}
        </>,
      ),
  ].filter(Boolean);

  const lines: ReactNode[] = [
    <>
      <span className='dv-kw'>import</span> {'{'}{' '}
      <span className='dv-fn'>Engineer</span> {'}'}{' '}
      <span className='dv-kw'>from</span>{' '}
      <span className='dv-str'>{"'./Engineer'"}</span>;
    </>,
    '',
    <>
      <span className='dv-kw'>export function</span>{' '}
      <span className='dv-fn'>Profile</span>() {'{'}
    </>,
    <>
      {'  '}
      <span className='dv-kw'>return</span> (
    </>,
    <>
      {'    '}&lt;<span className='dv-tg'>Engineer</span>
    </>,
    ...props.map((prop) => (
      <>
        {'      '}
        {prop}
      </>
    )),
    <>{'    '}/&gt;</>,
    '  );',
    '}',
  ];

  return (
    <CodeWindow
      icon={<FileIcon kind='tsx' />}
      file='Profile.tsx'
      language='TypeScript React'
      lines={lines}
    />
  );
}
