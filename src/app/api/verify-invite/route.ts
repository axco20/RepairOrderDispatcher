import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ error: 'Invitation token is missing.' }, { status: 400 });
    }

    // Fetch the invitation from the database
    const { data: invitation, error } = await supabaseAdmin
      .from('invitations')
      .select('email, role, expires_at, used_at')
      .eq('token', token)
      .single();

    if (error || !invitation) {
      return NextResponse.json({ error: 'Invalid invitation link.' }, { status: 404 });
    }

    // Check if the invitation has been used
    if (invitation.used_at) {
      return NextResponse.json({ error: 'This invitation has already been used.' }, { status: 410 });
    }

    // Check if the invitation has expired
    if (new Date(invitation.expires_at) < new Date()) {
      return NextResponse.json({ error: 'This invitation has expired.' }, { status: 410 });
    }

    // If valid, return the necessary details
    return NextResponse.json({
      email: invitation.email,
      role: invitation.role,
    });

  } catch (err) {
    console.error('Invite verification error:', err);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
} 