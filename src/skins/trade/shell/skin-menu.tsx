/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { LayoutTemplate } from 'lucide-react';
import { skinsCopy } from '@/content/copy/skins';
import { useCopy } from '@/lib/i18n/copy';
import { useSkin } from '@/lib/skin/skin';
import { isSkinId } from '@/lib/skin/skins';
import { preloadSkin } from '@/skins/registry';
import { ToolbarMenu } from '@/skins/trade/shell/toolbar-menu';

/** The Skin menu of the toolbar, built from `SKIN_IDS` like the Standard one (`Skin: Trade`): it is how a visitor leaves this skin. */
export function SkinMenu() {
  const copy = useCopy(skinsCopy);
  const { skin, setSkin, options, locked } = useSkin();
  if (locked) return null;
  return (
    <ToolbarMenu
      icon={<LayoutTemplate aria-hidden='true' />}
      current={copy.names[skin].name}
      label={`${copy.label}: ${copy.names[skin].name}`}
      value={skin}
      items={options.map((id) => ({
        value: id,
        label: copy.names[id].name,
        hint: copy.names[id].hint,
      }))}
      onSelect={(value) => isSkinId(value) && setSkin(value)}
      onPreview={(value) => isSkinId(value) && preloadSkin(value)}
    />
  );
}
