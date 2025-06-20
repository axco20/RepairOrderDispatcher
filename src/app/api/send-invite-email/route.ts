import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { EmailTemplate } from "@/components/EmailTemplate";
import React from "react";
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY);

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { email, dealershipId, role } = await request.json();

    if (!email || !dealershipId || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Step 1: Generate a secure, unique token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // Token expires in 24 hours

    // Step 2: Store the invitation in the database
    const { error: insertError } = await supabaseAdmin
      .from('invitations')
      .insert({
        token,
        email,
        dealership_id: dealershipId,
        role,
        expires_at: expiresAt.toISOString(),
      });

    if (insertError) {
      console.error('Error saving invitation:', insertError);
      return NextResponse.json({ error: 'Failed to create invitation.' }, { status: 500 });
    }

    // Step 3: Send the email with the secure link
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const inviteUrl = `${siteUrl}/signuppage?token=${token}`;

    const { data, error: emailError } = await resend.emails.send({
      from: "Registration Confirmation <support@autosynctify.com>",
      to: [email],
      subject: "You're Invited to AutoSynctify!",
      react: React.createElement(EmailTemplate, {
        message: "You've been invited to join a dealership on AutoSynctify. Click the button below to complete your registration.",
        link: inviteUrl
      }),
    });

    if (emailError) {
      console.error('Resend error:', emailError);
      // Optional: Clean up the created invitation if the email fails
      // await supabaseAdmin.from('invitations').delete().eq('token', token);
      return NextResponse.json({ error: 'Failed to send email.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Invitation sent successfully!" });

  } catch (error) {
    console.error('Overall error:', error);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}