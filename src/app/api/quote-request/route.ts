import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getServicesCollection, getCouponsCollection, getOrdersCollection } from "@/lib/db";
import { quoteRequestSchema } from "@/lib/validations/quote";
import { ObjectId } from "mongodb";
import { randomBytes } from "crypto";
import type { ServiceTier } from "@/types";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.email || !session?.user?.id) {
    return NextResponse.json(
      { error: "Sign in to request a quote" },
      { status: 401 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const parsed = quoteRequestSchema.safeParse(body);
  if (!parsed.success) {
    const msg = parsed.error.flatten().fieldErrors?.items?.[0] ?? parsed.error.message;
    return NextResponse.json(
      { error: typeof msg === "string" ? msg : "Invalid request" },
      { status: 400 }
    );
  }

  const { items, couponCode, quotationMode } = parsed.data;

  try {
    const servicesCol = await getServicesCollection();
    const ordersCol = await getOrdersCollection();

    const orderItems: Array<{
      serviceId: string;
      serviceTitle: string;
      tier: ServiceTier;
      quantity: number;
      unitPriceInr: number;
      addOns?: { name: string; priceInr: number; quantity: number }[];
    }> = [];
    let subtotalInr = 0;

    for (const item of items) {
      if (!ObjectId.isValid(item.serviceId)) {
        return NextResponse.json(
          { error: `Invalid service ID: ${item.serviceId}` },
          { status: 400 }
        );
      }
      const service = await servicesCol.findOne({ _id: new ObjectId(item.serviceId) });
      if (!service) {
        return NextResponse.json(
          { error: `Service not found: ${item.serviceId}` },
          { status: 404 }
        );
      }
      const unitPriceInr = service.pricing[item.tier] ?? 0;
      const baseLineTotal = unitPriceInr * item.quantity;

      const addOns =
        item.addOns?.map((a) => ({
          name: a.name,
          priceInr: a.priceInr,
          quantity: a.quantity ?? 1,
        })) ?? [];
      const addOnsTotal = addOns.reduce(
        (sum, a) => sum + a.priceInr * a.quantity,
        0
      );

      subtotalInr += baseLineTotal + addOnsTotal;
      orderItems.push({
        serviceId: item.serviceId,
        serviceTitle: service.title,
        tier: item.tier,
        quantity: item.quantity,
        unitPriceInr,
        addOns: addOns.length ? addOns : undefined,
      });
    }

    let discountPercentage = 0;
    let couponId: string | undefined;

    if (couponCode && couponCode.length > 0) {
      const couponsCol = await getCouponsCollection();
      const code = couponCode.trim().toUpperCase();
      const coupon = await couponsCol.findOne({ code, isActive: true });
      if (!coupon) {
        return NextResponse.json(
          { error: "Invalid or expired coupon" },
          { status: 400 }
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
      discountPercentage = coupon.discountPercentage;
      couponId = coupon._id.toString();
      await couponsCol.updateOne(
        { _id: coupon._id },
        { $inc: { usedCount: 1 } }
      );
    }

    const discountAmountInr = Math.round((subtotalInr * discountPercentage) / 100);
    const totalAmountInr = subtotalInr - discountAmountInr;
    const now = new Date();
    const viewToken = randomBytes(32).toString("hex");

    const doc = {
      userId: session.user.id,
      items: orderItems,
      couponCode: couponCode?.trim() || undefined,
      couponId,
      discountPercentage: discountPercentage || undefined,
      subtotalInr,
      discountAmountInr,
      totalAmountInr,
      status: "quoted" as const,
      viewToken,
      quotationMode: quotationMode ?? "confirm_via_admin",
      createdAt: now,
      updatedAt: now,
    };

    const result = await ordersCol.insertOne(doc as never);

    return NextResponse.json({
      orderId: result.insertedId.toString(),
      message: "Quote requested successfully",
      totalAmountInr,
    });
  } catch (e) {
    console.error("Quote request error:", e);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
