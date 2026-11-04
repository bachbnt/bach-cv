/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { defineCopy } from '@/lib/i18n/define-copy';

/**
 * Interface copy for the Services page, in both languages.
 * `{name}`, `{email}`, `{used}`, `{max}`, `{count}` and `{fields}` are filled in by `fill()`.
 */
export const servicesCopy = defineCopy(
  {
    title: 'Services',
    intro: 'What I can do for your team or project.',
    list: {
      label: 'Services',
      empty: 'My services will be listed here soon.',
    },
    cta: {
      title: 'What do you want to build?',
      hint: "Pick a topic and I'll start the message for you, or write your own.",
      topicLabel: 'Topic',
      askPrefix: 'Not sure where to start?',
      askButton: 'Ask BB Bot',
      off: {
        title: 'The contact form is taking a break.',
        body: 'Use the Connect menu at the top of the page to reach me by email or chat instead.',
      },
    },
    form: {
      name: 'Name',
      email: 'Email',
      message: 'Message',
      honeypot: 'Website',
      send: 'Send',
      sending: 'Sending',
      retry: 'Try again',
      note: "I'll only use your email to reply to this message.",
      failed:
        "Couldn't send your message. Check your connection and try again. Your text is still here.",
      errors: {
        name: 'Name is required',
        nameLong: 'Name is too long',
        email: 'Enter a valid email so I can reply',
        message: 'Message is required',
        messageLong: 'Message is too long',
        starterOnly: 'Add a few details about what you need',
      },
      count: {
        value: '{used}/{max}',
        limit: 'Limit reached, {used}/{max}',
      },
    },
    sent: {
      title: 'Message sent',
      body: "Thanks, {name}. I'll reply to {email}.",
      again: 'Send another message',
    },
    live: {
      sending: 'Sending your message',
      failed: 'Message not sent. Check your connection and try again.',
      sent: 'Message sent. I will reply to {email}',
      invalidOne: '{count} field needs attention: {fields}',
      invalidMany: '{count} fields need attention: {fields}',
    },
  },
  {
    title: 'Dịch vụ',
    intro: 'Những việc mình có thể làm cho đội nhóm hoặc dự án của bạn.',
    list: {
      label: 'Dịch vụ',
      empty: 'Các dịch vụ của mình sẽ sớm được cập nhật tại đây.',
    },
    cta: {
      title: 'Bạn muốn xây dựng điều gì?',
      hint: 'Chọn một chủ đề, mình sẽ mở đầu tin nhắn giúp bạn, hoặc bạn cứ tự viết nhé.',
      topicLabel: 'Chủ đề',
      askPrefix: 'Chưa biết bắt đầu từ đâu?',
      askButton: 'Hỏi BB Bot',
      off: {
        title: 'Biểu mẫu liên hệ đang tạm nghỉ.',
        body: 'Bạn hãy dùng menu Kết nối ở đầu trang để liên hệ với mình qua email hoặc chat nhé.',
      },
    },
    form: {
      name: 'Tên',
      email: 'Email',
      message: 'Tin nhắn',
      honeypot: 'Trang web',
      send: 'Gửi',
      sending: 'Đang gửi',
      retry: 'Thử lại',
      note: 'Mình chỉ dùng email của bạn để trả lời tin nhắn này.',
      failed:
        'Không gửi được tin nhắn. Bạn hãy kiểm tra kết nối và thử lại nhé. Nội dung bạn đã nhập vẫn còn đó.',
      errors: {
        name: 'Vui lòng nhập tên',
        nameLong: 'Tên quá dài',
        email: 'Nhập email hợp lệ để mình có thể trả lời bạn',
        message: 'Vui lòng nhập tin nhắn',
        messageLong: 'Tin nhắn quá dài',
        starterOnly: 'Hãy thêm vài chi tiết về điều bạn cần nhé',
      },
      count: {
        value: '{used}/{max}',
        limit: 'Đã đạt giới hạn, {used}/{max}',
      },
    },
    sent: {
      title: 'Đã gửi tin nhắn',
      body: 'Cảm ơn {name}. Mình sẽ trả lời bạn qua {email}.',
      again: 'Gửi tin nhắn khác',
    },
    live: {
      sending: 'Đang gửi tin nhắn của bạn',
      failed:
        'Chưa gửi được tin nhắn. Bạn hãy kiểm tra kết nối và thử lại nhé.',
      sent: 'Đã gửi tin nhắn. Mình sẽ trả lời bạn qua {email}',
      invalidOne: '{count} trường cần chú ý: {fields}',
      invalidMany: '{count} trường cần chú ý: {fields}',
    },
  },
);

export type ServicesCopy = (typeof servicesCopy)['en'];
