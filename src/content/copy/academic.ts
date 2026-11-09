/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { defineCopy } from '@/lib/i18n/define-copy';

/**
 * The words only the Academic skin has: the term of the manuscript that goes with each page (a small kicker above its title; the title and
 * the tab keep the Standard names, so nothing is hard to find) and the lines of the frame. Words that Standard has (the pages, the
 * menus, the states) are read from its own copy.
 */
export const academicCopy = defineCopy(
  {
    /** the section of a manuscript each page stands for, written small above its title */
    terms: {
      home: 'Abstract',
      about: 'Authors',
      resume: 'Results',
      projects: 'References',
      certificates: 'Peer review',
      services: 'Proposal',
      payment: 'Funding',
    },
    /** the tab of the first page (Standard has no tab for it, the logo goes there) */
    home: 'Home',
    brandNote: 'curriculum vitae · annotated manuscript',
    /** written up the side of the board: decoration, read by no one */
    spine: 'annotated manuscript · curriculum vitae · not peer reviewed',
    /** the line on the ledge under the board, beside the chat slip */
    ledgeHint: 'Questions in the margin? Ask here.',
    pager: {
      previous: 'Previous page: {page}',
      next: 'Next page: {page}',
      /** `Bach Bui · board 3 of 7` */
      position: '{name} · page {n} of {total}',
      keys: 'change page',
    },
  },
  {
    terms: {
      home: 'Tóm tắt',
      about: 'Tác giả',
      resume: 'Kết quả',
      projects: 'Tài liệu tham khảo',
      certificates: 'Phản biện',
      services: 'Đề xuất',
      payment: 'Kinh phí',
    },
    home: 'Trang chủ',
    brandNote: 'sơ yếu lý lịch · bản thảo có chú thích',
    spine: 'bản thảo có chú thích · sơ yếu lý lịch · chưa qua phản biện',
    ledgeHint: 'Có câu hỏi bên lề? Hỏi ngay ở đây.',
    pager: {
      previous: 'Trang trước: {page}',
      next: 'Trang sau: {page}',
      position: '{name} · trang {n} / {total}',
      keys: 'đổi trang',
    },
  },
);
