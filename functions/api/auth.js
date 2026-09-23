// Cloudflare Pages Function: /api/auth
// POST /api/auth - Xác thực đăng nhập trang Quản trị Admin

export async function onRequestPost(context) {
  const db = context.env.DB;
  
  try {
    const { password } = await context.request.json();
    if (!password) {
      return new Response(JSON.stringify({ error: 'Password required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    let adminPass = 'admin123';
    if (db) {
      const row = await db.prepare('SELECT value FROM settings WHERE key = ?').bind('site_settings').first();
      if (row && row.value) {
        try {
          const s = JSON.parse(row.value);
          if (s.adminPasswordHash) adminPass = s.adminPasswordHash;
        } catch (e) {}
      }
    }

    if (password === adminPass) {
      return new Response(JSON.stringify({
        success: true,
        message: 'Authenticated successfully'
      }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    } else {
      return new Response(JSON.stringify({
        success: false,
        error: 'Mật khẩu quản trị không chính xác'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }
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
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}
