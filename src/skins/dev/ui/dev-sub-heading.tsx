/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

/** A `###` heading with its line under it. */
export function DevSubHeading({
  title,
  lead,
}: {
  title: string;
  lead: string;
}) {
  return (
    <div className='mt-7 mb-3.5 grid grid-cols-[auto_1fr] items-baseline gap-x-2 text-[16px] before:font-bold before:text-signal before:content-["###"/""]'>
      <h3 className='font-sans text-[16px] font-normal tracking-normal'>
        {title}
      </h3>
      <small className='col-[1/-1] mt-1 block font-sans text-[15px]/[1.5] font-normal text-mute'>
        {lead}
      </small>
    </div>
  );
}
