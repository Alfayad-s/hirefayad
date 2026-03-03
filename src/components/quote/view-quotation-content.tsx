"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { CheckCircle2, Loader2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Order } from "@/types";
import type { Session } from "next-auth";

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
  const { data: session } = useSession();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [accepted, setAccepted] = useState(false);
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

  const handleAccept = async () => {
    if (!order?._id || !token) return;
    setError(null);
    setAccepting(true);
    try {
      const res = await fetch(`/api/orders/${order._id}/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          consent: `I accept the quotation and agree to the terms. ${new Date().toISOString()}`,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to accept");
        return;
      }
      setAccepted(true);
    } finally {
      setAccepting(false);
    }
  };

  return (
    <main className="mx-auto max-w-2xl px-4 pt-24 pb-16">
      {loading && (
        <p className="text-center text-muted-foreground">Loading quotation…</p>
      )}
      {error && !order && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-destructive">
          {error}
        </div>
      )}
      {accepted && (
        <div className="rounded-xl border border-primary/50 bg-primary/5 p-8 text-center">
          <CheckCircle2 className="mx-auto size-12 text-primary" />
          <h1 className="mt-4 text-xl font-bold">Booking confirmed</h1>
          <p className="mt-2 text-muted-foreground">
            Thank you. We&apos;ve sent a confirmation to your email and will start processing your service.
          </p>
        </div>
      )}
      {order && !accepted && (
        <>
          <h1 className="text-2xl font-bold text-foreground">Your quotation</h1>
          <p className="mt-1 text-muted-foreground">Review the details below and accept to book.</p>

          <div className="mt-8 rounded-xl border border-border bg-card p-6">
            <h2 className="font-semibold">Items</h2>
            <ul className="mt-3 space-y-2">
              {order.items.map((item, i) => (
                <li key={i} className="flex justify-between text-sm">
                  <span>
                    {item.serviceTitle} – {item.tier} × {item.quantity}
                  </span>
                  <span>{formatCurrency(item.unitPriceInr * item.quantity)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex justify-between border-t border-border pt-4 font-semibold">
              <span>Total</span>
              <span>{formatCurrency(order.totalAmountInr)}</span>
            </div>
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
          </div>

          {error && (
            <div className="mt-4 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {(order.status === "quoted" || order.status === "pending_acceptance") && (
            <Button
              onClick={handleAccept}
              disabled={accepting}
              size="lg"
              className="mt-8 w-full rounded-full bg-yellow-400 font-bold text-black hover:bg-yellow-300"
            >
              {accepting ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                "I accept & book"
              )}
            </Button>
          )}
          {(order.status === "accepted" || order.status === "in_progress" || order.status === "completed") && (
            <p className="mt-6 text-center text-muted-foreground">
              You have already accepted this quotation.
            </p>
          )}
        </>
      )}
    </main>
  );
}
