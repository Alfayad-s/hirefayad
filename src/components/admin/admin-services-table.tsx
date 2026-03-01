"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import type { Service } from "@/types";

export function AdminServicesTable({
  locale,
  services,
}: {
  locale: string;
  services: (Service & { _id: string })[];
}) {
  const router = useRouter();
  const base = `/${locale}/admin/services`;

  async function handleDelete(id: string) {
    if (!confirm("Delete this service?")) return;
    const res = await fetch(`/api/admin/services/${id}`, { method: "DELETE" });
    if (res.ok) router.refresh();
    else alert("Failed to delete");
  }

  if (services.length === 0) {
    return (
      <div className="mt-8 rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
        No services yet. Add one to get started.
      </div>
    );
  }

  return (
    <div className="mt-6 overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="p-3 font-medium">Title</th>
            <th className="p-3 font-medium">Basic</th>
            <th className="p-3 font-medium">Pro</th>
            <th className="p-3 font-medium">Premium</th>
            <th className="w-24 p-3" />
          </tr>
        </thead>
        <tbody>
          {services.map((s) => (
            <tr key={s._id} className="border-b border-border">
              <td className="p-3 font-medium">{s.title}</td>
              <td className="p-3">₹{s.pricing.basic.toLocaleString()}</td>
              <td className="p-3">₹{s.pricing.pro.toLocaleString()}</td>
              <td className="p-3">₹{s.pricing.premium.toLocaleString()}</td>
              <td className="p-3">
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" asChild>
                    <Link href={`${base}/${s._id}/edit`}>
                      <Pencil className="size-4" />
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDelete(s._id)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
