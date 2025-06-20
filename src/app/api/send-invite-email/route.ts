import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { EmailTemplate } from "@/components/EmailTemplate";
import React from "react";

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY);

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
      return NextResponse.json({ error: emailError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: "Invitation sent successfully!", data });
  } catch (error) {
    console.error('Overall error:', error);
    return NextResponse.json({ error: "Something went wrong: " + (error as Error).message }, { status: 500 });
  }
}