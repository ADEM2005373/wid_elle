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
    const raw = await readFile(new URL('../data/settings.json', import.meta.url), 'utf-8');
    const settings = JSON.parse(raw);
    return res.status(200).json(settings);
  } catch (err) {
    console.error('GET /api/settings error:', err);
    return res.status(200).json({ storeName: 'Widelle', storeDescription: 'Premium e-commerce store' });
  }
}
