import { AdminCouponForm } from "@/components/admin/admin-coupon-form";

type Props = { params: Promise<{ locale: string }> };

export default async function NewCouponPage({ params }: Props) {
  const { locale } = await params;
  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Add coupon</h1>
      <p className="mt-1 text-muted-foreground">Create a new discount code.</p>
      <AdminCouponForm locale={locale} />
    </div>
  );
}
