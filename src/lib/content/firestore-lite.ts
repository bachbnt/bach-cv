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
import type { ContentRepository } from './repository.ts';
import {
  COLLECTIONS,
  liveSchema,
  messageSchema,
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
  return getFirestore(
    getApps().length ? getApp() : initializeApp(firebaseConfig),
  );
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
        const parsed = COLLECTIONS[name].safeParse(d.data());
        // one malformed document must not take the whole page down
        if (parsed.success)
          docs.push({ ...(parsed.data as object), id: d.id } as Doc<N>);
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
