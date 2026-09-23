// Cloudflare Pages Function: /api/news
// GET /api/news - Lấy danh sách tin tức/blog
// POST /api/news - Thêm mới hoặc cập nhật bài viết

export async function onRequestGet(context) {
  const db = context.env.DB;
  if (!db) {
    return new Response(JSON.stringify({ error: 'Database binding not available' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }

  try {
    const { results } = await db.prepare(`
      SELECT * FROM news ORDER BY created_at DESC
    `).all();

    return new Response(JSON.stringify(results || []), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=60, s-maxage=120'
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
}

export async function onRequestPost(context) {
  const db = context.env.DB;
  if (!db) {
    return new Response(JSON.stringify({ error: 'Database binding not available' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }

  try {
    const body = await context.request.json();
    const id = body.id || ('news-' + Date.now());
    const title = body.title || 'Bài viết không tiêu đề';
    const date = body.date || new Date().toLocaleDateString('vi-VN');
    const excerpt = body.excerpt || '';
    const content = body.content || body.excerpt || '';
    const image = body.image || 'assets/images/news-gmp.jpg';
    const bg1 = body.bg1 || '#E6F1EA';
    const bg2 = body.bg2 || '#C9E3D3';
    const author = body.author || 'PUCECO';
    const createdAt = body.createdAt || body.created_at || new Date().toISOString().split('T')[0];

    await db.prepare(`
      INSERT INTO news (id, title, date, excerpt, content, image, bg1, bg2, author, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        title = excluded.title,
        date = excluded.date,
        excerpt = excluded.excerpt,
        content = excluded.content,
        image = excluded.image,
        bg1 = excluded.bg1,
        bg2 = excluded.bg2,
        author = excluded.author
    `).bind(id, title, date, excerpt, content, image, bg1, bg2, author, createdAt).run();

    const savedItem = { id, title, date, excerpt, content, image, bg1, bg2, author, createdAt };

    return new Response(JSON.stringify({ success: true, item: savedItem }), {
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
