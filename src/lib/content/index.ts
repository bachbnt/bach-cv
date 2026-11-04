/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { createFirestoreLiteRepository } from './firestore-lite';

/** The browser's door to the data. The rest of the app never imports Firestore directly. */
export const contentRepository = createFirestoreLiteRepository();
