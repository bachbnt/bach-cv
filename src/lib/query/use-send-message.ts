/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useMutation } from '@tanstack/react-query';
import { contentRepository } from '@/lib/content/index';
import type { MessageInput } from '@/lib/content/schema';

export const useSendMessage = () =>
  useMutation({
    mutationFn: (input: MessageInput) => contentRepository.createMessage(input),
  });
