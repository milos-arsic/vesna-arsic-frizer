import {
  addDays,
  addMinutes,
  addWeeks,
  isBefore,
  startOfWeek,
} from "date-fns";
import { sr } from "date-fns/locale";
import { formatInTimeZone, fromZonedTime, toZonedTime } from "date-fns-tz";

export const TIMEZONE = "Europe/Belgrade";
export const SLOT_DURATION_MINUTES = 30;
export const MAX_WEEKS_AHEAD = 2;
export const WORK_DAYS = [1, 2, 3, 4, 5, 6] as const; // Mon–Sat

type TimeRange = { startHour: number; startMinute: number; endHour: number; endMinute: number };

function getDaySchedule(dayOfWeek: number): TimeRange[] {
  if (dayOfWeek === 0) return [];
  if (dayOfWeek === 6) {
    return [{ startHour: 8, startMinute: 0, endHour: 14, endMinute: 0 }];
  }
  if (dayOfWeek >= 1 && dayOfWeek <= 5) {
    return [
      { startHour: 8, startMinute: 0, endHour: 12, endMinute: 0 },
      { startHour: 16, startMinute: 0, endHour: 20, endMinute: 0 },
    ];
  }
  return [];
}

export function getWeekStart(date: Date): Date {
  const zoned = toZonedTime(date, TIMEZONE);
  const monday = startOfWeek(zoned, { weekStartsOn: 1 });
  monday.setHours(0, 0, 0, 0);
  return fromZonedTime(monday, TIMEZONE);
}

export function getWeekEnd(weekStart: Date): Date {
  return addDays(weekStart, 6);
}

export function formatWeekLabel(weekStart: Date): string {
  const weekEnd = addDays(weekStart, 5);
  const startLabel = formatInTimeZone(weekStart, TIMEZONE, "d. MMM");
  const endLabel = formatInTimeZone(weekEnd, TIMEZONE, "d. MMM yyyy");
  return `${startLabel} – ${endLabel}`;
}

export function parseWeekParam(weekParam: string | null): Date {
  if (!weekParam) return getWeekStart(new Date());

  const parsed = fromZonedTime(`${weekParam}T00:00:00`, TIMEZONE);
  if (Number.isNaN(parsed.getTime())) return getWeekStart(new Date());
  return getWeekStart(parsed);
}

export function canNavigateToWeek(weekStart: Date): boolean {
  const currentWeekStart = getWeekStart(new Date());
  const maxWeekStart = addWeeks(currentWeekStart, MAX_WEEKS_AHEAD);
  return !isBefore(maxWeekStart, weekStart);
}

export function isWeekInPast(weekStart: Date): boolean {
  const currentWeekStart = getWeekStart(new Date());
  return isBefore(weekStart, currentWeekStart);
}

export function getPreviousWeekStart(weekStart: Date): Date {
  return addDays(weekStart, -7);
}

export function getNextWeekStart(weekStart: Date): Date {
  return addDays(weekStart, 7);
}

export function formatWeekParam(weekStart: Date): string {
  return formatInTimeZone(weekStart, TIMEZONE, "yyyy-MM-dd");
}

export function generateWeekSlots(weekStart: Date): Date[] {
  const slots: Date[] = [];

  for (const dayOffset of WORK_DAYS) {
    const dayStart = addDays(weekStart, dayOffset - 1);
    const zonedDay = toZonedTime(dayStart, TIMEZONE);
    const dayOfWeek = zonedDay.getDay();
    const ranges = getDaySchedule(dayOfWeek);

    for (const range of ranges) {
      let cursor = fromZonedTime(
        new Date(
          zonedDay.getFullYear(),
          zonedDay.getMonth(),
          zonedDay.getDate(),
          range.startHour,
          range.startMinute,
          0,
          0,
        ),
        TIMEZONE,
      );
      const rangeEnd = fromZonedTime(
        new Date(
          zonedDay.getFullYear(),
          zonedDay.getMonth(),
          zonedDay.getDate(),
          range.endHour,
          range.endMinute,
          0,
          0,
        ),
        TIMEZONE,
      );

      while (isBefore(cursor, rangeEnd)) {
        slots.push(new Date(cursor));
        cursor = addMinutes(cursor, SLOT_DURATION_MINUTES);
      }
    }
  }

  return slots;
}

