import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getServicesCollection, toJson } from "@/lib/db";
import { serviceSchema } from "@/lib/validations/admin";

export const dynamic = "force-dynamic";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  return null;
}

export async function GET() {
  const err = await requireAdmin();
  if (err) return err;
  try {
    const col = await getServicesCollection();
    const services = await col.find({}).sort({ createdAt: 1 }).toArray();
    return NextResponse.json(services.map((s) => toJson(s)));
  } catch (e) {
    console.error("GET admin services:", e);
    return NextResponse.json({ error: "Failed to load services" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const err = await requireAdmin();
  if (err) return err;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = serviceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }
  try {
    const col = await getServicesCollection();
    const doc = {
      ...parsed.data,
      createdAt: new Date(),
    };
    const { insertedId } = await col.insertOne(doc as never);
    const inserted = await col.findOne({ _id: insertedId });
    return NextResponse.json(inserted ? toJson(inserted) : { _id: insertedId.toString() });
  } catch (e) {
    console.error("POST admin services:", e);
    return NextResponse.json({ error: "Failed to create service" }, { status: 500 });
  }
}
