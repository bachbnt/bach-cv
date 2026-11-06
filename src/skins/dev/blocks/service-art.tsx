/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { Service } from '@/lib/content/schema';

/** Decorative terminal output: `$` is a command, `✓` a result, anything else is plain output. */
const LINES: Record<Service['art'], string[]> = {
  app: [
    '$ flutter create shop_app',
    '$ flutter run -d all',
    '✓ Android · Pixel 8',
    '✓ iOS · iPhone 15',
  ],
  web: [
    '$ npm create next-app',
    '$ npm run dev',
    'GET /api/products 200',
    '✓ node · mongodb · mysql',
  ],
  oss: [
    '$ gh repo fork next.js',
    '$ git commit -m "fix"',
    '$ gh pr create',
    '✓ PR #128 opened',
  ],
  teaching: [
    '$ cat syllabus.md',
    '1 Variables · 2 Loops',
    '3 Functions · 4 Project',
    '✓ Lesson 3 of 12 done',
  ],
  writing: [
    '$ cat clean-arch.md',
    '# Clean Architecture',
    '≈ 1,240 words · 6 min read',
    '✓ Published to the blog',
  ],
  generic: ['$ ls services/', '# nothing drawn for this one', '✓ ready'],
};

/** The picture at the top of a service card: a small terminal whose lines say what the service is about. */
export function ServiceArt({ art }: { art: Service['art'] }) {
  return (
    <div
      className='mb-3.5 h-[100px] overflow-hidden rounded-[6px] border border-line-2 bg-[#0b0f14] px-[13px] py-[11px] font-code text-[12px]/[1.6] whitespace-nowrap text-[#c9d1d9]'
      aria-hidden='true'
    >
      {LINES[art].map((line) =>
        line.startsWith('$ ') ? (
          <div key={line}>
            <span className='text-signal'>$</span> {line.slice(2)}
          </div>
        ) : (
          <div
            key={line}
            className={line.startsWith('✓') ? 'text-signal' : 'text-[#858585]'}
          >
            {line}
          </div>
        ),
      )}
    </div>
  );
}
