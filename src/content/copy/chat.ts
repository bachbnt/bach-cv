/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { defineCopy } from '@/lib/i18n/define-copy';

// Interface copy for the BB Bot chat, in both languages. `{name}`, `{used}` and `{max}` are filled by `fill`.
export const chatCopy = defineCopy(
  {
    roleLabel: 'AI assistant',
    online: 'Online',
    open: 'Open chat',
    close: 'Close chat',
    panelLabel: '{name}, AI assistant',
    greeting: "Hi, I'm {name}. How can I help?",
    placeholder: 'Ask me anything',
    messageLabel: 'Message',
    send: 'Send chat message',
    typing: '{name} is typing',
    suggestionsLabel: 'Suggested questions',
    count: '{used}/{max} messages',
    disclaimer: 'AI answers may be inaccurate.',
    limitReached: 'Message limit reached',
    unavailable:
      'The assistant is not available right now. Please try again later or contact me by email.',
    errors: {
      generic: 'Something went wrong',
      network: 'Could not reach the assistant. Check your connection.',
      rateLimit: 'Too many questions in a short time. Please wait a moment.',
      dailyLimit:
        'The daily question limit has been reached. Try again tomorrow.',
      tryAgain: 'Try again',
    },
    askButton: 'Ask BB Bot',
    chatButton: 'Chat with BB Bot',
    askCard: {
      title: 'Not sure where to look?',
      body: 'Ask BB Bot, my AI assistant, about my experience and projects.',
    },
    /** shown until `site/settings` provides its own suggestions */
    defaultSuggestions: [
      { id: 'fpt-role', text: 'What do you do at FPT?' },
      { id: 'ai-tooling', text: 'Tell me about your AI tooling' },
      { id: 'stack', text: 'Which stack do you use?' },
      { id: 'contact', text: 'How can I contact you?' },
    ],
  },
  {
    roleLabel: 'Trợ lý AI',
    online: 'Trực tuyến',
    open: 'Mở chat',
    close: 'Đóng chat',
    panelLabel: '{name}, trợ lý AI',
    greeting: 'Xin chào, mình là {name}. Mình có thể giúp gì cho bạn?',
    placeholder: 'Hỏi mình bất cứ điều gì',
    messageLabel: 'Tin nhắn',
    send: 'Gửi tin nhắn',
    typing: '{name} đang soạn tin',
    suggestionsLabel: 'Câu hỏi gợi ý',
    count: '{used}/{max} tin nhắn',
    disclaimer: 'Câu trả lời của AI có thể chưa chính xác.',
    limitReached: 'Đã đạt giới hạn tin nhắn',
    unavailable:
      'Trợ lý hiện chưa khả dụng. Vui lòng thử lại sau hoặc liên hệ với mình qua email.',
    errors: {
      generic: 'Đã có lỗi xảy ra',
      network: 'Không thể kết nối với trợ lý. Hãy kiểm tra kết nối mạng.',
      rateLimit: 'Bạn hỏi hơi nhanh. Vui lòng đợi một lát rồi thử lại.',
      dailyLimit: 'Đã hết lượt hỏi trong hôm nay. Hãy quay lại vào ngày mai.',
      tryAgain: 'Thử lại',
    },
    askButton: 'Hỏi BB Bot',
    chatButton: 'Chat với BB Bot',
    askCard: {
      title: 'Chưa biết nên xem gì?',
      body: 'Hãy hỏi BB Bot, trợ lý AI của mình, về kinh nghiệm và các dự án.',
    },
    defaultSuggestions: [
      { id: 'fpt-role', text: 'Bạn làm gì tại FPT?' },
      { id: 'ai-tooling', text: 'Kể mình nghe về công cụ AI của bạn' },
      { id: 'stack', text: 'Bạn dùng những công nghệ nào?' },
      { id: 'contact', text: 'Làm sao để liên hệ với bạn?' },
    ],
  },
);
