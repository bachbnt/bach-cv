/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { defineCopy } from '@/lib/i18n/define-copy';

/**
 * The words of the Terminal tab of the Dev skin (the bottom panel). The command names themselves (`help`, `cd`, ...) are not
 * translated: they are what the visitor types.
 */
export const devTerminalCopy = defineCopy(
  {
    label: 'Terminal',
    inputLabel: 'Terminal command line',
    hint: 'Type help to see the commands.',
    help: {
      title: 'Commands:',
      commands: {
        help: 'show this list',
        ls: 'list the pages',
        cd: 'go to a page: cd about, cd About.js, cd ~',
        cv: 'open my CV',
        connect: 'open the contact menu',
        ask: 'chat with BB Bot',
        clear: 'clear the screen (Ctrl+L)',
        exit: 'close the terminal',
      },
    },
    soon: '(soon)',
    opening: {
      cv: 'opening cv…',
      connect: 'opening connect…',
      ask: 'opening BB Bot…',
    },
    errors: {
      noSuchFile: 'cd: no such file or directory: {arg}',
      comingSoon: 'cd: {arg}: coming soon',
      tooManyArgs: 'cd: too many arguments',
      unavailable: '{command}: not available',
      notFound: 'zsh: command not found: {command}',
      notFoundHint: 'Type help to see the commands.',
    },
  },
  {
    label: 'Terminal',
    inputLabel: 'Dòng lệnh của terminal',
    hint: 'Gõ help để xem các lệnh.',
    help: {
      title: 'Các lệnh:',
      commands: {
        help: 'hiện danh sách này',
        ls: 'liệt kê các trang',
        cd: 'đi tới một trang: cd about, cd About.js, cd ~',
        cv: 'mở CV của mình',
        connect: 'mở menu liên hệ',
        ask: 'trò chuyện với BB Bot',
        clear: 'xoá màn hình (Ctrl+L)',
        exit: 'đóng terminal',
      },
    },
    soon: '(sắp có)',
    opening: {
      cv: 'đang mở cv…',
      connect: 'đang mở connect…',
      ask: 'đang mở BB Bot…',
    },
    errors: {
      noSuchFile: 'cd: không có tệp hoặc thư mục: {arg}',
      comingSoon: 'cd: {arg}: sắp có',
      tooManyArgs: 'cd: quá nhiều tham số',
      unavailable: '{command}: không khả dụng',
      notFound: 'zsh: không tìm thấy lệnh: {command}',
      notFoundHint: 'Gõ help để xem các lệnh.',
    },
  },
);

/** The copy in one language, as `run-command.ts` takes it. */
export type DevTerminalCopy = (typeof devTerminalCopy)['en'];
