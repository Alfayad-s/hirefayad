import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getOrdersCollection } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const col = await getOrdersCollection();
    const result = await col.deleteMany({});
    return NextResponse.json({
      deletedCount: result.deletedCount,
      message: `Removed ${result.deletedCount} order(s) from the database.`,
    });
  } catch (e) {
    console.error("Delete all orders:", e);
    return NextResponse.json({ error: "Failed to remove orders" }, { status: 500 });
  }
}
