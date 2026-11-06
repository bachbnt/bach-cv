/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { ServiceArt } from '@/components/services/service-art';
import type { Doc } from '@/lib/content/schema';

/** One service: its CSS drawing, name and description. */
export function ServiceCard({ service }: { service: Doc<'services'> }) {
  return (
    <article className='glow lift flex flex-col gap-2.5 rounded-2xl border border-border bg-card px-4 pt-4 pb-7'>
      <ServiceArt art={service.art} />
      <h2 className='mt-2.5 text-[22px] leading-[1.2]'>{service.name}</h2>
      <p className='text-base leading-[1.6] text-body'>{service.description}</p>
    </article>
  );
}
