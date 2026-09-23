// Cloudflare Pages Function: /api/images/*
// GET /api/images/:path - Đọc và phân phối ảnh từ Cloudflare R2 Storage với CDN Cache dài hạn

export async function onRequestGet(context) {
  const bucket = context.env.BUCKET;
  if (!bucket) {
    return new Response('R2 Storage not configured', { status: 404 });
  }

  // params.path is an array of path segments or string
  const rawPath = context.params.path;
  const key = Array.isArray(rawPath) ? rawPath.join('/') : rawPath;

  if (!key) {
    return new Response('Image key required', { status: 400 });
  }

  try {
    const object = await bucket.get(key);
    if (!object) {
      return new Response('Image not found', { status: 404 });
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');

    return new Response(object.body, { headers });
  } catch (err) {
    return new Response('Error retrieving image: ' + err.message, { status: 500 });
  }
}
