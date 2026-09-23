// Cloudflare Pages Function: /api/products/:id
// GET /api/products/:id - Lấy chi tiết 1 sản phẩm
// DELETE /api/products/:id - Xóa sản phẩm khỏi CSDL

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
    const r = await db.prepare('SELECT * FROM products WHERE id = ?').bind(id).first();
    if (!r) {
      return new Response(JSON.stringify({ error: 'Product not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    const product = {
      id: r.id,
      name: r.name,
      category: r.category,
      tag: r.tag,
      desc: r.desc,
      image: r.image,
      bg1: r.bg1,
      bg2: r.bg2,
      isFeatured: !!r.is_featured,
      isNew: !!r.is_new,
      details: {
        activeIngredient: r.active_ingredient || '',
        coaStandard: r.coa_standard || '',
        formulation: r.formulation || '',
        origin: r.origin || ''
      },
      createdAt: r.created_at
    };

    return new Response(JSON.stringify(product), {
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
    await db.prepare('DELETE FROM products WHERE id = ?').bind(id).run();
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
