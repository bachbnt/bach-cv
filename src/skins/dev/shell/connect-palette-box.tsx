/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useRef, useState, type KeyboardEvent, type RefObject } from 'react';
import { Input } from '@/components/ui/input';
import { commonCopy } from '@/content/copy/common';
import { devConnectCopy } from '@/content/copy/dev-connect';
import { useClipboard } from '@/hooks/use-clipboard';
import { CONTACT_GROUPS } from '@/lib/content/schema';
import { BRAND_ICONS } from '@/lib/brand-icons';
import { useCopy } from '@/lib/i18n/copy';
import { useContentQuery, useProfileQuery } from '@/lib/query/use-content';
import { cn } from '@/lib/utils';
import { DevIcon } from '@/skins/dev/icons/dev-icon';
import { ConnectTile } from '@/skins/dev/shell/connect-tile';
import { DevButton } from '@/skins/dev/ui/dev-button';

/** The colour of a brand in this skin: a real brand colour, or the heading colour when the brand has none of its own. */
const colorOf = (platform: string) => {
  const color = BRAND_ICONS[platform]?.color ?? '';
  return color.startsWith('#') ? color : 'var(--head)';
};

const ITEM = '[data-palette-item]';

/** A line of the list: the brand in a small tile, its name and its handle, and an arrow that shows on the line in use. */
const LINE =
  'group/line grid min-h-11 grid-cols-[28px_minmax(0,1fr)_auto] items-center gap-x-3 rounded-[8px] px-3 py-1.5 text-ink transition-[background-color] duration-100 hover:bg-hov focus-visible:bg-sel focus-visible:outline-none!';

