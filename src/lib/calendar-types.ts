import { msg } from "@/lib/messages";

export type ApiSlot = {
  start: string;
  timeLabel: string;
  dayKey: string;
  status:
    | "free"
    | "pending"
    | "approved"
    | "manual"
    | "past"
    | "mine_pending"
    | "mine_approved";
  appointmentId?: string;
  customerName?: string | null;
  customerPhone?: string | null;
  customerNote?: string | null;
  adminMessage?: string | null;
  isPast: boolean;
};

export type SlotsResponse = {
  weekStart: string;
  weekLabel: string;
  previousWeek: string;
  nextWeek: string;
  canGoPrevious: boolean;
  canGoNext: boolean;
  isAdmin: boolean;
  slots: ApiSlot[];
};

export type PendingAppointment = {
  id: string;
  slotStart: string;
  customerName: string | null;
  customerPhone: string | null;
  customerNote: string | null;
};

export const SLOT_STATUS_LABELS: Record<ApiSlot["status"], string> = {
  free: msg.statusFree,
  pending: msg.statusPending,
  approved: msg.statusBooked,
  manual: msg.statusManual,
  past: msg.statusPast,
  mine_pending: msg.statusMinePending,
  mine_approved: msg.statusMineApproved,
};

export function slotStatusClasses(status: ApiSlot["status"]): string {
  switch (status) {
    case "free":
      return "bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100 cursor-pointer";
    case "pending":
      return "bg-amber-50 border-amber-200 text-amber-800";
    case "mine_pending":
      return "bg-amber-100 border-amber-400 text-amber-900";
    case "approved":
    case "manual":
      return "bg-stone-100 border-stone-200 text-stone-500";
    case "mine_approved":
      return "bg-sky-50 border-sky-300 text-sky-900";
    case "past":
      return "bg-stone-50 border-stone-100 text-stone-300";
    default:
      return "bg-stone-50 border-stone-200";
  }
}

export function formatSlotDateTime(iso: string): string {
  return new Intl.DateTimeFormat("sr-Cyrl-RS", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Belgrade",
  }).format(new Date(iso));
}
