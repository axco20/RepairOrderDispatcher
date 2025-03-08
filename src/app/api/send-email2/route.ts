import { NextResponse } from "next/server";
import { Resend } from "resend";
import { EmailTemplate } from "@/components/EmailTemplate2";
import React from "react";

const resend = new Resend('re_46PjJjzW_5TzfHSkhdhwMm5WFXrzUvaca');

export async function POST(req: Request) {
  try {
    const { email } = await req.json(); // Extract email from request body

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const registrationLink = `http://www.autosynctify.com/TechnicianEmail`;

    const { data, error } = await resend.emails.send({
      from: "Registration Confirmation <support@autosynctify.com>", 
      to: [email],
      subject: "Your AutoSynctify Registration Link",
      react: React.createElement(EmailTemplate, {
        message: "You're almost there! Click the link below to complete your setup.",
        link: registrationLink
      }),
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Something went wrong" + error}, { status: 500 });
  }
}
