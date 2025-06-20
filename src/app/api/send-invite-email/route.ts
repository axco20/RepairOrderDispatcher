import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { EmailTemplate } from "@/components/EmailTemplate";
import React from "react";
import { createClient } from '@supabase/supabase-js';

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY);

// Initialize Supabase admin client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, dealershipId, role } = body;

    if (!email || !dealershipId || !role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Step 1: Create the user in Supabase Auth
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
      email,
      email_confirm: true, // User will be invited, so confirm their email
    });

    if (userError) {
      // Handle case where user might already exist
      if (userError.message.includes('already exists')) {
        return NextResponse.json({ error: 'User with this email already exists.' }, { status: 409 });
      }
      console.error('Supabase admin error:', userError);
      return NextResponse.json({ error: `Failed to create user: ${userError.message}` }, { status: 500 });
    }

    if (!userData.user) {
      return NextResponse.json({ error: 'Could not create user account.' }, { status: 500 });
    }

    const userId = userData.user.id;

    // Step 2: Add the user to the "users" public table
    const { error: publicUserError } = await supabaseAdmin
      .from('users')
      .insert({
        auth_id: userId,
        email,
        name: email, // Use email as a temporary name
        role,
        dealership_id: dealershipId,
      });

    if (publicUserError) {
      console.error('Error creating public user record:', publicUserError);
      // If this fails, you might want to delete the auth user to avoid orphans
      await supabaseAdmin.auth.admin.deleteUser(userId);
      return NextResponse.json({ error: `Failed to save user details: ${publicUserError.message}` }, { status: 500 });
    }

    // Step 3: Send the invitation email
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const inviteUrl = `${siteUrl}/signuppage?email=${encodeURIComponent(email)}&dealership_id=${dealershipId}&role=${role}`;

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
      // Also try to delete the user if the email fails
      await supabaseAdmin.auth.admin.deleteUser(userId);
      return NextResponse.json({ error: emailError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: "Invitation sent successfully!", data });
  } catch (error) {
    console.error('Overall error:', error);
    return NextResponse.json({ error: "Something went wrong: " + (error as Error).message }, { status: 500 });
  }
}