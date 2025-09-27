export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { filename, data } = req.body;
  
  if (!filename || !data) {
    return res.status(400).json({ error: 'filename and data are required' });
  }

  try {
    // In Vercel, we can't write to filesystem, so we'll just log to console
    // This will appear in Vercel's function logs
    console.log(`📝 LOG [${filename}]:`, JSON.stringify(data, null, 2));
    
    res.status(200).json({ 
      success: true, 
      message: 'Log written to Vercel console',
      filename 
    });
  } catch (error) {
    console.error('Failed to write log:', error);
    res.status(500).json({ error: error.message });
  }
}