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
    // Default settings object
    const settings = {
      storeName: 'Widelle',
      storeDescription: 'Premium e-commerce store'
    };
    
    console.log('GET /api/settings - returning settings');
    return res.status(200).json(settings);
  } catch (err) {
    console.error('GET /api/settings - error:', err.message);
    // Return default settings on error
    return res.status(200).json({ storeName: 'Widelle', storeDescription: 'Premium e-commerce store' });
  }
}
