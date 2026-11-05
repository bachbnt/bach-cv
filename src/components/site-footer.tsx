/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { shell } from '@/lib/content/shell';

export function SiteFooter() {
  return (
    <footer className='mx-auto flex w-full max-w-[1200px] flex-wrap items-center justify-between gap-x-8 gap-y-4 px-5 pt-8 pb-24 text-[15px] text-muted-foreground min-[721px]:px-12'>
      <p>
        &copy; {new Date().getFullYear()} {shell.name}
      </p>
      {shell.alternateNames.length > 0 && (
        // the other names this site is known by, in plain sight: people search for them
        <p data-testid='alternate-names'>{shell.alternateNames.join(' · ')}</p>
      )}
    </footer>
  );
}
