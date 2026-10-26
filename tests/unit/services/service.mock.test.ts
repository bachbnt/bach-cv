/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { afterEach, describe, expect, it, vi } from 'vitest';

const importMockService = async () => {
  vi.stubEnv('VITE_USE_MOCK_DATA', 'true');
  vi.resetModules();
  return import('@services/service');
};

describe('service mock mode', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('returns parsed config from local mock data', async () => {
    const { getConfig } = await importMockService();

    await expect(getConfig()).resolves.toMatchObject({
      appTitle: 'Bach Bui',
      homeVisible: true,
      chatVisible: true,
      chatProvider: 'openai',
    });
  });

  it('returns localized strings from local mock data', async () => {
    const { getLocalization } = await importMockService();

    await expect(getLocalization('en')).resolves.toMatchObject({
      page1: 'Home',
      chatbot_title: 'Portfolio assistant',
    });
  });

  it('returns visible mock user collections sorted by index', async () => {
    const { getContact, getExperience, getProject, getSkill } =
      await importMockService();

    await expect(getContact()).resolves.toEqual([
      expect.objectContaining({
        id: 'test',
        name: 'Ho Chi Minh City, Vietnam',
        visible: true,
      }),
    ]);
    await expect(getProject()).resolves.toEqual([
      expect.objectContaining({ id: 'test', name: 'VenusAI' }),
    ]);
    await expect(getSkill()).resolves.toEqual([
      expect.objectContaining({ id: 'test', name: 'ReactJS' }),
    ]);
    await expect(getExperience()).resolves.toEqual([
      expect.objectContaining({
        id: 'devblock',
        name: 'Devblock Vietnam',
      }),
      expect.objectContaining({
        id: 'american-code-lab',
        name: 'American Code Lab',
      }),
      expect.objectContaining({
        id: 'momo',
        name: 'MoMo (M_Service)',
      }),
      expect.objectContaining({
        id: 'fpt_software_team_lead',
        name: 'FPT Software',
      }),
    ]);
  });

  it('short-circuits writes in mock mode', async () => {
    const { postMessage } = await importMockService();

    await expect(
      postMessage({ name: 'Bach', message: 'Hello' }),
    ).resolves.toBeUndefined();
  });
});
