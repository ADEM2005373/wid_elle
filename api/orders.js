import { readFile } from 'fs/promises';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const raw = await readFile(new URL('../data/orders.json', import.meta.url), 'utf-8');
    const payload = JSON.parse(raw);
    const orders = Array.isArray(payload) ? payload : [];
    return res.status(200).json(orders);
  } catch (err) {
    console.error('GET /api/orders error:', err);
    return res.status(200).json([]);
  }
}
