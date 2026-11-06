/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { DevIcon } from '@/skins/dev/icons/dev-icon';
import type { ViewerItem } from '@/skins/dev/shell/dev-overlay-context';
import { DevButton, DevButtonLink } from '@/skins/dev/ui/dev-button';
import { DevChip } from '@/skins/dev/ui/dev-chip';
import { DevKind } from '@/skins/dev/ui/dev-kind';

/** Under the picture: its tags on the left, its actions (links, a copy button) on the right. */
export function DevViewerInfo({
  item,
  onCopy,
}: {
  item: ViewerItem;
  onCopy: (text: string, done: string) => void;
}) {
  const tags = item.tags ?? [];
  const links = item.links ?? [];
  if (!tags.length && !links.length && !item.copy) return null;
  return (
    <div className='flex flex-wrap items-center justify-between gap-[14px] border-t border-line px-[14px] py-[10px]'>
      {tags.length > 0 && (
        <div className='flex flex-wrap gap-[7px]'>
          {tags.map((tag) =>
            tag.pill ? (
              <DevKind key={tag.label} className='mb-0'>
                {tag.label}
              </DevKind>
            ) : (
              <DevChip key={tag.label} tone={tag.tone}>
                {tag.label}
              </DevChip>
            ),
          )}
        </div>
      )}
      {(links.length > 0 || item.copy) && (
        <div className='ml-auto flex flex-wrap gap-2'>
          {links.map((link) => (
            <DevButtonLink
              key={link.url}
              size='sm'
              href={link.url}
              target='_blank'
              rel='noopener'
            >
              {link.label}
              <DevIcon name='link-external' />
            </DevButtonLink>
          ))}
          {item.copy && (
            <DevButton
              variant='solid'
              size='sm'
              onClick={() =>
                item.copy && onCopy(item.copy.text, item.copy.done)
              }
            >
              <DevIcon name='copy' />
              {item.copy.label}
            </DevButton>
          )}
        </div>
      )}
    </div>
  );
}