export function formatSlotTime(slot: Date): string {
  return formatInTimeZone(slot, TIMEZONE, "HH:mm");
}

export function formatSlotDate(slot: Date): string {
  return formatInTimeZone(slot, TIMEZONE, "EEEE, d. MMMM yyyy.", { locale: sr });
}

export function formatSlotDateTime(slot: Date): string {
  return `${formatSlotDate(slot)} u ${formatSlotTime(slot)}`;
}

export function isSlotInPast(slot: Date): boolean {
  return isBefore(slot, new Date());
}

export function getDayKey(slot: Date): string {
  return formatInTimeZone(slot, TIMEZONE, "yyyy-MM-dd");
}

export type SlotStatus =
  | "free"
  | "pending"
  | "approved"
  | "manual"
  | "past"
  | "mine_pending"
  | "mine_approved";

export type CalendarSlot = {
  start: Date;
  timeLabel: string;
  dayKey: string;
  status: SlotStatus;
  appointmentId?: string;
  customerName?: string | null;
  customerPhone?: string | null;
  customerNote?: string | null;
  adminMessage?: string | null;
  isPast: boolean;
};

export type AppointmentRecord = {
  id: string;
  slotStart: Date;
  status: "pending" | "approved" | "rejected" | "cancelled" | "manual";
  customerUserId: string | null;
  customerName: string | null;
  customerPhone: string | null;
  customerNote: string | null;
  adminMessage: string | null;
};

export function buildCalendarSlots(
  weekStart: Date,
  appointments: AppointmentRecord[],
  currentUserId?: string,
): CalendarSlot[] {
  const appointmentBySlot = new Map<string, AppointmentRecord>();

  for (const appointment of appointments) {
    const key = slotStartKey(appointment.slotStart);
    appointmentBySlot.set(key, appointment);
  }

  return generateWeekSlots(weekStart).map((start) => {
    const key = slotStartKey(start);
    const appointment = appointmentBySlot.get(key);
    const isPast = isSlotInPast(start);

    let status: SlotStatus = "free";

    if (appointment) {
      if (appointment.status === "pending") {
        status =
          currentUserId && appointment.customerUserId === currentUserId
            ? "mine_pending"
            : "pending";
      } else if (appointment.status === "approved") {
        status =
          currentUserId && appointment.customerUserId === currentUserId
            ? "mine_approved"
            : "approved";
      } else if (appointment.status === "manual") {
        status = "manual";
      }
    }

    if (isPast && status === "free") {
      status = "past";
    }

    return {
      start,
      timeLabel: formatSlotTime(start),
      dayKey: getDayKey(start),
      status,
      appointmentId: appointment?.id,
      customerName: appointment?.customerName,
      customerPhone: appointment?.customerPhone,
      customerNote: appointment?.customerNote,
      adminMessage: appointment?.adminMessage,
      isPast,
    };
  });
}

export function slotStartKey(slot: Date): string {
  return formatInTimeZone(slot, TIMEZONE, "yyyy-MM-dd'T'HH:mm:ssXXX");
}

export function getUniqueTimeLabels(slots: CalendarSlot[]): string[] {
  const labels = new Set<string>();
  for (const slot of slots) {
    labels.add(slot.timeLabel);
  }
  return Array.from(labels).sort();
}

export function getDayLabels(weekStart: Date): { key: string; label: string }[] {
  return WORK_DAYS.map((dayOffset) => {
    const day = addDays(weekStart, dayOffset - 1);
    return {
      key: getDayKey(day),
      label: formatInTimeZone(day, TIMEZONE, "EEE d.M."),
    };
  });
}

export function groupSlotsByDayAndTime(slots: CalendarSlot[]): Map<string, Map<string, CalendarSlot>> {
  const grid = new Map<string, Map<string, CalendarSlot>>();

  for (const slot of slots) {
    if (!grid.has(slot.dayKey)) {
      grid.set(slot.dayKey, new Map());
    }
    grid.get(slot.dayKey)!.set(slot.timeLabel, slot);
  }

  return grid;
}
