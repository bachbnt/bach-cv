/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { defineCopy } from '@/lib/i18n/define-copy';

/**
 * Words of the Trade terminal frame, the symbol search, the watchlist, the ticker tape and Home. Content (roles, projects, skills) is
 * the same as in the Standard skin and is not repeated here. `{name}` slots are filled with `fill`.
 */
export const tradeShellCopy = defineCopy(
  {
    toolbar: {
      layout: 'Layout',
      layoutLabel: 'Choose what the terminal shows',
      watchlist: 'Watchlist',
      panel: 'Page panel',
      tools: 'Tool rail',
      tape: 'Ticker tape',
      resetLayout: 'Reset layout',
      fullscreen: {
        enter: 'Enter full screen',
        exit: 'Exit full screen',
        unavailable: 'Full screen is not available in this browser',
      },
      chartControls: 'Chart controls',
    },
    resize: {
      height: 'Resize the chart and the page: drag, or use the arrow keys',
      width: 'Resize the watchlist: drag, or use the arrow keys',
    },
    panelBar: {
      hidden: 'The page panel is hidden.',
      show: 'Show the page panel',
    },
    search: {
      button: 'Search the site',
      title: 'Search',
      description:
        'Find a page, a project, a role, a skill, a certificate, a service or my education.',
      inputLabel: 'Search the whole site',
      placeholder: 'Search pages, projects, roles, skills',
      listLabel: 'Search results',
      recent: 'Recent',
      groups: {
        page: 'Pages',
        role: 'Roles',
      },
      noResults: 'Nothing found for "{query}"',
      noResultsHint:
        'Try the name of a project, a company, a technology or a page.',
      count: '{count} results',
      countOne: '1 result',
      partial: 'Some of the content could not be loaded.',
      hints: { move: 'to move', open: 'to open', close: 'to close' },
      kinds: {
        page: 'Page',
        project: 'Project',
        role: 'Role',
        skill: 'Skill',
        certificate: 'Certificate',
        service: 'Service',
        education: 'Education',
      },
    },
    tape: {
      label:
        'Ticker tape: pages with their counts, skills with the years I used them',
      yearsUsed: 'Years used: {years}',
      years: '{n} y',
      months: '{n} mo',
    },
    watch: {
      tabs: 'Watchlists',
      pages: 'Pages',
      skills: 'Skills',
      roles: 'Roles',
      unitsHint:
        'Years used, and a sparkline of how many of my roles listed the skill in each year of my career.',
      legendEmpty:
        'Point at a skill, or move to it with the arrow keys, to see the roles that list it.',
      legendNoRoles: 'No role lists it yet.',
      legendUsed: '{name}: {used} in {count} roles',
      legendUsedOne: '{name}: {used} in 1 role',
      rolesHint: 'Open a role to see it on the Resume page.',
    },
    details: {
      idea: 'Idea',
    },
    home: {
      symbol: 'Symbol overview',
      stats: {
        label: 'The site in numbers',
        roles: 'Roles',
      },
      length: '{years} y {months} mo',
      lengthYears: '{years} y',
      lengthMonths: '{months} mo',
    },
  },
  {
    toolbar: {
      layout: 'Bố cục',
      layoutLabel: 'Chọn những gì terminal hiển thị',
      watchlist: 'Danh sách theo dõi',
      panel: 'Khung trang',
      tools: 'Thanh công cụ',
      tape: 'Dải chạy chữ',
      resetLayout: 'Đặt lại bố cục',
      fullscreen: {
        enter: 'Vào chế độ toàn màn hình',
        exit: 'Thoát chế độ toàn màn hình',
        unavailable: 'Trình duyệt này không hỗ trợ toàn màn hình',
      },
      chartControls: 'Điều khiển biểu đồ',
    },
    resize: {
      height: 'Đổi cỡ biểu đồ và trang: kéo, hoặc dùng phím mũi tên',
      width: 'Đổi cỡ danh sách theo dõi: kéo, hoặc dùng phím mũi tên',
    },
    panelBar: {
      hidden: 'Khung trang đang ẩn.',
      show: 'Hiện khung trang',
    },
    search: {
      button: 'Tìm trong trang',
      title: 'Tìm kiếm',
      description:
        'Tìm một trang, dự án, vai trò, kỹ năng, chứng chỉ, dịch vụ hoặc học vấn của mình.',
      inputLabel: 'Tìm trong toàn bộ trang',
      placeholder: 'Tìm trang, dự án, vai trò, kỹ năng',
      listLabel: 'Kết quả tìm kiếm',
      recent: 'Gần đây',
      groups: {
        page: 'Trang',
        role: 'Vai trò',
      },
      noResults: 'Không tìm thấy gì cho "{query}"',
      noResultsHint:
        'Thử tên một dự án, một công ty, một công nghệ hoặc một trang.',
      count: '{count} kết quả',
      countOne: '1 kết quả',
      partial: 'Một số nội dung chưa tải được.',
      hints: { move: 'để di chuyển', open: 'để mở', close: 'để đóng' },
      kinds: {
        page: 'Trang',
        project: 'Dự án',
        role: 'Vai trò',
        skill: 'Kỹ năng',
        certificate: 'Chứng chỉ',
        service: 'Dịch vụ',
        education: 'Học vấn',
      },
    },
    tape: {
      label:
        'Dải chạy: các trang kèm số lượng, các kỹ năng kèm số năm mình đã dùng',
      yearsUsed: 'Số năm đã dùng: {years}',
      years: '{n} năm',
      months: '{n} tháng',
    },
    watch: {
      tabs: 'Các danh sách theo dõi',
      pages: 'Trang',
      skills: 'Kỹ năng',
      roles: 'Vai trò',
      unitsHint:
        'Số năm đã dùng, và một biểu đồ nhỏ cho biết mỗi năm của sự nghiệp có bao nhiêu vai trò của mình dùng kỹ năng đó.',
      legendEmpty:
        'Trỏ vào một kỹ năng, hoặc dùng phím mũi tên để chọn, để xem các vai trò có dùng nó.',
      legendNoRoles: 'Chưa có vai trò nào dùng nó.',
      legendUsed: '{name}: {used} trong {count} vai trò',
      legendUsedOne: '{name}: {used} trong 1 vai trò',
      rolesHint: 'Mở một vai trò để xem nó trong trang Hồ sơ.',
    },
    details: {
      idea: 'Ý tưởng',
    },
    home: {
      symbol: 'Tổng quan',
      stats: {
        label: 'Trang này qua các con số',
        roles: 'Vai trò',
      },
      length: '{years} năm {months} tháng',
      lengthYears: '{years} năm',
      lengthMonths: '{months} tháng',
    },
  },
);
