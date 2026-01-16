const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://dfspecgmjxglklkrkbld.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmc3BlY2dtanhnbGtsa3JrYmxkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1Nzg1MDQsImV4cCI6MjA4NDE1NDUwNH0.B7WIU2Z3fzwcPU79dX6BDP2pWQneOk_cT584LLw2bl4';

module.exports = async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return res.status(401).json({ error: error.message });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: data.user?.id,
        email: data.user?.email,
        name: data.user?.user_metadata?.name || email.split('@')[0]
      },
      session: {
        access_token: data.session?.access_token,
        refresh_token: data.session?.refresh_token,
        expires_at: data.session?.expires_at
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'An error occurred during login' });
  }
}
