// Cloudflare Pages Function: /api/leads/:id
// PATCH /api/leads/:id - Cập nhật trạng thái liên hệ (new, contacted, sample_sent, completed)
// DELETE /api/leads/:id - Xóa liên hệ

export async function onRequestPatch(context) {
  const db = context.env.DB;
  const id = context.params.id;

  if (!db) {
    return new Response(JSON.stringify({ error: 'Database binding not available' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }

  try {
    const body = await context.request.json();
    const status = body.status || 'new';

    await db.prepare('UPDATE leads SET status = ? WHERE id = ?').bind(status, id).run();

    return new Response(JSON.stringify({ success: true, id, status }), {
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
    await db.prepare('DELETE FROM leads WHERE id = ?').bind(id).run();
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
      'Access-Control-Allow-Methods': 'GET, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}
