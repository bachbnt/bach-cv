/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { Share2 } from 'lucide-react';
import { useEffect } from 'react';
import { commonCopy } from '@/content/copy/common';
import { devCopy } from '@/content/copy/dev';
import { useLive } from '@/hooks/use-live';
import type { PageKey } from '@/lib/content/schema';
import { useCopy } from '@/lib/i18n/copy';
import { cn } from '@/lib/utils';
import { DEV_PROJECT, DEV_TREE, type TreeNode } from '@/skins/dev/config';
import { DevIcon } from '@/skins/dev/icons/dev-icon';
import { ExplorerArrow } from '@/skins/dev/shell/explorer-arrow';
import { ExplorerTree } from '@/skins/dev/shell/explorer-tree';
import type { DevUi, DevUiUpdate } from '@/skins/dev/shell/use-dev-ui';
import { DevButton } from '@/skins/dev/ui/dev-button';
import { DevDownloadCv } from '@/skins/dev/ui/dev-download-cv';

/** A section title of the Explorer (the project folder, Outline, Timeline). */
const SECTION =
  'flex cursor-default items-center gap-[5px] px-2 py-[3px] font-sans text-[11px] leading-[normal] font-bold whitespace-nowrap text-head uppercase max-[900px]:px-2.5 max-[900px]:py-2';

/** Whether a tree node holds the file of a page (so the folders above the open file stay open). */
const holds = (node: TreeNode, page: PageKey): boolean =>
  node.type === 'dir'
    ? node.children.some((child) => holds(child, page))
    : node.type === 'page' && node.page === page;

/** The Explorer: the project folder with the file of every page. */
export function Explorer({
  page,
  ui,
  onChange,
  onOpenConnect,
  onCloseDrawer,
}: {
  page: PageKey;
  ui: DevUi;
  onChange: DevUiUpdate;
  onOpenConnect: () => void;
  onCloseDrawer: () => void;
}) {
  const copy = useCopy(devCopy);
  const common = useCopy(commonCopy);
  const live = useLive();

  // the open file is always shown, like in the real Explorer
  useEffect(() => {
    const opened: Record<string, boolean> = {};
    const walk = (nodes: TreeNode[]) => {
      for (const node of nodes) {
        if (node.type === 'dir' && holds(node, page)) {
          opened[node.path] = true;
          walk(node.children);
        }
      }
    };
    walk(DEV_TREE);
    // only when the page changes: a folder the visitor shuts afterwards stays shut
    onChange((current) => ({ folders: { ...current.folders, ...opened } }));
  }, [page, onChange]);

  return (
    <aside
      className={cn(
        'sticky top-(--top) z-19 h-[calc(100vh-var(--top)-var(--bottom))] w-[332px] flex-none overflow-auto bg-chrome font-sans text-[13px] leading-[normal] transition-[width,opacity] duration-200 [view-transition-name:explorer]',
        !ui.explorer && 'pointer-events-none w-0 opacity-0',
        // a phone: a drawer that slides in from the left, over the page and its scrim
        'max-[900px]:fixed max-[900px]:bottom-0 max-[900px]:left-0 max-[900px]:z-97 max-[900px]:h-auto max-[900px]:w-[min(84vw,340px)] max-[900px]:pointer-events-auto max-[900px]:border-r max-[900px]:border-line-2 max-[900px]:pb-5 max-[900px]:opacity-100 max-[900px]:shadow-[18px_0_50px_rgba(0,0,0,0.45)] max-[900px]:transition-transform max-[900px]:duration-300 max-[900px]:ease-[cubic-bezier(0.2,0.8,0.2,1)] max-[900px]:[transform:translateX(-104%)] max-[900px]:[view-transition-name:none] max-[900px]:group-data-[nav-open]/dv:[transform:none]',
      )}
      id='dv-explorer'
      aria-label={copy.explorer}
    >
      <div className='flex items-center justify-between px-5 py-2.5 font-sans text-[11px] leading-[normal] tracking-[0.08em] whitespace-nowrap text-mute max-[900px]:pt-3.5 max-[900px]:pb-2 max-[900px]:text-[11.5px]'>
        <span>{copy.explorer.toUpperCase()}</span>
        <DevIcon name='ellipsis' />
      </div>
      <div className='hidden flex-col items-stretch gap-2 px-3.5 pt-1 pb-3 max-[900px]:flex'>
        {live.features.connectMenu && (
          <DevButton
            className='justify-center whitespace-nowrap'
            aria-haspopup='dialog'
            data-account-trigger
            onClick={onOpenConnect}
          >
            <Share2 aria-hidden='true' className='size-4' />
            {common.connect.button}
          </DevButton>
        )}
        <DevDownloadCv
          className='justify-center whitespace-nowrap'
          label={common.downloadCv}
          onOpen={onCloseDrawer}
        />
      </div>
      <details
        className='dv-workspace'
        open={ui.workspace}
        onToggle={(event) => onChange({ workspace: event.currentTarget.open })}
      >
        <summary
          className={cn(
            SECTION,
            'cursor-pointer list-none hover:bg-hov [&::-webkit-details-marker]:hidden',
          )}
        >
          <ExplorerArrow open={ui.workspace} />
          {DEV_PROJECT.toUpperCase()}
        </summary>
        <div className='py-0.5 pb-3.5 whitespace-nowrap'>
          <ExplorerTree
            nodes={DEV_TREE}
            page={page}
            ui={ui}
            top
            onFolder={(path, open) =>
              onChange((current) => ({
                folders: { ...current.folders, [path]: open },
              }))
            }
          />
        </div>
      </details>
      <div className={cn(SECTION, 'border-t border-line-2 text-mute')}>
        <DevIcon name='chevron-right' className='size-3.5' />
        {copy.outline.toUpperCase()}
      </div>
      <div className={cn(SECTION, 'border-t border-line-2 text-mute')}>
        <DevIcon name='chevron-right' className='size-3.5' />
        {copy.timeline.toUpperCase()}
      </div>
    </aside>
  );
}
