import { auth } from "@/auth";
import { db } from "@/lib/db";
import { appointments } from "@/lib/db/schema";
import {
  buildCalendarSlots,
  canNavigateToWeek,
  formatWeekParam,
  getNextWeekStart,
  getPreviousWeekStart,
  getWeekStart,
  parseWeekParam,
  type AppointmentRecord,
} from "@/lib/slots";
import { and, gte, inArray, lt } from "drizzle-orm";
import { addDays } from "date-fns";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const weekStart = parseWeekParam(searchParams.get("week"));
  const weekEnd = addDays(weekStart, 7);

  const rows = await db
    .select()
    .from(appointments)
    .where(
      and(
        gte(appointments.slotStart, weekStart),
        lt(appointments.slotStart, weekEnd),
        inArray(appointments.status, ["pending", "approved", "manual"]),
      ),
    );

  const appointmentRecords: AppointmentRecord[] = rows.map((row) => ({
    id: row.id,
    slotStart: row.slotStart,
    status: row.status,
    customerUserId: row.customerUserId,
    customerName: row.customerName,
    customerPhone: row.customerPhone,
    customerNote: row.customerNote,
    adminMessage: row.adminMessage,
  }));

  const slots = buildCalendarSlots(
    weekStart,
    appointmentRecords,
    session.user.id,
  );

  const isAdmin = session.user.role === "admin";

  return NextResponse.json({
    weekStart: weekStart.toISOString(),
    weekLabel: formatWeekParam(weekStart),
    previousWeek: formatWeekParam(getPreviousWeekStart(weekStart)),
    nextWeek: formatWeekParam(getNextWeekStart(weekStart)),
    canGoPrevious:
      getPreviousWeekStart(weekStart) >= getWeekStart(new Date()),
    canGoNext: canNavigateToWeek(getNextWeekStart(weekStart)),
    isAdmin,
    slots: slots.map((slot) => ({
      start: slot.start.toISOString(),
      timeLabel: slot.timeLabel,
      dayKey: slot.dayKey,
      status: slot.status,
      appointmentId: slot.appointmentId,
      customerName: isAdmin ? slot.customerName : undefined,
      customerPhone: isAdmin ? slot.customerPhone : undefined,
      customerNote: isAdmin ? slot.customerNote : undefined,
      adminMessage: slot.adminMessage,
      isPast: slot.isPast,
    })),
  });
}
