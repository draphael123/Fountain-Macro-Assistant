import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dfspecgmjxglklkrkbld.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmc3BlY2dtanhnbGtsa3JrYmxkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1Nzg1MDQsImV4cCI6MjA4NDE1NDUwNH0.B7WIU2Z3fzwcPU79dX6BDP2pWQneOk_cT584LLw2bl4';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Get auth token
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const token = authHeader.split(' ')[1];
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  // Verify user
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  // Create authenticated client
  const authSupabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: { Authorization: `Bearer ${token}` }
    }
  });

  try {
    // GET - Fetch user's macros from cloud
    if (req.method === 'GET') {
      const { data: macros, error } = await authSupabase
        .from('user_macros')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return res.status(200).json({
        success: true,
        macros: macros || [],
        count: macros?.length || 0
      });
    }

    // POST - Sync macros to cloud
    if (req.method === 'POST') {
      const { macros, mode = 'merge' } = req.body;

      if (!Array.isArray(macros)) {
        return res.status(400).json({ error: 'Macros must be an array' });
      }

      // If mode is 'replace', delete existing macros first
      if (mode === 'replace') {
        const { error: deleteError } = await authSupabase
          .from('user_macros')
          .delete()
          .eq('user_id', user.id);

        if (deleteError) throw deleteError;
      }

      // Prepare macros for insertion
      const macrosToInsert = macros.map(macro => ({
        user_id: user.id,
        shortcut: macro.shortcut,
        expansion: macro.expansion,
        name: macro.name || null,
        folder: macro.folder || macro.folderId || null,
        tags: macro.tags || [],
        case_sensitive: macro.caseSensitive || false,
        updated_at: new Date().toISOString()
      }));

      if (mode === 'merge') {
        // Upsert - insert or update based on user_id + shortcut
        const { data, error } = await authSupabase
          .from('user_macros')
          .upsert(macrosToInsert, {
            onConflict: 'user_id,shortcut',
            ignoreDuplicates: false
          });

        if (error) throw error;
      } else {
        // Insert new macros
        const { data, error } = await authSupabase
          .from('user_macros')
          .insert(macrosToInsert);

        if (error) throw error;
      }

      // Fetch updated macros
      const { data: updatedMacros, error: fetchError } = await authSupabase
        .from('user_macros')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      return res.status(200).json({
        success: true,
        message: `Synced ${macros.length} macros`,
        macros: updatedMacros || [],
        count: updatedMacros?.length || 0
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Sync error:', error);
    return res.status(500).json({ error: error.message || 'Sync failed' });
  }
}

