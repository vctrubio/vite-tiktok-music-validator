export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { musicId } = req.query;
  
  if (!musicId) {
    return res.status(400).json({ error: 'musicId parameter is required' });
  }

  const PRIMEAPI_KEY = process.env.VITE_PRIMEAPI_KEY;
  
  if (!PRIMEAPI_KEY) {
    return res.status(500).json({ error: 'PrimeAPI key not configured' });
  }

  try {
    const response = await fetch(`https://api.primeapi.co/tiktok/music/info?musicId=${musicId}`, {
      headers: {
        'X-PrimeAPI-Key': PRIMEAPI_KEY,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`PrimeAPI error: ${data.message || 'Unknown error'}`);
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('PrimeAPI music-info proxy error:', error);
    res.status(500).json({ error: error.message });
  }
}