import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getServicesCollection } from "@/lib/db";
import { serviceSchema } from "@/lib/validations/admin";

export const dynamic = "force-dynamic";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  return null;
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

  if (!Array.isArray(body) || body.length === 0) {
    return NextResponse.json(
      { error: "Provide a non-empty array of services" },
      { status: 400 }
    );
  }

  const parsedResults = body.map((item, index) => {
    const parsed = serviceSchema.safeParse(item);
    return { index, parsed };
  });

  const firstError = parsedResults.find((r) => !r.parsed.success);
  if (firstError && !firstError.parsed.success) {
    return NextResponse.json(
      {
        error: `Validation failed for service at index ${firstError.index}`,
        details: firstError.parsed.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const servicesToInsert = parsedResults.map((r) => ({
    ...(r.parsed as any).data,
    createdAt: new Date(),
  }));

  try {
    const col = await getServicesCollection();
    const result = await col.insertMany(servicesToInsert as never[]);
    return NextResponse.json({
      insertedCount: result.insertedCount,
    });
  } catch (e) {
    console.error("Bulk create services:", e);
    return NextResponse.json(
      { error: "Failed to create services" },
      { status: 500 }
    );
  }
}

