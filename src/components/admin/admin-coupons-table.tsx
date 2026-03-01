"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import type { Coupon } from "@/types";

export function AdminCouponsTable({
  locale,
  coupons,
}: {
  locale: string;
  coupons: (Coupon & { _id: string })[];
}) {
  const router = useRouter();
  const base = `/${locale}/admin/coupons`;

  async function handleDelete(id: string) {
    if (!confirm("Delete this coupon?")) return;
    const res = await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
    if (res.ok) router.refresh();
    else alert("Failed to delete");
  }

  if (coupons.length === 0) {
    return (
      <div className="mt-8 rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
        No coupons yet. Add one to get started.
      </div>
    );
  }

  return (
    <div className="mt-6 overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="p-3 font-medium">Code</th>
            <th className="p-3 font-medium">Discount</th>
            <th className="p-3 font-medium">Used</th>
            <th className="p-3 font-medium">Limit</th>
            <th className="p-3 font-medium">Expires</th>
            <th className="p-3 font-medium">Status</th>
            <th className="w-24 p-3" />
          </tr>
        </thead>
        <tbody>
          {coupons.map((c) => {
            const expiry = typeof c.expiryDate === "string" ? new Date(c.expiryDate) : c.expiryDate;
            const expired = expiry < new Date();
            return (
              <tr key={c._id} className="border-b border-border">
                <td className="p-3 font-mono font-medium">{c.code}</td>
                <td className="p-3">{c.discountPercentage}%</td>
                <td className="p-3">{c.usedCount}</td>
                <td className="p-3">{c.usageLimit}</td>
                <td className="p-3">{expiry.toLocaleDateString()}</td>
                <td className="p-3">
                  <span
                    className={
                      !c.isActive
                        ? "text-muted-foreground"
                        : expired
                          ? "text-destructive"
                          : "text-primary"
                    }
                  >
                    {!c.isActive ? "Inactive" : expired ? "Expired" : "Active"}
                  </span>
                </td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`${base}/${c._id}/edit`}>
                        <Pencil className="size-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(c._id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
