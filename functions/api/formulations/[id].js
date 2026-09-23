// Cloudflare Pages Function: /api/formulations/:id
// GET /api/formulations/:id - Lấy chi tiết 1 công thức mẫu
// DELETE /api/formulations/:id - Xóa công thức khỏi CSDL

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
    const r = await db.prepare('SELECT * FROM formulations WHERE id = ?').bind(id).first();
    if (!r) {
      return new Response(JSON.stringify({ error: 'Formulation not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    let ingredients = [];
    try {
      ingredients = JSON.parse(r.ingredients || '[]');
    } catch (e) {
      ingredients = [];
    }

    const formulation = {
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

    return new Response(JSON.stringify(formulation), {
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
    await db.prepare('DELETE FROM formulations WHERE id = ?').bind(id).run();
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
