import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getOrdersCollection, toJson } from "@/lib/db";
import { ObjectId } from "mongodb";

export const dynamic = "force-dynamic";

/** List orders for the current user */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in to view your orders" }, { status: 401 });
  }

  try {
    const col = await getOrdersCollection();
    const orders = await col
      .find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();
    return NextResponse.json({
      orders: orders.map((o) => toJson(o)),
    });
  } catch (e) {
    console.error("GET my orders:", e);
    return NextResponse.json({ error: "Failed to load orders" }, { status: 500 });
  }
}
