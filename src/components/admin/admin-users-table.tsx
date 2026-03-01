"use client";

import type { User } from "@/types";

export function AdminUsersTable({ users }: { users: (Omit<User, "password"> & { _id: string })[] }) {
  if (users.length === 0) {
    return (
      <div className="mt-8 rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
        No users yet.
      </div>
    );
  }

  return (
    <div className="mt-6 overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="p-3 font-medium">Name</th>
            <th className="p-3 font-medium">Email</th>
            <th className="p-3 font-medium">Role</th>
            <th className="p-3 font-medium">Signed up</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u._id} className="border-b border-border">
              <td className="p-3 font-medium">{u.name}</td>
              <td className="p-3 text-muted-foreground">{u.email}</td>
              <td className="p-3">
                <span className={u.role === "admin" ? "text-primary font-medium" : ""}>{u.role}</span>
              </td>
              <td className="p-3 text-muted-foreground">
                {typeof u.createdAt === "string"
                  ? new Date(u.createdAt).toLocaleDateString()
                  : (u.createdAt as Date).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
