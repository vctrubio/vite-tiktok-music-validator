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
    const apiUrl = `https://api.primeapi.co/userinfo-by-username?username=${username}`;
    console.log('🚀 Making PrimeAPI request to:', apiUrl);
    console.log('🔑 Using API Key (first 10 chars):', PRIMEAPI_KEY.substring(0, 10) + '...');
    
    const response = await fetch(apiUrl, {
      headers: {
        'X-PrimeAPI-Key': PRIMEAPI_KEY,
        'Content-Type': 'application/json'
      }
    });

    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
    
    const data = await response.json();
    console.log('📦 Response data:', JSON.stringify(data, null, 2));
    
    if (!response.ok) {
      console.error('❌ PrimeAPI error response:', data);
      throw new Error(`PrimeAPI error: ${data.message || data.error || 'Unknown error'}`);
    }

    console.log('✅ PrimeAPI request successful');
    res.status(200).json(data);
  } catch (error) {
    console.error('❌ PrimeAPI proxy error:', error);
    res.status(500).json({ error: error.message });
  }
}