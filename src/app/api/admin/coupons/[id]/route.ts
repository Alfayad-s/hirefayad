import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { ObjectId } from "mongodb";
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

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const err = await requireAdmin();
  if (err) return err;
  const { id } = await params;
  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }
  try {
    const col = await getCouponsCollection();
    const doc = await col.findOne({ _id: new ObjectId(id) });
    if (!doc) return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    return NextResponse.json(toJson(doc));
  } catch (e) {
    console.error("GET admin coupon:", e);
    return NextResponse.json({ error: "Failed to load coupon" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const err = await requireAdmin();
  if (err) return err;
  const { id } = await params;
  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }
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
    const sameCode = await col.findOne({
      code: parsed.data.code,
      _id: { $ne: new ObjectId(id) },
    });
    if (sameCode) {
      return NextResponse.json({ error: "Coupon code already exists" }, { status: 409 });
    }
    const update = {
      $set: {
        ...parsed.data,
        expiryDate: toDate(parsed.data.expiryDate),
        updatedAt: new Date(),
      },
    };
    const result = await col.findOneAndUpdate(
      { _id: new ObjectId(id) },
      update,
      { returnDocument: "after" }
    );
    if (!result) return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    return NextResponse.json(toJson(result));
  } catch (e) {
    console.error("PUT admin coupon:", e);
    return NextResponse.json({ error: "Failed to update coupon" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const err = await requireAdmin();
  if (err) return err;
  const { id } = await params;
  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }
  try {
    const col = await getCouponsCollection();
    const result = await col.deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("DELETE admin coupon:", e);
    return NextResponse.json({ error: "Failed to delete coupon" }, { status: 500 });
  }
}
