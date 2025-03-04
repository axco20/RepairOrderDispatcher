import { NextResponse } from "next/server";
import { Resend } from "resend";
import { EmailTemplate } from "@/components/EmailTemplate";
import React from "react"; // ✅ Ensure React is imported

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST() {
  try {
    const { data, error } = await resend.emails.send({
      from: "Acme <onboarding@resend.dev>", // Update with your verified domain
      to: ["xanderiscool007@gmail.com"], // Replace with actual recipient email
      subject: "Button Clicked!",
      react: React.createElement(EmailTemplate, { message: "You clicked a button!" }), // ✅ Fix here
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
