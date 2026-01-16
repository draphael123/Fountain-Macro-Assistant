// API endpoint for backing up macros to Supabase
// Vercel serverless function

import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, macros, folders, macroStats, settings, timestamp, version } = req.body;
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

    // Check if backup exists for this user
    const { data: existingBackup } = await supabase
      .from('macro_backups')
      .select('id')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    const backupData = {
      user_id: userId,
      macros: macros || [],
      folders: folders || [],
      macro_stats: macroStats || {},
      settings: settings || {},
      version: version || '1.0.1',
      updated_at: new Date().toISOString()
    };

    let result;
    if (existingBackup) {
      // Update existing backup
      const { data, error } = await supabase
        .from('macro_backups')
        .update(backupData)
        .eq('id', existingBackup.id)
        .select()
        .single();

      if (error) throw error;
      result = data;
    } else {
      // Create new backup
      const { data, error } = await supabase
        .from('macro_backups')
        .insert(backupData)
        .select()
        .single();

      if (error) throw error;
      result = data;
    }

    return res.status(200).json({
      success: true,
      backupId: result.id,
      message: 'Backup saved successfully'
    });
  } catch (error) {
    console.error('Backup error:', error);
    return res.status(500).json({ 
      error: 'Backup failed',
      message: error.message 
    });
  }
}
