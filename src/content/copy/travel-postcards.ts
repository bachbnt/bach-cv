/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { defineCopy } from '@/lib/i18n/define-copy';

/**
 * The words only the Travel skin has on its Projects, Certificates and Services pages (the postcards, the passport, the tours). Every
 * other word of these pages is the Standard copy (`projects`, `certificates`, `services`). `{name}` and `{count}` are slots.
 */
export const travelPostcardsCopy = defineCopy(
  {
    projects: {
      kicker: 'Postcards from the sights I built',
      postcardsLabel: 'Postcards',
      scrollLeft: 'Scroll the postcards left',
      scrollRight: 'Scroll the postcards right',
      readMore: 'Read more',
      readLess: 'Show less',
      postmark: 'Postmark',
    },
    passport: {
      kicker: 'Travel passport',
      idLabel: 'Passport details',
      holder: 'Holder',
      occupation: 'Occupation',
      home: 'Home',
      stampsLabel: 'Stamps',
    },
    tours: {
      kicker: 'Tours you can book',
      pickHint: 'Pick a tour and I will start the booking for you.',
      bookingKicker: 'Booking form',
      sentKicker: 'Booked',
    },
  },
  {
    projects: {
      kicker: 'Những tấm bưu thiếp từ các nơi tôi đã xây dựng',
      postcardsLabel: 'Bưu thiếp',
      scrollLeft: 'Cuộn bưu thiếp sang trái',
      scrollRight: 'Cuộn bưu thiếp sang phải',
      readMore: 'Xem thêm',
      readLess: 'Thu gọn',
      postmark: 'Dấu bưu điện',
    },
    passport: {
      kicker: 'Hộ chiếu du lịch',
      idLabel: 'Thông tin hộ chiếu',
      holder: 'Chủ hộ chiếu',
      occupation: 'Nghề nghiệp',
      home: 'Quê quán',
      stampsLabel: 'Dấu hộ chiếu',
    },
    tours: {
      kicker: 'Các tour bạn có thể đặt',
      pickHint: 'Chọn một tour, mình sẽ mở đầu phiếu đặt chỗ giúp bạn.',
      bookingKicker: 'Phiếu đặt chỗ',
      sentKicker: 'Đã đặt chỗ',
    },
  },
);
