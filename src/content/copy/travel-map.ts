/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { defineCopy } from '@/lib/i18n/define-copy';

/**
 * The words of the Travel map: the famous places of Nha Trang (scenery, never the owner's data) and the controls. The places and their
 * coordinates are real (OpenStreetMap); the descriptions are short and kept to facts that are well known.
 */
export const travelMapCopy = defineCopy(
  {
    label: 'Trip map of Nha Trang',
    help: 'Drag to move the map, scroll or pinch to zoom, arrow keys to move, plus and minus to zoom.',
    zoomIn: 'Zoom in',
    zoomOut: 'Zoom out',
    recentre: 'Show the whole trip',
    compass: 'Compass: north is up and to the right',
    youAreHere: 'You are here',
    credits:
      'Map data © OpenStreetMap contributors (ODbL). Drawings are original.',
    scenery: 'Sights of Nha Trang',
    kmFromCentre: '{n} km',
    hint: 'Point at a pin to see its stop.',
    hintTouch: 'Tap a pin to see its stop.',
    places: {
      title: 'Places of Nha Trang',
      intro: 'Pick a place and the map flies there.',
      shown: '{name}: {text}',
    },
    sights: {
      'po-nagar': {
        name: 'Po Nagar towers',
        text: 'Cham temple towers built between the 7th and 13th centuries on a hill beside the Cai River, still used for worship.',
      },
      'hon-chong': {
        name: 'Hon Chong',
        text: 'Granite boulders piled on a cape at the north end of the city beach, with its twin rock Hon Vo beside it.',
      },
      'long-son': {
        name: 'Long Son pagoda',
        text: 'A pagoda from the 1880s on Trai Thuy hill, with a big white seated Buddha that looks over the city.',
      },
      cathedral: {
        name: 'Nha Trang Cathedral',
        text: 'The stone church of Christ the King, built in the 1930s in the French Gothic style on a hill in the city centre.',
      },
      'tram-huong': {
        name: 'Tram Huong tower',
        text: 'The tower shaped like an open lotus on the beach square of Tran Phu street.',
      },
      'dam-market': {
        name: 'Dam Market',
        text: 'The big round market of Nha Trang, a landmark of the city since 1970.',
      },
      yersin: {
        name: 'Yersin Museum',
        text: 'The house museum of Dr Alexandre Yersin, who found the plague bacillus and made Nha Trang his home.',
      },
      oceanography: {
        name: 'Institute of Oceanography',
        text: 'The oldest marine research institute in Vietnam, with an aquarium and a museum at Cau Da.',
      },
      'bao-dai': {
        name: 'Bao Dai villa',
        text: 'The former summer residence of Emperor Bao Dai, on a rocky hill above the sea at Cau Da.',
      },
      'mud-bath': {
        name: 'Thap Ba mud baths',
        text: 'Hot mineral springs and mud baths in the north-west of the city, near the Po Nagar towers.',
      },
      vinpearl: {
        name: 'Vinpearl, Hon Tre',
        text: 'The resort and amusement park on Hon Tre, the biggest island of the bay.',
      },
      'cable-car': {
        name: 'Cable car',
        text: 'The cable car carries visitors over the sea from Cau Da to Hon Tre island.',
      },
      'hon-mieu': {
        name: 'Hon Mieu',
        text: 'An island of the bay south of Hon Tre with a fishing village and an aquarium.',
      },
      'hon-tam': {
        name: 'Hon Tam',
        text: 'The "silkworm" island with a quiet bay and beach, a short boat ride from the port.',
      },
      'hon-mot': {
        name: 'Hon Mot',
        text: 'A small island with a beach and a coral reef, a stop of many boat tours.',
      },
      'hon-mun': {
        name: 'Hon Mun',
        text: 'The "ebony" island and the heart of the marine reserve, known for diving and snorkelling over coral.',
      },
      'monkey-island': {
        name: 'Monkey Island',
        text: 'Hon Lao, reached by a short ferry from the north of the city, home to many macaques.',
      },
      'ba-ho': {
        name: 'Ba Ho waterfalls',
        text: 'Three cascades with natural pools in the forest north-west of the city, reached by a short trek.',
      },
      'do-theatre': {
        name: 'Do Theatre',
        text: 'A theatre by the sea at Bai Tien built in the shape of a do, the bamboo fish trap of Vietnamese fishermen.',
      },
      'co-tien': {
        name: 'Co Tien mountain',
        text: 'A ridge of three peaks about 400 m high north-west of the city, whose outline looks like a fairy lying down.',
      },
      'truc-lam': {
        name: 'Truc Lam Phung Thuy Son',
        text: 'A Zen monastery on the summit of Chin Khuc mountain, with a golden thirteen-storey stupa and a view over the whole city.',
      },
      'dong-bo': {
        name: 'Dong Bo mountain',
        text: 'Hoang Nguu Son, the range of nearly 1,000 m behind the city, once the Dong Bo war base, now green forest and streams.',
      },
      'hon-ro': {
        name: 'Hon Ro',
        text: 'A green hill of 344 m on the southern shore of the city, with a fishing village at its foot.',
      },
    },
    edges: {
      'cam-ranh': 'Cam Ranh airport',
      'bai-dai': 'Bai Dai beach',
      'doc-let': 'Doc Let beach',
    },
  },
  {
    label: 'Bản đồ chuyến đi ở Nha Trang',
    help: 'Kéo để di chuyển bản đồ, cuộn hoặc chụm tay để phóng to, phím mũi tên để di chuyển, phím cộng và trừ để phóng to thu nhỏ.',
    zoomIn: 'Phóng to',
    zoomOut: 'Thu nhỏ',
    recentre: 'Xem toàn bộ chuyến đi',
    compass: 'La bàn: hướng bắc là lên trên và sang phải',
    youAreHere: 'Bạn đang ở đây',
    credits:
      'Dữ liệu bản đồ © những người đóng góp OpenStreetMap (ODbL). Hình vẽ là bản gốc.',
    scenery: 'Danh thắng Nha Trang',
    kmFromCentre: '{n} km',
    hint: 'Rê chuột vào pin để xem chặng.',
    hintTouch: 'Chạm vào pin để xem chặng.',
    places: {
      title: 'Địa điểm ở Nha Trang',
      intro: 'Chọn một nơi, bản đồ sẽ bay tới đó.',
      shown: '{name}: {text}',
    },
    sights: {
      'po-nagar': {
        name: 'Tháp Bà Ponagar',
        text: 'Cụm tháp Chăm xây từ thế kỷ 7 đến 13 trên đồi bên sông Cái, đến nay vẫn còn được thờ cúng.',
      },
      'hon-chong': {
        name: 'Hòn Chồng',
        text: 'Những tảng đá granit xếp chồng trên mũi đất ở cuối phía bắc bãi biển thành phố, bên cạnh là Hòn Vợ.',
      },
      'long-son': {
        name: 'Chùa Long Sơn',
        text: 'Ngôi chùa từ thập niên 1880 trên đồi Trại Thủy, với tượng Phật trắng lớn nhìn xuống thành phố.',
      },
      cathedral: {
        name: 'Nhà thờ Núi',
        text: 'Nhà thờ Chính tòa Kitô Vua bằng đá, xây vào thập niên 1930 theo phong cách Gothic Pháp trên một ngọn đồi giữa thành phố.',
      },
      'tram-huong': {
        name: 'Tháp Trầm Hương',
        text: 'Tòa tháp hình đóa sen nở ở quảng trường bên bãi biển đường Trần Phú.',
      },
      'dam-market': {
        name: 'Chợ Đầm',
        text: 'Khu chợ tròn lớn của Nha Trang, một biểu tượng của thành phố từ năm 1970.',
      },
      yersin: {
        name: 'Bảo tàng Yersin',
        text: 'Nhà bảo tàng của bác sĩ Alexandre Yersin, người tìm ra trực khuẩn dịch hạch và chọn Nha Trang làm nơi sinh sống.',
      },
      oceanography: {
        name: 'Viện Hải dương học',
        text: 'Viện nghiên cứu biển lâu đời nhất Việt Nam, có thủy cung và bảo tàng ở Cầu Đá.',
      },
      'bao-dai': {
        name: 'Biệt điện Bảo Đại',
        text: 'Nơi nghỉ hè cũ của vua Bảo Đại, trên ngọn đồi đá bên biển ở Cầu Đá.',
      },
      'mud-bath': {
        name: 'Tắm bùn Tháp Bà',
        text: 'Suối khoáng nóng và khu tắm bùn ở phía tây bắc thành phố, gần tháp Bà Ponagar.',
      },
      vinpearl: {
        name: 'Vinpearl, Hòn Tre',
        text: 'Khu nghỉ dưỡng và công viên giải trí trên Hòn Tre, đảo lớn nhất của vịnh.',
      },
      'cable-car': {
        name: 'Cáp treo',
        text: 'Cáp treo đưa du khách vượt biển từ Cầu Đá sang đảo Hòn Tre.',
      },
      'hon-mieu': {
        name: 'Hòn Miễu',
        text: 'Hòn đảo của vịnh, phía nam Hòn Tre, có làng chài và một thủy cung.',
      },
      'hon-tam': {
        name: 'Hòn Tằm',
        text: 'Đảo "con tằm" với vịnh và bãi biển yên tĩnh, đi tàu một đoạn ngắn từ bến.',
      },
      'hon-mot': {
        name: 'Hòn Một',
        text: 'Hòn đảo nhỏ có bãi biển và rạn san hô, điểm dừng của nhiều tour đi tàu.',
      },
      'hon-mun': {
        name: 'Hòn Mun',
        text: 'Đảo "gỗ mun" và là trung tâm của khu bảo tồn biển, nổi tiếng với lặn biển ngắm san hô.',
      },
      'monkey-island': {
        name: 'Đảo Khỉ',
        text: 'Hòn Lao, đi phà ngắn từ phía bắc thành phố, nơi sinh sống của nhiều chú khỉ.',
      },
      'ba-ho': {
        name: 'Thác Ba Hồ',
        text: 'Ba tầng thác với những hồ nước tự nhiên trong rừng phía tây bắc thành phố, đi bộ một đoạn ngắn là tới.',
      },
      'do-theatre': {
        name: 'Nhà hát Đó',
        text: 'Nhà hát ven biển ở Bãi Tiên, dựng theo hình chiếc đó, dụng cụ bắt cá bằng tre của ngư dân Việt.',
      },
      'co-tien': {
        name: 'Núi Cô Tiên',
        text: 'Dãy núi ba đỉnh cao khoảng 400 m ở phía tây bắc thành phố, đường nét trông như nàng tiên nằm.',
      },
      'truc-lam': {
        name: 'Trúc Lâm Phụng Thuỳ Sơn',
        text: 'Thiền viện trên đỉnh núi Chín Khúc, có bảo tháp mười ba tầng dát vàng và nhìn xuống toàn thành phố.',
      },
      'dong-bo': {
        name: 'Núi Đồng Bò',
        text: 'Hoàng Ngưu Sơn, dãy núi gần 1.000 m phía sau thành phố, xưa là chiến khu Đồng Bò, nay là rừng xanh và suối.',
      },
      'hon-ro': {
        name: 'Hòn Rớ',
        text: 'Ngọn đồi xanh cao 344 m ở phía nam thành phố, dưới chân là làng chài.',
      },
    },
    edges: {
      'cam-ranh': 'Sân bay Cam Ranh',
      'bai-dai': 'Bãi Dài',
      'doc-let': 'Bãi Dốc Lết',
    },
  },
);
