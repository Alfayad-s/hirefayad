import Link from "next/link";
import { getCouponsCollection, toJson } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { AdminCouponsTable } from "@/components/admin/admin-coupons-table";
import { AdminCouponBulkForm } from "@/components/admin/admin-coupon-bulk-form";

type Props = { params: Promise<{ locale: string }> };

export default async function AdminCouponsPage({ params }: Props) {
  const { locale } = await params;
  const col = await getCouponsCollection();
  const coupons = await col.find({}).sort({ createdAt: -1 }).toArray();
  const list = coupons.map((c) => toJson(c));

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Coupons</h1>
        <Button asChild>
          <Link href={`/${locale}/admin/coupons/new`}>Add coupon</Link>
        </Button>
      </div>
      <p className="mt-1 text-muted-foreground">Manage discount codes and usage limits.</p>
      <AdminCouponBulkForm />
      <AdminCouponsTable locale={locale} coupons={list} />
    </div>
  );
}
