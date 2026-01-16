// API endpoint for restoring macros from Supabase
// Vercel serverless function

import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId } = req.query;
    const authToken = req.headers.authorization?.replace('Bearer ', '');

    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    // Initialize Supabase client
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('Supabase credentials not configured');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get latest backup for user
    const { data: backups, error: listError } = await supabase
      .from('macro_backups')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(1);

    if (listError) throw listError;
    
    const backup = backups && backups.length > 0 ? backups[0] : null;

    if (error) {
      if (error.code === 'PGRST116') {
        // No backup found
        return res.status(404).json({ error: 'No backup found' });
      }
      throw error;
    }

    if (!backup) {
      return res.status(404).json({ error: 'No backup found' });
    }

    return res.status(200).json({
      success: true,
      macros: backup.macros || [],
      folders: backup.folders || [],
      macroStats: backup.macro_stats || {},
      settings: backup.settings || {},
      timestamp: backup.updated_at,
      version: backup.version
    });
  } catch (error) {
    console.error('Restore error:', error);
    return res.status(500).json({ 
      error: 'Restore failed',
      message: error.message 
    });
  }
}
