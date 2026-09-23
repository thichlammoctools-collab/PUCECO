// Cloudflare Pages Function: /api/init
// Tự động kiểm tra và khởi tạo các bảng D1 nếu chưa có

export async function onRequestPost(context) {
  const db = context.env.DB;
  if (!db) {
    return new Response(JSON.stringify({ error: 'D1 database binding "DB" not found.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }

  try {
    // 1. Tạo các bảng nếu chưa có
    await db.batch([
      db.prepare(`
        CREATE TABLE IF NOT EXISTS products (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          category TEXT DEFAULT 'extract',
          tag TEXT DEFAULT 'Bán chạy',
          desc TEXT,
          image TEXT,
          bg1 TEXT DEFAULT '#E6F1EA',
          bg2 TEXT DEFAULT '#C9E3D3',
          is_featured INTEGER DEFAULT 1,
          is_new INTEGER DEFAULT 0,
          active_ingredient TEXT,
          coa_standard TEXT,
          formulation TEXT,
          origin TEXT,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );
      `),
      db.prepare(`
        CREATE TABLE IF NOT EXISTS news (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          date TEXT NOT NULL,
          excerpt TEXT,
          content TEXT,
          image TEXT,
          bg1 TEXT DEFAULT '#E6F1EA',
          bg2 TEXT DEFAULT '#C9E3D3',
          author TEXT DEFAULT 'PUCECO',
          created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );
      `),
      db.prepare(`
        CREATE TABLE IF NOT EXISTS leads (
          id TEXT PRIMARY KEY,
          full_name TEXT NOT NULL,
          email TEXT,
          phone TEXT,
          company TEXT,
          product_of_interest TEXT,
          message TEXT,
          status TEXT DEFAULT 'new',
          created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );
      `),
      db.prepare(`
        CREATE TABLE IF NOT EXISTS settings (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL
        );
      `)
    ]);

    // 2. Kiểm tra nếu chưa có sản phẩm nào thì chèn seed data
    const prodCount = await db.prepare('SELECT COUNT(*) as count FROM products').first();
    if (prodCount && prodCount.count === 0) {
      await db.batch([
        db.prepare(`
          INSERT INTO products (id, name, category, tag, desc, image, bg1, bg2, is_featured, is_new, active_ingredient, coa_standard, formulation, origin, created_at)
          VALUES ('prod-1', 'Chiết xuất Trà xanh', 'extract', 'Bán chạy', 'Polyphenol & EGCG độ tinh khiết cao, công nghệ trích ly lạnh bảo toàn 100% hoạt tính chống oxy hóa.', 'assets/images/prod-green-tea.jpg', '#E6F1EA', '#C9E3D3', 1, 0, 'EGCG ≥ 50%, Polyphenol ≥ 98%', 'Chuẩn USP 43 / Dược điển VN V', 'Bột mịn màu vàng nâu tan hoàn toàn', 'Vùng trồng trà Shan Tuyết Hà Giang', '2026-08-01');
        `),
        db.prepare(`
          INSERT INTO products (id, name, category, tag, desc, image, bg1, bg2, is_featured, is_new, active_ingredient, coa_standard, formulation, origin, created_at)
          VALUES ('prod-2', 'Tinh dầu Sả chanh', 'oil', 'Hữu cơ', 'Chưng cất lôi cuốn hơi nước áp suất thấp từ lá sả chanh tươi, giàu Citral tự nhiên kháng khuẩn mạnh.', 'assets/images/prod-lemongrass.jpg', '#F3EFE2', '#E0CFA6', 1, 0, 'Citral (Geranial + Neral) ≥ 75%', 'ISO 3217 / Chuẩn TCVN', 'Chất lỏng màu vàng nhạt, mùi thơm đặc trưng', 'Hợp tác xã nông nghiệp Đắk Lắk', '2026-08-05');
        `),
        db.prepare(`
          INSERT INTO products (id, name, category, tag, desc, image, bg1, bg2, is_featured, is_new, active_ingredient, coa_standard, formulation, origin, created_at)
          VALUES ('prod-3', 'Curcumin Nano', 'nano', 'Công nghệ cao', 'Hạt nano 30-50nm tan hoàn toàn trong nước, tăng sinh khả dụng gấp 40 lần so với curcumin thông thường.', 'assets/images/prod-curcumin.jpg', '#FDF5E6', '#F5D0A9', 1, 0, 'Nano Curcuminoid ≥ 20%', 'Chuẩn phân tích HPLC, kích thước hạt DLS', 'Bột màu cam đỏ, phân tán trong nước trong suốt', 'Viện R&D Công nghệ cao PUCECO', '2026-08-10');
        `),
        db.prepare(`
          INSERT INTO products (id, name, category, tag, desc, image, bg1, bg2, is_featured, is_new, active_ingredient, coa_standard, formulation, origin, created_at)
          VALUES ('prod-4', 'Chiết xuất Lô hội (Aloe Vera)', 'extract', 'Bán chạy', 'Gel nha đam nguyên chất cô đặc 200:1 giàu Polysaccharide, cấp ẩm sâu và làm dịu kích ứng da vượt trội.', 'assets/images/prod-aloe.jpg', '#EFEFE6', '#D2D6B8', 1, 0, 'Aloin ≤ 1ppm (đã loại bỏ), Polysaccharide ≥ 10%', 'Chuẩn IASC (International Aloe Science Council)', 'Bột mịn trắng ngà, hút ẩm nhẹ', 'Vùng trồng Phan Rang, Ninh Thuận', '2026-08-15');
        `),
        db.prepare(`
          INSERT INTO products (id, name, category, tag, desc, image, bg1, bg2, is_featured, is_new, active_ingredient, coa_standard, formulation, origin, created_at)
          VALUES ('prod-5', 'Chiết xuất Nghệ đen', 'extract', 'Mới', 'Dòng hoạt chất curcuminoid & sesquiterpene thế hệ mới, ổn định nhiệt, hỗ trợ chống viêm và tiêu hóa hiệu quả.', 'assets/images/prod-turmeric-black.jpg', '#E6F1EA', '#A6D0BC', 0, 1, 'Curcumenol, Germacrone, Curzerenone', 'Chuẩn Dược điển Việt Nam V', 'Bột chiết chuẩn hóa tỷ lệ 10:1', 'Lâm Đồng, Việt Nam', '2026-09-01');
        `),
        db.prepare(`
          INSERT INTO products (id, name, category, tag, desc, image, bg1, bg2, is_featured, is_new, active_ingredient, coa_standard, formulation, origin, created_at)
          VALUES ('prod-6', 'Glycoside Stevia (Cỏ ngọt)', 'sweetener', 'Mới', 'Chất tạo ngọt tự nhiên Rebaudioside-A 98%, không sinh calo, chỉ số đường huyết 0, an toàn cho người ăn kiêng.', 'assets/images/prod-stevia.jpg', '#F3EFE2', '#E0CFA6', 0, 1, 'Rebaudioside A ≥ 98%', 'FDA GRAS, HALAL, KOSHER', 'Bột tinh thể màu trắng tinh khiết', 'Việt Nam & Hợp tác quốc tế', '2026-09-05');
        `)
      ]);
    }

    // 3. Kiểm tra tin tức
    const newsCount = await db.prepare('SELECT COUNT(*) as count FROM news').first();
    if (newsCount && newsCount.count === 0) {
      await db.batch([
        db.prepare(`
          INSERT INTO news (id, title, date, excerpt, content, image, bg1, bg2, author, created_at)
          VALUES ('news-1', 'PUCECO đạt chứng nhận GMP nâng hạng', '18 Thg 9, 2026', 'Nhà máy chiết xuất hoàn thiện nâng cấp dây chuyền chiết xuất áp suất thấp theo tiêu chuẩn GMP mới nhất.', 'Tháng 9/2026, PUCECO chính thức đón nhận giấy chứng nhận Thực hành Sản xuất Tốt (GMP) phiên bản nâng hạng cho toàn bộ tổ hợp nhà máy chiết xuất dược liệu công nghệ cao. Với dây chuyền tự động hóa khép kín và hệ thống lọc nano tiên tiến, công suất chế biến đạt hơn 1.200 tấn dược liệu tươi mỗi năm, sẵn sàng cung ứng cho các tập đoàn dược phẩm lớn trong và ngoài nước.', 'assets/images/news-gmp.svg', '#E6F1EA', '#C9E3D3', 'Ban Kiểm Soát Chất Lượng', '2026-09-18');
        `),
        db.prepare(`
          INSERT INTO news (id, title, date, excerpt, content, image, bg1, bg2, author, created_at)
          VALUES ('news-2', 'Mở rộng vùng trồng nguyên liệu sạch tại Tây Nguyên', '02 Thg 9, 2026', 'Liên kết 5 hợp tác xã tại Đắk Lắk và Gia Lai, đảm bảo nguồn cung sả chanh, nghệ vàng và gừng bền vững.', 'Nhằm chủ động kiểm soát chất lượng từ mầm cây đến giọt chiết xuất cuối cùng, PUCECO đã ký kết liên kết bao tiêu cùng 5 hợp tác xã dược liệu với tổng quy mô hơn 150 ha. Mô hình canh tác đạt chứng nhận Hữu cơ (Organic) nói không với thuốc trừ sâu hóa học, tạo sinh kế bền vững cho hơn 200 hộ đồng bào địa phương.', 'assets/images/news-farm.svg', '#F3EFE2', '#E4D6B0', 'Phòng Phát Triển Vùng Trồng', '2026-09-02');
        `),
        db.prepare(`
          INSERT INTO news (id, title, date, excerpt, content, image, bg1, bg2, author, created_at)
          VALUES ('news-3', 'Ra mắt Curcumin nano thế hệ mới cho dược phẩm', '21 Thg 8, 2026', 'Công trình R&D nội bộ 3 năm nghiên cứu với kích thước tiểu phân dưới 50nm mang lại hiệu quả hấp thu kỷ lục.', 'Trung tâm Nghiên cứu & Phát triển PUCECO Labs công bố thương mại hóa thành công dòng nguyên liệu Nano Curcumin tan hoàn toàn trong nước với kích thước hạt trung bình chỉ 35nm. Sản phẩm đạt độ ổn định cao trong dải pH 2.0 - 8.0, tương thích lý tưởng cho các dạng bào chế siro, viên nang mềm, thạch collagen và nước uống chức năng.', 'assets/images/news-lab.svg', '#E8F0EC', '#BBD9CA', 'Viện R&D PUCECO', '2026-08-21');
        `)
      ]);
    }

    // 4. Kiểm tra settings
    const settingCount = await db.prepare('SELECT COUNT(*) as count FROM settings WHERE key = ?').bind('site_settings').first();
    if (!settingCount || settingCount.count === 0) {
      await db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)')
        .bind('site_settings', JSON.stringify({
          hotline: '0967.669.808',
          email: 'nguyentrongphuccnsh@gmail.com',
          address: 'Thôn Đìa, Xã Nam Hồng, Huyện Đông Anh, TP Hà Nội',
          slogan: 'Chiết xuất từ thiên nhiên, tin cậy từ khoa học. Nhà cung ứng nguyên liệu dược phẩm chuẩn hóa hàng đầu.',
          mapsUrl: 'https://maps.google.com/?q=Thôn+Đìa,+Nam+Hồng,+Đông+Anh,+Hà+Nội',
          adminPasswordHash: 'admin123',
          stats: { years: 12, partners: 320, lines: 48, traceability: 100 }
        })).run();
    }

    return new Response(JSON.stringify({ success: true, message: 'Database initialized successfully!' }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
}
