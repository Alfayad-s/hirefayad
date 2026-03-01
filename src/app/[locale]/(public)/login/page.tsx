import { setRequestLocale } from "next-intl/server";
import { auth } from "@/auth";
import { LoginForm } from "@/components/auth/LoginForm";
import { PublicHeader } from "@/components/layout/public-header";

type Props = { params: Promise<{ locale: string }> };

export default async function LoginPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await auth();

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader showBack session={session} />
      <main className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-md flex-col items-center justify-center px-4 pt-24 pb-12">
        <LoginForm />
      </main>
    </div>
  );
}
