import { getUsersCollection, toJson } from "@/lib/db";
import { AdminUsersTable } from "@/components/admin/admin-users-table";

type Props = { params: Promise<{ locale: string }> };

export default async function AdminUsersPage({ params }: Props) {
  const { locale } = await params;
  const col = await getUsersCollection();
  const users = await col
    .find({}, { projection: { password: 0 } })
    .sort({ createdAt: -1 })
    .limit(200)
    .toArray();
  const list = users.map((u) => toJson(u));

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Users</h1>
      <p className="mt-1 text-muted-foreground">Registered users and signup date.</p>
      <AdminUsersTable users={list} />
    </div>
  );
}
