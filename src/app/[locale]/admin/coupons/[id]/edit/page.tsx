import { notFound } from "next/navigation";
import { getCouponsCollection, toJson } from "@/lib/db";
import { ObjectId } from "mongodb";
import { AdminCouponForm } from "@/components/admin/admin-coupon-form";
import type { Coupon } from "@/types";

type Props = { params: Promise<{ locale: string; id: string }> };

export default async function EditCouponPage({ params }: Props) {
  const { locale, id } = await params;
  if (!ObjectId.isValid(id)) notFound();
  const col = await getCouponsCollection();
  const doc = await col.findOne({ _id: new ObjectId(id) });
  if (!doc) notFound();
  const coupon = toJson(doc);
  const expiryStr = new Date(coupon.expiryDate).toISOString().slice(0, 16);

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Edit coupon</h1>
      <p className="mt-1 text-muted-foreground">{coupon.code}</p>
      <AdminCouponForm
        locale={locale}
        coupon={
          {
            ...coupon,
            expiryDate: expiryStr,
          } as unknown as Omit<Coupon, "usedCount" | "createdAt"> & { expiryDate: string }
        }
      />
    </div>
  );
}
