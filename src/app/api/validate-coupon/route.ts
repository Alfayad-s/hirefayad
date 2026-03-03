import { NextResponse } from "next/server";
import { getCouponsCollection } from "@/lib/db";

export const dynamic = "force-dynamic";

/** Validate a coupon without incrementing usedCount. Use for quote page "Apply" preview. */
export async function POST(request: Request) {
  let body: { code?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const code = String(body?.code ?? "").trim().toUpperCase();
  if (!code) {
    return NextResponse.json(
      { valid: false, error: "Coupon code is required" },
      { status: 400 }
    );
  }

  try {
    const col = await getCouponsCollection();
    const coupon = await col.findOne({ code, isActive: true });
    if (!coupon) {
      return NextResponse.json({
        valid: false,
        error: "Invalid or expired coupon",
      });
    }
    if (new Date() > coupon.expiryDate) {
      return NextResponse.json({
        valid: false,
        error: "Coupon has expired",
      });
    }
    if (coupon.usedCount >= coupon.usageLimit) {
      return NextResponse.json({
        valid: false,
        error: "Coupon usage limit reached",
      });
    }

    return NextResponse.json({
      valid: true,
      code: coupon.code,
      discountPercentage: coupon.discountPercentage,
    });
  } catch (e) {
    console.error("Validate coupon error:", e);
    return NextResponse.json(
      { valid: false, error: "Something went wrong" },
      { status: 500 }
    );
  }
}
