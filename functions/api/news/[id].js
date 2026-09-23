// Cloudflare Pages Function: /api/news/:id
// GET /api/news/:id - Lấy chi tiết 1 bài viết
// DELETE /api/news/:id - Xóa bài viết khỏi CSDL

export async function onRequestGet(context) {
  const db = context.env.DB;
  const id = context.params.id;

  if (!db) {
    return new Response(JSON.stringify({ error: 'Database binding not available' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }

  try {
    const item = await db.prepare('SELECT * FROM news WHERE id = ?').bind(id).first();
    if (!item) {
      return new Response(JSON.stringify({ error: 'News item not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    return new Response(JSON.stringify(item), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
}

export async function onRequestDelete(context) {
  const db = context.env.DB;
  const id = context.params.id;

  if (!db) {
    return new Response(JSON.stringify({ error: 'Database binding not available' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }

  try {
    await db.prepare('DELETE FROM news WHERE id = ?').bind(id).run();
    return new Response(JSON.stringify({ success: true, id }), {
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
      'Access-Control-Allow-Methods': 'GET, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}
