const SESSION_COOKIE = 'puceco_admin_session';
const SESSION_TTL_SECONDS = 8 * 60 * 60;

function encode(value) {
  return btoa(String.fromCharCode(...new TextEncoder().encode(value)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function decode(value) {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((value.length + 3) % 4);
  return new TextDecoder().decode(Uint8Array.from(atob(padded), char => char.charCodeAt(0)));
}

async function sign(value, secret) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  return encode(String.fromCharCode(...new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value)))));
}

async function getStoredSettings(context) {
  if (!context.env?.DB) return {};
  try {
    const row = await context.env.DB.prepare('SELECT value FROM settings WHERE key = ?').bind('site_settings').first();
    return row?.value ? JSON.parse(row.value) : {};
  } catch (e) {
    return {};
  }
}

export async function getAdminPassword(context) {
  const settings = await getStoredSettings(context);
  // `adminPassword` is the current editable value; keep the legacy hash-named
  // field as a fallback for databases created by older releases.
  return settings.adminPassword || settings.adminPasswordHash || 'admin123';
}

export async function verifyAdminPassword(context, password) {
  if (!password) return false;
  return password === await getAdminPassword(context);
}

export async function createAdminSession(context) {
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const payload = String(expiresAt);
  const secret = context.env?.AUTH_SECRET || await getAdminPassword(context);
  const signature = await sign(payload, secret);
  return `${encode(payload)}.${signature}`;
}

function getCookie(request, name) {
  const header = request.headers.get('cookie') || '';
  const item = header.split(';').map(part => part.trim()).find(part => part.startsWith(`${name}=`));
  return item ? item.slice(name.length + 1) : '';
}

export async function isAdminAuthenticated(context) {
  try {
    const token = getCookie(context.request, SESSION_COOKIE);
    const [encodedExpiry, providedSignature] = token.split('.');
    if (!encodedExpiry || !providedSignature) return false;

    const payload = decode(encodedExpiry);
    if (Number(payload) < Math.floor(Date.now() / 1000)) return false;

    const secret = context.env?.AUTH_SECRET || await getAdminPassword(context);
    const expectedSignature = await sign(payload, secret);
    return expectedSignature === providedSignature;
  } catch (e) {
    return false;
  }
}

export async function requireAdmin(context) {
  if (await isAdminAuthenticated(context)) return null;
  return new Response(JSON.stringify({ error: 'Admin authentication required' }), {
    status: 401,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': 'true'
    }
  });
}

export function sessionCookie(token, request) {
  const secure = new URL(request.url).protocol === 'https:' ? '; Secure' : '';
  return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_TTL_SECONDS}${secure}`;
}

export function clearSessionCookie(request) {
  const secure = new URL(request.url).protocol === 'https:' ? '; Secure' : '';
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`;
}
