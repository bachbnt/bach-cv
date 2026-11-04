/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { Download, Menu } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRef, useState } from 'react';
import { BrandIcon, brandColor, brandName } from '@/components/brand-icon';
import { CvDialog } from '@/components/cv/cv-dialog';
import { buttonVariants } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import type { PageKey } from '@/lib/content/schema';
import { type Live } from '@/lib/content/schema';
import { NAV_PAGES, PAGE_META } from '@/lib/pages';
import { commonCopy } from '@/content/copy/common';
import { useCopy } from '@/lib/i18n/copy';
import { useLang } from '@/lib/i18n/language';
import { LANGS, type Lang } from '@/lib/content/schema';
import { shell } from '@/lib/content/shell';
import { cn } from 'cn';
import { useContentQuery } from '@/lib/query/use-content';

/** The drawer used below 1200px: navigation, a grid of contact links and the CV button. */
export function MobileMenu({
  current,
  live,
}: {
  current: PageKey | 'neutral';
  live: Live;
}) {
  const { data: contacts = [] } = useContentQuery('contacts');
  const [menuOpen, setMenuOpen] = useState(false);
  const copy = useCopy(commonCopy);
  const { lang, setLang } = useLang();
  const [cvOpen, setCvOpen] = useState(false);
  // the CV opens once the drawer has finished closing, so two modals never overlap
  const openCvAfterClose = useRef(false);
  const links = contacts.filter(
    (c) => c.url && (c.kind === 'email' || c.kind === 'social'),
  );

  return (
    <>
      <Sheet
        open={menuOpen}
        onOpenChange={setMenuOpen}
        onOpenChangeComplete={(open) => {
          if (open || !openCvAfterClose.current) return;
          openCvAfterClose.current = false;
          setCvOpen(true);
        }}
      >
        <SheetTrigger
          aria-label={copy.menu.open}
          className='inline-flex min-h-11 cursor-pointer items-center gap-2.5 rounded-[10px] border border-border bg-white px-4 text-[15px] font-semibold min-[1200px]:hidden'
        >
          <Menu aria-hidden='true' className='size-[18px]' />
          {copy.menu.label}
        </SheetTrigger>
        <SheetContent
          side='right'
          className='w-[min(360px,88vw)] gap-0 overflow-y-auto bg-white p-4 data-[side=right]:sm:max-w-[360px]'
        >
          <div className='flex items-center gap-3 pr-12'>
            <Image
              src='/logo.png'
              alt=''
              width={36}
              height={34}
              className='h-auto w-9'
            />
            <SheetTitle className='font-heading text-xl font-bold'>
              {shell.name}
            </SheetTitle>
          </div>

          <nav aria-label='Main' className='mt-4 flex flex-col'>
            {NAV_PAGES.map((page) => {
              const state = live.pages[page];
              if (state === 'hidden') return null;
              const meta = PAGE_META[page];
              const label = copy.nav[page];
              return state === 'soon' ? (
                <span
                  key={page}
                  className='flex min-h-[52px] items-center gap-2.5 px-3.5 font-heading text-xl font-bold text-muted-foreground'
                >
                  {label}
                  <small className='rounded-full bg-secondary px-2 py-0.5 font-sans text-xs font-semibold'>
                    {copy.soon}
                  </small>
                </span>
              ) : (
                <Link
                  key={page}
                  href={meta.href}
                  aria-current={current === page ? 'page' : undefined}
                  className={cn(
                    'flex min-h-[52px] items-center rounded-xl px-3.5 font-heading text-xl font-bold active:bg-background',
                    current === page && 'bg-page-tint',
                  )}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          {links.length > 0 && (
            <div className='mt-3.5 border-t pt-3.5'>
              <p className='mb-2.5 text-[13px] font-semibold text-muted-foreground'>
                {copy.connect.button}
              </p>
              <div className='grid grid-cols-5 gap-2'>
                {links.map((c) => (
                  <a
                    key={c.id}
                    href={c.url}
                    aria-label={brandName(c.platform)}
                    target={c.kind === 'email' ? undefined : '_blank'}
                    rel='noopener'
                    style={
                      { '--c': brandColor(c.platform) } as React.CSSProperties
                    }
                    className='flex aspect-square items-center justify-center rounded-[14px] bg-background text-foreground transition-colors active:bg-(--c) active:text-white'
                  >
                    <BrandIcon platform={c.platform} className='size-[22px]' />
                  </a>
                ))}
              </div>
            </div>
          )}

          {shell.languages.length > 1 && (
            <div className='mt-3.5 flex items-center justify-between gap-3 border-t pt-3.5'>
              <p className='text-[13px] font-semibold text-muted-foreground'>
                {copy.language.label}
              </p>
              <div
                role='group'
                aria-label={copy.language.label}
                className='inline-flex rounded-xl bg-background p-[3px]'
              >
                {LANGS.filter((code) => shell.languages.includes(code)).map(
                  (code: Lang) => (
                    <button
                      key={code}
                      type='button'
                      aria-pressed={lang === code}
                      onClick={() => setLang(code)}
                      className='min-h-10 min-w-14 cursor-pointer rounded-[10px] px-3.5 text-[15px] font-semibold text-muted-foreground aria-pressed:bg-foreground aria-pressed:text-white'
                    >
                      {code.toUpperCase()}
                    </button>
                  ),
                )}
              </div>
            </div>
          )}

          {live.features.cvDownload && (
            <button
              type='button'
              aria-haspopup='dialog'
              onClick={() => {
                openCvAfterClose.current = true;
                setMenuOpen(false);
              }}
              className={cn(
                buttonVariants({ variant: 'brand', size: 'lg' }),
                'sticky bottom-0 mt-auto cursor-pointer',
              )}
            >
              <Download aria-hidden='true' />
              {copy.downloadCv}
            </button>
          )}
        </SheetContent>
      </Sheet>
      <CvDialog open={cvOpen} onOpenChange={setCvOpen} />
    </>
  );
}
