/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

export interface PageBlock {
  /** rendered height in px, margins included */
  height: number;
  /** a heading: stays on the same page as the block after it */
  keepWithNext?: boolean;
}

/**
 * Packs blocks into pages of `capacity` px, in order. A block never splits; a heading moves to the
 * next page when the block after it would not fit beside it. A block taller than a page gets a page of its own.
 * Returns the block indexes of each page. Always at least one page.
 */
export const paginate = (blocks: PageBlock[], capacity: number): number[][] => {
  const pages: number[][] = [[]];
  let used = 0;
  blocks.forEach((block, index) => {
    // a chain of headings is kept together with the first block that follows it
    let need = block.height;
    for (let i = index; blocks[i]?.keepWithNext && blocks[i + 1]; i++)
      need += blocks[i + 1].height;
    const page = pages[pages.length - 1];
    if (page.length > 0 && used + need > capacity) {
      pages.push([index]);
      used = block.height;
    } else {
      page.push(index);
      used += block.height;
    }
  });
  return pages;
};
