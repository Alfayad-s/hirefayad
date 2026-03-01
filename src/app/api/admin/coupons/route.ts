import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getCouponsCollection, toJson } from "@/lib/db";
import { couponSchema } from "@/lib/validations/admin";

export const dynamic = "force-dynamic";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  return null;
}

function toDate(v: string | Date): Date {
  return typeof v === "string" ? new Date(v) : v;
}

export async function GET() {
  const err = await requireAdmin();
  if (err) return err;
  try {
    const col = await getCouponsCollection();
    const coupons = await col.find({}).sort({ createdAt: -1 }).toArray();
    return NextResponse.json(coupons.map((c) => toJson(c)));
  } catch (e) {
    console.error("GET admin coupons:", e);
    return NextResponse.json({ error: "Failed to load coupons" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const err = await requireAdmin();
  if (err) return err;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = couponSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }
  try {
    const col = await getCouponsCollection();
    const existing = await col.findOne({ code: parsed.data.code });
    if (existing) {
      return NextResponse.json({ error: "Coupon code already exists" }, { status: 409 });
    }
    const doc = {
      ...parsed.data,
      expiryDate: toDate(parsed.data.expiryDate),
      usedCount: 0,
      createdAt: new Date(),
    };
    const { insertedId } = await col.insertOne(doc as never);
    const inserted = await col.findOne({ _id: insertedId });
    return NextResponse.json(inserted ? toJson(inserted) : { _id: insertedId.toString() });
  } catch (e) {
    console.error("POST admin coupons:", e);
    return NextResponse.json({ error: "Failed to create coupon" }, { status: 500 });
  }
}
