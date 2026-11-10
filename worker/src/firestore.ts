/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

// Reads the public site content over the Firestore REST API (no SDK, no credentials) and decodes its typed values.
// Only what firestore.rules lets anyone read is asked for: site/{shell,profile} and the visible documents of the collections.

const REST_ROOT = 'https://firestore.googleapis.com/v1/projects';
const TIMEOUT_MS = 4_000;
/** Firestore project ids are lowercase letters, digits and hyphens. Anything else is never put in a URL. */
const PROJECT_ID = /^[a-z][a-z0-9-]{4,29}$/;

export interface FirestoreDoc {
  id: string;
  data: Record<string, unknown>;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/** A number that Firestore writes as a string (`integerValue`, and `doubleValue` for NaN and the infinities). */
const numberOf = (value: unknown): number | null => {
  if (typeof value === 'number') return value;
  if (typeof value !== 'string' || !value.trim()) return null;
  const n = Number(value);
  return Number.isNaN(n) && value !== 'NaN' ? null : n;
};

/**
 * One Firestore REST typed value (`{ stringValue: 'x' }`, `{ integerValue: '3' }`, `{ mapValue: { fields } }` ...) as a plain value.
 * Timestamps, references and bytes stay strings, a geo point becomes `{ latitude, longitude }`, and an unknown type is `null`.
 */
export const decodeValue = (value: unknown): unknown => {
  if (!isRecord(value)) return null;
  if ('stringValue' in value) return String(value.stringValue ?? '');
  if ('booleanValue' in value) return value.booleanValue === true;
  if ('integerValue' in value || 'doubleValue' in value)
    return numberOf(value.integerValue ?? value.doubleValue);
  if ('nullValue' in value) return null;
  if ('timestampValue' in value) return String(value.timestampValue ?? '');
  if ('referenceValue' in value) return String(value.referenceValue ?? '');
  if ('bytesValue' in value) return String(value.bytesValue ?? '');
  if ('geoPointValue' in value) {
    const point = isRecord(value.geoPointValue) ? value.geoPointValue : {};
    return {
      latitude: numberOf(point.latitude ?? 0),
      longitude: numberOf(point.longitude ?? 0),
    };
  }
  if ('arrayValue' in value) {
    const array = isRecord(value.arrayValue) ? value.arrayValue.values : [];
    return Array.isArray(array) ? array.map(decodeValue) : [];
  }
  if ('mapValue' in value) {
    const map = isRecord(value.mapValue) ? value.mapValue.fields : {};
    return decodeFields(map);
  }
  return null;
};

/** A `fields` object of a document (or of a map value) as a plain object. */
export const decodeFields = (fields: unknown): Record<string, unknown> =>
  isRecord(fields)
    ? Object.fromEntries(
        Object.entries(fields).map(([key, value]) => [key, decodeValue(value)]),
      )
    : {};

/** A REST document (`{ name: '.../documents/skills/react', fields }`) as its id and plain data, or `null` when it is not one. */
export const decodeDocument = (raw: unknown): FirestoreDoc | null => {
  if (!isRecord(raw) || typeof raw.name !== 'string') return null;
  const id = raw.name.split('/').pop() ?? '';
  return id ? { id, data: decodeFields(raw.fields) } : null;
};

/** The documents of a `runQuery` answer: a list of `{ document?, readTime }`, where an empty result has no `document`. */
export const decodeQueryResult = (raw: unknown): FirestoreDoc[] =>
  Array.isArray(raw)
    ? raw.flatMap((row) => {
        const doc = isRecord(row) ? decodeDocument(row.document) : null;
        return doc ? [doc] : [];
      })
    : [];

const documentsUrl = (projectId: string): string | null =>
  PROJECT_ID.test(projectId)
    ? `${REST_ROOT}/${projectId}/databases/(default)/documents`
    : null;

/**
 * One document, e.g. `site/profile`. A missing document (404) is `null`: the schema defaults apply, as in the browser.
 * Any other failure throws, so the caller can tell "empty" from "could not read".
 */
export const fetchDocument = async (
  projectId: string,
  path: string,
): Promise<FirestoreDoc | null> => {
  const root = documentsUrl(projectId);
  if (!root) throw new Error('firestore_not_configured');
  const response = await fetch(`${root}/${path}`, {
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`firestore_${response.status}`);
  return decodeDocument(await response.json());
};

/** The visible documents of a collection: the filter the rules require (a query that could return a hidden document is refused). */
export const fetchVisible = async (
  projectId: string,
  collectionId: string,
): Promise<FirestoreDoc[]> => {
  const root = documentsUrl(projectId);
  if (!root) throw new Error('firestore_not_configured');
  const response = await fetch(`${root}:runQuery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      structuredQuery: {
        from: [{ collectionId }],
        where: {
          fieldFilter: {
            field: { fieldPath: 'visible' },
            op: 'EQUAL',
            value: { booleanValue: true },
          },
        },
        limit: 200,
      },
    }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!response.ok) throw new Error(`firestore_${response.status}`);
  return decodeQueryResult(await response.json());
};
