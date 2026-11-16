/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { defineCopy } from '@/lib/i18n/define-copy';

/**
 * The screens for a page that threw, in both languages: the outermost one (`plain`, it cannot depend on the app, so it is plain data that
 * `PlainErrorScreen` reads without hooks) and one in the voice of each skin. The two ways out are the same everywhere: try again and home.
 */
export const errorsCopy = defineCopy(
  {
    plain: {
      title: 'Something went wrong',
      body: "The page couldn't be shown. Try again, and if it keeps happening, come back later.",
      retry: 'Try again',
      home: 'Back to home',
    },
    standard: {
      title: 'This page broke',
      body: 'Something went wrong while the page was drawn. It is nothing you did. Try again, or go back to the start.',
      retry: 'Try again',
      home: 'Back to home',
    },
    dev: {
      title: 'Render failed',
      body: 'process exited with code 1. If it happens again, retry: the saved copy of the data is cleared first.',
      retry: 'Retry',
      home: 'Home',
    },
    trade: {
      kicker: 'Feed error',
      title: 'This screen has no data',
      body: 'The page could not be drawn. Reconnect, or go back to the watchlist.',
      retry: 'Reconnect',
      home: 'Home',
    },
    academic: {
      title: 'Page not finished',
      body: 'The ink ran out while the page was being written. Rewrite it, or go back to the first page.',
      retry: 'Rewrite',
      home: 'First page',
    },
    travel: {
      kicker: 'Delayed',
      title: 'This trip did not take off',
      body: 'The page could not be drawn. Rebook it, or go back to the terminal.',
      retry: 'Rebook',
      home: 'Terminal',
    },
    phone: {
      title: 'This app stopped',
      body: 'The page could not be drawn. Reopen the app, or go back to the home screen.',
      retry: 'Reopen',
      home: 'Home screen',
    },
  },
  {
    plain: {
      title: 'Có lỗi xảy ra',
      body: 'Không thể hiển thị trang này. Hãy thử lại, nếu vẫn lỗi thì quay lại sau nhé.',
      retry: 'Thử lại',
      home: 'Về trang chủ',
    },
    standard: {
      title: 'Trang này bị lỗi',
      body: 'Có gì đó trục trặc khi vẽ trang. Không phải lỗi của bạn. Hãy thử lại hoặc về trang chủ.',
      retry: 'Thử lại',
      home: 'Về trang chủ',
    },
    dev: {
      title: 'Render thất bại',
      body: 'process exited with code 1. Nếu còn lỗi, hãy thử lại: bản dữ liệu đã lưu sẽ được xóa trước.',
      retry: 'Thử lại',
      home: 'Trang chủ',
    },
    trade: {
      kicker: 'Lỗi nguồn dữ liệu',
      title: 'Màn hình này chưa có dữ liệu',
      body: 'Không thể vẽ trang. Hãy kết nối lại hoặc về danh sách theo dõi.',
      retry: 'Kết nối lại',
      home: 'Trang chủ',
    },
    academic: {
      title: 'Trang chưa viết xong',
      body: 'Hết mực khi đang viết trang này. Hãy viết lại hoặc về trang đầu.',
      retry: 'Viết lại',
      home: 'Trang đầu',
    },
    travel: {
      kicker: 'Hoãn',
      title: 'Chuyến này chưa cất cánh',
      body: 'Không thể vẽ trang. Hãy đặt lại hoặc về nhà ga.',
      retry: 'Đặt lại',
      home: 'Nhà ga',
    },
    phone: {
      title: 'Ứng dụng đã dừng',
      body: 'Không thể vẽ trang. Hãy mở lại ứng dụng hoặc về màn hình chính.',
      retry: 'Mở lại',
      home: 'Màn hình chính',
    },
  },
);
