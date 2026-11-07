/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { defineCopy } from '@/lib/i18n/define-copy';

/**
 * Words that only the Trade skin has for About, Services, Payment and the system screens (the symbol profile, the order ticket,
 * the deposit table, "Symbol not found"). The content itself and every other interface string are the Standard ones. Nothing here is
 * a quote, a rating or advice: they are the names of the parts of a terminal.
 */
export const tradeDeskCopy = defineCopy(
  {
    about: {
      symbol: 'Symbol',
      description: 'Description',
      facts: {
        title: 'Key facts',
        location: 'Location',
        languages: 'Site languages',
        years: 'Years in software',
        yearsOne: 'year',
        yearsMany: 'years',
        areas: 'Areas',
        firstRole: 'First role',
        role: 'Current role',
        company: 'Company',
      },
      timeline: { kicker: 'Corporate actions', major: 'Major' },
      composition: 'Composition',
      photos: 'Photos',
    },
    services: {
      catalogue: 'Catalogue',
      ticket: 'Order ticket',
      trade: 'Trade',
      tradeFor: '{trade}: {name}',
    },
    payment: {
      recommended: 'Recommended',
      method: 'Method',
    },
    states: {
      emptyKicker: 'No data for this symbol',
      errorKicker: 'Widget error',
      notFoundKicker: 'Symbol not found',
      soonKicker: 'Pre-market',
      closedKicker: 'Market closed',
      path: 'Path',
    },
  },
  {
    about: {
      symbol: 'Mã',
      description: 'Mô tả',
      facts: {
        title: 'Thông tin chính',
        location: 'Nơi ở',
        languages: 'Ngôn ngữ của trang',
        years: 'Năm làm phần mềm',
        yearsOne: 'năm',
        yearsMany: 'năm',
        areas: 'Lĩnh vực',
        firstRole: 'Công việc đầu tiên',
        role: 'Vị trí hiện tại',
        company: 'Nơi làm',
      },
      timeline: { kicker: 'Sự kiện công ty', major: 'Chuyên ngành' },
      composition: 'Cấu thành',
      photos: 'Ảnh',
    },
    services: {
      catalogue: 'Danh mục',
      ticket: 'Phiếu lệnh',
      trade: 'Giao dịch',
      tradeFor: '{trade}: {name}',
    },
    payment: {
      recommended: 'Ưu tiên',
      method: 'Phương thức',
    },
    states: {
      emptyKicker: 'Không có dữ liệu cho mã này',
      errorKicker: 'Lỗi tiện ích',
      notFoundKicker: 'Không tìm thấy mã',
      soonKicker: 'Trước giờ giao dịch',
      closedKicker: 'Thị trường đóng cửa',
      path: 'Đường dẫn',
    },
  },
);
