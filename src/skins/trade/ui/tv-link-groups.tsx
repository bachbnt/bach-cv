/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { BrandIcon, brandColor, brandName } from '@/components/brand-icon';
import { commonCopy } from '@/content/copy/common';
import { CONTACT_GROUPS, type Contact } from '@/lib/content/schema';
import { useCopy } from '@/lib/i18n/copy';
import { TvLinkRow } from '@/skins/trade/ui/tv-link-row';

/**
 * The social links of Connect under the heading of their group (Professional, Messaging, Social), each as a `TvLinkRow`. The popover of
 * the rail and the links of About draw them with this one, so the accounts look the same in both.
 */
export function TvLinkGroups({
  contacts,
}: {
  contacts: (Contact & { id: string })[];
}) {
  const groups = useCopy(commonCopy).connect.groups;
  return CONTACT_GROUPS.map((group) => {
    const items = contacts.filter((c) => c.menuGroup === group);
    if (!items.length) return null;
    return (
      <div key={group} className='mt-2 first:mt-0'>
        <h3 className='mx-2 mb-1 text-[11px] font-bold tracking-wide text-tv-mute uppercase'>
          {groups[group]}
        </h3>
        <ul className='m-0 grid list-none gap-0.5 p-0'>
          {items.map((c) => (
            <li key={c.id}>
              <TvLinkRow
                href={c.url}
                external
                icon={<BrandIcon platform={c.platform} />}
                color={brandColor(c.platform)}
                title={brandName(c.platform)}
                detail={c.label}
              />
            </li>
          ))}
        </ul>
      </div>
    );
  });
}
