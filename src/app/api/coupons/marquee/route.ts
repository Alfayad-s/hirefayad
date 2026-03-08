import { NextResponse } from "next/server";
import { getCouponsCollection } from "@/lib/db";

export const dynamic = "force-dynamic";

/** Public: coupons to show in the top marquee (showInMarquee, active, not expired). Optional ?serviceId= to filter by service. */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const serviceId = searchParams.get("serviceId") ?? undefined;

    const col = await getCouponsCollection();
    const now = new Date();
    const filter: Record<string, unknown> = {
      showInMarquee: true,
      isActive: true,
      expiryDate: { $gt: now },
      $expr: { $lt: ["$usedCount", "$usageLimit"] },
    };
    if (serviceId) {
      filter.$or = [
        { serviceIds: { $exists: false } },
        { serviceIds: { $size: 0 } },
        { serviceIds: serviceId },
      ];
    }
    const coupons = await col
      .find(filter)
      .sort({ discountPercentage: -1 })
      .project({ code: 1, discountPercentage: 1 })
      .toArray();

    const list = coupons.map((c) => ({
      code: c.code,
      discountPercentage: c.discountPercentage,
    }));

    return NextResponse.json({ coupons: list });
  } catch (e) {
    console.error("GET coupons/marquee:", e);
    return NextResponse.json(
      { error: "Failed to load marquee coupons" },
      { status: 500 }
    );
  }
}
