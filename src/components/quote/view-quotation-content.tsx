"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Download } from "lucide-react";
import type { Order } from "@/types";

function formatCurrency(inr: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(inr);
}

export function ViewQuotationContent({
  token,
  locale,
}: {
  token: string;
  locale: string;
}) {
  const t = useTranslations("Quote");
  const { data: session } = useSession();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    fetch(`/api/quote/view/${token}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.order) {
          setOrder(data.order);
        } else {
          setError(data.error ?? "Quotation not found");
        }
      })
      .catch(() => setError("Failed to load"))
      .finally(() => setLoading(false));
  }, [token]);

  const pdfViewUrl = token ? `/api/quote/view/${token}/pdf?display=1` : null;
  const isViewOnly = order?.quotationMode === "view_only";
  // view_only: can see PDF only after admin has sent quotation (pending_acceptance = sent)
  const canSeePdf =
    order &&
    (order.status === "accepted" || order.status === "in_progress" || order.status === "completed" ||
      (isViewOnly && order.status === "pending_acceptance"));
  const isConfirmViaAdmin = order?.quotationMode === "confirm_via_admin" || !order?.quotationMode;
  const viewOnlyWaitingSent = isViewOnly && order?.status === "quoted";
  return (
    <main className="mx-auto max-w-5xl px-4 pt-24 pb-16">
      {loading && (
        <p className="text-center text-muted-foreground">Loading quotation…</p>
      )}
      {error && !order && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-destructive">
          {error}
        </div>
      )}
      {order && (
        <>
          <h1 className="text-2xl font-bold text-foreground">Your quotation</h1>
          <p className="mt-1 text-muted-foreground">
            {canSeePdf
              ? isViewOnly
                ? "Your quotation – for viewing only. Contact us to proceed with booking."
                : "Booking confirmed. You can view and download your quotation below."
              : viewOnlyWaitingSent
                ? t("viewOnlyWaitMessage")
                : isConfirmViaAdmin
                  ? "Your quotation is being prepared. You will be able to view and download the PDF once we confirm your booking."
                  : "Your quotation – for viewing only. Contact us to proceed with booking."}
          </p>

          {viewOnlyWaitingSent && (
            <div className="mt-6 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-4 text-center">
              <p className="text-sm font-medium text-foreground">
                {t("viewOnlyWaitMessage")}
              </p>
            </div>
          )}

          {/* Live PDF viewer - only after admin has accepted */}
          {pdfViewUrl && canSeePdf && (
            <div className="mt-8 rounded-xl border border-border bg-card overflow-hidden">
              <div className="flex items-center justify-between border-b border-border bg-muted/30 px-4 py-3">
                <span className="text-sm font-semibold text-foreground">Quotation PDF</span>
                <a
                  href={pdfViewUrl.replace("?display=1", "")}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted/50 transition-colors"
                >
                  <Download className="size-3.5" />
                  Download PDF
                </a>
              </div>
              <div className="bg-muted/20 flex items-center justify-center">
                <iframe
                  src={pdfViewUrl}
                  title="Quotation PDF"
                  className="w-full border-0 min-h-[70vh] h-[75vh] max-h-[900px]"
                />
              </div>
            </div>
          )}

          <div className="mt-8 rounded-xl border border-border bg-card p-6">
            <h2 className="font-semibold">Items</h2>
            <ul className="mt-3 space-y-3">
              {order.items.map((item, i) => {
                const addOns = item.addOns ?? [];
                const baseTotal = item.unitPriceInr * item.quantity;
                const addOnsTotal = addOns.reduce(
                  (sum, a) => sum + a.priceInr * a.quantity,
                  0
                );
                const itemTotal = baseTotal + addOnsTotal;
                return (
                  <li key={i} className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>
                        {item.serviceTitle} – {item.tier} × {item.quantity}
                      </span>
                      <span>{formatCurrency(itemTotal)}</span>
                    </div>
                    {addOns.length > 0 && (
                      <ul className="mt-1 ml-4 space-y-0.5 text-xs text-muted-foreground">
                        {addOns.map((addon, aIdx) => {
                          const addonTotal = addon.priceInr * addon.quantity;
                          return (
                            <li key={aIdx} className="flex justify-between">
                              <span>
                                + {addon.name} × {addon.quantity}
                              </span>
                              <span>{formatCurrency(addonTotal)}</span>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
            <div className="mt-4 space-y-1 border-t border-border pt-4 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>{formatCurrency(order.subtotalInr)}</span>
              </div>
              {order.discountAmountInr > 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Discount</span>
                  <span>-{formatCurrency(order.discountAmountInr)}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-foreground pt-1">
                <span>Total</span>
                <span>{formatCurrency(order.totalAmountInr)}</span>
              </div>
            </div>
            {canSeePdf && (
            <div className="mt-4 pt-4 border-t border-border">
              <a
                href={`/api/quote/view/${token}/pdf`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-muted/50 transition-colors cursor-pointer"
              >
                <Download className="size-4" />
                Download quotation (PDF)
              </a>
            </div>
            )}
          </div>

          {error && (
            <div className="mt-4 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {canSeePdf && (
            <p className="mt-6 text-center text-muted-foreground">
              {isViewOnly
                ? "This quotation is for viewing only. Contact us to confirm your booking."
                : "Your booking is confirmed. You can view and download your quotation above."}
            </p>
          )}
        </>
      )}
    </main>
  );
}
