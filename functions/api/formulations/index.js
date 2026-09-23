// Cloudflare Pages Function: /api/formulations
// GET /api/formulations - Lấy danh sách công thức mẫu
// POST /api/formulations - Thêm hoặc cập nhật công thức mẫu

export async function onRequestGet(context) {
  const db = context.env.DB;
  if (!db) {
    return new Response(JSON.stringify({ error: 'Database binding not available' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }

  try {
    const { results } = await db.prepare('SELECT * FROM formulations ORDER BY created_at DESC').all();
    const formulations = (results || []).map(r => {
      let ingredients = [];
      try {
        ingredients = JSON.parse(r.ingredients || '[]');
      } catch (e) {
        ingredients = [];
      }
      return {
        id: r.id,
        name: r.name,
        category: r.category,
        badge: r.badge,
        dosageForm: r.dosage_form,
        mainIngredient: r.main_ingredient,
        image: r.image,
        desc: r.desc,
        spec: r.spec,
        directions: r.directions,
        ingredients: ingredients,
        createdAt: r.created_at
      };
    });

    return new Response(JSON.stringify(formulations), {
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
    if (!body.name) {
      return new Response(JSON.stringify({ error: 'Tên công thức là bắt buộc' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    const id = body.id || ('form-' + Date.now());
    const name = body.name.trim();
    const category = body.category || 'cosmetics';
    const badge = body.badge || '';
    const dosage_form = body.dosageForm || '';
    const main_ingredient = body.mainIngredient || '';
    const image = body.image || 'assets/images/form-serum.svg';
    const desc = body.desc || '';
    const spec = body.spec || '';
    const directions = body.directions || '';
    const ingredients = JSON.stringify(body.ingredients || []);

    await db.prepare(`
      INSERT INTO formulations (id, name, category, badge, dosage_form, main_ingredient, image, desc, spec, directions, ingredients)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        name = excluded.name,
        category = excluded.category,
        badge = excluded.badge,
        dosage_form = excluded.dosage_form,
        main_ingredient = excluded.main_ingredient,
        image = excluded.image,
        desc = excluded.desc,
        spec = excluded.spec,
        directions = excluded.directions,
        ingredients = excluded.ingredients
    `).bind(
      id, name, category, badge, dosage_form, main_ingredient, image, desc, spec, directions, ingredients
    ).run();

    return new Response(JSON.stringify({ success: true, item: { ...body, id } }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
}
