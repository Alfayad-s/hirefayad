import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getUsersCollection, toJson } from "@/lib/db";
import { signupSchema } from "@/lib/validations/auth";
import type { User } from "@/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = signupSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, email, password } = parsed.data;
    const users = await getUsersCollection();
    const normalizedEmail = email.toLowerCase().trim();

    const existing = await users.findOne({ email: normalizedEmail });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();
    const role = adminEmail && normalizedEmail === adminEmail ? "admin" : "user";

    const { insertedId } = await users.insertOne({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role,
      createdAt: new Date(),
    });

    const user = await users.findOne({ _id: insertedId });
    if (!user) {
      return NextResponse.json({ error: "Failed to create user." }, { status: 500 });
    }

    const { password: _p, ...safeUser } = toJson(user);
    return NextResponse.json({
      user: safeUser,
      message: "Account created. You can now sign in.",
    });
  } catch (e) {
    console.error("Signup error:", e);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
