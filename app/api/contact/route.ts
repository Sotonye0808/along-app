import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/db/prisma";
import { sendContactNotification } from "@/app/lib/services/emailService";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json({ error: "name, email, and message are required" }, { status: 400 });
    }

    if (typeof name !== "string" || typeof email !== "string" || typeof message !== "string") {
      return NextResponse.json({ error: "Invalid field types" }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    if (name.length < 1 || name.length > 100) {
      return NextResponse.json({ error: "Name must be between 1 and 100 characters" }, { status: 400 });
    }

    if (message.length < 1 || message.length > 5000) {
      return NextResponse.json({ error: "Message must be between 1 and 5000 characters" }, { status: 400 });
    }

    await prisma.contactSubmission.create({
      data: { name, email, message },
    });

    await sendContactNotification(name, email, message);

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Contact submission error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
