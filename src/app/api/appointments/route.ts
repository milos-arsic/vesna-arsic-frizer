import { auth } from "@/auth";
import { db } from "@/lib/db";
import { appointments, users } from "@/lib/db/schema";
import { notifyAdminsOfNewRequest } from "@/lib/email";
import { deleteCustomerCalendarEvent } from "@/lib/google-calendar";
import {
  canNavigateToWeek,
  generateWeekSlots,
  getWeekStart,
  isSlotInPast,
  slotStartKey,
} from "@/lib/slots";
import { msg } from "@/lib/messages";
import { and, eq, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

const requestSchema = z.object({
  slotStart: z.string().datetime(),
  customerNote: z.string().trim().max(500).optional(),
  rescheduleAppointmentId: z.string().uuid().optional(),
});

async function validateBookableSlot(slotStart: Date) {
  if (isSlotInPast(slotStart)) {
    return { error: msg.cannotBookPast, status: 400 as const };
  }

  const weekStart = getWeekStart(slotStart);
  if (!canNavigateToWeek(weekStart)) {
    return { error: msg.maxWeeksAhead, status: 400 as const };
  }

  const validSlots = generateWeekSlots(weekStart);
  const isValidSlot = validSlots.some(
    (slot) => slotStartKey(slot) === slotStartKey(slotStart),
  );

  if (!isValidSlot) {
    return { error: msg.slotUnavailable, status: 400 as const };
  }

  const existingSlot = await db.query.appointments.findFirst({
    where: and(
      eq(appointments.slotStart, slotStart),
      inArray(appointments.status, ["pending", "approved", "manual"]),
    ),
  });

  if (existingSlot) {
    return { error: msg.slotTaken, status: 409 as const };
  }

  return { weekStart };
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id || !session.user.phone) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = requestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? msg.invalidRequest },
      { status: 400 },
    );
  }

  const slotStart = new Date(parsed.data.slotStart);
  const slotValidation = await validateBookableSlot(slotStart);

  if ("error" in slotValidation) {
    return NextResponse.json(
      { error: slotValidation.error },
      { status: slotValidation.status },
    );
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
  });

  if (!user) {
    return NextResponse.json({ error: msg.userNotFound }, { status: 404 });
  }

  if (parsed.data.rescheduleAppointmentId) {
    const existingApproved = await db.query.appointments.findFirst({
      where: and(
        eq(appointments.id, parsed.data.rescheduleAppointmentId),
        eq(appointments.customerUserId, session.user.id),
        eq(appointments.status, "approved"),
      ),
    });

    if (!existingApproved) {
      return NextResponse.json(
        { error: msg.appointmentNotFound },
        { status: 404 },
      );
    }

    if (
      slotStartKey(existingApproved.slotStart) === slotStartKey(slotStart)
    ) {
      return NextResponse.json(
        { error: msg.rescheduleSameSlot },
        { status: 400 },
      );
    }

    if (
      existingApproved.googleCalendarEventId &&
      existingApproved.customerUserId
    ) {
      await deleteCustomerCalendarEvent({
        userId: existingApproved.customerUserId,
        eventId: existingApproved.googleCalendarEventId,
      });
    }

    const previousSlotStart = existingApproved.slotStart;

    const [appointment] = await db
      .update(appointments)
      .set({
        slotStart,
        status: "pending",
        customerNote: parsed.data.customerNote || null,
        adminMessage: null,
        googleCalendarEventId: null,
      })
      .where(eq(appointments.id, existingApproved.id))
      .returning();

    await notifyAdminsOfNewRequest({
      customerName: user.name ?? msg.client,
      customerPhone: user.phone!,
      slotStart,
      customerNote: parsed.data.customerNote,
      previousSlotStart,
    });

    return NextResponse.json({ appointment }, { status: 200 });
  }

  const existingPending = await db.query.appointments.findFirst({
    where: and(
      eq(appointments.customerUserId, session.user.id),
      eq(appointments.status, "pending"),
    ),
  });

  if (existingPending) {
    return NextResponse.json(
      { error: msg.pendingExists },
      { status: 409 },
    );
  }

  const [appointment] = await db
    .insert(appointments)
    .values({
      slotStart,
      status: "pending",
      customerUserId: user.id,
      customerName: user.name,
      customerPhone: user.phone!,
      customerNote: parsed.data.customerNote || null,
      createdBy: user.id,
    })
    .returning();

  await notifyAdminsOfNewRequest({
    customerName: user.name ?? msg.client,
    customerPhone: user.phone!,
    slotStart,
    customerNote: parsed.data.customerNote,
  });

  return NextResponse.json({ appointment }, { status: 201 });
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userAppointments = await db.query.appointments.findMany({
    where: and(
      eq(appointments.customerUserId, session.user.id),
      inArray(appointments.status, ["pending", "approved"]),
    ),
    orderBy: (table, { asc }) => [asc(table.slotStart)],
  });

  return NextResponse.json({ appointments: userAppointments });
}
