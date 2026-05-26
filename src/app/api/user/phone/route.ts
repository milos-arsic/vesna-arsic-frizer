import { auth } from "@/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { msg } from "@/lib/messages";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

const phoneSchema = z.object({
  phone: z
    .string()
    .trim()
    .min(6, msg.phoneRequired)
    .max(20, msg.phoneTooLong),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = phoneSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? msg.invalidInput },
      { status: 400 },
    );
  }

  await db
    .update(users)
    .set({ phone: parsed.data.phone })
    .where(eq(users.id, session.user.id));

  return NextResponse.json({ success: true });
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
  });

  return NextResponse.json({ phone: user?.phone ?? null });
}
