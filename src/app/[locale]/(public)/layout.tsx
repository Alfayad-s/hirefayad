import { AuthModalProvider } from "@/components/providers/auth-modal-provider";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthModalProvider>{children}</AuthModalProvider>;
}
