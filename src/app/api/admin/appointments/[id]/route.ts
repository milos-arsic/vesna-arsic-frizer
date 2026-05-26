import { auth } from "@/auth";
import { db } from "@/lib/db";
import { appointments, users } from "@/lib/db/schema";
import {
  sendCancellationToCustomer,
  sendRequestApprovedToCustomer,
  sendRequestRejectedToCustomer,
} from "@/lib/email";
import {
  createCustomerCalendarEvent,
  deleteCustomerCalendarEvent,
} from "@/lib/google-calendar";
import { msg } from "@/lib/messages";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

const actionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("approve") }),
  z.object({
    action: z.literal("reject"),
    adminMessage: z.string().trim().min(1, msg.rejectReasonRequired).max(500),
  }),
  z.object({ action: z.literal("cancel") }),
]);

async function getCustomerEmail(userId: string | null): Promise<string | null> {
  if (!userId) return null;
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });
  return user?.email ?? null;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const parsed = actionSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? msg.invalidRequest },
      { status: 400 },
    );
  }

  const appointment = await db.query.appointments.findFirst({
    where: eq(appointments.id, id),
  });

  if (!appointment) {
    return NextResponse.json({ error: msg.appointmentNotFound }, { status: 404 });
  }

  if (parsed.data.action === "approve") {
    if (appointment.status !== "pending") {
      return NextResponse.json(
        { error: msg.onlyPendingApprove },
        { status: 400 },
      );
    }

    let googleCalendarEventId: string | null = null;
    if (appointment.customerUserId) {
      googleCalendarEventId = await createCustomerCalendarEvent({
        userId: appointment.customerUserId,
        slotStart: appointment.slotStart,
        customerName: appointment.customerName ?? msg.client,
      });
    }

    const [updated] = await db
      .update(appointments)
      .set({
        status: "approved",
        adminMessage: null,
        googleCalendarEventId,
      })
      .where(eq(appointments.id, id))
      .returning();

    const customerEmail = await getCustomerEmail(updated.customerUserId);
    if (customerEmail) {
      await sendRequestApprovedToCustomer({
        customerEmail,
        customerName: updated.customerName ?? msg.client,
        slotStart: updated.slotStart,
      });
    }

    return NextResponse.json({ appointment: updated });
  }

  if (parsed.data.action === "reject") {
    if (appointment.status !== "pending") {
      return NextResponse.json(
        { error: msg.onlyPendingReject },
        { status: 400 },
      );
    }

    const [updated] = await db
      .update(appointments)
      .set({ status: "rejected", adminMessage: parsed.data.adminMessage })
      .where(eq(appointments.id, id))
      .returning();

    const customerEmail = await getCustomerEmail(updated.customerUserId);
    if (customerEmail) {
      await sendRequestRejectedToCustomer({
        customerEmail,
        customerName: updated.customerName ?? msg.client,
        slotStart: updated.slotStart,
        adminMessage: parsed.data.adminMessage,
      });
    }

    return NextResponse.json({ appointment: updated });
  }

  if (parsed.data.action === "cancel") {
    if (!["pending", "approved", "manual"].includes(appointment.status)) {
      return NextResponse.json(
        { error: msg.cannotCancel },
        { status: 400 },
      );
    }

    if (
      appointment.googleCalendarEventId &&
      appointment.customerUserId
    ) {
      await deleteCustomerCalendarEvent({
        userId: appointment.customerUserId,
        eventId: appointment.googleCalendarEventId,
      });
    }

    const [updated] = await db
      .update(appointments)
      .set({ status: "cancelled", googleCalendarEventId: null })
      .where(eq(appointments.id, id))
      .returning();

    const customerEmail = await getCustomerEmail(updated.customerUserId);
    if (customerEmail) {
      await sendCancellationToCustomer({
        customerEmail,
        customerName: updated.customerName ?? msg.client,
        slotStart: updated.slotStart,
      });
    }

    return NextResponse.json({ appointment: updated });
  }

  return NextResponse.json({ error: msg.unknownAction }, { status: 400 });
}
