import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://dfspecgmjxglklkrkbld.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

if (!supabaseAnonKey) {
  console.warn('SUPABASE_ANON_KEY is not set');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper to get user from request
export async function getUserFromRequest(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error) throw error;
    return user;
  } catch (error) {
    console.error('Auth error:', error);
    return null;
  }
}

// Create a client with a specific user's token
export function createAuthClient(token) {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  });
}


