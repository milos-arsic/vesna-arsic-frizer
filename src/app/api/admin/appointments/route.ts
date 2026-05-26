import { auth } from "@/auth";
import { db } from "@/lib/db";
import { appointments } from "@/lib/db/schema";
import { sendManualBookingConfirmation } from "@/lib/email";
import {
  generateWeekSlots,
  getWeekStart,
  isSlotInPast,
  slotStartKey,
} from "@/lib/slots";
import { msg } from "@/lib/messages";
import { and, eq, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

const manualSchema = z.object({
  slotStart: z.string().datetime(),
  customerName: z.string().trim().min(2, msg.nameRequired).max(100),
  customerPhone: z
    .string()
    .trim()
    .max(20)
    .optional()
    .or(z.literal(""))
    .refine((value) => !value || value.length >= 6, msg.phoneRequired),
  customerEmail: z.string().email().optional().or(z.literal("")),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = manualSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? msg.invalidRequest },
      { status: 400 },
    );
  }

  const slotStart = new Date(parsed.data.slotStart);

  if (isSlotInPast(slotStart)) {
    return NextResponse.json(
      { error: msg.cannotAddPast },
      { status: 400 },
    );
  }

  const weekStart = getWeekStart(slotStart);
  const validSlots = generateWeekSlots(weekStart);
  const isValidSlot = validSlots.some(
    (slot) => slotStartKey(slot) === slotStartKey(slotStart),
  );

  if (!isValidSlot) {
    return NextResponse.json(
      { error: msg.slotInvalid },
      { status: 400 },
    );
  }

  const existingSlot = await db.query.appointments.findFirst({
    where: and(
      eq(appointments.slotStart, slotStart),
      inArray(appointments.status, ["pending", "approved", "manual"]),
    ),
  });

  if (existingSlot) {
    return NextResponse.json(
      { error: msg.slotAlreadyTaken },
      { status: 409 },
    );
  }

  const [appointment] = await db
    .insert(appointments)
    .values({
      slotStart,
      status: "manual",
      customerName: parsed.data.customerName,
      customerPhone: parsed.data.customerPhone?.trim() || null,
      createdBy: session.user.id,
    })
    .returning();

  const customerEmail = parsed.data.customerEmail || null;
  if (customerEmail) {
    await sendManualBookingConfirmation({
      customerEmail,
      customerName: parsed.data.customerName,
      slotStart,
    });
  }

  return NextResponse.json({ appointment }, { status: 201 });
}
