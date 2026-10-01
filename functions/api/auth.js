// Cloudflare Pages Function: /api/auth
// POST /api/auth - Xác thực đăng nhập trang Quản trị Admin
import { clearSessionCookie, createAdminSession, sessionCookie, verifyAdminPassword } from '../_shared/auth.js';

export async function onRequestPost(context) {
  try {
    const { password } = await context.request.json();
    if (!password) {
      return new Response(JSON.stringify({ error: 'Password required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    if (await verifyAdminPassword(context, password)) {
      const token = await createAdminSession(context);
      return new Response(JSON.stringify({
        success: true,
        message: 'Authenticated successfully'
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': 'true',
          'Set-Cookie': sessionCookie(token, context.request)
        }
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
      'Access-Control-Allow-Methods': 'POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}

export async function onRequestDelete(context) {
  return new Response(JSON.stringify({ success: true }), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': 'true',
      'Set-Cookie': clearSessionCookie(context.request)
    }
  });
}
