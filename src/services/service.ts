/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { FirestoreCollection, FirestoreDocument } from '@core/firestore';
import Constant from '@core/constants';
import { Certificate } from '@models/certificate';
import { ChatMessage, ChatProvider } from '@models/chat';
import { Config, parseConfig } from '@models/config';
import { Contact } from '@models/contact';
import { Cv, parseCv } from '@models/cv';
import { Education } from '@models/education';
import { Experience } from '@models/experience';
import { Message } from '@models/message';
import { Payment } from '@models/payment';
import { Profile, parseProfile } from '@models/profile';
import { Project } from '@models/project';
import { Service as ServiceModel } from '@models/service';
import { Skill } from '@models/skill';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import filter from 'lodash/filter';
import sortBy from 'lodash/sortBy';
import { firestore } from './firebase';
import MOCK from './mock';
import cvBackup from '../data/my-cv.json';

type MockArrayDocument<T> = {
  id: string;
  data: Omit<T, 'id'>;
};

type MockArrayDocuments<T> = MockArrayDocument<T> | MockArrayDocument<T>[];

const mockArrayDocuments: Partial<
  Record<FirestoreDocument, MockArrayDocuments<any>>
> = {
  [FirestoreDocument.CONTACT]: MOCK.CONTACT,
  [FirestoreDocument.EDUCATION]: MOCK.EDUCATION,
  [FirestoreDocument.EXPERIENCE]: MOCK.EXPERIENCE,
  [FirestoreDocument.PROJECT]: MOCK.PROJECT,
  [FirestoreDocument.SERVICE]: MOCK.SERVICE,
  [FirestoreDocument.SKILL]: MOCK.SKILL,
  [FirestoreDocument.PAYMENT]: MOCK.PAYMENT,
};

const getMockArrayData = <T extends { visible?: boolean }>(
  document: FirestoreDocument,
): T[] => {
  const entry = mockArrayDocuments[document];
  if (!entry) return [];
  const entries = Array.isArray(entry) ? entry : [entry];
  return sortBy(
    filter(
      entries.map((mockEntry) => ({
        id: mockEntry.id,
        ...mockEntry.data,
      })),
      { visible: true },
    ),
    Constant.SORT_KEY,
  ) as T[];
};

const fetchArrayData = async <T extends { visible?: boolean }>(
  collection: FirestoreCollection,
  document: FirestoreDocument,
): Promise<T[]> => {
  if (Constant.USE_MOCK_DATA) {
    return getMockArrayData<T>(document);
  }

  const ref = doc(firestore, collection, document);
  const snapshot = await getDoc(ref);
  const data = snapshot.data() || {};
  const list = Object.entries(data).map(([id, value]) => ({
    id,
    ...(value as any),
  }));
  return sortBy(filter(list, { visible: true }), Constant.SORT_KEY) as T[];
};

export const getLocalization = async (
  language: string = Constant.DEFAULT_LANGUAGE,
): Promise<Record<string, any>> => {
  if (Constant.USE_MOCK_DATA) {
    return (MOCK.LOCALIZATION as Record<string, any>)[language];
  }

  const ref = doc(
    firestore,
    FirestoreCollection.CONFIG,
    FirestoreDocument.LOCALIZATION,
  );
  const snapshot = await getDoc(ref);
  const data = snapshot.data() || {};
  return data[language];
};

export const getConfig = async (): Promise<Config> => {
  if (Constant.USE_MOCK_DATA) {
    return parseConfig(MOCK.CONFIG);
  }

  const ref = doc(
    firestore,
    FirestoreCollection.CONFIG,
    FirestoreDocument.CONFIG,
  );
  const snapshot = await getDoc(ref);
  return parseConfig(snapshot.data() ?? {});
};

export const getCv = async (): Promise<Cv> => {
  if (Constant.USE_MOCK_DATA) {
    return parseCv(cvBackup);
  }

  const ref = doc(firestore, FirestoreCollection.USER, FirestoreDocument.CV);
  const snapshot = await getDoc(ref);
  return parseCv(snapshot.data() ?? cvBackup);
};

export const postMessage = async (message: Message): Promise<void> => {
  if (Constant.USE_MOCK_DATA) return;

  const ref = doc(
    firestore,
    FirestoreCollection.MESSAGE,
    new Date().toString(),
  );
  await setDoc(ref, message);
};

export const getCertificate = (): Promise<Certificate[]> =>
  fetchArrayData<Certificate>(
    FirestoreCollection.USER,
    FirestoreDocument.CERTIFICATE,
  );

export const getContact = (): Promise<Contact[]> =>
  fetchArrayData<Contact>(FirestoreCollection.USER, FirestoreDocument.CONTACT);

export const getEducation = (): Promise<Education[]> =>
  fetchArrayData<Education>(
    FirestoreCollection.USER,
    FirestoreDocument.EDUCATION,
  );

export const getExperience = (): Promise<Experience[]> =>
  fetchArrayData<Experience>(
    FirestoreCollection.USER,
    FirestoreDocument.EXPERIENCE,
  );

export const getProfile = async (): Promise<Profile> => {
  if (Constant.USE_MOCK_DATA) {
    return parseProfile(MOCK.PROFILE);
  }

  const ref = doc(
    firestore,
    FirestoreCollection.USER,
    FirestoreDocument.PROFILE,
  );
  const snapshot = await getDoc(ref);
  return parseProfile(snapshot.data() ?? {});
};

export const getProject = (): Promise<Project[]> =>
  fetchArrayData<Project>(FirestoreCollection.USER, FirestoreDocument.PROJECT);

export const getService = (): Promise<ServiceModel[]> =>
  fetchArrayData<ServiceModel>(
    FirestoreCollection.USER,
    FirestoreDocument.SERVICE,
  );

export const getSkill = (): Promise<Skill[]> =>
  fetchArrayData<Skill>(FirestoreCollection.USER, FirestoreDocument.SKILL);

export const getPayment = (): Promise<Payment[]> =>
  fetchArrayData<Payment>(FirestoreCollection.USER, FirestoreDocument.PAYMENT);

export const sendChatMessage = async (
  provider: ChatProvider,
  messages: ChatMessage[],
  systemPrompt: string,
): Promise<string> => {
  if (!Constant.CHAT_PROXY_URL) {
    throw new Error('Missing VITE_CHAT_PROXY_URL — deploy worker/ first');
  }
  const response = await fetch(`${Constant.CHAT_PROXY_URL}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ provider, messages, systemPrompt }),
  });
  if (response.status === 429) throw new Error('rate_limit');
  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`chat_proxy_error: ${response.status} ${body}`);
  }
  const data = (await response.json()) as { text?: string };
  return data.text ?? '...';
};

export const postMockData = async <T>(
  data: Omit<T, 'id'>,
  id: string,
  path: {
    collection: FirestoreCollection;
    document: FirestoreDocument;
  },
): Promise<void> => {
  if (Constant.USE_MOCK_DATA) return;

  const ref = doc(firestore, path.collection, path.document);
  await updateDoc(ref, { [id]: data });
};
