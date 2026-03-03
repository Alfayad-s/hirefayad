import { Resend } from "resend";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

const FROM = process.env.EMAIL_FROM ?? "ServiceFunnel <onboarding@resend.dev>";
const APP_URL = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

/** To send to real Gmail/outlook etc., add and verify your domain at https://resend.com/domains and set EMAIL_FROM e.g. "ServiceFunnel <noreply@yourdomain.com>" in .env.local */

export async function sendQuotationReadyEmail({
  to,
  userName,
  viewLink,
  orderId,
}: {
  to: string;
  userName: string;
  viewLink: string;
  orderId: string;
}) {
  const resend = getResend();
  if (!resend) {
    console.warn("[email] RESEND_API_KEY not set; skipping quotation email");
    return { ok: false, error: "Email not configured" };
  }
  if (FROM.includes("onboarding@resend.dev") && !to.endsWith("@resend.dev")) {
    console.warn("[email] Using onboarding@resend.dev only delivers to Resend test addresses (e.g. delivered@resend.dev). To send to " + to + ", verify your domain at https://resend.com/domains and set EMAIL_FROM in .env.local");
  }
  const { data, error } = await resend.emails.send({
    from: FROM,
    to: [to],
    subject: "Your quotation is ready – ServiceFunnel",
    html: `
      <p>Hi ${userName},</p>
      <p>Your quotation request (#${orderId.slice(-8)}) is ready.</p>
      <p><a href="${viewLink}" style="display:inline-block;background:#eab308;color:#000;padding:12px 24px;text-decoration:none;font-weight:bold;border-radius:9999px;">View quotation</a></p>
      <p>You can review the details and accept the quote when you're ready.</p>
      <p>— ServiceFunnel</p>
    `,
  });
  if (error) {
    console.error("[email] Quotation email failed:", error.message);
    return { ok: false, error: error.message };
  }
  return { ok: true, id: data?.id };
}

export async function sendBookingConfirmedEmail({
  to,
  userName,
  orderId,
  totalAmountInr,
  itemsSummary,
}: {
  to: string;
  userName: string;
  orderId: string;
  totalAmountInr: number;
  itemsSummary: string;
}) {
  const resend = getResend();
  if (!resend) {
    console.warn("[email] RESEND_API_KEY not set; skipping booking email");
    return { ok: false, error: "Email not configured" };
  }
  if (FROM.includes("onboarding@resend.dev") && !to.endsWith("@resend.dev")) {
    console.warn("[email] Using onboarding@resend.dev only delivers to Resend test addresses. To send to " + to + ", verify your domain at https://resend.com/domains and set EMAIL_FROM in .env.local");
  }
  const totalFormatted = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(totalAmountInr);
  const { data, error } = await resend.emails.send({
    from: FROM,
    to: [to],
    subject: "Booking confirmed – ServiceFunnel",
    html: `
      <p>Hi ${userName},</p>
      <p>Thank you for accepting our quotation. Your booking is confirmed.</p>
      <p><strong>Order reference:</strong> #${orderId.slice(-8)}</p>
      <p><strong>Services:</strong> ${itemsSummary}</p>
      <p><strong>Total:</strong> ${totalFormatted}</p>
      <p>We'll start processing your service and keep you updated.</p>
      <p>— ServiceFunnel</p>
    `,
  });
  if (error) {
    console.error("[email] Booking confirmation email failed:", error.message);
    return { ok: false, error: error.message };
  }
  return { ok: true, id: data?.id };
}

export { APP_URL };
