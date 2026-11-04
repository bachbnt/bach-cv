/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { defineCopy } from '@/lib/i18n/define-copy';

/** Interface copy for the CV dialog and the CV document (preview and PDF), in both languages. */
export const cvCopy = defineCopy(
  {
    titleSuffix: 'CV',
    fallbackTitle: 'CV',
    download: 'Download PDF',
    preparing: 'Preparing PDF',
    downloadFailed: 'The PDF could not be created. Try again.',
    close: 'Close',
    description: 'Preview of the CV as printed pages.',
    previewLabel: 'CV preview',
    /** `{page}` and `{total}` are replaced */
    pageLabel: 'Page {page} of {total}',
    loading: 'Loading the CV',
    loadFailed:
      'The CV could not be loaded. Check your connection and try again.',
    fallbackFileName: 'cv.pdf',
    sections: {
      summary: 'Summary',
      experience: 'Work experience',
      education: 'Education',
      certificates: 'Certifications',
      skills: 'Skills',
      projects: 'Projects & research',
    },
    labels: {
      technologies: 'Technologies',
      projects: 'Projects',
      responsibilities: 'Responsibilities',
      major: 'Major',
      thesis: 'Thesis',
    },
    skillGroups: {
      mobile: 'Mobile',
      web: 'Web',
      ai: 'AI & automation',
      tools: 'Tools',
    },
  },
  {
    titleSuffix: 'CV',
    fallbackTitle: 'CV',
    download: 'Tải PDF',
    preparing: 'Đang tạo PDF',
    downloadFailed: 'Không thể tạo PDF. Vui lòng thử lại.',
    close: 'Đóng',
    description: 'Xem trước CV dưới dạng các trang in.',
    previewLabel: 'Xem trước CV',
    pageLabel: 'Trang {page} / {total}',
    loading: 'Đang tải CV',
    loadFailed: 'Không thể tải CV. Kiểm tra kết nối và thử lại.',
    fallbackFileName: 'cv.pdf',
    sections: {
      summary: 'Tóm tắt',
      experience: 'Kinh nghiệm làm việc',
      education: 'Học vấn',
      certificates: 'Chứng chỉ',
      skills: 'Kỹ năng',
      projects: 'Dự án & nghiên cứu',
    },
    labels: {
      technologies: 'Công nghệ',
      projects: 'Dự án',
      responsibilities: 'Trách nhiệm',
      major: 'Chuyên ngành',
      thesis: 'Luận văn',
    },
    skillGroups: {
      mobile: 'Di động',
      web: 'Web',
      ai: 'AI & tự động hóa',
      tools: 'Công cụ',
    },
  },
);

export type CvCopy = (typeof cvCopy)['en'];

/** The accessible name of a sheet: 'Page 2 of 3'. */
export const pageLabel = (copy: CvCopy, page: number, total: number): string =>
  copy.pageLabel
    .replace('{page}', String(page))
    .replace('{total}', String(total));
