/**
 * PUCECO — Zero-Dependency HTTP & API Server for Local Development
 * Khởi chạy: node server.js (hoặc npm start)
 * Truy cập: http://localhost:3000
 * Lưu ý: Khi deploy lên Cloudflare Pages, các API trong thư mục functions/api/ sẽ tự động xử lý.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const ROOT_DIR = __dirname;
const DATA_FILE = path.join(ROOT_DIR, '.local-data.json');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8'
};

// Đọc hoặc khởi tạo dữ liệu cục bộ cho server.js
function getLocalData() {
  if (fs.existsSync(DATA_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    } catch (e) {}
  }
  return { products: [], news: [], leads: [], settings: {}, certifications: [], formulations: [] };
}

function saveLocalData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {}
}

function parseBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        resolve({});
      }
    });
  });
}

function sendJson(res, data, status = 200) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(data));
}

const server = http.createServer(async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const urlObj = new URL(req.url, `http://${req.headers.host}`);
  let pathname = decodeURIComponent(urlObj.pathname);

  // ===== XỬ LÝ REST API CỤC BỘ (/api/*) =====
  if (pathname.startsWith('/api/')) {
    const data = getLocalData();

    // 1. /api/init
    if (pathname === '/api/init' && req.method === 'POST') {
      return sendJson(res, { success: true, message: 'Local API initialized' });
    }

    // 2. /api/products
    if (pathname === '/api/products') {
      if (req.method === 'GET') {
        return sendJson(res, data.products || []);
      }
      if (req.method === 'POST') {
        const item = await parseBody(req);
        if (!item.id) item.id = 'prod-' + Date.now();
        const idx = data.products.findIndex(p => p.id === item.id);
        if (idx >= 0) data.products[idx] = { ...data.products[idx], ...item };
        else data.products.unshift(item);
        saveLocalData(data);
        return sendJson(res, { success: true, item });
      }
    }

    if (pathname.startsWith('/api/products/')) {
      const id = pathname.replace('/api/products/', '');
      if (req.method === 'DELETE') {
        data.products = data.products.filter(p => p.id !== id);
        saveLocalData(data);
        return sendJson(res, { success: true, id });
      }
      if (req.method === 'GET') {
        const item = data.products.find(p => p.id === id);
        return item ? sendJson(res, item) : sendJson(res, { error: 'Not found' }, 404);
      }
    }

    // 3. /api/news
    if (pathname === '/api/news') {
      if (req.method === 'GET') {
        return sendJson(res, data.news || []);
      }
      if (req.method === 'POST') {
        const item = await parseBody(req);
        if (!item.id) item.id = 'news-' + Date.now();
        const idx = data.news.findIndex(n => n.id === item.id);
        if (idx >= 0) data.news[idx] = { ...data.news[idx], ...item };
        else data.news.unshift(item);
        saveLocalData(data);
        return sendJson(res, { success: true, item });
      }
    }

    if (pathname.startsWith('/api/news/')) {
      const id = pathname.replace('/api/news/', '');
      if (req.method === 'DELETE') {
        data.news = data.news.filter(n => n.id !== id);
        saveLocalData(data);
        return sendJson(res, { success: true, id });
      }
      if (req.method === 'GET') {
        const item = data.news.find(n => n.id === id);
        return item ? sendJson(res, item) : sendJson(res, { error: 'Not found' }, 404);
      }
    }

    // 4. /api/leads
    if (pathname === '/api/leads') {
      if (req.method === 'GET') {
        return sendJson(res, data.leads || []);
      }
      if (req.method === 'POST') {
        const item = await parseBody(req);
        if (!item.id) item.id = 'lead-' + Date.now();
        item.createdAt = new Date().toLocaleString('vi-VN');
        data.leads.unshift(item);
        saveLocalData(data);
        return sendJson(res, { success: true, item }, 201);
      }
    }

    if (pathname.startsWith('/api/leads/')) {
      const id = pathname.replace('/api/leads/', '');
      if (req.method === 'PATCH') {
        const body = await parseBody(req);
        const item = data.leads.find(l => l.id === id);
        if (item) {
          item.status = body.status;
          saveLocalData(data);
          return sendJson(res, { success: true, item });
        }
      }
      if (req.method === 'DELETE') {
        data.leads = data.leads.filter(l => l.id !== id);
        saveLocalData(data);
        return sendJson(res, { success: true, id });
      }
    }

    // 5. /api/settings
    if (pathname === '/api/settings') {
      if (req.method === 'GET') {
        return sendJson(res, data.settings || {});
      }
      if (req.method === 'POST') {
        const body = await parseBody(req);
        data.settings = { ...data.settings, ...body };
        saveLocalData(data);
        return sendJson(res, { success: true, settings: data.settings });
      }
    }

    // 6. /api/upload
    if (pathname === '/api/upload' && req.method === 'POST') {
      const body = await parseBody(req);
      return sendJson(res, {
        success: true,
        url: body.dataUrl || 'assets/images/news-gmp.jpg',
        storage: 'local'
      });
    }

    // 7. /api/auth
    if (pathname === '/api/auth' && req.method === 'POST') {
      const body = await parseBody(req);
      const isOk = body.password === 'admin123' || body.password === data.settings?.adminPassword;
      return sendJson(res, { success: isOk }, isOk ? 200 : 401);
    }

    // 8. /api/certifications
    if (pathname === '/api/certifications') {
      if (req.method === 'GET') {
        return sendJson(res, data.certifications || []);
      }
      if (req.method === 'POST') {
        const body = await parseBody(req);
        data.certifications = Array.isArray(body) ? body : (body.certifications || []);
        saveLocalData(data);
        return sendJson(res, { success: true, certifications: data.certifications });
      }
    }

    // 9. /api/formulations
    if (pathname === '/api/formulations') {
      if (!data.formulations) data.formulations = [];
      if (req.method === 'GET') {
        return sendJson(res, data.formulations);
      }
      if (req.method === 'POST') {
        const item = await parseBody(req);
        if (!item.id) item.id = 'form-' + Date.now();
        const idx = data.formulations.findIndex(f => f.id === item.id);
        if (idx >= 0) data.formulations[idx] = { ...data.formulations[idx], ...item };
        else data.formulations.unshift(item);
        saveLocalData(data);
        return sendJson(res, { success: true, item });
      }
    }

    if (pathname.startsWith('/api/formulations/')) {
      const id = pathname.replace('/api/formulations/', '');
      if (!data.formulations) data.formulations = [];
      if (req.method === 'DELETE') {
        data.formulations = data.formulations.filter(f => f.id !== id);
        saveLocalData(data);
        return sendJson(res, { success: true, id });
      }
      if (req.method === 'GET') {
        const item = data.formulations.find(f => f.id === id);
        return item ? sendJson(res, item) : sendJson(res, { error: 'Not found' }, 404);
      }
    }
  }

  // ===== XỬ LÝ PHỤC VỤ FILE TĨNH (STATIC FILES) =====
  if (pathname === '/' || pathname === '') {
    pathname = '/index.html';
  }

  const filePath = path.normalize(path.join(ROOT_DIR, pathname));

  if (!filePath.startsWith(ROOT_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('403 Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`
        <div style="font-family:sans-serif;text-align:center;padding:50px;">
          <h2>404 — Không tìm thấy tệp</h2>
          <p>Tệp yêu cầu không tồn tại trên hệ thống.</p>
          <a href="/">Quay về Trang chủ PUCECO</a>
        </div>
      `);
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=86400'
    });

    const readStream = fs.createReadStream(filePath);
    readStream.pipe(res);
  });
});

server.listen(PORT, () => {
  console.log('==================================================');
  console.log(`🌿 PUCECO Serverless & API Server is running!`);
  console.log(`🌐 Website: http://localhost:${PORT}`);
  console.log(`🔐 Admin:   http://localhost:${PORT}/admin.html`);
  console.log(`⚡ API:     http://localhost:${PORT}/api/news`);
  console.log(`🔑 Mật khẩu Admin mặc định: admin123`);
  console.log('==================================================');
});
