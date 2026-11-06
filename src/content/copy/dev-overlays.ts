/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { defineCopy } from '@/lib/i18n/define-copy';

/**
 * Words that only the windows of the Dev skin have (the picture viewer, the CV window and the chat window). Whatever the
 * Standard skin already says (the chat, the CV) is read from its own copy file.
 */
export const devOverlaysCopy = defineCopy(
  {
    viewer: {
      description:
        'Picture viewer. Use the arrow keys to browse and plus, minus and zero to zoom.',
      previous: 'Previous',
      next: 'Next',
      hideDetails: 'Hide the thumbnails and tags',
      showDetails: 'Show the thumbnails and tags',
      fit: 'Fit to window',
      zoomIn: 'Zoom in',
      zoomOut: 'Zoom out',
      openOriginal: 'Open the original',
      download: 'Download',
      copyLink: 'Copy the image link',
      linkCopied: 'Image link copied',
      saved: 'Saved {file}',
      pictures: 'Pictures',
      goTo: 'Go to {current} of {total}',
      counter: '{current} of {total}',
      keys: { browse: 'browse', zoom: 'zoom', fit: 'fit', close: 'close' },
    },
    cv: { backToTop: 'Back to top' },
    chat: {
      fold: 'Fold the chat',
      unfold: 'Unfold the chat',
      bigger: 'Make the chat bigger',
      smaller: 'Make the chat smaller',
      you: 'You',
      messages: 'Messages',
      latest: 'Scroll to the latest message',
      shortcut: 'Shortcut: {keys}',
    },
  },
  {
    viewer: {
      description:
        'Trình xem ảnh. Dùng phím mũi tên để chuyển ảnh, phím cộng, trừ và số 0 để phóng to, thu nhỏ.',
      previous: 'Trước',
      next: 'Tiếp theo',
      hideDetails: 'Ẩn ảnh thu nhỏ và thẻ',
      showDetails: 'Hiện ảnh thu nhỏ và thẻ',
      fit: 'Vừa cửa sổ',
      zoomIn: 'Phóng to',
      zoomOut: 'Thu nhỏ',
      openOriginal: 'Mở ảnh gốc',
      download: 'Tải xuống',
      copyLink: 'Sao chép liên kết ảnh',
      linkCopied: 'Đã sao chép liên kết ảnh',
      saved: 'Đã lưu {file}',
      pictures: 'Các ảnh',
      goTo: 'Đến ảnh {current} / {total}',
      counter: '{current} / {total}',
      keys: {
        browse: 'chuyển ảnh',
        zoom: 'thu phóng',
        fit: 'vừa',
        close: 'đóng',
      },
    },
    cv: { backToTop: 'Lên đầu trang' },
    chat: {
      fold: 'Thu gọn chat',
      unfold: 'Mở rộng chat',
      bigger: 'Phóng to chat',
      smaller: 'Thu nhỏ chat',
      you: 'Bạn',
      messages: 'Cuộc trò chuyện',
      latest: 'Cuộn đến tin nhắn mới nhất',
      shortcut: 'Phím tắt: {keys}',
    },
  },
);
