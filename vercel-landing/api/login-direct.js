// Direct login API endpoint for extension
// Allows extension to login without opening a new tab

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Since we're using client-side auth with localStorage,
    // we need to use a sync page approach
    // Return instructions for extension to sync with website
    
    return res.status(200).json({
      success: true,
      message: 'Use sync page for authentication',
      syncUrl: `https://fountain-macro-assistant.vercel.app/sync-login.html?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ 
      error: 'Login failed',
      message: error.message 
    });
  }
}






