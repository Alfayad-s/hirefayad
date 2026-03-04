import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getOrdersCollection, getUsersCollection } from "@/lib/db";
import { ObjectId } from "mongodb";
import { sendBookingConfirmedEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

/** Accept quotation: only admin can accept. When admin accepts, customer can then view/download PDF. */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id || !ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
  }

  let body: { consent?: string };
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json(
      { error: "Only an admin can accept this quotation" },
      { status: 403 }
    );
  }

  const col = await getOrdersCollection();
  const order = await col.findOne({ _id: new ObjectId(id) });
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const orderStatus = (order as { status: string }).status;
  if (orderStatus !== "quoted" && orderStatus !== "pending_acceptance") {
    return NextResponse.json(
      { error: "This quotation can no longer be accepted" },
      { status: 400 }
    );
  }

  const now = new Date();
  const consentText = body.consent ?? `Accepted by admin on behalf of customer. ${now.toISOString()}`;

  await col.updateOne(
    { _id: new ObjectId(id) },
    {
      $set: {
        status: "accepted",
        acceptedAt: now,
        signedAt: now,
        signedConsent: consentText,
        updatedAt: now,
      },
    }
  );

  let userEmail: string | undefined;
  let userName: string | undefined;
  if (order.userId) {
    const usersCol = await getUsersCollection();
    const user = await usersCol.findOne(
      { _id: new ObjectId(order.userId) },
      { projection: { email: 1, name: 1 } }
    );
    userEmail = user?.email;
    userName = user?.name ?? "Customer";
  } else {
    userEmail = (order as { guestEmail?: string }).guestEmail;
    userName = (order as { guestName?: string }).guestName ?? "Customer";
  }

  const itemsSummary = (order as { items: Array<{ serviceTitle: string; tier: string }> }).items
    .map((i) => `${i.serviceTitle} (${i.tier})`)
    .join(", ");

  if (userEmail) {
    await sendBookingConfirmedEmail({
      to: userEmail,
      userName: userName ?? "Customer",
      orderId: order._id.toString(),
      totalAmountInr: (order as { totalAmountInr: number }).totalAmountInr,
      itemsSummary,
    });
  }

  return NextResponse.json({
    message: "Quotation accepted. Booking confirmed.",
    orderId: id,
  });
}
