import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getOrdersCollection, getUsersCollection, toJson } from "@/lib/db";
import { ObjectId } from "mongodb";
import type { OrderStatus } from "@/types";

export const dynamic = "force-dynamic";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  return null;
}

const ALLOWED_STATUSES: OrderStatus[] = [
  "quoted",
  "pending_acceptance",
  "accepted",
  "rejected",
  "in_progress",
  "completed",
  "cancelled",
];

export async function GET(
  request: Request,
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
      ...json,
      userName: userName ?? "—",
      userEmail: userEmail ?? "—",
    });
  } catch (e) {
    console.error("GET admin order:", e);
    return NextResponse.json({ error: "Failed to load order" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const err = await requireAdmin();
  if (err) return err;
  const { id } = await params;
  if (!id || !ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
  }

  let body: {
    status?: OrderStatus;
    adminNotes?: string;
    quotationAdvancePercentage?: number;
    quotationIntro?: string;
    quotationPaymentTerms?: string;
    quotationValidity?: string;
    quotationTerms?: string;
    quotationOtherSections?: { heading: string; content: string }[];
    quotationLogo?: string;
    quotationSignature?: string;
    quotationCompanyName?: string;
    quotationCompanyAddress?: string;
    quotationCompanyEmail?: string;
    quotationCompanyPhone?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const updates: Record<string, unknown> = { updatedAt: new Date() };
  if (body.status !== undefined) {
    if (!ALLOWED_STATUSES.includes(body.status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    updates.status = body.status;
  }
  if (body.adminNotes !== undefined) updates.adminNotes = body.adminNotes;
  if (body.quotationAdvancePercentage !== undefined) updates.quotationAdvancePercentage = body.quotationAdvancePercentage;
  if (body.quotationIntro !== undefined) updates.quotationIntro = body.quotationIntro;
  if (body.quotationPaymentTerms !== undefined) updates.quotationPaymentTerms = body.quotationPaymentTerms;
  if (body.quotationValidity !== undefined) updates.quotationValidity = body.quotationValidity;
  if (body.quotationTerms !== undefined) updates.quotationTerms = body.quotationTerms;
  if (body.quotationOtherSections !== undefined) updates.quotationOtherSections = body.quotationOtherSections;
  if (body.quotationLogo !== undefined) updates.quotationLogo = body.quotationLogo;
  if (body.quotationSignature !== undefined) updates.quotationSignature = body.quotationSignature;
  if (body.quotationCompanyName !== undefined) updates.quotationCompanyName = body.quotationCompanyName;
  if (body.quotationCompanyAddress !== undefined) updates.quotationCompanyAddress = body.quotationCompanyAddress;
  if (body.quotationCompanyEmail !== undefined) updates.quotationCompanyEmail = body.quotationCompanyEmail;
  if (body.quotationCompanyPhone !== undefined) updates.quotationCompanyPhone = body.quotationCompanyPhone;

  try {
    const col = await getOrdersCollection();
    const result = await col.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updates },
      { returnDocument: "after" }
    );
    if (!result) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    return NextResponse.json(toJson(result));
  } catch (e) {
    console.error("PATCH admin order:", e);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}
