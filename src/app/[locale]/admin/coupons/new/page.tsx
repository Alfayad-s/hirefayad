import { AdminCouponForm } from "@/components/admin/admin-coupon-form";

type Props = { params: Promise<{ locale: string }> };

export default async function NewCouponPage({ params }: Props) {
  const { locale } = await params;
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-3">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Add coupon</h1>
        <p className="mt-1 text-muted-foreground">Create a new discount code.</p>
      </div>
      <AdminCouponForm locale={locale} />
    </div>
  );
}
