import { NextResponse } from "next/server";
import { getServicesCollection, toJson } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const col = await getServicesCollection();
    const services = await col.find({}).sort({ createdAt: 1 }).toArray();
    return NextResponse.json(
      services.map((s) => toJson(s))
    );
  } catch (e) {
    console.error("GET services error:", e);
    return NextResponse.json(
      { error: "Failed to load services" },
      { status: 500 }
    );
  }
}
