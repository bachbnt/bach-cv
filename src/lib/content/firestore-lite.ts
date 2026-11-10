/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { getApp, getApps, initializeApp } from 'firebase/app';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore/lite';
import { enableAppCheck } from './app-check.ts';
import type { ContentRepository } from './repository.ts';
import {
  liveSchema,
  messageSchema,
  parseDoc,
  profileSchema,
  settingsSchema,
  type CollectionName,
  type Doc,
} from './schema.ts';

/** Public web config. These values identify the project; security comes from the Firestore rules. */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const getDb = () => {
  if (!firebaseConfig.projectId) {
    throw new Error(
      'Firebase is not configured: set NEXT_PUBLIC_FIREBASE_* in .env.local',
    );
  }
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  enableAppCheck(app);
  return getFirestore(app);
};

/** One-shot reads only, so the lite SDK is enough and the page stays small. */
export const createFirestoreLiteRepository = (): ContentRepository => {
  const readSingle = async <T>(
    path: string,
    parse: (data: unknown) => T,
  ): Promise<T> => {
    const snap = await getDoc(doc(getDb(), path));
    // a missing document is not an error: the schema defaults apply (fail-open)
    return parse(snap.exists() ? snap.data() : {});
  };

  return {
    // never throws: if the switches cannot be read, the site shows everything
    loadLive: () =>
      readSingle('site/live', (d) => liveSchema.parse(d)).catch(() =>
        liveSchema.parse({}),
      ),
    loadProfile: () =>
      readSingle('site/profile', (d) => profileSchema.parse(d)),
    loadSettings: () =>
      readSingle('site/settings', (d) => settingsSchema.parse(d)),

    async list<N extends CollectionName>(name: N): Promise<Doc<N>[]> {
      // the rules require this exact filter; without it the whole query is rejected
      const snap = await getDocs(
        query(collection(getDb(), name), where('visible', '==', true)),
      );
      const docs: Doc<N>[] = [];
      for (const d of snap.docs) {
        // one malformed document must not take the whole page down
        const item = parseDoc(name, d.id, d.data());
        if (item) docs.push(item);
      }
      return docs;
    },

    async createMessage(input) {
      const data = messageSchema.parse(input);
      await addDoc(collection(getDb(), 'messages'), {
        ...data,
        createdAt: serverTimestamp(),
      });
    },
  };
};
