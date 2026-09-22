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

  // Seed Data mặc định
  const DEFAULT_SETTINGS = {
    brandName: 'PUCECO',
    slogan: 'Nguyên liệu chiết xuất từ thiên nhiên — tin cậy từ khoa học.',
    hotline: '(+84) 08 272 272 59',
    email: 'puceco2018@gmail.com',
    address: '679/38 Quang Trung , Phường 11, Quận Gò Vấp , Thành phố Hồ Chí Minh, Việt Nam',
    mapsUrl: 'https://maps.app.goo.gl/1Rfge7JdRQY9vLxBA',
    adminPassword: 'admin123',
    stats: {
      years: 12,
      partners: 320,
      lines: 48,
      traceability: 100
    }
  };

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
      content: 'Tháng 9/2026, PUCECO chính thức đón nhận giấy chứng nhận Thực hành Sản xuất Tốt (GMP) phiên bản nâng hạng cho toàn bộ tổ hợp nhà máy chiết xuất dược liệu công nghệ cao. Với dây chuyền tự động hóa khép kín và hệ thống lọc nano tiên tiến, công suất chế biến đạt hơn 1.200 tấn dược liệu tươi mỗi năm, sẵn sàng cung ứng cho các tập đoàn dược phẩm lớn trong và ngoài nước.',
      image: 'assets/images/news-gmp.svg',
      bg1: '#E6F1EA',
      bg2: '#C9E3D3',
      author: 'Ban Kiểm Soát Chất Lượng'
    },
    {
      id: 'news-2',
      title: 'Mở rộng vùng trồng nguyên liệu sạch tại Tây Nguyên',
      date: '02 Thg 9, 2026',
      excerpt: 'Liên kết 5 hợp tác xã tại Đắk Lắk và Gia Lai, đảm bảo nguồn cung sả chanh, nghệ vàng và gừng bền vững.',
      content: 'Nhằm chủ động kiểm soát chất lượng từ mầm cây đến giọt chiết xuất cuối cùng, PUCECO đã ký kết liên kết bao tiêu cùng 5 hợp tác xã dược liệu với tổng quy mô hơn 150 ha. Mô hình canh tác đạt chứng nhận Hữu cơ (Organic) nói không với thuốc trừ sâu hóa học, tạo sinh kế bền vững cho hơn 200 hộ đồng bào địa phương.',
      image: 'assets/images/news-farm.svg',
      bg1: '#F3EFE2',
      bg2: '#E4D6B0',
      author: 'Phòng Phát Triển Vùng Trồng'
    },
    {
      id: 'news-3',
      title: 'Ra mắt Curcumin nano thế hệ mới cho dược phẩm',
      date: '21 Thg 8, 2026',
      excerpt: 'Công trình R&D nội bộ 3 năm nghiên cứu với kích thước tiểu phân dưới 50nm mang lại hiệu quả hấp thu kỷ lục.',
      content: 'Trung tâm Nghiên cứu & Phát triển PUCECO Labs công bố thương mại hóa thành công dòng nguyên liệu Nano Curcumin tan hoàn toàn trong nước với kích thước hạt trung bình chỉ 35nm. Sản phẩm đạt độ ổn định cao trong dải pH 2.0 - 8.0, tương thích lý tưởng cho các dạng bào chế siro, viên nang mềm, thạch collagen và nước uống chức năng.',
      image: 'assets/images/news-lab.svg',
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

  // Khởi tạo Seed Data nếu chưa có & Cập nhật ảnh realistic mới
  function initData() {
    const storedSettings = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (!storedSettings) {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
    } else {
      try {
        const s = JSON.parse(storedSettings);
        if (s.email === 'info@puceco.vn' || s.hotline === '1900 123 456' || !s.mapsUrl) {
          const updatedSettings = {
            ...s,
            email: s.email === 'info@puceco.vn' ? DEFAULT_SETTINGS.email : s.email,
            hotline: s.hotline === '1900 123 456' ? DEFAULT_SETTINGS.hotline : s.hotline,
            address: (s.address === 'Khu Công Nghệ Cao, Hà Nội, Việt Nam' || s.address === 'Khu Công Nghệ Cao, Hà Nội') ? DEFAULT_SETTINGS.address : s.address,
            mapsUrl: s.mapsUrl || DEFAULT_SETTINGS.mapsUrl
          };
          localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(updatedSettings));
        }
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
        prods = prods.map(p => {
          if (p.image && p.image.endsWith('.svg') && p.image.includes('prod-')) {
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
    if (!localStorage.getItem(STORAGE_KEY_NEWS)) {
      localStorage.setItem(STORAGE_KEY_NEWS, JSON.stringify(DEFAULT_NEWS));
    }
    if (!localStorage.getItem(STORAGE_KEY_LEADS)) {
      localStorage.setItem(STORAGE_KEY_LEADS, JSON.stringify(DEFAULT_LEADS));
    }
  }

  initData();

  // API Đọc / Ghi
  const DataStore = {
    // Products
    getProducts: function () {
      try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY_PRODUCTS)) || [];
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
      return product;
    },

    deleteProduct: function (id) {
      let list = this.getProducts();
      list = list.filter(p => p.id !== id);
      localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(list));
      emitSync('PRODUCT_DELETED', { id });
      return true;
    },

    // News
    getNews: function () {
      try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY_NEWS)) || [];
      } catch (e) {
        return DEFAULT_NEWS;
      }
    },

    getNewsById: function (id) {
      const list = this.getNews();
      return list.find(n => n.id === id) || null;
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
      return item;
    },

    deleteNews: function (id) {
      let list = this.getNews();
      list = list.filter(n => n.id !== id);
      localStorage.setItem(STORAGE_KEY_NEWS, JSON.stringify(list));
      emitSync('NEWS_DELETED', { id });
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
      return newLead;
    },

    updateLeadStatus: function (id, status) {
      const list = this.getLeads();
      const item = list.find(l => l.id === id);
      if (item) {
        item.status = status;
        localStorage.setItem(STORAGE_KEY_LEADS, JSON.stringify(list));
        emitSync('LEAD_STATUS_UPDATED', { id, status });
        return true;
      }
      return false;
    },

    deleteLead: function (id) {
      let list = this.getLeads();
      list = list.filter(l => l.id !== id);
      localStorage.setItem(STORAGE_KEY_LEADS, JSON.stringify(list));
      emitSync('LEAD_DELETED', { id });
      return true;
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
      return updated;
    },

    // Auth
    verifyAdminPassword: function (password) {
      const settings = this.getSettings();
      return password === settings.adminPassword;
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
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        settings: this.getSettings(),
        products: this.getProducts(),
        news: this.getNews(),
        leads: this.getLeads()
      }, null, 2);
    },

    importAllData: function (jsonString) {
      try {
        const data = JSON.parse(jsonString);
        if (data.settings) localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(data.settings));
        if (data.products) localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(data.products));
        if (data.news) localStorage.setItem(STORAGE_KEY_NEWS, JSON.stringify(data.news));
        if (data.leads) localStorage.setItem(STORAGE_KEY_LEADS, JSON.stringify(data.leads));
        emitSync('ALL_DATA_RESTORED', {});
        return { success: true };
      } catch (err) {
        return { success: false, error: err.message };
      }
    },

    resetToDefault: function () {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
      localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(DEFAULT_PRODUCTS));
      localStorage.setItem(STORAGE_KEY_NEWS, JSON.stringify(DEFAULT_NEWS));
      localStorage.setItem(STORAGE_KEY_LEADS, JSON.stringify(DEFAULT_LEADS));
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
