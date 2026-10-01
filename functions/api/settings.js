// Cloudflare Pages Function: /api/settings
import { requireAdmin } from '../_shared/auth.js';
// GET /api/settings - Lấy cài đặt website (Hotline, Email, Địa chỉ, Slogan, Stats)
// POST /api/settings - Lưu cài đặt website

const DEFAULT_SETTINGS = {
  hotline: '0967.669.808',
  email: 'nguyentrongphuccnsh@gmail.com',
  address: 'Thôn Đìa, Xã Nam Hồng, Huyện Đông Anh, TP Hà Nội',
  slogan: 'Chiết xuất từ thiên nhiên, tin cậy từ khoa học. Nhà cung ứng nguyên liệu dược phẩm chuẩn hóa hàng đầu.',
  mapsUrl: 'https://maps.google.com/?q=Thôn+Đìa,+Nam+Hồng,+Đông+Anh,+Hà+Nội',
  stats: {
    years: 12,
    partners: 320,
    lines: 48,
    traceability: 100
  }
};

export async function onRequestGet(context) {
  const db = context.env.DB;
  if (!db) {
    return new Response(JSON.stringify(DEFAULT_SETTINGS), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }

  try {
    const row = await db.prepare('SELECT value FROM settings WHERE key = ?').bind('site_settings').first();
    if (row && row.value) {
      let publicSettings = {};
      try {
        publicSettings = JSON.parse(row.value);
      } catch (e) {
        publicSettings = {};
      }
      delete publicSettings.adminPassword;
      delete publicSettings.adminPasswordHash;
      return new Response(JSON.stringify(publicSettings), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'public, max-age=60'
        }
      });
    }

    return new Response(JSON.stringify(DEFAULT_SETTINGS), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  } catch (err) {
    return new Response(JSON.stringify(DEFAULT_SETTINGS), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
}

export async function onRequestPost(context) {
  const authError = await requireAdmin(context);
  if (authError) return authError;

  const db = context.env.DB;
  if (!db) {
    return new Response(JSON.stringify({ error: 'Database binding not available' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }

  try {
    const body = await context.request.json();
    const settingsStr = JSON.stringify(body);

    await db.prepare(`
      INSERT INTO settings (key, value)
      VALUES (?, ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value
    `).bind('site_settings', settingsStr).run();

    return new Response(JSON.stringify({ success: true, settings: body }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}
