import { NextResponse } from "next/server";
import { getOrdersCollection, getUsersCollection, toJson } from "@/lib/db";
import { ObjectId } from "mongodb";
import { generateQuotationPDF } from "@/lib/quotation-pdf";

export const dynamic = "force-dynamic";

/** Public: download quotation PDF by view token (from email link) */
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
        "Content-Disposition": `attachment; filename="quotation-${String(order._id).slice(-8)}.pdf"`,
      },
    });
  } catch (e) {
    console.error("Quote view PDF error:", e);
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  }
}
