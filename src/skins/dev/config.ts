/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { PAGES, type PageKey } from '@/lib/content/schema';

/** The kinds of file the Explorer shows; each has an icon (`icons/file-icon.tsx`). */
export type FileKind =
  | 'java'
  | 'js'
  | 'dart'
  | 'py'
  | 'kt'
  | 'ts'
  | 'tsx'
  | 'swift'
  | 'sql'
  | 'json'
  | 'md'
  | 'sh'
  | 'yaml';

/** The project the editor "has open". Decoration only: it is the name shown in the title bar, the Explorer and the status bar. */
export const DEV_PROJECT = 'bachbntdev';
/** The number on the Source Control icon and in the status bar (my lucky number). */
export const GIT_PENDING = 5;

interface DevFile {
  /** the file name, with its extension */
  name: string;
  /** the name in the breadcrumb and the tab */
  symbol: string;
  /** the language shown in the status bar */
  language: string;
  kind: FileKind;
  /** the folders from the project root, for the breadcrumb and the Explorer */
  folder: string[];
}

/** Every page is a file of a different language. */
export const DEV_FILES: Record<PageKey, DevFile> = {
  home: {
    name: 'Home.java',
    symbol: 'Home',
    language: 'Java',
    kind: 'java',
    folder: ['backend', 'src', 'main', 'java', 'dev', 'bach'],
  },
  about: {
    name: 'About.js',
    symbol: 'About',
    language: 'JavaScript',
    kind: 'js',
    folder: ['frontend', 'src', 'pages'],
  },
  resume: {
    name: 'Resume.dart',
    symbol: 'Resume',
    language: 'Dart',
    kind: 'dart',
    folder: ['app', 'lib'],
  },
  projects: {
    name: 'Projects.py',
    symbol: 'Projects',
    language: 'Python',
    kind: 'py',
    folder: ['backend', 'scripts'],
  },
  certificates: {
    name: 'Certificates.kt',
    symbol: 'Certificates',
    language: 'Kotlin',
    kind: 'kt',
    folder: ['app', 'android', 'app', 'src', 'main', 'kotlin', 'dev', 'bach'],
  },
  services: {
    name: 'Services.ts',
    symbol: 'Services',
    language: 'TypeScript',
    kind: 'ts',
    folder: ['frontend', 'src', 'services'],
  },
  payment: {
    name: 'Payment.swift',
    symbol: 'Payment',
    language: 'Swift',
    kind: 'swift',
    folder: ['app', 'ios', 'Runner'],
  },
};

/** Files that only decorate the project (they are not pages), by folder. */
const DECOR: Record<string, { name: string; kind: FileKind }[]> = {
  '': [{ name: 'README.md', kind: 'md' }],
  'backend/src/main/java/dev/bach': [
    { name: 'Application.java', kind: 'java' },
  ],
  'backend/src/main/resources': [{ name: 'schema.sql', kind: 'sql' }],
  'backend/scripts': [{ name: 'build_portal.sh', kind: 'sh' }],
  frontend: [{ name: 'package.json', kind: 'json' }],
  'frontend/src': [{ name: 'App.tsx', kind: 'tsx' }],
  app: [{ name: 'pubspec.yaml', kind: 'yaml' }],
  'app/lib': [{ name: 'main.dart', kind: 'dart' }],
  'app/android/app/src/main/kotlin/dev/bach': [
    { name: 'MainActivity.kt', kind: 'kt' },
  ],
  'app/ios/Runner': [{ name: 'AppDelegate.swift', kind: 'swift' }],
};

/** The top folders, in the order the Explorer lists them. */
const TOP_FOLDERS = ['backend', 'frontend', 'app'];

export type TreeNode =
  | { type: 'dir'; label: string; path: string; children: TreeNode[] }
  | { type: 'page'; page: PageKey }
  | { type: 'file'; name: string; kind: FileKind };

interface Draft {
  dirs: Map<string, Draft>;
  files: TreeNode[];
}

const draft = (): Draft => ({ dirs: new Map(), files: [] });

function build(): TreeNode[] {
  const root = draft();
  const at = (segments: string[]): Draft =>
    segments.reduce((node, name) => {
      let child = node.dirs.get(name);
      if (!child) {
        child = draft();
        node.dirs.set(name, child);
      }
      return child;
    }, root);

  for (const page of PAGES)
    at(DEV_FILES[page].folder).files.push({ type: 'page', page });
  for (const [dir, files] of Object.entries(DECOR)) {
    at(dir.split('/').filter(Boolean)).files.push(
      ...files.map((f) => ({
        type: 'file' as const,
        name: f.name,
        kind: f.kind,
      })),
    );
  }

  // a folder that holds only one folder is shown together with it (`src/main`, `java/dev/bach`), like the real Explorer does
  const nodesOf = (node: Draft, parent: string, top: boolean): TreeNode[] => {
    const dirs = [...node.dirs.entries()].sort(([a], [b]) =>
      top
        ? TOP_FOLDERS.indexOf(a) - TOP_FOLDERS.indexOf(b)
        : a.localeCompare(b),
    );
    const out: TreeNode[] = dirs.map(([name, child]) => {
      let label = name;
      let inner = child;
      while (inner.dirs.size === 1 && inner.files.length === 0) {
        const [[next, deeper]] = [...inner.dirs.entries()];
        label += `/${next}`;
        inner = deeper;
      }
      const path = parent ? `${parent}/${label}` : label;
      return {
        type: 'dir',
        label,
        path,
        children: nodesOf(inner, path, false),
      };
    });
    return out.concat(node.files);
  };
  return nodesOf(root, '', true);
}

/** The Explorer tree: the pages are links, the rest is decoration that makes the project look real. */
export const DEV_TREE: TreeNode[] = build();

/** The path typed after `code` in the head of a page. */
export function shownPath(file: DevFile): string {
  const parts = [...file.folder, file.name];
  const full = parts.join('/');
  return full.length > 32 ? `…/${parts.slice(-2).join('/')}` : full;
}
