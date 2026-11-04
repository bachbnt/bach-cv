/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { defineCopy } from '@/lib/i18n/define-copy';

/** `color` (the card's top rule and dot) is the same in both languages, so it lives in the component. */
export const homeBuildCopy = defineCopy(
  {
    title: "What I've built at FPT",
    intro:
      'Engineering workflows the 5-person team uses every day, from the first bug report to the merged MR.',
    items: [
      {
        title: 'Bug-fixing pipeline',
        body: 'Traces root cause, then opens a fix MR, a vendor Q&A or paired design and code MRs. Evidence thresholds and a stale-ticket guard make it safe to run unattended.',
      },
      {
        title: 'Teams bot',
        body: 'Trace, fix, Q&A, resolve, ship and performance RCA from chat. Permissions are enforced per command; merge and resolve need two-step confirmation.',
      },
      {
        title: 'MR review and design-sync agents',
        body: 'The reviewer checks each MR against source, specs and project rules and marks problems as Draft. The sync agent applies merged design diffs across repos as per-repo MRs.',
      },
      {
        title: 'detekt-fix workflow',
        body: 'Proves each change is behavior-neutral by token-level diff. Lint cleared across 35 repo MRs with no suppressions, held in place by a pre-push gate.',
      },
      {
        title: 'Yokoten rollouts',
        body: 'An inventory script, a one-function pilot, then one MR per repo across every module for back-navigation, navigation-enum and resource-clearing fixes.',
      },
      {
        title: 'Build Portal',
        body: 'Python and Playwright. Replaced 30 batch scripts with one registry-driven script for one-click multi-module Android builds.',
      },
    ],
  },
  {
    title: 'Những gì mình đã xây ở FPT',
    intro:
      'Các quy trình kỹ thuật mà nhóm 5 người dùng mỗi ngày, từ báo cáo lỗi đầu tiên đến MR được merge.',
    items: [
      {
        title: 'Quy trình sửa lỗi tự động',
        body: 'Truy tìm nguyên nhân gốc, rồi mở MR sửa lỗi, một phiên hỏi đáp với vendor hoặc cặp MR thiết kế và code. Ngưỡng bằng chứng và cơ chế chặn ticket cũ giúp quy trình chạy an toàn mà không cần người trông.',
      },
      {
        title: 'Bot Teams',
        body: 'Truy vết, sửa lỗi, hỏi đáp, resolve, ship và phân tích nguyên nhân hiệu năng ngay trong chat. Quyền được kiểm soát theo từng lệnh; merge và resolve cần xác nhận hai bước.',
      },
      {
        title: 'Agent review MR và đồng bộ thiết kế',
        body: 'Agent review kiểm tra từng MR với mã nguồn, đặc tả và quy tắc dự án, rồi đánh dấu Draft cho các vấn đề. Agent đồng bộ áp các thay đổi thiết kế đã merge lên nhiều repo dưới dạng MR riêng cho từng repo.',
      },
      {
        title: 'Quy trình detekt-fix',
        body: 'Chứng minh mỗi thay đổi không đổi hành vi bằng so sánh diff theo token. Đã xử lý lint trên 35 MR của các repo mà không dùng suppress, và giữ vững nhờ cổng kiểm tra trước khi push.',
      },
      {
        title: 'Triển khai Yokoten',
        body: 'Một script kiểm kê, một lần thử nghiệm trên một hàm, rồi mỗi repo một MR trên mọi module cho các bản sửa điều hướng quay lại, enum điều hướng và dọn tài nguyên.',
      },
      {
        title: 'Build Portal',
        body: 'Python và Playwright. Thay 30 script batch bằng một script điều khiển bằng registry để build Android nhiều module chỉ với một cú nhấp.',
      },
    ],
  },
);

export const BUILD_COLORS = [
  '#f28b7a',
  '#7fa8f5',
  '#b59bf0',
  '#6fd0a8',
  '#f0b25e',
  '#7fa8f5',
] as const;
