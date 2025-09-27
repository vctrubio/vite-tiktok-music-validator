export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { username } = req.query;
  
  if (!username) {
    return res.status(400).json({ error: 'Username parameter is required' });
  }

  const PRIMEAPI_KEY = process.env.VITE_PRIMEAPI_KEY;
  
  if (!PRIMEAPI_KEY) {
    console.error('❌ PrimeAPI key not found in environment variables');
    return res.status(500).json({ error: 'PrimeAPI key not configured' });
  }
  
  console.log('✅ PrimeAPI key found, making request for username:', username);

  try {
    const response = await fetch(`https://api.primeapi.co/tiktok/user/info?username=${username}`, {
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
    console.error('PrimeAPI proxy error:', error);
    res.status(500).json({ error: error.message });
  }
}