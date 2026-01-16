const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://dfspecgmjxglklkrkbld.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmc3BlY2dtanhnbGtsa3JrYmxkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1Nzg1MDQsImV4cCI6MjA4NDE1NDUwNH0.B7WIU2Z3fzwcPU79dX6BDP2pWQneOk_cT584LLw2bl4';

module.exports = async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No authorization token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name || user.email?.split('@')[0],
        created_at: user.created_at
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    return res.status(500).json({ error: 'An error occurred' });
  }
}

