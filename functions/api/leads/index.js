// Cloudflare Pages Function: /api/leads
// GET /api/leads - Lấy danh sách liên hệ khách hàng (Admin)
// POST /api/leads - Tiếp nhận liên hệ / yêu cầu báo giá từ form Website

export async function onRequestGet(context) {
  const db = context.env.DB;
  if (!db) {
    return new Response(JSON.stringify({ error: 'Database binding not available' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }

  try {
    const { results } = await db.prepare('SELECT * FROM leads ORDER BY created_at DESC').all();
    const leads = (results || []).map(r => ({
      id: r.id,
      fullName: r.full_name,
      email: r.email,
      phone: r.phone,
      company: r.company,
      productOfInterest: r.product_of_interest,
      message: r.message,
      status: r.status,
      createdAt: r.created_at
    }));

    return new Response(JSON.stringify(leads), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
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
    const id = 'lead-' + Date.now();
    const fullName = body.fullName || body.full_name || 'Khách hàng';
    const email = body.email || '';
    const phone = body.phone || '';
    const company = body.company || '';
    const productOfInterest = body.productOfInterest || body.product_of_interest || 'Yêu cầu tư vấn';
    const message = body.message || '';
    const status = body.status || 'new';
    const createdAt = new Date().toLocaleString('vi-VN');

    await db.prepare(`
      INSERT INTO leads (id, full_name, email, phone, company, product_of_interest, message, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(id, fullName, email, phone, company, productOfInterest, message, status, createdAt).run();

    const newLead = { id, fullName, email, phone, company, productOfInterest, message, status, createdAt };

    return new Response(JSON.stringify({ success: true, item: newLead }), {
      status: 201,
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
