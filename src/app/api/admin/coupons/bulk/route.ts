import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getCouponsCollection } from "@/lib/db";
import { couponSchema } from "@/lib/validations/admin";
import type { CouponInput } from "@/lib/validations/admin";

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

export async function POST(request: Request) {
  const err = await requireAdmin();
  if (err) return err;
  let body: { coupons?: unknown[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const raw = body?.coupons;
  if (!Array.isArray(raw)) {
    return NextResponse.json(
      { error: "Body must include 'coupons' as an array of coupon objects" },
      { status: 400 }
    );
  }

  const validated: CouponInput[] = [];
  const validationErrors: { index: number; code?: string; message: string }[] = [];

  for (let i = 0; i < raw.length; i++) {
    const parsed = couponSchema.safeParse(raw[i]);
    if (!parsed.success) {
      const first = parsed.error.flatten().fieldErrors;
      const msg = Object.entries(first)
        .map(([k, v]) => `${k}: ${Array.isArray(v) ? v[0] : v}`)
        .join("; ");
      validationErrors.push({
        index: i,
        code: typeof raw[i] === "object" && raw[i] !== null && "code" in raw[i] ? String((raw[i] as { code?: unknown }).code) : undefined,
        message: msg,
      });
      continue;
    }
    validated.push(parsed.data);
  }

  if (validated.length === 0 && validationErrors.length > 0) {
    return NextResponse.json(
      { error: "No valid coupons", validationErrors },
      { status: 400 }
    );
  }

  const created: string[] = [];
  const skipped: string[] = [];

  try {
    const col = await getCouponsCollection();
    const existingCodes = new Set(
      (await col.find({ code: { $in: validated.map((c) => c.code) } }).project({ code: 1 }).toArray()).map(
        (d) => d.code
      )
    );

    for (const c of validated) {
      if (existingCodes.has(c.code)) {
        skipped.push(c.code);
        continue;
      }
      const doc = {
        ...c,
        expiryDate: toDate(c.expiryDate),
        usedCount: 0,
        createdAt: new Date(),
      };
      const { insertedId } = await col.insertOne(doc as never);
      created.push(insertedId.toString());
      existingCodes.add(c.code);
    }

    return NextResponse.json({
      created: created.length,
      createdIds: created,
      skipped: skipped.length,
      skippedCodes: skipped,
      validationErrors: validationErrors.length ? validationErrors : undefined,
    });
  } catch (e) {
    console.error("POST admin coupons bulk:", e);
    return NextResponse.json({ error: "Failed to create coupons" }, { status: 500 });
  }
}
