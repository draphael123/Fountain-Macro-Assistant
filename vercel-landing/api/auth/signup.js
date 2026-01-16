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

  const { email, password, name } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name || email.split('@')[0]
        }
      }
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({
      success: true,
      message: 'Account created successfully! Please check your email to verify your account.',
      user: {
        id: data.user?.id,
        email: data.user?.email,
        name: data.user?.user_metadata?.name
      },
      session: data.session
    });
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ error: 'An error occurred during signup' });
  }
}

