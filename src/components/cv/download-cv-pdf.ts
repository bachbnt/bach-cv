/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { DocumentProps } from '@react-pdf/renderer';
import type { ReactElement } from 'react';
import type { CvCopy } from '@/content/copy/cv';
import type { CvModel } from '@/lib/cv/build-cv';

/**
 * Builds the PDF in the browser and saves it. The PDF engine (about 1 MB) and the fonts are only
 * fetched here, the first time someone clicks Download, so they never weigh on a page load.
 */
export async function downloadCvPdf(
  cv: CvModel,
  copy: CvCopy,
  fileName: string,
) {
  const [{ pdf }, { CvPdfDocument }] = await Promise.all([
    import('@react-pdf/renderer'),
    import('@/components/cv/cv-pdf-document'),
  ]);
  // CvPdfDocument has no hooks, so it can be called as a function: it returns the <Document> element itself
  const pdfDocument = CvPdfDocument({
    cv,
    copy,
  }) as ReactElement<DocumentProps>;
  const blob = await pdf(pdfDocument).toBlob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.append(link);
  link.click();
  link.remove();
  // the download has started by the next task; keep the URL alive until then
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