/** The box itself; it is mounted while the palette is open, so the text typed is gone the next time. */
export function ConnectPaletteBox({
  input,
}: {
  input: RefObject<HTMLInputElement | null>;
}) {
  const text = useCopy(commonCopy).connect;
  const extra = useCopy(devConnectCopy);
  const { data: contacts = [] } = useContentQuery('contacts');
  const { data: profile } = useProfileQuery();
  const { copied, copy } = useClipboard();
  const [query, setQuery] = useState('');
  const list = useRef<HTMLDivElement>(null);

  const q = query.trim().toLowerCase();
  const matches = (...parts: (string | undefined)[]) =>
    !q || parts.some((part) => part?.toLowerCase().includes(q));

  const email = contacts.find((c) => c.kind === 'email');
  const showEmail = email && matches(text.email, email.label);
  const social = contacts.filter(
    (c) =>
      c.kind === 'social' &&
      c.url &&
      matches(BRAND_ICONS[c.platform]?.name, c.platform, c.label),
  );
  const empty = !showEmail && social.length === 0;

  const items = () =>
    Array.from(list.current?.querySelectorAll<HTMLElement>(ITEM) ?? []);

  /** The arrow keys move the focus along the lines; going up from the first goes back to the input. */
  const onListKey = (event: KeyboardEvent) => {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
    event.preventDefault();
    const all = items();
    const at = all.indexOf(document.activeElement as HTMLElement);
    const next = all[at + (event.key === 'ArrowDown' ? 1 : -1)];
    if (next) next.focus();
    else if (event.key === 'ArrowUp') input.current?.focus();
  };

  return (
    <div className='flex max-h-[min(70dvh,560px)] w-[min(420px,100%)] origin-bottom-left flex-col overflow-hidden rounded-[12px] border border-line-2 bg-chrome shadow-[0_18px_44px_rgba(0,0,0,0.5)] animate-[dv-lbpop_0.25s_cubic-bezier(0.2,0.8,0.2,1)_both]'>
      <div className='flex flex-none items-center gap-2.5 border-b border-line bg-chrome-2 px-4'>
        <span
          aria-hidden='true'
          className='font-code text-[14px] font-semibold text-signal'
        >
          ›
        </span>
        <Input
          ref={input}
          value={query}
          placeholder={extra.placeholder}
          aria-label={extra.placeholder}
          autoComplete='off'
          spellCheck={false}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'ArrowDown') {
              event.preventDefault();
              items()[0]?.focus();
            }
          }}
          className='h-12 rounded-none border-0 bg-transparent px-0 font-code text-[14px] text-head shadow-none placeholder:text-dim focus-visible:border-0 focus-visible:ring-0 dark:bg-transparent'
        />
      </div>

      <div
        ref={list}
        className='min-h-0 flex-1 overflow-auto p-2'
        onKeyDown={onListKey}
      >
        {showEmail && (
          <div className={cn(LINE, 'grid-cols-[28px_minmax(0,1fr)_auto_auto]')}>
            <ConnectTile platform='email' color='var(--and)' />
            <a
              data-palette-item=''
              data-slot='dev-connect-link'
              href={email.url}
              className='flex min-w-0 items-baseline gap-2.5 rounded-[4px] focus-visible:outline-none! max-[700px]:flex-col max-[700px]:items-start max-[700px]:gap-0'
            >
              <span className='flex-none font-code text-[13px] leading-[normal] font-semibold text-head lowercase'>
                {text.email}
              </span>
              <span className='max-w-full truncate font-code text-[12px] leading-[normal] text-sky underline underline-offset-[3px]'>
                {email.label}
              </span>
            </a>
            <span />
            <DevButton
              size='sm'
              data-palette-item=''
              className='min-w-20 justify-center'
              onClick={() => copy(email.label)}
            >
              <DevIcon
                name={copied ? 'check' : 'copy'}
                className={cn(copied && 'text-signal')}
              />
              {copied ? text.copied : text.copy}
            </DevButton>
          </div>
        )}

        {CONTACT_GROUPS.map((group) => {
          const inGroup = social.filter((c) => c.menuGroup === group);
          if (!inGroup.length) return null;
          return (
            <div key={group}>
              <p className='mx-3 mt-3 mb-1 font-code text-[11.5px] leading-[normal] font-semibold text-dim lowercase'>
                <span aria-hidden='true'># </span>
                {text.groups[group]}
              </p>
              {inGroup.map((c) => (
                <a
                  key={c.id}
                  data-palette-item=''
                  data-slot='dev-connect-link'
                  href={c.url}
                  target='_blank'
                  rel='noopener'
                  className={LINE}
                >
                  <ConnectTile
                    platform={c.platform}
                    color={colorOf(c.platform)}
                  />
                  <span className='flex min-w-0 items-baseline gap-2.5'>
                    <span className='flex-none font-code text-[13px] leading-[normal] font-semibold text-head lowercase'>
                      {BRAND_ICONS[c.platform]?.name ?? c.platform}
                    </span>
                    <span className='truncate font-code text-[12px] leading-[normal] text-mute'>
                      {c.label}
                    </span>
                  </span>
                  <DevIcon
                    name='link-external'
                    className='size-3.5 justify-self-end text-dim opacity-0 transition-opacity duration-100 group-hover/line:opacity-100 group-focus-visible/line:opacity-100'
                  />
                </a>
              ))}
            </div>
          );
        })}

        {empty && (
          <p className='m-0 px-3 py-6 text-center font-code text-[12.5px] text-dim'>
            {extra.empty}
          </p>
        )}
      </div>

      <div className='flex flex-none items-center justify-between gap-4 border-t border-line bg-chrome-2 px-4 py-2 font-code text-[11.5px] leading-[normal] text-dim'>
        <span className='min-w-0 truncate'>
          {profile?.location && (
            <>
              <span aria-hidden='true'># </span>
              {profile.location}
            </>
          )}
        </span>
        <span aria-hidden='true' className='flex-none max-[700px]:hidden'>
          ↑↓ · ↵ · esc
        </span>
      </div>
    </div>
  );
}
