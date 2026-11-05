/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useMutation } from '@tanstack/react-query';
import { contentRepository } from '@/lib/content/index';
import type { MessageInput } from '@/lib/content/schema';
import { notifyMessage } from '@/lib/notify';

export const useSendMessage = () =>
  useMutation({
    mutationFn: (input: MessageInput) => contentRepository.createMessage(input),
    // the message is saved first; the email is only a nudge and its result is not waited for
    onSuccess: (_data, input) => notifyMessage(input),
  });
