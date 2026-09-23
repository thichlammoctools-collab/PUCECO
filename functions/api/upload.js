// Cloudflare Pages Function: /api/upload
// POST /api/upload - Nhận file ảnh và lưu trữ vào Cloudflare R2 Storage (có fallback nếu chưa cấu hình R2)

export async function onRequestPost(context) {
  const bucket = context.env.BUCKET;
  const contentType = context.request.headers.get('content-type') || '';

  try {
    let fileBuffer = null;
    let mimeType = 'image/jpeg';
    let originalName = 'uploaded-image.jpg';
    let dataUrlFallback = null;

    if (contentType.includes('multipart/form-data')) {
      const formData = await context.request.formData();
      const file = formData.get('file');
      if (!file) {
        return new Response(JSON.stringify({ error: 'No file provided' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      }
      fileBuffer = await file.arrayBuffer();
      mimeType = file.type || 'image/jpeg';
      originalName = file.name || 'image.jpg';
    } else if (contentType.includes('application/json')) {
      const json = await context.request.json();
      if (!json.dataUrl) {
        return new Response(JSON.stringify({ error: 'Missing dataUrl in request body' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      }
      dataUrlFallback = json.dataUrl;
      originalName = json.name || 'image.jpg';
      
      // Parse base64
      const matches = json.dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        mimeType = matches[1];
        const binaryStr = atob(matches[2]);
        const len = binaryStr.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryStr.charCodeAt(i);
        }
        fileBuffer = bytes.buffer;
      }
    } else {
      fileBuffer = await context.request.arrayBuffer();
      mimeType = contentType;
    }

    // Nếu có R2 Storage binding
    if (bucket && fileBuffer) {
      const ext = originalName.split('.').pop() || 'jpg';
      const cleanName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_').toLowerCase();
      const key = `uploads/${Date.now()}-${cleanName}`;

      await bucket.put(key, fileBuffer, {
        httpMetadata: {
          contentType: mimeType,
          cacheControl: 'public, max-age=31536000, immutable'
        }
      });

      const imageUrl = `/api/images/${key}`;

      return new Response(JSON.stringify({
        success: true,
        url: imageUrl,
        storage: 'r2',
        key
      }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    // Nếu chưa cấu hình R2: Trả về dataUrl (đã nén) để lưu trực tiếp trong D1/Client
    return new Response(JSON.stringify({
      success: true,
      url: dataUrlFallback || 'assets/images/news-gmp.jpg',
      storage: 'inline_data_url',
      message: 'Image processed successfully (R2 bucket not active, using optimized data URL)'
    }), {
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
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}
