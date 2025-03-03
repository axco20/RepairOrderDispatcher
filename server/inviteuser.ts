import { NextApiRequest, NextApiResponse } from 'next'; // If using Next.js
import { createClient } from '@supabase/supabase-js';

// Use the Supabase Service Role Key (backend only!)
const SUPABASE_URL = 'https://pqjomphjukbacvtjjnkt.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY; // Store in .env

if (!SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing Supabase Service Role Key');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { email, role } = req.body;
  if (!email || !role) return res.status(400).json({ error: 'Missing email or role' });

  try {
    // Step A: Invite user via Supabase Auth
    const { data, error } = await supabase.auth.admin.inviteUserByEmail(email);
    if (error) throw error;

    const newUserId = data.user?.id;
    if (!newUserId) return res.status(500).json({ error: 'No user ID returned' });

    // Step B: Insert into your "users" table
    const { error: insertError } = await supabase
      .from('users')
      .insert({ auth_id: newUserId, email, role, name: '' });

    if (insertError) throw insertError;

    return res.status(200).json({ message: 'Invitation sent successfully', user: data.user });
  } catch (err) {
    console.error('Error inviting user:', err);
    return res.status(500).json({ error: err.message });
  }
}
