import { auth } from "@/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { msg } from "@/lib/messages";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

const profileSchema = z.object({
  name: z.string().trim().min(2, msg.invalidInput).max(100),
  phone: z.string().trim().min(6, msg.phoneRequired).max(20, msg.phoneTooLong),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
  });

  if (!user) {
    return NextResponse.json({ error: msg.userNotFound }, { status: 404 });
  }

  return NextResponse.json({
    name: user.name ?? "",
    email: user.email,
    phone: user.phone ?? "",
  });
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = profileSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? msg.invalidInput },
      { status: 400 },
    );
  }

  const [updated] = await db
    .update(users)
    .set({
      name: parsed.data.name,
      phone: parsed.data.phone,
    })
    .where(eq(users.id, session.user.id))
    .returning();

  return NextResponse.json({
    name: updated.name ?? "",
    email: updated.email,
    phone: updated.phone ?? "",
  });
}
