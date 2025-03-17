import { NextResponse } from "next/server";
import { Resend } from "resend";
import { EmailTemplate } from "@/components/EmailTemplate2";
import React from "react";

// Initialize Resend with API key
const resend = new Resend("re_46PjJjzW_5TzfHSkhdhwMm5WFXrzUvaca");

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("🔹 API Received Data:", body);
    const { email, inviteUrl } = body;

    if (!email || !inviteUrl) {
      console.error("🚨 Missing fields in API request:", { email, inviteUrl });
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
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