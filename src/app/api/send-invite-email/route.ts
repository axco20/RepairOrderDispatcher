import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { EmailTemplate } from "@/components/EmailTemplate";
import React from "react";

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, inviteUrl } = body;

    if (!email || !inviteUrl) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Send email with invitation link
    const { data, error } = await resend.emails.send({
      from: "Registration Confirmation <support@autosynctify.com>", 
      to: [email],
      subject: "You're Invited to AutoSynctify!",
      react: React.createElement(EmailTemplate, {
        message: "You're almost there! Click the button below to complete your setup.",
        link: inviteUrl
      }),
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: "Invitation sent successfully!", data });
  } catch (error) {
    return NextResponse.json({ error: "Something went wrong: " + error }, { status: 500 });
  }
}