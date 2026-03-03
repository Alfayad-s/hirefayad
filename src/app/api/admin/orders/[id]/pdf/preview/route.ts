import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getOrdersCollection, getUsersCollection, toJson } from "@/lib/db";
import { ObjectId } from "mongodb";
import { generateQuotationPDF } from "@/lib/quotation-pdf";
import type { Order } from "@/types";

export const dynamic = "force-dynamic";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  return null;
}

/** Generate PDF with optional quotation overrides (for live preview in admin) */
export async function POST(
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
  } = {};
  try {
    const raw = await request.json();
    if (raw && typeof raw === "object") body = raw;
  } catch {
    /* empty body ok */
  }

  try {
    const col = await getOrdersCollection();
    const order = await col.findOne({ _id: new ObjectId(id) });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
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

    const orderJson = toJson(order) as Order;
    const merged: Order = {
      ...orderJson,
      quotationAdvancePercentage: body.quotationAdvancePercentage ?? orderJson.quotationAdvancePercentage,
      quotationIntro: body.quotationIntro ?? orderJson.quotationIntro,
      quotationPaymentTerms: body.quotationPaymentTerms ?? orderJson.quotationPaymentTerms,
      quotationValidity: body.quotationValidity ?? orderJson.quotationValidity,
      quotationTerms: body.quotationTerms ?? orderJson.quotationTerms,
      quotationOtherSections: body.quotationOtherSections ?? orderJson.quotationOtherSections,
      quotationLogo: body.quotationLogo ?? orderJson.quotationLogo,
      quotationSignature: body.quotationSignature ?? orderJson.quotationSignature,
      quotationCompanyName: body.quotationCompanyName ?? orderJson.quotationCompanyName,
      quotationCompanyAddress: body.quotationCompanyAddress ?? orderJson.quotationCompanyAddress,
      quotationCompanyEmail: body.quotationCompanyEmail ?? orderJson.quotationCompanyEmail,
      quotationCompanyPhone: body.quotationCompanyPhone ?? orderJson.quotationCompanyPhone,
    };

    const pdfBytes = await generateQuotationPDF(merged, userName, userEmail);

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    console.error("Preview PDF error:", e);
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  }
}
