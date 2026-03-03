import { NextResponse } from "next/server";
import { getOrdersCollection, getUsersCollection, toJson } from "@/lib/db";
import { ObjectId } from "mongodb";

export const dynamic = "force-dynamic";

/** Public: get order by view token for "View quotation" page */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  if (!token || token.length < 16) {
    return NextResponse.json({ error: "Invalid link" }, { status: 400 });
  }

  try {
    const col = await getOrdersCollection();
    const order = await col.findOne({ viewToken: token } as { viewToken: string });
    if (!order) {
      return NextResponse.json({ error: "Quotation not found or link expired" }, { status: 404 });
    }

    const json = toJson(order);
    let userName: string | undefined;
    let userEmail: string | undefined;
    if (order.userId) {
      const usersCol = await getUsersCollection();
      const user = await usersCol.findOne(
        { _id: new ObjectId(order.userId) },
        { projection: { name: 1, email: 1 } }
      );
      userName = user?.name;
      userEmail = user?.email;
    } else {
      userName = (order as { guestName?: string }).guestName;
      userEmail = (order as { guestEmail?: string }).guestEmail;
    }

    return NextResponse.json({
      order: json,
      userName: userName ?? "—",
      userEmail: userEmail ?? "—",
    });
  } catch (e) {
    console.error("GET quote view:", e);
    return NextResponse.json({ error: "Failed to load quotation" }, { status: 500 });
  }
}
