import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getOrdersCollection, getUsersCollection } from "@/lib/db";
import { ObjectId } from "mongodb";
import { sendQuotationReadyEmail, APP_URL } from "@/lib/email";

export const dynamic = "force-dynamic";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  return null;
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const err = await requireAdmin();
  if (err) return err;
  const { id } = await params;
  if (!id || !ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
  }

  try {
    const col = await getOrdersCollection();
    const order = await col.findOne({ _id: new ObjectId(id) });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    let userEmail: string;
    let userName: string;
    if (order.userId) {
      const usersCol = await getUsersCollection();
      const user = await usersCol.findOne(
        { _id: new ObjectId(order.userId) },
        { projection: { email: 1, name: 1 } }
      );
      userEmail = user?.email ?? "";
      userName = user?.name ?? "Customer";
    } else {
      userEmail = (order as { guestEmail?: string }).guestEmail ?? "";
      userName = (order as { guestName?: string }).guestName ?? "Customer";
    }

    if (!userEmail) {
      return NextResponse.json(
        { error: "No email for this order" },
        { status: 400 }
      );
    }

    const viewToken = (order as { viewToken?: string }).viewToken;
    if (!viewToken) {
      return NextResponse.json(
        { error: "Order has no view link" },
        { status: 400 }
      );
    }

    const locale = "en";
    const viewLink = `${APP_URL}/${locale}/quote/view/${viewToken}`;

    const result = await sendQuotationReadyEmail({
      to: userEmail,
      userName,
      viewLink,
      orderId: order._id.toString(),
    });

    if (!result.ok) {
      return NextResponse.json(
        { error: result.error ?? "Failed to send email" },
        { status: 500 }
      );
    }

    const now = new Date();
    await col.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          quotationSentAt: now,
          updatedAt: now,
          status: "pending_acceptance",
        },
      }
    );

    return NextResponse.json({
      message: "Quotation sent",
      viewLink,
    });
  } catch (e) {
    console.error("Send quotation error:", e);
    return NextResponse.json(
      { error: "Failed to send quotation" },
      { status: 500 }
    );
  }
}
