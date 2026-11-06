/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

/** The file name of a picture URL; a name that is not valid percent-encoding is kept as it is. */
export function imageFileName(src: string): string {
  const name = src.split('?')[0].split('/').pop() || 'image';
  try {
    return decodeURIComponent(name);
  } catch {
    return name;
  }
}

/** Saves the picture, or opens it in a new tab when the browser refuses the download (for example no CORS). */
export async function saveImage(src: string): Promise<boolean> {
  try {
    const response = await fetch(src);
    if (!response.ok) throw new Error(String(response.status));
    const url = URL.createObjectURL(await response.blob());
    const link = document.createElement('a');
    link.href = url;
    link.download = imageFileName(src);
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
    return true;
  } catch {
    window.open(src, '_blank', 'noopener');
    return false;
  }
}
