/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { defineCopy } from '@/lib/i18n/define-copy';

/** The words of the trip pages of the Travel skin: Home (the trip overview), Resume (the route) and About (the passport). */
export const travelTripCopy = defineCopy(
  {
    home: {
      kicker: 'The trip',
      startTrip: 'Start the trip',
      stopTrip: 'Stop the trip',
      tripRunning: 'The traveller is riding to {name}',
      ridingTo: 'Heading to',
      yearsLabel: 'years in software',
      stopsLabel: 'stops on the route',
      destination: 'Destination',
      showOnMap: 'Show on the map',
      luggage: 'In the luggage',
    },
    resume: {
      itinerary: 'Itinerary',
      pickStop: 'Pick a stop and the map flies there.',
      trailhead: 'Trailhead',
      destination: 'Destination · Current',
      stop: 'Stop {n}',
      sideTrip: 'Side trip',
      thingsToSee: 'Things to see',
      souvenirs: 'Souvenirs in the luggage',
      fieldsOfStudy: 'Fields of study',
      previous: 'Previous stop',
      next: 'Next stop',
      stopsLabel: 'Stops of the trip',
      logoAlt: '{name}',
    },
    about: {
      passport: 'Travel passport',
      holder: 'Traveller',
      home: 'Home town',
      trailhead: 'The trailhead',
      packing: 'The packing list',
      seeTrip: 'See the trip',
    },
  },
  {
    home: {
      kicker: 'Chuyến đi',
      startTrip: 'Bắt đầu chuyến đi',
      stopTrip: 'Dừng chuyến đi',
      tripRunning: 'Lữ khách đang đi tới {name}',
      ridingTo: 'Đang tới',
      yearsLabel: 'năm trong ngành phần mềm',
      stopsLabel: 'điểm dừng trên lộ trình',
      destination: 'Điểm đến',
      showOnMap: 'Xem trên bản đồ',
      luggage: 'Trong hành lý',
    },
    resume: {
      itinerary: 'Lịch trình',
      pickStop: 'Chọn một điểm dừng, bản đồ sẽ bay tới đó.',
      trailhead: 'Điểm xuất phát',
      destination: 'Điểm đến · Hiện tại',
      stop: 'Điểm dừng {n}',
      sideTrip: 'Chuyến rẽ',
      thingsToSee: 'Điều đáng xem',
      souvenirs: 'Quà lưu niệm trong hành lý',
      fieldsOfStudy: 'Lĩnh vực học',
      previous: 'Điểm dừng trước',
      next: 'Điểm dừng sau',
      stopsLabel: 'Các điểm dừng của chuyến đi',
      logoAlt: '{name}',
    },
    about: {
      passport: 'Hộ chiếu du lịch',
      holder: 'Lữ khách',
      home: 'Quê nhà',
      trailhead: 'Điểm xuất phát',
      packing: 'Danh sách hành lý',
      seeTrip: 'Xem chuyến đi',
    },
  },
);
