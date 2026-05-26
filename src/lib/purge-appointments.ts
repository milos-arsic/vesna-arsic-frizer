import { db } from "@/lib/db";
import { appointments } from "@/lib/db/schema";
import { subDays } from "date-fns";
import { lt } from "drizzle-orm";

const DEFAULT_RETENTION_DAYS = 365;

export function getAppointmentRetentionDays(): number {
  const raw = process.env.APPOINTMENT_RETENTION_DAYS?.trim();
  if (!raw) return DEFAULT_RETENTION_DAYS;

  const days = Number.parseInt(raw, 10);
  if (!Number.isFinite(days) || days < 1) {
    throw new Error("APPOINTMENT_RETENTION_DAYS must be a positive integer");
  }

  return days;
}

export async function purgeExpiredAppointments() {
  const retentionDays = getAppointmentRetentionDays();
  const cutoff = subDays(new Date(), retentionDays);

  const deleted = await db
    .delete(appointments)
    .where(lt(appointments.slotStart, cutoff))
    .returning({ id: appointments.id });

  return {
    retentionDays,
    cutoff: cutoff.toISOString(),
    deletedCount: deleted.length,
  };
}
