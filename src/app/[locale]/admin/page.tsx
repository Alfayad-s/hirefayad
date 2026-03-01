import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getServicesCollection, getCouponsCollection, getUsersCollection } from "@/lib/db";

type Props = { params: Promise<{ locale: string }> };

export default async function AdminDashboardPage({ params }: Props) {
  const session = await auth();
  const { locale } = await params;
  if (!session?.user) redirect(`/${locale}/login?callbackUrl=/${locale}/admin`);
  if (session.user.role !== "admin") redirect(`/${locale}`);

  const [servicesCount, couponsCount, usersCount] = await Promise.all([
    getServicesCollection().then((c) => c.countDocuments()),
    getCouponsCollection().then((c) => c.countDocuments()),
    getUsersCollection().then((c) => c.countDocuments()),
  ]);

  const base = `/${locale}/admin`;
  const cards = [
    { title: "Services", count: servicesCount, href: `${base}/services` },
    { title: "Coupons", count: couponsCount, href: `${base}/coupons` },
    { title: "Users", count: usersCount, href: `${base}/users` },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
      <p className="mt-1 text-muted-foreground">Overview of your funnel.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="rounded-xl border border-border bg-card p-6 shadow-sm transition-colors hover:bg-muted/50"
          >
            <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
            <p className="mt-2 text-3xl font-bold text-foreground">{card.count}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
