import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getCouponsCollection } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json(
      { error: "Sign in to apply a coupon" },
      { status: 401 }
    );
  }

  let body: { code?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid body" },
      { status: 400 }
    );
  }

  const code = String(body?.code ?? "").trim().toUpperCase();
  if (!code) {
    return NextResponse.json(
      { error: "Coupon code is required" },
      { status: 400 }
    );
  }

  try {
    const col = await getCouponsCollection();
    const coupon = await col.findOne({ code, isActive: true });
    if (!coupon) {
      return NextResponse.json(
        { error: "Invalid or expired coupon" },
        { status: 404 }
      );
    }
    if (new Date() > coupon.expiryDate) {
      return NextResponse.json(
        { error: "Coupon has expired" },
        { status: 400 }
      );
    }
    if (coupon.usedCount >= coupon.usageLimit) {
      return NextResponse.json(
        { error: "Coupon usage limit reached" },
        { status: 400 }
      );
    }

    await col.updateOne(
      { _id: coupon._id },
      { $inc: { usedCount: 1 } }
    );

    return NextResponse.json({
      code: coupon.code,
      discountPercentage: coupon.discountPercentage,
      message: "Coupon applied",
    });
  } catch (e) {
    console.error("Apply coupon error:", e);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
