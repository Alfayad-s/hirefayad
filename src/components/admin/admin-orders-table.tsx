"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FileText, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Order, OrderStatus } from "@/types";

type OrderRow = Order & { userName?: string; userEmail?: string };

const STATUS_LABELS: Record<OrderStatus, string> = {
  draft: "Draft",
  quoted: "Quoted",
  pending_acceptance: "Pending acceptance",
  accepted: "Accepted",
  rejected: "Rejected",
  in_progress: "In progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

const STATUS_COLOR: Record<OrderStatus, string> = {
  draft: "text-muted-foreground",
  quoted: "text-amber-600 dark:text-amber-400",
  pending_acceptance: "text-blue-600 dark:text-blue-400",
  accepted: "text-green-600 dark:text-green-400",
  rejected: "text-destructive",
  in_progress: "text-primary",
  completed: "text-green-600 dark:text-green-400",
  cancelled: "text-muted-foreground",
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

export function AdminOrdersTable({ locale }: { locale: string }) {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [deletingAll, setDeletingAll] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const base = `/${locale}/admin`;

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      const res = await fetch(`/api/admin/orders?${params.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setOrders(data.orders ?? []);
        setTotal(data.total ?? 0);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const handleRemoveAllOrders = async () => {
    if (total === 0) return;
    const confirmed = window.confirm(
      `Are you sure you want to remove all ${total} order(s) from the database? This cannot be undone.`
    );
    if (!confirmed) return;
    setDeletingAll(true);
    try {
      const res = await fetch("/api/admin/orders/delete-all", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setOrders([]);
        setTotal(0);
      } else {
        alert(data.error ?? "Failed to remove orders");
      }
    } catch {
      alert("Failed to remove orders");
    } finally {
      setDeletingAll(false);
    }
  };

  if (loading && orders.length === 0) {
    return (
      <div className="mt-6 rounded-xl border border-border p-12 text-center text-muted-foreground">
        Loading orders…
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="mt-6 rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
        No orders yet. Quote requests from the site will appear here.
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">All statuses</option>
          {(Object.keys(STATUS_LABELS) as OrderStatus[]).map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
        <Button variant="outline" size="sm" onClick={fetchOrders} disabled={loading} className="gap-1.5">
          <RefreshCw className={loading ? "size-4 animate-spin" : "size-4"} />
          Refresh
        </Button>
        <span className="text-sm text-muted-foreground">{total} order(s)</span>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRemoveAllOrders}
          disabled={loading || deletingAll || total === 0}
          className="gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
          title="Remove all orders from the database (for cleaning)"
        >
          <Trash2 className={deletingAll ? "size-4 animate-pulse" : "size-4"} />
          Remove all orders
        </Button>
      </div>
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="p-3 font-medium">Date</th>
              <th className="p-3 font-medium">Customer</th>
              <th className="p-3 font-medium">Items</th>
              <th className="p-3 font-medium">Total</th>
              <th className="p-3 font-medium">Status</th>
              <th className="w-20 p-3" />
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o._id} className="border-b border-border">
                <td className="p-3 text-muted-foreground">{formatDate(o.createdAt)}</td>
                <td className="p-3">
                  <div className="font-medium">{o.userName ?? "—"}</div>
                  <div className="text-xs text-muted-foreground">{o.userEmail ?? "—"}</div>
                </td>
                <td className="p-3">
                  {o.items.length} item(s): {o.items.map((i) => i.serviceTitle).join(", ")}
                </td>
                <td className="p-3 font-medium">{formatCurrency(o.totalAmountInr)}</td>
                <td className="p-3">
                  <span className={STATUS_COLOR[o.status]}>{STATUS_LABELS[o.status]}</span>
                </td>
                <td className="p-3">
                  <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                    <Link href={`${base}/orders/${o._id}/quotation`} title="View / Edit quotation">
                      <FileText className="size-4" />
                    </Link>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
