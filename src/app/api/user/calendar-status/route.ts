import { auth } from "@/auth";
import { db } from "@/lib/db";
import { accounts } from "@/lib/db/schema";
import { GOOGLE_CALENDAR_SCOPE } from "@/lib/google-auth";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const account = await db.query.accounts.findFirst({
    where: and(
      eq(accounts.userId, session.user.id),
      eq(accounts.provider, "google"),
    ),
  });

  const connected =
    account?.scope?.includes("calendar.events") ?? false;

  return NextResponse.json({
    connected,
    scope: GOOGLE_CALENDAR_SCOPE,
  });
}