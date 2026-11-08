/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { commonCopy } from '@/content/copy/common';
import { homeCopy } from '@/content/copy/home';
import { tradeCopy } from '@/content/copy/trade';
import { tradeShellCopy } from '@/content/copy/trade-shell';
import { fill } from '@/lib/chat/fill';
import { localize } from '@/lib/content/schema';
import { shell } from '@/lib/content/shell';
import { useCopy } from '@/lib/i18n/copy';
import { useLang } from '@/lib/i18n/language';
import { useCareerYears } from '@/lib/query/use-career-years';
import { useContentQuery, useProfileQuery } from '@/lib/query/use-content';
import { useCountUp } from '@/skins/trade/shell/use-count-up';
import { TvSkeleton } from '@/skins/trade/ui/tv-skeleton';

/** One number of the strip: a link to the page it counts. A number that is not known yet is a skeleton, and one that failed is left out. */
function Stat({
  label,
  href,
  count,
  pending,
}: {
  label: string;
  href: string;
  count: number | null;
  pending: boolean;
}) {
  if (pending) return <TvSkeleton className='h-[52px] border-0' />;
  if (count === null) return null;
  return (
    <Link
      href={href}
      data-slot='tv-link'
      className='flex min-w-0 flex-col justify-center rounded border border-tv-line px-3 py-2 transition-[background-color,scale] duration-100 hover:bg-tv-hover active:scale-[.98] pointer-coarse:min-h-11'
    >
      <span className='text-lg leading-tight font-semibold tabular-nums'>
        {count}
      </span>
      <span className='truncate text-[11px] text-tv-mute'>{label}</span>
    </Link>
  );
}

/**
 * Home as the overview of a symbol: my photo, name and headline, the number of years in software that counts up once, and a strip of
 * the real counts of projects, certificates and roles (each a link to its page). Every number is derived from my data.
 */
export function SymbolOverview() {
  const trade = useCopy(tradeCopy).details;
  const words = useCopy(tradeShellCopy).home;
  const common = useCopy(commonCopy);
  const homeText = useCopy(homeCopy);
  const { lang } = useLang();
  const jobs = useContentQuery('experience');
  const projects = useContentQuery('projects');
  const certificates = useContentQuery('certificates');
  const { data: profile } = useProfileQuery();
  const years = useCareerYears();
  const shown = useCountUp(years);
  const count = <T,>(query: { data?: T[]; isError: boolean }) =>
    query.isError || !query.data ? null : query.data.length;

  return (
    <section
      aria-label={words.symbol}
      className='tv-rise rounded-md border border-tv-line bg-tv-panel p-4'
    >
      <div className='flex items-center gap-3'>
        {shell.avatar && (
          <Image
            src={shell.avatar}
            alt={fill(homeText.avatarAlt, { name: shell.name })}
            width={44}
            height={44}
            unoptimized
            className='size-11 flex-none rounded-full object-cover object-[50%_25%]'
          />
        )}
        <div className='min-w-0'>
          <p className='text-[17px] leading-tight font-bold'>{shell.name}</p>
          <p className='text-xs text-tv-mute'>
            {localize(shell, lang).headline}
          </p>
          {profile?.location && (
            <p className='text-xs text-tv-mute'>{profile.location}</p>
          )}
        </div>
      </div>
      {years !== null && (
        <p className='mt-4 flex items-baseline gap-2'>
          <span className='sr-only'>
            {years} {years === 1 ? trade.yearsOne : trade.yearsMany}
          </span>
          <span
            aria-hidden='true'
            className='text-[48px] leading-none font-semibold tabular-nums'
          >
            {shown}
          </span>
          <span aria-hidden='true' className='text-[13px] text-tv-mute'>
            {years === 1 ? trade.yearsOne : trade.yearsMany}
          </span>
        </p>
      )}
      <div
        role='group'
        aria-label={words.stats.label}
        className='mt-4 grid grid-cols-3 gap-2'
      >
        <Stat
          label={common.nav.projects}
          href='/projects'
          count={count(projects)}
          pending={projects.isPending}
        />
        <Stat
          label={common.nav.certificates}
          href='/certificates'
          count={count(certificates)}
          pending={certificates.isPending}
        />
        <Stat
          label={words.stats.roles}
          href='/resume'
          count={count(jobs)}
          pending={jobs.isPending}
        />
      </div>
    </section>
  );
}
