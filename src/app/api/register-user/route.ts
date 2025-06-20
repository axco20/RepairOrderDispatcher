import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { token, name, password } = await request.json();

    if (!token || !name || !password) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    // Step 1: Re-verify the token
    const { data: invitation, error: inviteError } = await supabaseAdmin
      .from('invitations')
      .select('*')
      .eq('token', token)
      .single();

    if (inviteError || !invitation) {
      return NextResponse.json({ error: 'Invalid invitation token.' }, { status: 404 });
    }
    if (invitation.used_at) {
      return NextResponse.json({ error: 'This invitation has already been used.' }, { status: 410 });
    }
    if (new Date(invitation.expires_at) < new Date()) {
      return NextResponse.json({ error: 'This invitation has expired.' }, { status: 410 });
    }

    // Step 2: Create user in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: invitation.email,
      password,
      email_confirm: true, // The email is trusted since it came from an invite
    });

    if (authError) {
      console.error('Auth creation error:', authError);
      return NextResponse.json({ error: `Failed to create account: ${authError.message}` }, { status: 500 });
    }
    if (!authData.user) {
      return NextResponse.json({ error: 'Failed to get user data after creation.' }, { status: 500 });
    }

    // Step 3: Add user to the public "users" table
    const { error: userError } = await supabaseAdmin.from('users').insert({
      auth_id: authData.user.id,
      email: invitation.email,
      name, // Use the name from the form
      role: invitation.role,
      dealership_id: invitation.dealership_id,
    });

    if (userError) {
      // Clean up the auth user if the public user insert fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      console.error('Public user creation error:', userError);
      return NextResponse.json({ error: 'Failed to save user details.' }, { status: 500 });
    }
    
    // Step 4: Mark the invitation as used
    await supabaseAdmin
      .from('invitations')
      .update({ used_at: new Date().toISOString() })
      .eq('token', token);

    return NextResponse.json({ success: true, message: 'Registration successful!' });

  } catch (err) {
    console.error('Registration error:', err);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
} 