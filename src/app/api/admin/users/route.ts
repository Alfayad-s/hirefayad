import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getUsersCollection, toJson } from "@/lib/db";

export const dynamic = "force-dynamic";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  return null;
}

export async function GET(request: Request) {
  const err = await requireAdmin();
  if (err) return err;
  const { searchParams } = new URL(request.url);
  const limit = Math.min(Number(searchParams.get("limit")) || 50, 100);
  const skip = Number(searchParams.get("skip")) || 0;
  try {
    const col = await getUsersCollection();
    const users = await col
      .find({}, { projection: { password: 0 } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
    const total = await col.countDocuments();
    return NextResponse.json({
      users: users.map((u) => toJson(u)),
      total,
    });
  } catch (e) {
    console.error("GET admin users:", e);
    return NextResponse.json({ error: "Failed to load users" }, { status: 500 });
  }
}
