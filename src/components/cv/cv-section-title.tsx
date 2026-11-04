/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

/** A section heading: the title with a short accent bar, then a rule to the edge. */
export function CvSectionTitle({ title }: { title: string }) {
  return (
    <div className='mt-4 mb-3 flex items-center gap-3'>
      <h2 className='text-[15px] whitespace-nowrap after:mt-[5px] after:block after:h-[3px] after:w-9 after:bg-brand after:content-[""]'>
        {title}
      </h2>
      <span aria-hidden='true' className='h-px flex-1 bg-[#c9cdd6]' />
    </div>
  );
}
