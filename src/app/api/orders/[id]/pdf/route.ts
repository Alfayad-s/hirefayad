import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getOrdersCollection, getUsersCollection, toJson } from "@/lib/db";
import { ObjectId } from "mongodb";
import { generateQuotationPDF } from "@/lib/quotation-pdf";

export const dynamic = "force-dynamic";

/** User downloads quotation PDF for their own order (logged in) */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in to download" }, { status: 401 });
  }

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

    if (order.userId !== session.user.id) {
      return NextResponse.json({ error: "Not your order" }, { status: 403 });
    }

    const status = (order as { status?: string }).status;
    const quotationMode = (order as { quotationMode?: "view_only" | "confirm_via_admin" }).quotationMode;
    // view_only: PDF only after admin has sent the quotation (pending_acceptance = sent)
    const canViewPdf =
      status === "accepted" || status === "in_progress" || status === "completed" ||
      (quotationMode === "view_only" && status === "pending_acceptance");
    if (!canViewPdf) {
      return NextResponse.json(
        { error: "Quotation PDF is available only after your booking is confirmed." },
        { status: 403 }
      );
    }

    let userName: string;
    let userEmail: string;
    if (order.userId) {
      const usersCol = await getUsersCollection();
      const user = await usersCol.findOne(
        { _id: new ObjectId(order.userId) },
        { projection: { name: 1, email: 1 } }
      );
      userName = user?.name ?? "Customer";
      userEmail = user?.email ?? "";
    } else {
      userName = (order as { guestName?: string }).guestName ?? "Customer";
      userEmail = (order as { guestEmail?: string }).guestEmail ?? "";
    }

    const orderJson = toJson(order);
    const pdfBytes = await generateQuotationPDF(
      orderJson as import("@/types").Order,
      userName,
      userEmail
    );

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="quotation-${id.slice(-8)}.pdf"`,
      },
    });
  } catch (e) {
    console.error("User PDF download error:", e);
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  }
}
