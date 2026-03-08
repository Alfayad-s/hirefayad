import { AuthModalProvider } from "@/components/providers/auth-modal-provider";
import { CouponMarquee } from "@/components/coupon-marquee";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthModalProvider>
          {/* <CouponMarquee /> */}
      {children}
  
    </AuthModalProvider>
  );
}
