"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { FileText, ChevronRight, Package, Tag, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Order, OrderStatus, OrderItem } from "@/types";

const STATUS_LABELS: Record<OrderStatus, string> = {
  draft: "Draft",
  quoted: "Quoted",
  pending_acceptance: "Pending",
  accepted: "Accepted",
  rejected: "Rejected",
  in_progress: "In progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

function formatDate(val: string | Date) {
  return new Date(val).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatCurrency(inr: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(inr);
}

const TIER_LABELS: Record<string, string> = {
  basic: "Basic",
  pro: "Pro",
  premium: "Premium",
};

function OrderCard({ order, locale }: { order: Order; locale: string }) {
  const lineTotal = (item: OrderItem) => item.unitPriceInr * item.quantity;

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <Link
        href={order.viewToken ? `/${locale}/quote/view/${order.viewToken}` : "#"}
        className="flex items-center justify-between p-4 transition-colors hover:bg-muted/30"
      >
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2">
            <FileText className="size-5 text-primary" />
          </div>
          <div>
            <p className="font-medium text-foreground">
              Quote · {formatDate(order.createdAt)}
            </p>
            <p className="text-sm text-muted-foreground">
              {order.items.length} service{order.items.length !== 1 ? "s" : ""} · {formatCurrency(order.totalAmountInr)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-foreground">
            {STATUS_LABELS[order.status]}
          </span>
          <ChevronRight className="size-4 text-muted-foreground" />
        </div>
      </Link>

      {/* Full details: services list */}
      <div className="border-t border-border bg-muted/20 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Services</p>
        <ul className="space-y-2">
          {order.items.map((item, idx) => (
            <li key={idx} className="flex flex-wrap items-center justify-between gap-2 text-sm">
              <div className="flex items-center gap-2">
                <Package className="size-3.5 text-muted-foreground shrink-0" />
                <span className="font-medium text-foreground">{item.serviceTitle}</span>
                <span className="text-muted-foreground">· {TIER_LABELS[item.tier] ?? item.tier}</span>
                <span className="text-muted-foreground">× {item.quantity}</span>
              </div>
              <span className="font-medium text-foreground">{formatCurrency(lineTotal(item))}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 pt-3 border-t border-border space-y-1 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal</span>
            <span>{formatCurrency(order.subtotalInr)}</span>
          </div>
          {order.discountAmountInr > 0 && (
            <div className="flex justify-between text-muted-foreground">
              <span className="flex items-center gap-1">
                Discount {order.couponCode && (
                  <span className="inline-flex items-center gap-0.5 rounded bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary">
                    <Tag className="size-3" /> {order.couponCode}
                  </span>
                )}
              </span>
              <span>−{formatCurrency(order.discountAmountInr)}</span>
            </div>
          )}
          <div className="flex justify-between font-semibold text-foreground pt-1">
            <span>Total</span>
            <span>{formatCurrency(order.totalAmountInr)}</span>
          </div>
        </div>
        <div className="border-t border-border px-4 py-3">
          <a
            href={`/api/orders/${order._id}/pdf`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground hover:bg-muted/50 transition-colors cursor-pointer"
          >
            <Download className="size-4" />
            Download quotation (PDF)
          </a>
        </div>
      </div>
    </div>
  );
}

export function MyOrdersContent({ locale }: { locale: string }) {
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status !== "authenticated") {
      setLoading(false);
      return;
    }
    fetch("/api/orders/my")
      .then((res) => res.json())
      .then((data) => {
        if (data.orders) setOrders(data.orders);
      })
      .finally(() => setLoading(false));
  }, [status]);

  if (status === "loading" || loading) {
    return (
      <main className="mx-auto max-w-2xl px-4 pt-24 pb-16">
        <p className="text-center text-muted-foreground">Loading your orders…</p>
      </main>
    );
  }

  if (status !== "authenticated") {
    return (
      <main className="mx-auto max-w-2xl px-4 pt-24 pb-16 text-center">
        <p className="text-muted-foreground">Sign in to view your orders.</p>
        <Button asChild className="mt-4">
          <Link href={`/${locale}/login?callbackUrl=/${locale}/orders`}>Sign in</Link>
        </Button>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-4 pt-24 pb-16">
      <h1 className="text-2xl font-bold text-foreground">Requested quotes</h1>
      <p className="mt-1 text-muted-foreground">View your quote requests, services, and booking status.</p>

      {orders.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
          You haven&apos;t requested any quotes yet.
          <Button asChild className="mt-4">
            <Link href={`/${locale}/quote`}>Request a quote</Link>
          </Button>
        </div>
      ) : (
        <ul className="mt-6 space-y-4">
          {orders.map((o) => (
            <li key={o._id}>
              <OrderCard order={o} locale={locale} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
