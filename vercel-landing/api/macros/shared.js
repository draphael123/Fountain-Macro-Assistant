import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dfspecgmjxglklkrkbld.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmc3BlY2dtanhnbGtsa3JrYmxkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1Nzg1MDQsImV4cCI6MjA4NDE1NDUwNH0.B7WIU2Z3fzwcPU79dX6BDP2pWQneOk_cT584LLw2bl4';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    // GET - Browse shared macros (public, no auth required)
    if (req.method === 'GET') {
      const { category, search, limit = 50, offset = 0 } = req.query;

      let query = supabase
        .from('shared_macros')
        .select('*')
        .eq('is_public', true)
        .order('downloads', { ascending: false })
        .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

      if (category && category !== 'all') {
        query = query.eq('category', category);
      }

      if (search) {
        query = query.or(`name.ilike.%${search}%,shortcut.ilike.%${search}%,description.ilike.%${search}%`);
      }

      const { data: macros, error } = await query;

      if (error) throw error;

      return res.status(200).json({
        success: true,
        macros: macros || [],
        count: macros?.length || 0
      });
    }

    // POST - Share a macro (auth required)
    if (req.method === 'POST') {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authentication required to share macros' });
      }

      const token = authHeader.split(' ')[1];
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);

      if (authError || !user) {
        return res.status(401).json({ error: 'Invalid or expired token' });
      }

      const { shortcut, expansion, name, description, category = 'general' } = req.body;

      if (!shortcut || !expansion || !name) {
        return res.status(400).json({ error: 'Shortcut, expansion, and name are required' });
      }

      const authSupabase = createClient(supabaseUrl, supabaseAnonKey, {
        global: {
          headers: { Authorization: `Bearer ${token}` }
        }
      });

      const { data: newMacro, error } = await authSupabase
        .from('shared_macros')
        .insert({
          author_id: user.id,
          author_name: user.user_metadata?.name || user.email?.split('@')[0],
          shortcut,
          expansion,
          name,
          description: description || '',
          category,
          is_public: true
        })
        .select()
        .single();

      if (error) throw error;

      return res.status(201).json({
        success: true,
        message: 'Macro shared successfully!',
        macro: newMacro
      });
    }

    // DELETE - Remove a shared macro (auth required, must be author)
    if (req.method === 'DELETE') {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const token = authHeader.split(' ')[1];
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);

      if (authError || !user) {
        return res.status(401).json({ error: 'Invalid or expired token' });
      }

      const { id } = req.query;
      if (!id) {
        return res.status(400).json({ error: 'Macro ID is required' });
      }

      const authSupabase = createClient(supabaseUrl, supabaseAnonKey, {
        global: {
          headers: { Authorization: `Bearer ${token}` }
        }
      });

      const { error } = await authSupabase
        .from('shared_macros')
        .delete()
        .eq('id', id)
        .eq('author_id', user.id);

      if (error) throw error;

      return res.status(200).json({
        success: true,
        message: 'Macro deleted'
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Shared macros error:', error);
    return res.status(500).json({ error: error.message || 'An error occurred' });
  }
}

