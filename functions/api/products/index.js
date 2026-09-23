// Cloudflare Pages Function: /api/products
// GET /api/products - Lấy danh sách sản phẩm
// POST /api/products - Thêm hoặc cập nhật sản phẩm

export async function onRequestGet(context) {
  const db = context.env.DB;
  if (!db) {
    return new Response(JSON.stringify({ error: 'Database binding not available' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }

  try {
    const { results } = await db.prepare('SELECT * FROM products ORDER BY is_featured DESC, created_at DESC').all();
    
    // Map D1 rows to format expected by client
    const products = (results || []).map(r => ({
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
    }));

    return new Response(JSON.stringify(products), {
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
    const id = body.id || ('prod-' + Date.now());
    const name = body.name || 'Sản phẩm mới';
    const category = body.category || 'extract';
    const tag = body.tag || 'Mới';
    const desc = body.desc || '';
    const image = body.image || 'assets/images/prod-green-tea.jpg';
    const bg1 = body.bg1 || '#E6F1EA';
    const bg2 = body.bg2 || '#C9E3D3';
    const isFeatured = body.isFeatured !== false ? 1 : 0;
    const isNew = body.isNew ? 1 : 0;
    const activeIngredient = body.details?.activeIngredient || '';
    const coaStandard = body.details?.coaStandard || '';
    const formulation = body.details?.formulation || '';
    const origin = body.details?.origin || '';
    const createdAt = body.createdAt || new Date().toISOString().split('T')[0];

    await db.prepare(`
      INSERT INTO products (id, name, category, tag, desc, image, bg1, bg2, is_featured, is_new, active_ingredient, coa_standard, formulation, origin, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        name = excluded.name,
        category = excluded.category,
        tag = excluded.tag,
        desc = excluded.desc,
        image = excluded.image,
        bg1 = excluded.bg1,
        bg2 = excluded.bg2,
        is_featured = excluded.is_featured,
        is_new = excluded.is_new,
        active_ingredient = excluded.active_ingredient,
        coa_standard = excluded.coa_standard,
        formulation = excluded.formulation,
        origin = excluded.origin
    `).bind(id, name, category, tag, desc, image, bg1, bg2, isFeatured, isNew, activeIngredient, coaStandard, formulation, origin, createdAt).run();

    const savedProduct = {
      id, name, category, tag, desc, image, bg1, bg2,
      isFeatured: !!isFeatured, isNew: !!isNew,
      details: { activeIngredient, coaStandard, formulation, origin },
      createdAt
    };

    return new Response(JSON.stringify({ success: true, item: savedProduct }), {
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
