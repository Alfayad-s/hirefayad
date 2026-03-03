import { NextResponse } from "next/server";
import { getCouponsCollection } from "@/lib/db";

export const dynamic = "force-dynamic";

/** Public list of coupons that are active, not expired, and under usage limit */
export async function GET() {
  try {
    const col = await getCouponsCollection();
    const now = new Date();
    const coupons = await col
      .find({
        isActive: true,
        expiryDate: { $gt: now },
        $expr: { $lt: ["$usedCount", "$usageLimit"] },
      })
      .sort({ discountPercentage: -1 })
      .project({ code: 1, discountPercentage: 1, expiryDate: 1 })
      .toArray();

    const list = coupons.map((c) => ({
      code: c.code,
      discountPercentage: c.discountPercentage,
      expiryDate: c.expiryDate instanceof Date ? c.expiryDate.toISOString() : c.expiryDate,
    }));

    return NextResponse.json({ coupons: list });
  } catch (e) {
    console.error("GET coupons/available:", e);
    return NextResponse.json(
      { error: "Failed to load coupons" },
      { status: 500 }
    );
  }
}
