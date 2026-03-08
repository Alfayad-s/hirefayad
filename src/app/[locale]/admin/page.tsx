import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Database, BarChart3, CheckCircle2 } from "lucide-react";
import { getDb, getServicesCollection, getCouponsCollection, getUsersCollection } from "@/lib/db";

type Props = { params: Promise<{ locale: string }> };

async function getDbInfo(): Promise<{ connected: boolean; databaseName: string | null }> {
  try {
    const db = await getDb();
    return { connected: true, databaseName: db.databaseName };
  } catch {
    return { connected: false, databaseName: null };
  }
}

export default async function AdminDashboardPage({ params }: Props) {
  const session = await auth();
  const { locale } = await params;
  if (!session?.user) redirect(`/${locale}/login?callbackUrl=/${locale}/admin`);
  if (session.user.role !== "admin") redirect(`/${locale}`);

  const [servicesCount, couponsCount, usersCount, dbInfo] = await Promise.all([
    getServicesCollection().then((c) => c.countDocuments()),
    getCouponsCollection().then((c) => c.countDocuments()),
    getUsersCollection().then((c) => c.countDocuments()),
    getDbInfo(),
  ]);

  const base = `/${locale}/admin`;
  const cards = [
    { title: "Services", count: servicesCount, href: `${base}/services` },
    { title: "Coupons", count: couponsCount, href: `${base}/coupons` },
    { title: "Users", count: usersCount, href: `${base}/users` },
  ];

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="mt-1 text-muted-foreground">Overview of your funnel.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
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

      {/* Database & connection info */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-foreground">Connection &amp; analytics</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="flex items-start gap-3 rounded-lg border border-border/70 bg-muted/20 p-3">
            <Database className="size-5 shrink-0 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-foreground">Database</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {dbInfo.connected ? (
                  <>
                    <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400">
                      <CheckCircle2 className="size-3.5" /> Connected
                    </span>
                    {dbInfo.databaseName && (
                      <> · {dbInfo.databaseName}</>
                    )}
                  </>
                ) : (
                  <span className="text-amber-600 dark:text-amber-400">Not configured or unreachable</span>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-lg border border-border/70 bg-muted/20 p-3">
            <BarChart3 className="size-5 shrink-0 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-foreground">Vercel Analytics</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Enabled. Good for privacy: no cookies, minimal data, compliant with GDPR. Use it for traffic and performance insights.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
