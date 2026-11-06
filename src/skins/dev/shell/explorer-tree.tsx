/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { cva } from 'class-variance-authority';
import Link from 'next/link';
import { useLive } from '@/hooks/use-live';
import type { PageKey } from '@/lib/content/schema';
import { PAGE_META } from '@/lib/pages';
import { cn } from '@/lib/utils';
import { DEV_FILES, type TreeNode } from '@/skins/dev/config';
import { FileIcon } from '@/skins/dev/icons/file-icon';
import { ExplorerArrow } from '@/skins/dev/shell/explorer-arrow';
import type { DevUi } from '@/skins/dev/shell/use-dev-ui';

/** A row of the tree: a file, or a folder name. The phone drawer has roomier rows. */
const ROW =
  'flex items-center px-2.5 py-0.5 leading-[22px] max-[900px]:py-1.5 max-[900px]:text-[14px]';

/**
 * The indent guide of a folder (the line at the left of its children). Like VS Code, it brightens while the mouse is over a row that is
 * one of its own children (a file, or the name of a sub-folder): the guide of the folder that holds the row. Pure CSS: `:has` on the
 * guide, inside `@media (hover: hover)` (the arbitrary variant is not the `hover:` one, so the media query is written out).
 */
const GUIDE =
  'ml-3.5 border-l border-[color-mix(in_srgb,var(--line-2)_60%,transparent)] pl-3 transition-colors duration-150 [@media(hover:hover)]:has-[>a:hover,>span:hover,>details>summary:hover]:border-mute';

/** A file of the tree: `link` opens a page (the open one is `selected`), `dim` is a file that is only there to look like a project: faded like a file that was cut, and it does not react to the pointer. */
const leafVariants = cva(
  `${ROW} gap-2 transition-[background-color,padding-left] duration-[120ms,150ms]`,
  {
    variants: {
      kind: {
        link: 'text-ink hover:bg-hov hover:pl-3.5',
        selected: 'bg-sel text-head hover:pl-3.5',
        dim: 'cursor-default text-mute opacity-45',
      },
      top: { true: 'pl-7', false: '' },
    },
    defaultVariants: { kind: 'link', top: false },
  },
);

export function ExplorerTree({
  nodes,
  page,
  ui,
  top = false,
  onFolder,
}: {
  nodes: TreeNode[];
  page: PageKey;
  ui: DevUi;
  /** the nodes are the direct children of the project folder (their text is indented past the folder arrow) */
  top?: boolean;
  onFolder: (path: string, open: boolean) => void;
}) {
  const live = useLive();
  return (
    <>
      {nodes.map((node) => {
        if (node.type === 'dir') {
          const open = ui.folders[node.path] ?? true;
          return (
            <details
              key={node.path}
              className='dv-dir'
              open={open}
              onToggle={(event) =>
                onFolder(node.path, event.currentTarget.open)
              }
            >
              <summary
                className={cn(
                  ROW,
                  'cursor-pointer list-none gap-1.5 text-ink hover:bg-hov [&::-webkit-details-marker]:hidden',
                )}
              >
                <ExplorerArrow open={open} folder />
                {node.label}
              </summary>
              <div className={GUIDE}>
                <ExplorerTree
                  nodes={node.children}
                  page={page}
                  ui={ui}
                  onFolder={onFolder}
                />
              </div>
            </details>
          );
        }
        if (node.type === 'page') {
          const state = live.pages[node.page];
          if (state === 'hidden') return null;
          const file = DEV_FILES[node.page];
          if (state === 'soon') {
            return (
              <span
                key={node.page}
                className={leafVariants({ kind: 'dim', top })}
              >
                <FileIcon kind={file.kind} />
                {file.name}
              </span>
            );
          }
          return (
            <Link
              key={node.page}
              data-slot='dev-leaf'
              href={PAGE_META[node.page].href}
              className={leafVariants({
                kind: node.page === page ? 'selected' : 'link',
                top,
              })}
              aria-current={node.page === page ? 'page' : undefined}
            >
              <FileIcon kind={file.kind} />
              {file.name}
            </Link>
          );
        }
        return (
          <span key={node.name} className={leafVariants({ kind: 'dim', top })}>
            <FileIcon kind={node.kind} />
            {node.name}
          </span>
        );
      })}
    </>
  );
}
