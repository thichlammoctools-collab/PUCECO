/**
 * PUCECO Data Store — Quản lý dữ liệu tập trung (LocalStorage + Sync Broadcast)
 * Hỗ trợ hoạt động độc lập (Client-side) lẫn đồng bộ API (Node.js Server)
 */

(function (window) {
  'use strict';

  const STORAGE_KEY_PRODUCTS = 'puceco_products';
  const STORAGE_KEY_NEWS = 'puceco_news';
  const STORAGE_KEY_LEADS = 'puceco_leads';
  const STORAGE_KEY_SETTINGS = 'puceco_settings';
  const STORAGE_KEY_AUTH = 'puceco_auth_session';
  const STORAGE_KEY_FORMULATIONS = 'puceco_formulations';
  const STORAGE_KEY_CERTS = 'puceco_certifications';
  const STORAGE_KEY_SLIDES = 'puceco_hero_slides';
  const STORAGE_KEY_MENU = 'puceco_menu';
  const STORAGE_KEY_HEADER_CTA = 'puceco_header_cta';
  const STORAGE_KEY_SECTIONS = 'puceco_sections';

  // Seed Menu mặc định
  const DEFAULT_MENU = [
    { id: 'menu-1', label: 'Trang Chủ', url: '#top', target: '_self', enabled: true, order: 1 },
    { id: 'menu-2', label: 'Giới Thiệu', url: '#gioi-thieu', target: '_self', enabled: true, order: 2 },
    { id: 'menu-3', label: 'Sản Phẩm', url: '#noi-bat', target: '_self', enabled: true, order: 3 },
    { id: 'menu-4', label: 'Công Thức Mẫu', url: '#cong-thuc-mau', target: '_self', enabled: true, order: 4 },
    { id: 'menu-5', label: 'Tin Tức', url: '#tin-tuc', target: '_self', enabled: true, order: 5 },
    { id: 'menu-6', label: 'Liên Hệ', url: '#lien-he', target: '_self', enabled: true, order: 6 }
  ];

  // Nút kêu gọi hành động trên Header
  const DEFAULT_HEADER_CTA = {
    text: 'Nhận mẫu thử',
    url: '#lien-he',
    enabled: true
  };

  // Cấu hình Tiêu đề & Nội dung từng phần đề mục Trang chủ
  const DEFAULT_SECTIONS = {
    intro: {
      eyebrow: 'GIỚI THIỆU — PUCECO',
      title: 'Chiết xuất từ thiên nhiên\n& Hoạt chất thế hệ mới',
      lead: 'Công ty chúng tôi chuyên cung cấp các chiết xuất từ thiên nhiên và hoạt chất thế hệ mới, phục vụ cho ngành công nghiệp sản xuất dược phẩm, thực phẩm chức năng, mỹ phẩm. Với cam kết mang đến thị trường những sản phẩm đạt tiêu chuẩn chất lượng quốc tế, giá cả cạnh tranh và phù hợp với xu hướng phát triển thị trường.',
      btn1Text: 'Tìm Hiểu Sản Phẩm',
      btn1Url: '#noi-bat',
      btn2Text: 'Xem Công Thức Mẫu',
      btn2Url: '#cong-thuc-mau',
      statYears: 30,
      statYearsLabel: 'năm kinh nghiệm',
      statPartners: 20,
      statPartnersLabel: 'đối tác toàn cầu',
      statLines: 8,
      statLinesLabel: 'dòng nguyên liệu',
      statTrace: 100,
      statTraceLabel: 'truy xuất nguồn gốc',
      values: [
        {
          title: 'Chất Lượng',
          desc: 'Chúng tôi luôn đặt chất lượng sản phẩm và dịch vụ lên hàng đầu, giá trị đi đôi với thương hiệu.'
        },
        {
          title: 'Uy Tín',
          desc: 'Cam kết cung cấp sản phẩm chính hãng, rõ nguồn gốc xuất xứ từ các thương hiệu uy tín.'
        },
        {
          title: 'Chuyên Nghiệp',
          desc: 'Đội ngũ nhân viên chuyên nghiệp, nhiệt tình, luôn sẵn sàng tư vấn và hỗ trợ khách hàng.'
        }
      ]
    },
    certs: {
      eyebrow: 'Cam kết chất lượng',
      title: 'Chứng nhận & tiêu chuẩn'
    },
    featuredProducts: {
      eyebrow: 'Danh mục',
      title: 'Sản phẩm nổi bật',
      sub: 'Các dòng nguyên liệu chiết xuất được các đối tác dược mỹ phẩm tin dùng nhiều nhất.'
    },
    newProducts: {
      eyebrow: 'Mới ra mắt',
      title: 'Sản phẩm mới',
      sub: 'Những đột phá công nghệ chiết xuất và hoạt chất sinh học mới nhất từ phòng thí nghiệm.'
    },
    formulations: {
      eyebrow: 'R&D & Ứng Dụng Chuyển Giao',
      title: 'Công Thức Mẫu',
      sub: 'Các giải pháp phối chế mẫu chuẩn hóa từ phòng thí nghiệm PUCECO, giúp đối tác rút ngắn thời gian R&D và thương mại hóa nhanh chóng.'
    },
    news: {
      eyebrow: 'Tin tức & sự kiện',
      title: 'Tin mới nhất',
      sub: 'Cập nhật tin tức chuyên ngành, hoạt động R&D và sự kiện nổi bật của PUCECO.'
    },
    contact: {
      title: 'Trở thành đối tác của PUCECO',
      desc: 'Nhận báo giá sỉ, hồ sơ kỹ thuật (COA, Spec Sheet) và mẫu thử nghiệm cho dự án của bạn. Đội ngũ chuyên gia phản hồi trong 24 giờ.',
      formBtnText: 'Gửi yêu cầu mẫu & Báo giá'
    },
    footer: {
      slogan: 'Nguyên liệu chiết xuất từ thiên nhiên — tin cậy từ khoa học.',
      col1Title: 'Sản phẩm & R&D',
      col2Title: 'Điều hướng',
      col3Title: 'Liên hệ',
      copyright: '© 2026 PUCECO. All rights reserved. Tiêu chuẩn GMP & USDA Organic.'
    }
  };

  // Seed Data mặc định
  const DEFAULT_SETTINGS = {
    brandName: 'PUCECO',
    slogan: 'Chiết xuất từ thiên nhiên & hoạt chất thế hệ mới',
    certEyebrow: 'Cam kết chất lượng',
    certTitle: 'Chứng nhận & tiêu chuẩn',
    aboutIntro: 'Công ty chúng tôi chuyên cung cấp các chiết xuất từ thiên nhiên và hoạt chất thế hệ mới, phục vụ cho ngành công nghiệp sản xuất dược phẩm, thực phẩm chức năng, mỹ phẩm. Với cam kết mang đến thị trường những sản phẩm đạt tiêu chuẩn chất lượng quốc tế, giá cả cạnh tranh và phù hợp với xu hướng phát triển thị trường.',
    values: {
      quality: 'Chúng tôi luôn đặt chất lượng sản phẩm và dịch vụ lên hàng đầu, giá trị đi đôi với thương hiệu.',
      reputation: 'Cam kết cung cấp sản phẩm chính hãng, rõ nguồn gốc xuất xứ từ các thương hiệu uy tín.',
      professional: 'Đội ngũ nhân viên chuyên nghiệp, nhiệt tình, luôn sẵn sàng tư vấn và hỗ trợ khách hàng.'
    },
    hotline: '(+84) 08 272 272 59',
    email: 'puceco2018@gmail.com',
    address: '679/38 Quang Trung , Phường 11, Quận Gò Vấp , Thành phố Hồ Chí Minh, Việt Nam',
    mapsUrl: 'https://maps.app.goo.gl/1Rfge7JdRQY9vLxBA',
    adminPassword: 'admin123',
    stats: {
      years: 30,
      partners: 20,
      lines: 8,
      traceability: 100
    }
  };

  const DEFAULT_SLIDES = [
    {
      id: 'slide-1',
      order: 1,
      enabled: true,
      eyebrow: 'Nguyên liệu thiên nhiên · Chuẩn quốc tế',
      title: 'Chiết xuất từ thiên nhiên,\ntin cậy từ khoa học',
      lede: 'PUCECO cung cấp nguyên liệu dược phẩm và mỹ phẩm chiết xuất từ thảo mộc, đảm bảo nguồn gốc minh bạch và quy trình kiểm soát chất lượng đa điểm.',
      btn1Text: 'Khám phá sản phẩm',
      btn1Link: '#noi-bat',
      btn2Text: 'Về chúng tôi',
      btn2Link: '#gioi-thieu',
      badgeTop: 'GMP',
      badgeBottom: 'đạt chuẩn',
      bgImage: 'assets/images/hero-bg-1.jpg',
      artImage: 'assets/images/hero-botanical-1.svg',
      g1: '#18181B',
      g2: '#B72622'
    },
    {
      id: 'slide-2',
      order: 2,
      enabled: true,
      eyebrow: 'Hợp tác bền vững',
      title: 'Đồng hành cùng\nnhà sản xuất Việt',
      lede: 'Chúng tôi liên kết vùng trồng nguyên liệu sạch, hỗ trợ nông dân địa phương và bảo vệ hệ sinh thái qua từng mẻ chiết xuất đạt chuẩn.',
      btn1Text: 'Xem lợi ích',
      btn1Link: '#loi-ich',
      btn2Text: 'Chứng nhận',
      btn2Link: '#chung-nhan',
      badgeTop: '100%',
      badgeBottom: 'thiên nhiên',
      bgImage: 'assets/images/hero-bg-2.jpg',
      artImage: 'assets/images/hero-botanical-2.svg',
      g1: '#18181B',
      g2: '#991B1B'
    },
    {
      id: 'slide-3',
      order: 3,
      enabled: true,
      eyebrow: 'Nghiên cứu & phát triển',
      title: 'Đổi mới từ\nphòng thí nghiệm',
      lede: 'Đội ngũ R&D của PUCECO phát triển các hoạt chất nano và phân tử tự nhiên với độ sinh khả dụng cao, an toàn và truy xuất nguồn gốc.',
      btn1Text: 'Tin nghiên cứu',
      btn1Link: '#tin-tuc',
      btn2Text: 'Trở thành đối tác',
      btn2Link: '#lien-he',
      badgeTop: 'R&D',
      badgeBottom: 'nội bộ',
      bgImage: 'assets/images/hero-bg-3.jpg',
      artImage: 'assets/images/hero-botanical-3.svg',
      g1: '#18181B',
      g2: '#D4322D'
    }
  ];

  const DEFAULT_CERTS = [
    { id: 'cert-1', code: 'GMP', title: 'Thực hành sản xuất tốt', desc: 'Đạt chuẩn thực hành sản xuất tốt theo quy chuẩn Bộ Y Tế', enabled: true, order: 1 },
    { id: 'cert-2', code: 'ISO 9001', title: 'Quản lý chất lượng', desc: 'Hệ thống quản lý chất lượng tiêu chuẩn quốc tế', enabled: true, order: 2 },
    { id: 'cert-3', code: 'USDA', title: 'Hữu cơ Organic', desc: 'Chứng nhận nguồn gốc nông sản hữu cơ quốc tế', enabled: true, order: 3 },
    { id: 'cert-4', code: 'HACCP', title: 'An toàn thực phẩm', desc: 'Hệ thống phân tích mối nguy và kiểm soát an toàn vệ sinh thực phẩm', enabled: true, order: 4 },
    { id: 'cert-5', code: 'HALAL', title: 'Chứng nhận Halal', desc: 'Chứng nhận tiêu chuẩn Hồi giáo cho thị trường xuất khẩu', enabled: true, order: 5 }
  ];

  const DEFAULT_FORMULATIONS = [
    {
      id: 'form-1',
      name: 'Serum Dưỡng Trắng & Chống Oxy Hóa Chuyên Sâu',
      badge: 'Mỹ phẩm Skin-care',
      category: 'cosmetics',
      desc: 'Công thức ứng dụng Chiết xuất Trà xanh EGCG 98% và Lô hội hữu cơ giúp ngăn ngừa lão hóa, trung hòa gốc tự do và phục hồi màng ẩm tự nhiên.',
      mainIngredient: 'Chiết xuất Trà xanh EGCG 98% (PUCECO)',
      dosageForm: 'Serum dưỡng da dạng tinh chất',
      image: 'assets/images/form-serum.jpg',
      ingredients: [
        { name: 'Chiết xuất Trà xanh EGCG 98% (PUCECO)', ratio: '2.0%', role: 'Chống oxy hóa vượt trội, sáng da' },
        { name: 'Chiết xuất Lô hội 200:1 (PUCECO)', ratio: '5.0%', role: 'Cấp ẩm sâu, làm dịu da nhạy cảm' },
        { name: 'Niacinamide (Vitamin B3)', ratio: '3.0%', role: 'Cải thiện sắc tố & hàng rào bảo vệ da' },
        { name: 'Hyaluronic Acid đa tầng', ratio: '1.5%', role: 'Khóa ẩm & tăng độ đàn hồi biểu bì' },
        { name: 'Dung môi & chất bảo quản tự nhiên', ratio: 'Vừa đủ 100%', role: 'Hệ nền nhũ tương an toàn' }
      ],
      spec: 'Serum trong suốt ánh lục thảo mộc tự nhiên, pH 5.5 - 6.0, độ nhớt 1.200 - 1.800 cP.',
      directions: 'Hòa tan pha nước ở 45°C, bổ sung EGCG ở nhiệt độ dưới 40°C để bảo toàn tối đa hoạt tính sinh học.'
    },
    {
      id: 'form-2',
      name: 'Viên Nang Mềm Hỗ Trợ Dạ Dày & Kháng Viêm',
      badge: 'Thực phẩm chức năng',
      category: 'pharma',
      desc: 'Ứng dụng Curcumin Nano 35nm kết hợp Chiết xuất Nghệ đen giúp tăng sinh khả dụng gấp 40 lần, hỗ trợ bảo vệ niêm mạc dạ dày và tiêu hóa khỏe mạnh.',
      mainIngredient: 'Curcumin Nano 35nm & Nghệ đen (PUCECO)',
      dosageForm: 'Viên nang mềm (Softgel)',
      image: 'assets/images/form-capsule.jpg',
      ingredients: [
        { name: 'Curcumin Nano 35nm (PUCECO)', ratio: '150 mg/viên', role: 'Hoạt chất kháng viêm, hấp thu nhanh' },
        { name: 'Chiết xuất Nghệ đen chuẩn hóa (PUCECO)', ratio: '100 mg/viên', role: 'Hỗ trợ hành khí, kiện tỳ vị' },
        { name: 'Piperine 95% từ hạt tiêu đen', ratio: '5 mg/viên', role: 'Tăng cường hấp thu qua ruột' },
        { name: 'Dầu đậu nành & sáp ong tinh khiết', ratio: 'Vừa đủ 1 viên', role: 'Hệ tá dược chất mang' }
      ],
      spec: 'Nang mềm hình thon dài (Oblong), màu nâu cam đậm óng ánh, tan rã hoàn toàn trong vòng 20 phút.',
      directions: 'Đồng hóa hỗn dịch bằng sóng siêu âm trước khi dập nang trên dây chuyền đạt chuẩn GMP.'
    },
    {
      id: 'form-3',
      name: 'Nước Uống Thảo Dược Đề Kháng Sugar-Free (0 Calo)',
      badge: 'Đồ uống chức năng',
      category: 'beverage',
      desc: 'Công thức tạo ngọt thanh mát từ Glycoside Stevia Rebaudioside-A 98% và Tinh dầu Sả chanh, hoàn toàn không sinh calo, đáp ứng lối sống lành mạnh.',
      mainIngredient: 'Glycoside Stevia Reb-A 98% & Sả chanh (PUCECO)',
      dosageForm: 'Nước uống thảo dược đóng lon/chai',
      image: 'assets/images/form-drink.jpg',
      ingredients: [
        { name: 'Glycoside Stevia Reb-A 98% (PUCECO)', ratio: '0.04%', role: 'Chất tạo ngọt tự nhiên không calo' },
        { name: 'Tinh dầu Sả chanh hòa tan (PUCECO)', ratio: '0.08%', role: 'Tạo hương tự nhiên, ấm họng' },
        { name: 'Chiết xuất Trà xanh tan nước (PUCECO)', ratio: '0.50%', role: 'Bổ sung Polyphenol đề kháng' },
        { name: 'Vitamin C & Kẽm Gluconate', ratio: '0.10%', role: 'Tăng cường miễn dịch' },
        { name: 'Nước tinh khiết đã khử khoáng', ratio: 'Vừa đủ 100%', role: 'Hệ dung dịch nền' }
      ],
      spec: 'Nước trong suốt, hương sả chanh thanh nhẹ sảng khoái, vị ngọt thanh hậu sâu, chỉ số đường huyết 0.',
      directions: 'Phối trộn đồng nhất ở nhiệt độ thường, tiệt trùng UHT 135°C trong 4 giây rồi chiết rót vô trùng.'
    },
    {
      id: 'form-4',
      name: 'Gel Làm Dịu & Phục Hồi Biểu Bì Sau Xâm Lấn',
      badge: 'Dược mỹ phẩm',
      category: 'cosmetics',
      desc: 'Dạng gel mát dịu chiết xuất từ Lô hội nồng độ cao và Tinh dầu Sả chanh kháng khuẩn, chuyên dùng cho liệu trình phục hồi da tại viện da liễu & spa.',
      mainIngredient: 'Chiết xuất Lô hội 200:1 & Sả chanh (PUCECO)',
      dosageForm: 'Gel dưỡng ẩm sinh học',
      image: 'assets/images/form-gel.jpg',
      ingredients: [
        { name: 'Chiết xuất Lô hội hữu cơ 200:1 (PUCECO)', ratio: '1.0% (= 200% gel tươi)', role: 'Cấp ẩm tức thì, hạ nhiệt da' },
        { name: 'Tinh dầu Sả chanh nano (PUCECO)', ratio: '0.2%', role: 'Kháng khuẩn tự nhiên an toàn' },
        { name: 'Pro-Vitamin B5 (D-Panthenol)', ratio: '2.0%', role: 'Kích thích phục hồi tế bào da' },
        { name: 'Chiết xuất Rau má (Centella)', ratio: '1.0%', role: 'Tái tạo liên kết mô' },
        { name: 'Hệ gel Carbomer trung hòa & Nước cất', ratio: 'Vừa đủ 100%', role: 'Tạo cấu trúc gel mát mịn' }
      ],
      spec: 'Gel trong suốt đồng nhất, độ pH 5.8 tương thích sinh lý da, thấm nhanh không nhờn dính.',
      directions: 'Ngậm nước Carbomer hoàn toàn, nâng pH bằng TEA rồi đưa hoạt chất PUCECO vào ở tốc độ khuấy chậm.'
    }
  ];

  const DEFAULT_PRODUCTS = [
    {
      id: 'prod-1',
      name: 'Chiết xuất Trà xanh',
      category: 'extract',
      tag: 'Bán chạy',
      desc: 'EGCG cao (≥ 98%), chống oxy hóa mạnh, ứng dụng rộng cho thực phẩm bảo vệ sức khỏe và mỹ phẩm chống lão hóa.',
      details: {
        activeIngredient: 'EGCG ≥ 98%, Polyphenol ≥ 99%',
        coaStandard: 'Chuẩn USP / EP / ISO 9001',
        formulation: 'Bột mịn màu vàng nhạt đến xanh lục nhạt',
        origin: 'Vùng chè hữu cơ Mộc Châu - Sơn La'
      },
      image: 'assets/images/prod-green-tea.jpg',
      images: ['assets/images/prod-green-tea.jpg'],
      bg1: '#E6F1EA',
      bg2: '#C9E3D3',
      isFeatured: true,
      isNew: false,
      createdAt: '2026-08-01'
    },
    {
      id: 'prod-2',
      name: 'Tinh dầu Sả chanh',
      category: 'essential_oil',
      tag: 'Organic',
      desc: 'Hàm lượng Citral vượt trội (≥ 82%), hương thơm thanh khiết, kháng khuẩn tự nhiên, nguồn gốc dược liệu Việt Nam.',
      details: {
        activeIngredient: 'Citral a + b ≥ 82%',
        coaStandard: 'USDA Organic, HACCP',
        formulation: 'Chất lỏng trong suốt, màu vàng óng ánh',
        origin: 'Tây Nguyên, Việt Nam'
      },
      image: 'assets/images/prod-lemongrass.jpg',
      images: ['assets/images/prod-lemongrass.jpg'],
      bg1: '#F3EFE2',
      bg2: '#E4D6B0',
      isFeatured: true,
      isNew: false,
      createdAt: '2026-08-05'
    },
    {
      id: 'prod-3',
      name: 'Curcumin Nano thế hệ mới',
      category: 'nano',
      tag: 'Bán chạy',
      desc: 'Hạt kích thước siêu nhỏ 30-50nm, độ sinh khả dụng tăng gấp 40 lần, phân tán tan hoàn toàn trong nước.',
      details: {
        activeIngredient: 'Curcuminoid toàn phần ≥ 95%',
        coaStandard: 'Đạt chuẩn GMP Dược phẩm & Viện R&D',
        formulation: 'Bột nano màu vàng cam tươi, tan nước 100%',
        origin: 'Nghệ vàng Nghệ An, Việt Nam'
      },
      image: 'assets/images/prod-curcumin.jpg',
      images: ['assets/images/prod-curcumin.jpg'],
      bg1: '#E8F0EC',
      bg2: '#BBD9CA',
      isFeatured: true,
      isNew: false,
      createdAt: '2026-08-10'
    },
    {
      id: 'prod-4',
      name: 'Chiết xuất Lô hội (Aloe Vera)',
      category: 'extract',
      tag: 'Organic',
      desc: 'Polysaccharide tinh khiết, làm dịu, cấp ẩm sâu và phục hồi biểu bì, chuẩn hóa cho mỹ phẩm dạng gel & serum.',
      details: {
        activeIngredient: 'Polysaccharide ≥ 10%, Aloin A+B < 0.1ppm',
        coaStandard: 'USDA Organic, GMP Cosmetic',
        formulation: 'Dịch chiết cô đặc hoặc bột đông khô 200:1',
        origin: 'Vùng trồng Phan Rang, Ninh Thuận'
      },
      image: 'assets/images/prod-aloe.jpg',
      images: ['assets/images/prod-aloe.jpg'],
      bg1: '#EFEFE6',
      bg2: '#D2D6B8',
      isFeatured: true,
      isNew: false,
      createdAt: '2026-08-15'
    },
    {
      id: 'prod-5',
      name: 'Chiết xuất Nghệ đen',
      category: 'extract',
      tag: 'Mới',
      desc: 'Dòng hoạt chất curcuminoid & sesquiterpene thế hệ mới, ổn định nhiệt, hỗ trợ chống viêm và tiêu hóa hiệu quả.',
      details: {
        activeIngredient: 'Curcumenol, Germacrone, Curzerenone',
        coaStandard: 'Chuẩn Dược điển Việt Nam V',
        formulation: 'Bột chiết chuẩn hóa tỷ lệ 10:1',
        origin: 'Lâm Đồng, Việt Nam'
      },
      image: 'assets/images/prod-turmeric-black.jpg',
      images: ['assets/images/prod-turmeric-black.jpg'],
      bg1: '#E6F1EA',
      bg2: '#A6D0BC',
      isFeatured: false,
      isNew: true,
      createdAt: '2026-09-01'
    },
    {
      id: 'prod-6',
      name: 'Glycoside Stevia (Cỏ ngọt)',
      category: 'sweetener',
      tag: 'Mới',
      desc: 'Chất tạo ngọt tự nhiên Rebaudioside-A 98%, không sinh calo, chỉ số đường huyết 0, an toàn cho người ăn kiêng.',
      details: {
        activeIngredient: 'Rebaudioside A ≥ 98%',
        coaStandard: 'FDA GRAS, HALAL, KOSHER',
        formulation: 'Bột tinh thể màu trắng tinh khiết',
        origin: 'Việt Nam & Hợp tác quốc tế'
      },
      image: 'assets/images/prod-stevia.jpg',
      images: ['assets/images/prod-stevia.jpg'],
      bg1: '#F3EFE2',
      bg2: '#E0CFA6',
      isFeatured: false,
      isNew: true,
      createdAt: '2026-09-05'
    }
  ];

  const DEFAULT_NEWS = [
    {
      id: 'news-1',
      title: 'PUCECO đạt chứng nhận GMP nâng hạng',
      date: '18 Thg 9, 2026',
      excerpt: 'Nhà máy chiết xuất hoàn thiện nâng cấp dây chuyền chiết xuất áp suất thấp theo tiêu chuẩn GMP mới nhất.',
      content: 'Tháng 9/2026, PUCECO chính thức đón nhận giấy chứng nhận Thực hành Sản xuất Tốt (GMP) phiên bản nâng hạng cho toàn bộ tổ hợp nhà máy chiết xuất dược liệu công nghệ cao. Với dây chuyền tự động hóa khép kín và hệ thống lọc nano tiên tiến, công suất chế biến đạt hơn 1.200 tấn dược liệu tươi mỗi năm, sẵn sàng cung ứng cho các tập đoàn dược phẩm lớn trong và ngoài nước.\n\n### Quy trình chiết xuất áp suất thấp & kiểm soát đa tầng\nKhác với phương pháp nhiệt cổ truyền làm hao hụt hoạt tính sinh học quý giá, công nghệ chiết xuất áp suất giảm tại nhiệt độ thấp giúp bảo toàn gần như trọn vẹn 100% hàm lượng tinh chất, flavonoid và polyphenol trong từng mẻ dược liệu.\n\nToàn bộ thông số nhiệt độ, áp suất, độ chân không và thời gian tuần hoàn đều được giám sát thời gian thực bằng hệ thống SCADA tự động hóa, đảm bảo sự đồng nhất tuyệt đối giữa các lô mẻ thành phẩm trước khi xuất xưởng.\n\n![Hệ thống phòng kiểm nghiệm vi sinh và sắc ký phân tích hoạt chất HPLC đạt tiêu chuẩn Dược điển tại PUCECO Labs](assets/images/news-lab.jpg)\n\nViệc đón nhận chứng nhận GMP nâng hạng không chỉ khẳng định năng lực kỹ thuật vượt bậc của PUCECO mà còn đánh dấu bước tiến quan trọng trong sứ mệnh đưa dược liệu chuẩn hóa Việt Nam vươn tầm chuỗi cung ứng quốc tế.',
      image: 'assets/images/news-gmp.jpg',
      images: [
        'assets/images/news-gmp.jpg',
        'assets/images/news-lab.jpg'
      ],
      bg1: '#E6F1EA',
      bg2: '#C9E3D3',
      author: 'Ban Kiểm Soát Chất Lượng'
    },
    {
      id: 'news-2',
      title: 'Mở rộng vùng trồng nguyên liệu sạch tại Tây Nguyên',
      date: '02 Thg 9, 2026',
      excerpt: 'Liên kết 5 hợp tác xã tại Đắk Lắk và Gia Lai, đảm bảo nguồn cung sả chanh, nghệ vàng và gừng bền vững.',
      content: 'Nhằm chủ động kiểm soát chất lượng từ mầm cây đến giọt chiết xuất cuối cùng, PUCECO đã ký kết liên kết bao tiêu cùng 5 hợp tác xã dược liệu với tổng quy mô hơn 150 ha. Mô hình canh tác đạt chứng nhận Hữu cơ (Organic) nói không với thuốc trừ sâu hóa học, tạo sinh kế bền vững cho hơn 200 hộ đồng bào địa phương.\n\n### Chuẩn hóa nguồn giống & canh tác không hóa chất\nCác loại thảo dược chủ lực như sả chanh, nghệ vàng, gừng sẻ và cỏ ngọt được chọn lọc kỹ lưỡng từ nguồn giống thuần chủng có hàm lượng tinh chất cao nhất. Đội ngũ kỹ sư nông nghiệp của PUCECO trực tiếp chuyển giao kỹ thuật canh tác an toàn sinh học và kiểm tra dư lượng định kỳ trước ngày thu hoạch.\n\n![Dược liệu tươi đạt chuẩn hữu cơ được phân loại nghiêm ngặt trước khi đưa vào chiết xuất](assets/images/prod-lemongrass.jpg)\n\nMô hình liên kết khép kín này giúp đối tác hoàn toàn an tâm về tính truy xuất nguồn gốc (Traceability) và sự ổn định dài hạn của chuỗi cung ứng.',
      image: 'assets/images/news-farm.jpg',
      images: [
        'assets/images/news-farm.jpg',
        'assets/images/prod-lemongrass.jpg'
      ],
      bg1: '#F3EFE2',
      bg2: '#E4D6B0',
      author: 'Phòng Phát Triển Vùng Trồng'
    },
    {
      id: 'news-3',
      title: 'Ra mắt Curcumin nano thế hệ mới cho dược phẩm',
      date: '21 Thg 8, 2026',
      excerpt: 'Công trình R&D nội bộ 3 năm nghiên cứu với kích thước tiểu phân dưới 50nm mang lại hiệu quả hấp thu kỷ lục.',
      content: 'Trung tâm Nghiên cứu & Phát triển PUCECO Labs công bố thương mại hóa thành công dòng nguyên liệu Nano Curcumin tan hoàn toàn trong nước với kích thước hạt trung bình chỉ 35nm. Sản phẩm đạt độ ổn định cao trong dải pH 2.0 - 8.0, tương thích lý tưởng cho các dạng bào chế siro, viên nang mềm, thạch collagen và nước uống chức năng.\n\n### Độ hòa tan đột phá & sinh khả dụng tăng gấp 40 lần\nNhờ công nghệ bao vi nang thế hệ mới với màng sinh học tự nhiên, các hạt Nano Curcumin được bảo vệ tối đa qua môi trường acid dạ dày và giải phóng nhanh tại ruột non, nâng cao hiệu quả hấp thu vào cơ thể lên gấp 40 lần so với Curcumin thông thường.\n\n![Nguyên liệu Nano Curcumin phân tán trong suốt tan hoàn toàn không lắng cặn](assets/images/prod-curcumin.jpg)\n\nDòng nguyên liệu mới đã sẵn sàng cung ứng theo lô lớn với đầy đủ hồ sơ kiểm nghiệm COA, phổ UV-Vis và chuẩn phân tích HPLC.',
      image: 'assets/images/news-lab.jpg',
      images: [
        'assets/images/news-lab.jpg',
        'assets/images/prod-curcumin.jpg'
      ],
      bg1: '#E8F0EC',
      bg2: '#BBD9CA',
      author: 'Viện R&D PUCECO'
    }
  ];

  const DEFAULT_LEADS = [
    {
      id: 'lead-1',
      fullName: 'Dược phẩm Tâm Bình Minh',
      email: 'contact@tambinhminh.vn',
      phone: '0912 345 678',
      company: 'Công ty CP Dược Phẩm TBM',
      productOfInterest: 'Curcumin Nano thế hệ mới',
      message: 'Xin chào PUCECO, chúng tôi muốn xin mẫu thử 100g và hồ sơ COA để thử nghiệm sản phẩm viên nang khớp mới.',
      status: 'contacted',
      createdAt: '2026-09-20 14:32'
    },
    {
      id: 'lead-2',
      fullName: 'Mỹ phẩm Thiên Nhiên EcoSkin',
      email: 'ecoskin.rd@gmail.com',
      phone: '0988 776 655',
      company: 'EcoSkin Lab',
      productOfInterest: 'Chiết xuất Trà xanh & Lô hội',
      message: 'Cần nhận bảng báo giá sỉ cho lô hàng 50kg và mẫu thử làm toner dưỡng ẩm.',
      status: 'new',
      createdAt: '2026-09-21 09:15'
    }
  ];

  // Broadcast Channel để đồng bộ giữa các tab
  let broadcastChannel = null;
  if ('BroadcastChannel' in window) {
    try {
      broadcastChannel = new BroadcastChannel('puceco_sync_channel');
    } catch (e) {
      console.warn('BroadcastChannel not available:', e);
    }
  }

  function emitSync(type, payload) {
    if (broadcastChannel) {
      broadcastChannel.postMessage({ type, payload, timestamp: Date.now() });
    }
  }

  function normalizeNewsItem(n) {
    if (!n) return n;
    const defaultNewsMap = {
      'news-1': DEFAULT_NEWS[0],
      'news-2': DEFAULT_NEWS[1],
      'news-3': DEFAULT_NEWS[2]
    };
    const def = defaultNewsMap[n.id];
    if (def) {
      // Ép dùng ảnh thực tế JPG chất lượng cao thay vì vector SVG icon
      n.image = def.image;
      if (!n.content || !n.content.includes('![')) {
        n.content = def.content;
      }
      n.images = def.images;
      if (!n.excerpt) n.excerpt = def.excerpt;
      n.bg1 = def.bg1;
      n.bg2 = def.bg2;
    } else if (n.image && typeof n.image === 'string' && n.image.endsWith('.svg')) {
      n.image = n.image.replace(/\.svg$/, '.jpg');
    }
    // Loại bỏ cú pháp ảnh cover nếu còn sót trong nội dung markdown để không lặp hình
    if (n.content && n.image) {
      const cleanCover = n.image.replace(/^\.?\//, '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const dupRegex = new RegExp(`!\\[[^\\]]*\\]\\(\\s*\\.?\\/?${cleanCover}\\s*\\)\\r?\\n?`, 'gi');
      n.content = n.content.replace(dupRegex, '').trim();
    }
    return n;
  }

  // Khởi tạo Seed Data nếu chưa có & Cập nhật ảnh realistic mới
  function initData() {
    const storedSettings = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (!storedSettings) {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
    } else {
      try {
        const s = JSON.parse(storedSettings);
        const updatedSettings = {
          ...s,
          slogan: DEFAULT_SETTINGS.slogan,
          aboutIntro: DEFAULT_SETTINGS.aboutIntro,
          values: DEFAULT_SETTINGS.values,
          stats: (!s.stats || s.stats.years === 12 || s.stats.partners === 320) ? DEFAULT_SETTINGS.stats : (s.stats || DEFAULT_SETTINGS.stats),
          email: s.email === 'info@puceco.vn' ? DEFAULT_SETTINGS.email : (s.email || DEFAULT_SETTINGS.email),
          hotline: s.hotline === '1900 123 456' ? DEFAULT_SETTINGS.hotline : (s.hotline || DEFAULT_SETTINGS.hotline),
          address: (s.address === 'Khu Công Nghệ Cao, Hà Nội, Việt Nam' || s.address === 'Khu Công Nghệ Cao, Hà Nội') ? DEFAULT_SETTINGS.address : (s.address || DEFAULT_SETTINGS.address),
          mapsUrl: s.mapsUrl || DEFAULT_SETTINGS.mapsUrl
        };
        localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(updatedSettings));
      } catch (e) {
        localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
      }
    }
    const storedProds = localStorage.getItem(STORAGE_KEY_PRODUCTS);
    if (!storedProds) {
      localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(DEFAULT_PRODUCTS));
    } else {
      try {
        let prods = JSON.parse(storedProds);
        let updated = false;
        const defaultImgMap = {
          'prod-1': 'assets/images/prod-green-tea.jpg',
          'prod-2': 'assets/images/prod-lemongrass.jpg',
          'prod-3': 'assets/images/prod-curcumin.jpg',
          'prod-4': 'assets/images/prod-aloe.jpg',
          'prod-5': 'assets/images/prod-turmeric-black.jpg',
          'prod-6': 'assets/images/prod-stevia.jpg'
        };
        prods = prods.map(p => {
          if (defaultImgMap[p.id] && (!p.image || p.image.endsWith('.svg') || p.image.includes('prod-'))) {
            if (p.image !== defaultImgMap[p.id]) {
              p.image = defaultImgMap[p.id];
              updated = true;
            }
          } else if (p.image && p.image.endsWith('.svg') && p.image.includes('prod-')) {
            p.image = p.image.replace(/\.svg$/, '.jpg');
            updated = true;
          }
          return p;
        });
        if (updated) {
          localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(prods));
        }
      } catch (e) {
        localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(DEFAULT_PRODUCTS));
      }
    }
    // Auto-upgrade News sang ảnh realistic JPG và nội dung có ảnh chi tiết
    const storedNews = localStorage.getItem(STORAGE_KEY_NEWS);
    if (!storedNews) {
      localStorage.setItem(STORAGE_KEY_NEWS, JSON.stringify(DEFAULT_NEWS));
    } else {
      try {
        let news = JSON.parse(storedNews);
        if (Array.isArray(news) && news.length > 0) {
          news = news.map(normalizeNewsItem);
          localStorage.setItem(STORAGE_KEY_NEWS, JSON.stringify(news));
        } else {
          localStorage.setItem(STORAGE_KEY_NEWS, JSON.stringify(DEFAULT_NEWS));
        }
      } catch (e) {
        localStorage.setItem(STORAGE_KEY_NEWS, JSON.stringify(DEFAULT_NEWS));
      }
    }

    if (!localStorage.getItem(STORAGE_KEY_LEADS)) {
      localStorage.setItem(STORAGE_KEY_LEADS, JSON.stringify(DEFAULT_LEADS));
    }

    // Auto-upgrade Formulations sang ảnh realistic JPG
    const storedForms = localStorage.getItem(STORAGE_KEY_FORMULATIONS);
    if (!storedForms) {
      localStorage.setItem(STORAGE_KEY_FORMULATIONS, JSON.stringify(DEFAULT_FORMULATIONS));
    } else {
      try {
        let forms = JSON.parse(storedForms);
        let updated = false;
        const defaultFormMap = {
          'form-1': 'assets/images/form-serum.jpg',
          'form-2': 'assets/images/form-capsule.jpg',
          'form-3': 'assets/images/form-drink.jpg',
          'form-4': 'assets/images/form-gel.jpg'
        };
        forms = forms.map(f => {
          if (defaultFormMap[f.id] && (!f.image || f.image.endsWith('.svg') || f.image.includes('form-'))) {
            if (f.image !== defaultFormMap[f.id]) {
              f.image = defaultFormMap[f.id];
              updated = true;
            }
          } else if (f.image && f.image.endsWith('.svg') && f.image.includes('form-')) {
            f.image = f.image.replace(/\.svg$/, '.jpg');
            updated = true;
          }
          return f;
        });
        if (updated) {
          localStorage.setItem(STORAGE_KEY_FORMULATIONS, JSON.stringify(forms));
        }
      } catch (e) {
        localStorage.setItem(STORAGE_KEY_FORMULATIONS, JSON.stringify(DEFAULT_FORMULATIONS));
      }
    }

    if (!localStorage.getItem(STORAGE_KEY_CERTS)) {
      localStorage.setItem(STORAGE_KEY_CERTS, JSON.stringify(DEFAULT_CERTS));
    }

    if (!localStorage.getItem(STORAGE_KEY_SLIDES)) {
      localStorage.setItem(STORAGE_KEY_SLIDES, JSON.stringify(DEFAULT_SLIDES));
    }

    // Menu điều hướng
    if (!localStorage.getItem(STORAGE_KEY_MENU)) {
      localStorage.setItem(STORAGE_KEY_MENU, JSON.stringify(DEFAULT_MENU));
    }

    // Header CTA Button
    if (!localStorage.getItem(STORAGE_KEY_HEADER_CTA)) {
      localStorage.setItem(STORAGE_KEY_HEADER_CTA, JSON.stringify(DEFAULT_HEADER_CTA));
    }

    // Cấu hình đề mục trang chủ
    const storedSections = localStorage.getItem(STORAGE_KEY_SECTIONS);
    if (!storedSections) {
      localStorage.setItem(STORAGE_KEY_SECTIONS, JSON.stringify(DEFAULT_SECTIONS));
    } else {
      try {
        const sec = JSON.parse(storedSections);
        const merged = {
          intro: { ...DEFAULT_SECTIONS.intro, ...(sec.intro || {}) },
          certs: { ...DEFAULT_SECTIONS.certs, ...(sec.certs || {}) },
          featuredProducts: { ...DEFAULT_SECTIONS.featuredProducts, ...(sec.featuredProducts || {}) },
          newProducts: { ...DEFAULT_SECTIONS.newProducts, ...(sec.newProducts || {}) },
          formulations: { ...DEFAULT_SECTIONS.formulations, ...(sec.formulations || {}) },
          news: { ...DEFAULT_SECTIONS.news, ...(sec.news || {}) },
          contact: { ...DEFAULT_SECTIONS.contact, ...(sec.contact || {}) },
          footer: { ...DEFAULT_SECTIONS.footer, ...(sec.footer || {}) }
        };
        localStorage.setItem(STORAGE_KEY_SECTIONS, JSON.stringify(merged));
      } catch (e) {
        localStorage.setItem(STORAGE_KEY_SECTIONS, JSON.stringify(DEFAULT_SECTIONS));
      }
    }
  }

  // Tự động đồng bộ 2 chiều với Cloudflare D1 & R2 Backend
  async function syncWithApi() {
    try {
      // 1. Kích hoạt tự động kiểm tra/tạo bảng D1 nếu cần
      fetch('/api/init', { method: 'POST' }).catch(() => {});

      // 2. Đồng bộ Sản phẩm từ D1
      const prodRes = await fetch('/api/products').catch(() => null);
      if (prodRes && prodRes.ok) {
        const cloudProds = await prodRes.json();
        if (Array.isArray(cloudProds) && cloudProds.length > 0) {
          localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(cloudProds));
          emitSync('PRODUCTS_SYNCED', cloudProds);
        }
      }

      // 3. Đồng bộ Tin tức / Blog từ D1
      const newsRes = await fetch('/api/news').catch(() => null);
      if (newsRes && newsRes.ok) {
        const cloudNews = await newsRes.json();
        if (Array.isArray(cloudNews) && cloudNews.length > 0) {
          const normalized = cloudNews.map(normalizeNewsItem);
          localStorage.setItem(STORAGE_KEY_NEWS, JSON.stringify(normalized));
          emitSync('NEWS_SYNCED', normalized);
        }
      }

      // 4. Đồng bộ Cấu hình từ D1
      const setRes = await fetch('/api/settings').catch(() => null);
      if (setRes && setRes.ok) {
        const cloudSettings = await setRes.json();
        if (cloudSettings && typeof cloudSettings === 'object' && cloudSettings.hotline) {
          const current = JSON.parse(localStorage.getItem(STORAGE_KEY_SETTINGS) || '{}');
          localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify({ ...current, ...cloudSettings }));
          if (Array.isArray(cloudSettings.certifications)) {
            localStorage.setItem(STORAGE_KEY_CERTS, JSON.stringify(cloudSettings.certifications));
            emitSync('CERTS_SYNCED', cloudSettings.certifications);
          }
          if (Array.isArray(cloudSettings.slides) && cloudSettings.slides.length > 0) {
            localStorage.setItem(STORAGE_KEY_SLIDES, JSON.stringify(cloudSettings.slides));
            emitSync('SLIDES_SYNCED', cloudSettings.slides);
          }
          if (Array.isArray(cloudSettings.menu) && cloudSettings.menu.length > 0) {
            localStorage.setItem(STORAGE_KEY_MENU, JSON.stringify(cloudSettings.menu));
            emitSync('MENU_SYNCED', cloudSettings.menu);
          }
          if (cloudSettings.headerCta && typeof cloudSettings.headerCta === 'object') {
            localStorage.setItem(STORAGE_KEY_HEADER_CTA, JSON.stringify(cloudSettings.headerCta));
            emitSync('HEADER_CTA_SYNCED', cloudSettings.headerCta);
          }
          if (cloudSettings.sections && typeof cloudSettings.sections === 'object') {
            const curSec = JSON.parse(localStorage.getItem(STORAGE_KEY_SECTIONS) || '{}');
            const mergedSec = { ...DEFAULT_SECTIONS, ...curSec, ...cloudSettings.sections };
            localStorage.setItem(STORAGE_KEY_SECTIONS, JSON.stringify(mergedSec));
            emitSync('SECTIONS_SYNCED', mergedSec);
          }
          emitSync('SETTINGS_SYNCED', cloudSettings);
        }
      }

      // 5. Đồng bộ Leads nếu đang ở trang Admin
      if (sessionStorage.getItem(STORAGE_KEY_AUTH) === 'true') {
        const leadRes = await fetch('/api/leads').catch(() => null);
        if (leadRes && leadRes.ok) {
          const cloudLeads = await leadRes.json();
          if (Array.isArray(cloudLeads)) {
            localStorage.setItem(STORAGE_KEY_LEADS, JSON.stringify(cloudLeads));
            emitSync('LEADS_SYNCED', cloudLeads);
          }
        }
      }
    } catch (e) {
      console.warn('API sync warning (running in offline/local fallback mode):', e);
    }
  }

  initData();
  // Kích hoạt đồng bộ ngầm khi tải trang
  if (typeof window !== 'undefined' && window.fetch) {
    setTimeout(syncWithApi, 100);
  }

  // API Đọc / Ghi
  const DataStore = {
    // Products
    getProducts: function () {
      try {
        const raw = JSON.parse(localStorage.getItem(STORAGE_KEY_PRODUCTS)) || [];
        return raw.map(p => {
          if (!p.images || !Array.isArray(p.images) || p.images.length === 0) {
            p.images = p.image ? [p.image] : [];
          }
          if (p.images.length > 3) {
            p.images = p.images.slice(0, 3);
          }
          if (!p.image && p.images.length > 0) {
            p.image = p.images[0];
          }
          return p;
        });
      } catch (e) {
        return DEFAULT_PRODUCTS;
      }
    },

    getProductById: function (id) {
      const list = this.getProducts();
      return list.find(p => p.id === id) || null;
    },

    saveProduct: function (product) {
      const list = this.getProducts();

      // Đảm bảo mảng hình ảnh tối đa 3 hình
      if (Array.isArray(product.images)) {
        product.images = product.images.filter(img => typeof img === 'string' && img.trim() !== '').slice(0, 3);
      } else if (product.image) {
        product.images = [product.image];
      } else {
        product.images = [];
      }

      // Ảnh đại diện chính luôn đồng bộ với ảnh đầu tiên trong mảng
      if (product.images.length > 0) {
        product.image = product.images[0];
      } else if (!product.image) {
        product.image = 'assets/images/prod-green-tea.jpg';
        product.images = [product.image];
      }

      if (!product.id) {
        product.id = 'prod-' + Date.now();
        product.createdAt = new Date().toISOString().split('T')[0];
        list.unshift(product);
      } else {
        const index = list.findIndex(p => p.id === product.id);
        if (index >= 0) {
          list[index] = { ...list[index], ...product };
        } else {
          list.unshift(product);
        }
      }
      localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(list));
      emitSync('PRODUCT_UPDATED', product);

      // Đồng bộ ngầm lên Cloudflare D1
      fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
      }).catch(err => console.warn('Cloudflare D1 sync warning:', err));

      return product;
    },

    deleteProduct: function (id) {
      let list = this.getProducts();
      list = list.filter(p => p.id !== id);
      localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(list));
      emitSync('PRODUCT_DELETED', { id });

      // Đồng bộ xóa trên Cloudflare D1
      fetch('/api/products/' + encodeURIComponent(id), {
        method: 'DELETE'
      }).catch(err => console.warn('Cloudflare D1 delete warning:', err));

      return true;
    },

    // News / Blog
    getNews: function () {
      try {
        const raw = JSON.parse(localStorage.getItem(STORAGE_KEY_NEWS));
        if (Array.isArray(raw) && raw.length > 0) {
          return raw.map(normalizeNewsItem);
        }
        return DEFAULT_NEWS.map(normalizeNewsItem);
      } catch (e) {
        return DEFAULT_NEWS.map(normalizeNewsItem);
      }
    },

    getNewsById: function (id) {
      const list = this.getNews();
      const item = list.find(n => n.id === id);
      return item ? normalizeNewsItem(item) : null;
    },

    saveNews: function (item) {
      const list = this.getNews();
      if (!item.id) {
        item.id = 'news-' + Date.now();
        item.createdAt = new Date().toISOString().split('T')[0];
        list.unshift(item);
      } else {
        const index = list.findIndex(n => n.id === item.id);
        if (index >= 0) {
          list[index] = { ...list[index], ...item };
        } else {
          list.unshift(item);
        }
      }
      localStorage.setItem(STORAGE_KEY_NEWS, JSON.stringify(list));
      emitSync('NEWS_UPDATED', item);

      // Đồng bộ ngầm lên Cloudflare D1
      fetch('/api/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      }).catch(err => console.warn('Cloudflare D1 sync warning:', err));

      return item;
    },

    deleteNews: function (id) {
      let list = this.getNews();
      list = list.filter(n => n.id !== id);
      localStorage.setItem(STORAGE_KEY_NEWS, JSON.stringify(list));
      emitSync('NEWS_DELETED', { id });

      // Đồng bộ xóa trên Cloudflare D1
      fetch('/api/news/' + encodeURIComponent(id), {
        method: 'DELETE'
      }).catch(err => console.warn('Cloudflare D1 delete warning:', err));

      return true;
    },

    // Leads / Contact Inquiries
    getLeads: function () {
      try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY_LEADS)) || [];
      } catch (e) {
        return DEFAULT_LEADS;
      }
    },

    addLead: function (lead) {
      const list = this.getLeads();
      const newLead = {
        id: 'lead-' + Date.now(),
        fullName: lead.fullName || 'Khách hàng',
        email: lead.email || '',
        phone: lead.phone || '',
        company: lead.company || '',
        productOfInterest: lead.productOfInterest || 'Yêu cầu tư vấn chung',
        message: lead.message || '',
        status: 'new', // 'new' | 'contacted' | 'sample_sent' | 'completed'
        createdAt: new Date().toLocaleString('vi-VN')
      };
      list.unshift(newLead);
      localStorage.setItem(STORAGE_KEY_LEADS, JSON.stringify(list));
      emitSync('NEW_LEAD', newLead);

      // Gửi yêu cầu lưu vào Cloudflare D1
      fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLead)
      }).catch(err => console.warn('Cloudflare D1 lead sync warning:', err));

      return newLead;
    },

    updateLeadStatus: function (id, status) {
      const list = this.getLeads();
      const item = list.find(l => l.id === id);
      if (item) {
        item.status = status;
        localStorage.setItem(STORAGE_KEY_LEADS, JSON.stringify(list));
        emitSync('LEAD_STATUS_UPDATED', { id, status });

        fetch('/api/leads/' + encodeURIComponent(id), {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status })
        }).catch(err => console.warn('Cloudflare D1 status sync warning:', err));

        return true;
      }
      return false;
    },

    deleteLead: function (id) {
      let list = this.getLeads();
      list = list.filter(l => l.id !== id);
      localStorage.setItem(STORAGE_KEY_LEADS, JSON.stringify(list));
      emitSync('LEAD_DELETED', { id });

      fetch('/api/leads/' + encodeURIComponent(id), {
        method: 'DELETE'
      }).catch(err => console.warn('Cloudflare D1 lead delete warning:', err));

      return true;
    },

    // Formulations (Công thức mẫu)
    getFormulations: function () {
      try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY_FORMULATIONS)) || DEFAULT_FORMULATIONS;
      } catch (e) {
        return DEFAULT_FORMULATIONS;
      }
    },

    getFormulationById: function (id) {
      const list = this.getFormulations();
      return list.find(f => f.id === id) || null;
    },

    saveFormulation: function (form) {
      const list = this.getFormulations();
      if (!form.id) {
        form.id = 'form-' + Date.now();
        list.unshift(form);
      } else {
        const index = list.findIndex(f => f.id === form.id);
        if (index >= 0) {
          list[index] = { ...list[index], ...form };
        } else {
          list.unshift(form);
        }
      }
      localStorage.setItem(STORAGE_KEY_FORMULATIONS, JSON.stringify(list));
      emitSync('FORMULATION_UPDATED', form);

      fetch('/api/formulations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      }).catch(err => console.warn('Cloudflare D1 formulation save warning:', err));

      return form;
    },

    deleteFormulation: function (id) {
      let list = this.getFormulations();
      list = list.filter(f => f.id !== id);
      localStorage.setItem(STORAGE_KEY_FORMULATIONS, JSON.stringify(list));
      emitSync('FORMULATION_DELETED', { id });

      fetch('/api/formulations/' + encodeURIComponent(id), {
        method: 'DELETE'
      }).catch(err => console.warn('Cloudflare D1 formulation delete warning:', err));

      return true;
    },

    // Certifications (Chứng nhận & Tiêu chuẩn)
    getCertifications: function () {
      try {
        const raw = JSON.parse(localStorage.getItem(STORAGE_KEY_CERTS));
        if (Array.isArray(raw) && raw.length > 0) return raw;
        return DEFAULT_CERTS;
      } catch (e) {
        return DEFAULT_CERTS;
      }
    },

    getCertificationById: function (id) {
      const list = this.getCertifications();
      return list.find(c => c.id === id) || null;
    },

    saveCertification: function (cert) {
      const list = this.getCertifications();
      if (!cert.id) {
        cert.id = 'cert-' + Date.now();
        cert.order = list.length + 1;
        if (cert.enabled === undefined) cert.enabled = true;
        list.push(cert);
      } else {
        const index = list.findIndex(c => c.id === cert.id);
        if (index >= 0) {
          list[index] = { ...list[index], ...cert };
        } else {
          list.push(cert);
        }
      }
      localStorage.setItem(STORAGE_KEY_CERTS, JSON.stringify(list));
      emitSync('CERTS_UPDATED', list);
      this.syncCertsToSettings(list);
      return cert;
    },

    saveCertificationsList: function (newList) {
      localStorage.setItem(STORAGE_KEY_CERTS, JSON.stringify(newList));
      emitSync('CERTS_UPDATED', newList);
      this.syncCertsToSettings(newList);
      return newList;
    },

    deleteCertification: function (id) {
      let list = this.getCertifications();
      list = list.filter(c => c.id !== id);
      localStorage.setItem(STORAGE_KEY_CERTS, JSON.stringify(list));
      emitSync('CERTS_UPDATED', list);
      this.syncCertsToSettings(list);
      return true;
    },

    toggleCertification: function (id) {
      const list = this.getCertifications();
      const item = list.find(c => c.id === id);
      if (item) {
        item.enabled = !item.enabled;
        localStorage.setItem(STORAGE_KEY_CERTS, JSON.stringify(list));
        emitSync('CERTS_UPDATED', list);
        this.syncCertsToSettings(list);
        return item.enabled;
      }
      return false;
    },

    reorderCertifications: function (id, direction) {
      const list = this.getCertifications();
      const index = list.findIndex(c => c.id === id);
      if (index < 0) return false;
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= list.length) return false;

      const temp = list[index];
      list[index] = list[targetIndex];
      list[targetIndex] = temp;

      list.forEach((item, idx) => { item.order = idx + 1; });
      localStorage.setItem(STORAGE_KEY_CERTS, JSON.stringify(list));
      emitSync('CERTS_UPDATED', list);
      this.syncCertsToSettings(list);
      return true;
    },

    syncCertsToSettings: function (certsList) {
      try {
        const current = this.getSettings();
        current.certifications = certsList;
        localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(current));
        fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(current)
        }).catch(() => {});
      } catch (e) {}
    },

    // Hero Slides (Trang chủ)
    getSlides: function () {
      try {
        const raw = JSON.parse(localStorage.getItem(STORAGE_KEY_SLIDES));
        if (Array.isArray(raw) && raw.length > 0) {
          return raw.sort((a, b) => (a.order || 0) - (b.order || 0));
        }
        return DEFAULT_SLIDES;
      } catch (e) {
        return DEFAULT_SLIDES;
      }
    },

    getSlideById: function (id) {
      const list = this.getSlides();
      return list.find(s => s.id === id) || null;
    },

    saveSlide: function (slide) {
      const list = this.getSlides();
      if (!slide.id) {
        slide.id = 'slide-' + (list.length + 1);
        slide.order = list.length + 1;
        if (slide.enabled === undefined) slide.enabled = true;
        list.push(slide);
      } else {
        const index = list.findIndex(s => s.id === slide.id);
        if (index >= 0) {
          list[index] = { ...list[index], ...slide };
        } else {
          list.push(slide);
        }
      }
      localStorage.setItem(STORAGE_KEY_SLIDES, JSON.stringify(list));
      emitSync('SLIDES_UPDATED', list);
      this.syncSlidesToSettings(list);
      return slide;
    },

    saveSlidesList: function (newList) {
      localStorage.setItem(STORAGE_KEY_SLIDES, JSON.stringify(newList));
      emitSync('SLIDES_UPDATED', newList);
      this.syncSlidesToSettings(newList);
      return newList;
    },

    toggleSlide: function (id) {
      const list = this.getSlides();
      const item = list.find(s => s.id === id);
      if (item) {
        item.enabled = !item.enabled;
        localStorage.setItem(STORAGE_KEY_SLIDES, JSON.stringify(list));
        emitSync('SLIDES_UPDATED', list);
        this.syncSlidesToSettings(list);
        return item.enabled;
      }
      return false;
    },

    resetSlidesToDefault: function () {
      localStorage.setItem(STORAGE_KEY_SLIDES, JSON.stringify(DEFAULT_SLIDES));
      emitSync('SLIDES_UPDATED', DEFAULT_SLIDES);
      this.syncSlidesToSettings(DEFAULT_SLIDES);
      return DEFAULT_SLIDES;
    },

    syncSlidesToSettings: function (slidesList) {
      try {
        const current = this.getSettings();
        current.slides = slidesList;
        localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(current));
        fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(current)
        }).catch(() => {});
      } catch (e) {}
    },

    // ===== Menu Điều Hướng (Navigation Items) =====
    getMenu: function () {
      try {
        const raw = JSON.parse(localStorage.getItem(STORAGE_KEY_MENU));
        if (Array.isArray(raw) && raw.length > 0) {
          return raw.sort((a, b) => (a.order || 0) - (b.order || 0));
        }
        return DEFAULT_MENU;
      } catch (e) {
        return DEFAULT_MENU;
      }
    },

    getMenuItemById: function (id) {
      const list = this.getMenu();
      return list.find(m => m.id === id) || null;
    },

    saveMenuItem: function (item) {
      const list = this.getMenu();
      if (!item.id) {
        item.id = 'menu-' + Date.now();
        item.order = list.length + 1;
        if (item.enabled === undefined) item.enabled = true;
        if (!item.target) item.target = '_self';
        list.push(item);
      } else {
        const index = list.findIndex(m => m.id === item.id);
        if (index >= 0) {
          list[index] = { ...list[index], ...item };
        } else {
          list.push(item);
        }
      }
      localStorage.setItem(STORAGE_KEY_MENU, JSON.stringify(list));
      emitSync('MENU_UPDATED', list);
      this.syncMenuToSettings(list);
      return item;
    },

    saveMenuList: function (newList) {
      localStorage.setItem(STORAGE_KEY_MENU, JSON.stringify(newList));
      emitSync('MENU_UPDATED', newList);
      this.syncMenuToSettings(newList);
      return newList;
    },

    deleteMenuItem: function (id) {
      let list = this.getMenu();
      list = list.filter(m => m.id !== id);
      list.forEach((m, idx) => { m.order = idx + 1; });
      localStorage.setItem(STORAGE_KEY_MENU, JSON.stringify(list));
      emitSync('MENU_UPDATED', list);
      this.syncMenuToSettings(list);
      return true;
    },

    toggleMenuItem: function (id) {
      const list = this.getMenu();
      const item = list.find(m => m.id === id);
      if (item) {
        item.enabled = !item.enabled;
        localStorage.setItem(STORAGE_KEY_MENU, JSON.stringify(list));
        emitSync('MENU_UPDATED', list);
        this.syncMenuToSettings(list);
        return item.enabled;
      }
      return false;
    },

    reorderMenu: function (id, direction) {
      const list = this.getMenu();
      const index = list.findIndex(m => m.id === id);
      if (index < 0) return false;
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= list.length) return false;

      const temp = list[index];
      list[index] = list[targetIndex];
      list[targetIndex] = temp;

      list.forEach((m, idx) => { m.order = idx + 1; });
      localStorage.setItem(STORAGE_KEY_MENU, JSON.stringify(list));
      emitSync('MENU_UPDATED', list);
      this.syncMenuToSettings(list);
      return true;
    },

    resetMenuToDefault: function () {
      localStorage.setItem(STORAGE_KEY_MENU, JSON.stringify(DEFAULT_MENU));
      emitSync('MENU_UPDATED', DEFAULT_MENU);
      this.syncMenuToSettings(DEFAULT_MENU);
      return DEFAULT_MENU;
    },

    syncMenuToSettings: function (menuList) {
      try {
        const current = this.getSettings();
        current.menu = menuList;
        localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(current));
        fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(current)
        }).catch(() => {});
      } catch (e) {}
    },

    // ===== Header CTA Button =====
    getHeaderCta: function () {
      try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY_HEADER_CTA)) || DEFAULT_HEADER_CTA;
      } catch (e) {
        return DEFAULT_HEADER_CTA;
      }
    },

    saveHeaderCta: function (cta) {
      const updated = { ...DEFAULT_HEADER_CTA, ...cta };
      localStorage.setItem(STORAGE_KEY_HEADER_CTA, JSON.stringify(updated));
      emitSync('HEADER_CTA_UPDATED', updated);
      try {
        const current = this.getSettings();
        current.headerCta = updated;
        localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(current));
        fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(current)
        }).catch(() => {});
      } catch (e) {}
      return updated;
    },

    // ===== Tiêu đề & Nội dung từng phần đề mục Trang Chủ (Sections) =====
    getSections: function () {
      try {
        const raw = JSON.parse(localStorage.getItem(STORAGE_KEY_SECTIONS));
        if (raw && typeof raw === 'object') {
          return {
            intro: { ...DEFAULT_SECTIONS.intro, ...(raw.intro || {}) },
            certs: { ...DEFAULT_SECTIONS.certs, ...(raw.certs || {}) },
            featuredProducts: { ...DEFAULT_SECTIONS.featuredProducts, ...(raw.featuredProducts || {}) },
            newProducts: { ...DEFAULT_SECTIONS.newProducts, ...(raw.newProducts || {}) },
            formulations: { ...DEFAULT_SECTIONS.formulations, ...(raw.formulations || {}) },
            news: { ...DEFAULT_SECTIONS.news, ...(raw.news || {}) },
            contact: { ...DEFAULT_SECTIONS.contact, ...(raw.contact || {}) },
            footer: { ...DEFAULT_SECTIONS.footer, ...(raw.footer || {}) }
          };
        }
        return DEFAULT_SECTIONS;
      } catch (e) {
        return DEFAULT_SECTIONS;
      }
    },

    saveSections: function (newSections) {
      const current = this.getSections();
      const updated = {
        intro: { ...current.intro, ...(newSections.intro || {}) },
        certs: { ...current.certs, ...(newSections.certs || {}) },
        featuredProducts: { ...current.featuredProducts, ...(newSections.featuredProducts || {}) },
        newProducts: { ...current.newProducts, ...(newSections.newProducts || {}) },
        formulations: { ...current.formulations, ...(newSections.formulations || {}) },
        news: { ...current.news, ...(newSections.news || {}) },
        contact: { ...current.contact, ...(newSections.contact || {}) },
        footer: { ...current.footer, ...(newSections.footer || {}) }
      };
      localStorage.setItem(STORAGE_KEY_SECTIONS, JSON.stringify(updated));
      emitSync('SECTIONS_UPDATED', updated);
      this.syncSectionsToSettings(updated);
      return updated;
    },

    resetSectionsToDefault: function () {
      localStorage.setItem(STORAGE_KEY_SECTIONS, JSON.stringify(DEFAULT_SECTIONS));
      emitSync('SECTIONS_UPDATED', DEFAULT_SECTIONS);
      this.syncSectionsToSettings(DEFAULT_SECTIONS);
      return DEFAULT_SECTIONS;
    },

    syncSectionsToSettings: function (sectionsData) {
      try {
        const current = this.getSettings();
        current.sections = sectionsData;
        localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(current));
        fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(current)
        }).catch(() => {});
      } catch (e) {}
    },

    // Settings
    getSettings: function () {
      try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY_SETTINGS)) || DEFAULT_SETTINGS;
      } catch (e) {
        return DEFAULT_SETTINGS;
      }
    },

    saveSettings: function (newSettings) {
      const current = this.getSettings();
      const updated = { ...current, ...newSettings };
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(updated));
      emitSync('SETTINGS_UPDATED', updated);

      fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      }).catch(err => console.warn('Cloudflare D1 settings sync warning:', err));

      return updated;
    },

    // Upload Media lên Cloudflare R2 Storage (với fallback)
    uploadMedia: async function (fileOrDataUrl, filename = 'image.jpg') {
      try {
        let res;
        if (fileOrDataUrl instanceof File || fileOrDataUrl instanceof Blob) {
          const formData = new FormData();
          formData.append('file', fileOrDataUrl, filename);
          res = await fetch('/api/upload', { method: 'POST', body: formData });
        } else if (typeof fileOrDataUrl === 'string' && fileOrDataUrl.startsWith('data:image/')) {
          res = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ dataUrl: fileOrDataUrl, name: filename })
          });
        }
        if (res && res.ok) {
          const data = await res.json();
          if (data && data.url) return data.url;
        }
      } catch (e) {
        console.warn('Media upload to R2 API warning:', e);
      }
      return typeof fileOrDataUrl === 'string' ? fileOrDataUrl : null;
    },

    // Auth
    verifyAdminPassword: function (password) {
      const settings = this.getSettings();
      return password === settings.adminPassword || password === settings.adminPasswordHash;
    },

    setAdminSession: function (isLoggedIn) {
      if (isLoggedIn) {
        sessionStorage.setItem(STORAGE_KEY_AUTH, 'true');
      } else {
        sessionStorage.removeItem(STORAGE_KEY_AUTH);
      }
    },

    isAdminLoggedIn: function () {
      return sessionStorage.getItem(STORAGE_KEY_AUTH) === 'true';
    },

    // Backup & Restore
    exportAllData: function () {
      return JSON.stringify({
        version: '2.1.0',
        exportedAt: new Date().toISOString(),
        settings: this.getSettings(),
        menu: this.getMenu(),
        headerCta: this.getHeaderCta(),
        sections: this.getSections(),
        products: this.getProducts(),
        news: this.getNews(),
        leads: this.getLeads(),
        formulations: this.getFormulations(),
        certifications: this.getCertifications(),
        slides: this.getSlides()
      }, null, 2);
    },

    importAllData: function (jsonString) {
      try {
        const data = JSON.parse(jsonString);
        if (data.settings) localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(data.settings));
        if (data.menu) localStorage.setItem(STORAGE_KEY_MENU, JSON.stringify(data.menu));
        if (data.headerCta) localStorage.setItem(STORAGE_KEY_HEADER_CTA, JSON.stringify(data.headerCta));
        if (data.sections) localStorage.setItem(STORAGE_KEY_SECTIONS, JSON.stringify(data.sections));
        if (data.products) localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(data.products));
        if (data.news) localStorage.setItem(STORAGE_KEY_NEWS, JSON.stringify(data.news));
        if (data.leads) localStorage.setItem(STORAGE_KEY_LEADS, JSON.stringify(data.leads));
        if (data.formulations) localStorage.setItem(STORAGE_KEY_FORMULATIONS, JSON.stringify(data.formulations));
        if (data.certifications) localStorage.setItem(STORAGE_KEY_CERTS, JSON.stringify(data.certifications));
        if (data.slides) localStorage.setItem(STORAGE_KEY_SLIDES, JSON.stringify(data.slides));
        emitSync('ALL_DATA_RESTORED', {});
        return { success: true };
      } catch (err) {
        return { success: false, error: err.message };
      }
    },

    resetToDefault: function () {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
      localStorage.setItem(STORAGE_KEY_MENU, JSON.stringify(DEFAULT_MENU));
      localStorage.setItem(STORAGE_KEY_HEADER_CTA, JSON.stringify(DEFAULT_HEADER_CTA));
      localStorage.setItem(STORAGE_KEY_SECTIONS, JSON.stringify(DEFAULT_SECTIONS));
      localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(DEFAULT_PRODUCTS));
      localStorage.setItem(STORAGE_KEY_NEWS, JSON.stringify(DEFAULT_NEWS));
      localStorage.setItem(STORAGE_KEY_LEADS, JSON.stringify(DEFAULT_LEADS));
      localStorage.setItem(STORAGE_KEY_FORMULATIONS, JSON.stringify(DEFAULT_FORMULATIONS));
      localStorage.setItem(STORAGE_KEY_CERTS, JSON.stringify(DEFAULT_CERTS));
      localStorage.setItem(STORAGE_KEY_SLIDES, JSON.stringify(DEFAULT_SLIDES));
      emitSync('ALL_DATA_RESTORED', {});
      return true;
    },

    // Lắng nghe sự kiện đồng bộ
    onSync: function (callback) {
      if (broadcastChannel) {
        broadcastChannel.addEventListener('message', (event) => {
          callback(event.data);
        });
      }
      window.addEventListener('storage', (event) => {
        if (event.key && event.key.startsWith('puceco_')) {
          callback({ type: 'STORAGE_CHANGE', key: event.key });
        }
      });
    }
  };

  window.PUCECO_STORE = DataStore;
})(window);
