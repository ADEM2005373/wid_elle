export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  // Handle OPTIONS for CORS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only GET allowed
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Fallback empty array for now (replace with DB query later)
    const orders = [];
    
    console.log('GET /api/orders - returning', orders.length, 'orders');
    return res.status(200).json(orders);
  } catch (err) {
    console.error('GET /api/orders - error:', err.message);
    // Return empty array instead of 500 to prevent frontend crash
    return res.status(200).json([]);
  }
}
