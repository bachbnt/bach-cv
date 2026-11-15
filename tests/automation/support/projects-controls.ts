/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { expect, type Page } from '@playwright/test';
import type { ProjectSort } from '@/lib/content/schema';

// The controls of the Projects page that every skin draws its own way but names the same way: a search box, ONE button for the filters and ONE
// for the order, each opening a menu. The words are the copy of Standard (`content/copy/projects.ts`), in both languages.

type Lang = 'en' | 'vi';

const WORDS = {
  en: {
    filters: 'Filters',
    sort: 'Sort projects',
    orders: {
      manual: 'My order',
      latest: 'Newest first',
      oldest: 'Oldest first',
      name: 'Name A to Z',
      featured: 'Featured first',
      technologies: 'Most technologies',
    },
  },
  vi: {
    filters: 'Bộ lọc',
    sort: 'Sắp xếp dự án',
    orders: {
      manual: 'Thứ tự của tôi',
      latest: 'Mới nhất trước',
      oldest: 'Cũ nhất trước',
      name: 'Tên A đến Z',
      featured: 'Nổi bật trước',
      technologies: 'Nhiều công nghệ nhất',
    },
  },
} as const;

export function projectsControls(lang: Lang = 'en') {
  const words = WORDS[lang];
  /** the button of the filters: its name starts with the word and ends with how many are on ("Filters, 2") */
  const filtersButton = (page: Page) =>
    page.getByRole('button', { name: new RegExp(`^${words.filters}`) });
  /** the menu of the filters, with a group for each filter */
  const filtersMenu = (page: Page) =>
    page.getByRole('dialog', { name: words.filters, exact: true });
  const sortButton = (page: Page) =>
    page.getByRole('button', { name: words.sort, exact: true });
  const sortMenu = (page: Page) =>
    page.getByRole('radiogroup', { name: words.sort });
  return {
    words,
    filtersButton,
    filtersMenu,
    sortButton,
    sortMenu,
    /** opens the menu of the filters (it stays open while a choice is made in it) and returns it */
    async openFilters(page: Page) {
      if ((await filtersMenu(page).count()) === 0)
        await filtersButton(page).click();
      await expect(filtersMenu(page)).toBeVisible();
      return filtersMenu(page);
    },
    async closeMenus(page: Page) {
      await page.keyboard.press('Escape');
      await expect(filtersMenu(page)).toHaveCount(0);
    },
    /** opens the menu of the order, and the options of it */
    async openSort(page: Page) {
      await sortButton(page).click();
      await expect(sortMenu(page)).toBeVisible();
      return sortMenu(page);
    },
    /** picks an order from its menu (the menu closes) */
    async chooseSort(page: Page, sort: ProjectSort) {
      await sortButton(page).click();
      await sortMenu(page)
        .getByRole('radio', { name: words.orders[sort], exact: true })
        .click();
      await expect(sortMenu(page)).toHaveCount(0);
    },
    /** what the button of the order says: the order that shows */
    async expectSort(page: Page, sort: ProjectSort) {
      await expect(sortButton(page)).toContainText(words.orders[sort]);
    },
  };
}
