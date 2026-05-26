import { auth } from "@/auth";
import { db } from "@/lib/db";
import { appointments } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const pending = await db.query.appointments.findMany({
    where: eq(appointments.status, "pending"),
    orderBy: (table, { asc }) => [asc(table.slotStart)],
  });

  return NextResponse.json({ pending });
}
