import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getOrdersCollection, getUsersCollection, toJson } from "@/lib/db";
import { ObjectId } from "mongodb";
import type { OrderStatus } from "@/types";

export const dynamic = "force-dynamic";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  return null;
}

export async function GET(request: Request) {
  const err = await requireAdmin();
  if (err) return err;
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") as OrderStatus | null;
  const limit = Math.min(Number(searchParams.get("limit")) || 50, 100);
  const skip = Number(searchParams.get("skip")) || 0;

  try {
    const col = await getOrdersCollection();
    const filter: Record<string, unknown> = {};
    if (status && status.trim()) {
      filter.status = status;
    }
    const orders = await col
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
    const total = await col.countDocuments(filter);

    const userIds = [...new Set(orders.map((o) => o.userId).filter(Boolean))] as string[];
    const usersCol = await getUsersCollection();
    const users = await usersCol
      .find({ _id: { $in: userIds.map((id) => new ObjectId(id)) } })
      .project({ _id: 1, name: 1, email: 1 })
      .toArray();
    const userMap = new Map(users.map((u) => [u._id.toString(), { name: u.name, email: u.email }]));

    const list = orders.map((o) => {
      const json = toJson(o);
      const user = o.userId ? userMap.get(o.userId) : null;
      return {
        ...json,
        userName: user?.name ?? (o as { guestName?: string }).guestName ?? "—",
        userEmail: user?.email ?? (o as { guestEmail?: string }).guestEmail ?? "—",
      };
    });

    return NextResponse.json({ orders: list, total });
  } catch (e) {
    console.error("GET admin orders:", e);
    return NextResponse.json({ error: "Failed to load orders" }, { status: 500 });
  }
}
