/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { CornerDownLeft, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { commonCopy } from '@/content/copy/common';
import { statesCopy } from '@/content/copy/states';
import { tradeCopy } from '@/content/copy/trade';
import { tradeShellCopy } from '@/content/copy/trade-shell';
import { useLive } from '@/hooks/use-live';
import { fill } from '@/lib/chat/fill';
import { formatPeriod } from '@/lib/format';
import { useCopy } from '@/lib/i18n/copy';
import { useLang } from '@/lib/i18n/language';
import { useContentQuery } from '@/lib/query/use-content';
import { cn } from '@/lib/utils';
import {
  buildSearchIndex,
  groupResults,
  rankItems,
  type SearchItem,
} from '@/skins/trade/blocks/shell-search';
import { navItems, WATCH } from '@/skins/trade/config';
import { useTrade } from '@/skins/trade/shell/trade-context';
import { TvButton } from '@/skins/trade/ui/tv-button';
import { TvChip } from '@/skins/trade/ui/tv-chip';

/** A heading of the list and the results under it: a kind, or the recent picks. */
interface Section {
  key: string;
  label: string;
  items: SearchItem[];
}

/**
 * The symbol search: a command palette over everything the site says (pages, projects, roles, skills, certificates, services and
 * education). Results are grouped with a badge for their kind; the arrow keys move, Enter opens, Esc closes. A page goes to its route,
 * a role opens that job on Resume, a project goes to Projects. Picks are remembered for the session (not stored). On a phone it fills
 * the screen. It is loaded the first time it is opened; its body mounts on every opening, so the field starts empty each time.
 */
export function SearchPalette() {
  const { searchOpen, closeSearch, searchReturnFocus } = useTrade();
  const copy = useCopy(tradeShellCopy).search;
  return (
    <Dialog
      open={searchOpen}
      onOpenChange={(open) => {
        if (!open) closeSearch();
      }}
    >
      <DialogContent
        showCloseButton={false}
        finalFocus={searchReturnFocus}
        className='top-[10vh] translate-y-0 gap-0 overflow-hidden rounded-md border border-tv-line bg-tv-panel p-0 text-tv-ink shadow-tv-dialog ring-0 sm:max-w-[640px] max-[700px]:inset-0 max-[700px]:top-0 max-[700px]:left-0 max-[700px]:h-dvh max-[700px]:max-w-none max-[700px]:translate-x-0 max-[700px]:translate-y-0 max-[700px]:rounded-none max-[700px]:border-0'
      >
        <DialogTitle className='sr-only'>{copy.title}</DialogTitle>
        <DialogDescription className='sr-only'>
          {copy.description}
        </DialogDescription>
        <PaletteBody />
      </DialogContent>
    </Dialog>
  );
}

function PaletteBody() {
  const { closeSearch, recents, remember, showJob } = useTrade();
  const router = useRouter();
  const copy = useCopy(tradeShellCopy).search;
  const common = useCopy(commonCopy);
  const trade = useCopy(tradeCopy);
  const states = useCopy(statesCopy);
  const { lang } = useLang();
  const { pages } = useLive();
  const projects = useContentQuery('projects');
  const jobs = useContentQuery('experience');
  const skills = useContentQuery('skills');
  const certificates = useContentQuery('certificates');
  const services = useContentQuery('services');
  const education = useContentQuery('education');
  const queries = [projects, jobs, skills, certificates, services, education];
  const failed = queries.filter((q) => q.isError);
  const loading = queries.some((q) => q.isPending);

  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const listId = useId();
  const list = useRef<HTMLDivElement>(null);

  const index = useMemo(
    () =>
      buildSearchIndex({
        pages: navItems(pages)
          .filter(({ soon }) => !soon)
          .map(({ page }) => ({
            page,
            label: page === 'home' ? trade.home : common.nav[page],
            href: WATCH[page].href,
          })),
        projects: projects.data ?? [],
        jobs: jobs.data ?? [],
        skills: skills.data ?? [],
        certificates: certificates.data ?? [],
        services: services.data ?? [],
        education: education.data ?? [],
        period: (start, end) => formatPeriod(start, end, lang),
      }),
    [
      pages,
      trade.home,
      common.nav,
      projects.data,
      jobs.data,
      skills.data,
      certificates.data,
      services.data,
      education.data,
      lang,
    ],
  );

  const typing = query.trim().length > 0;
  const sections: Section[] = useMemo(() => {
    if (typing)
      return groupResults(rankItems(index, query)).map((group) => ({
        key: group.kind,
        label: copy.groups[group.kind],
        items: group.items,
      }));
    const recent = recents
      .map((id) => index.find((item) => item.id === id))
      .filter((item): item is SearchItem => Boolean(item));
    return [
      { key: 'recent', label: copy.recent, items: recent },
      {
        key: 'page',
        label: copy.groups.page,
        items: index.filter((item) => item.kind === 'page'),
      },
    ].filter((section) => section.items.length > 0);
  }, [typing, index, query, recents, copy.recent, copy.groups]);
  const flat = sections.flatMap((section) => section.items);
  const at = Math.min(active, Math.max(0, flat.length - 1));

  // the highlighted row stays in view while the arrow keys walk a long list
  useEffect(() => {
    list.current
      ?.querySelector('[aria-selected="true"]')
      ?.scrollIntoView({ block: 'nearest' });
  }, [at, flat.length]);

  const pick = (item: SearchItem) => {
    remember(item.id);
    closeSearch();
    if (item.target.type === 'job') showJob(item.target.id);
    else router.push(item.target.href);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (flat.length === 0) return;
      const step = event.key === 'ArrowDown' ? 1 : -1;
      setActive((at + step + flat.length) % flat.length);
    } else if (event.key === 'Enter') {
      const item = flat[at];
      if (item) {
        event.preventDefault();
        pick(item);
      }
    }
  };

  const status = typing
    ? flat.length === 0
      ? ''
      : flat.length === 1
        ? copy.countOne
        : fill(copy.count, { count: flat.length })
    : '';

  return (
    <>
      <div className='flex items-center gap-2.5 border-b border-tv-line px-4'>
        <Search aria-hidden='true' className='size-4 flex-none text-tv-mute' />
        <input
          autoFocus
          role='combobox'
          aria-expanded='true'
          aria-controls={flat.length ? listId : undefined}
          aria-activedescendant={
            flat[at] ? `${listId}-${flat[at].id}` : undefined
          }
          aria-autocomplete='list'
          aria-label={copy.inputLabel}
          placeholder={copy.placeholder}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setActive(0);
          }}
          onKeyDown={onKeyDown}
          className='h-12 min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-tv-dim'
        />
        <kbd
          aria-hidden='true'
          className='rounded border border-tv-line px-1.5 py-0.5 font-sans text-[11px] text-tv-mute max-[700px]:hidden'
        >
          Esc
        </kbd>
      </div>
      <div
        ref={list}
        className='max-h-[min(56vh,460px)] min-h-[120px] overflow-y-auto py-1 max-[700px]:max-h-none max-[700px]:flex-1'
      >
        {flat.length === 0 ? (
          typing &&
          !loading && (
            <div role='status' className='px-4 py-8 text-center'>
              <p className='text-sm font-semibold'>
                {fill(copy.noResults, { query: query.trim() })}
              </p>
              <p className='mt-1 text-xs text-tv-mute'>{copy.noResultsHint}</p>
            </div>
          )
        ) : (
          <div id={listId} role='listbox' aria-label={copy.listLabel}>
            {sections.map((section) => {
              const headingId = `${listId}-g-${section.key}`;
              return (
                <div key={section.key} role='group' aria-labelledby={headingId}>
                  <p
                    id={headingId}
                    className='px-4 pt-2 pb-1 text-[11px] font-bold tracking-wide text-tv-mute uppercase'
                  >
                    {section.label}
                  </p>
                  {section.items.map((item) => {
                    const selected = flat[at]?.id === item.id;
                    return (
                      <div
                        key={item.id}
                        id={`${listId}-${item.id}`}
                        role='option'
                        aria-selected={selected}
                        onPointerMove={() => setActive(flat.indexOf(item))}
                        onClick={() => pick(item)}
                        className={cn(
                          'flex min-h-10 cursor-pointer items-center gap-3 px-4 py-1.5 transition-[background-color] duration-75 pointer-coarse:min-h-12',
                          selected && 'bg-tv-hover',
                        )}
                      >
                        <span className='min-w-0 flex-1'>
                          <span className='block truncate text-[13px] font-semibold'>
                            {item.title}
                          </span>
                          {item.detail && (
                            <span className='block truncate text-xs text-tv-mute'>
                              {item.detail}
                            </span>
                          )}
                        </span>
                        <TvChip tone={selected ? 'accent' : 'neutral'}>
                          {copy.kinds[item.kind]}
                        </TvChip>
                        <CornerDownLeft
                          aria-hidden='true'
                          className={cn(
                            'size-3.5 flex-none text-tv-mute',
                            !selected && 'invisible',
                          )}
                        />
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}
      </div>
      <div className='flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-tv-line px-4 py-2 text-[11px] text-tv-mute'>
        <span aria-hidden='true' className='max-[700px]:hidden'>
          <kbd className='font-sans'>↑↓</kbd> {copy.hints.move}
          {'   '}
          <kbd className='font-sans'>↵</kbd> {copy.hints.open}
          {'   '}
          <kbd className='font-sans'>Esc</kbd> {copy.hints.close}
        </span>
        <span role='status' aria-live='polite' className='ml-auto'>
          {loading ? states.loading : status}
        </span>
        {failed.length > 0 && (
          <span className='flex items-center gap-2 text-tv-down'>
            {copy.partial}
            <TvButton
              variant='outline'
              size='sm'
              onClick={() => failed.forEach((q) => void q.refetch())}
            >
              {states.retry}
            </TvButton>
          </span>
        )}
      </div>
    </>
  );
}
