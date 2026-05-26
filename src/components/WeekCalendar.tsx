"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { GlassCard } from "@/components/GlassCard";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { MobileWeekCalendar } from "@/components/MobileWeekCalendar";
import { ScissorsIcon } from "@/components/icons/ScissorsIcon";
import { SlotCell, SlotLegend } from "@/components/SlotCell";
import {
  formatSlotDateTime,
  type ApiSlot,
  type PendingAppointment,
  type SlotsResponse,
} from "@/lib/calendar-types";
import { msg } from "@/lib/messages";
import { formatWeekLabel, parseWeekParam } from "@/lib/slots";

function formatCustomerLine(
  name?: string | null,
  phone?: string | null,
): string {
  const parts = [name?.trim(), phone?.trim()].filter(Boolean);
  return parts.join(" · ") || msg.client;
}

function getUniqueTimeLabels(slots: ApiSlot[]): string[] {
  return Array.from(new Set(slots.map((slot) => slot.timeLabel))).sort();
}

function getDayLabels(weekStartIso: string): {
  key: string;
  label: string;
  shortLabel: string;
}[] {
  const weekStart = new Date(weekStartIso);
  const formatter = new Intl.DateTimeFormat("sr-Cyrl-RS", {
    weekday: "short",
    day: "numeric",
    month: "numeric",
    timeZone: "Europe/Belgrade",
  });
  const shortFormatter = new Intl.DateTimeFormat("sr-Cyrl-RS", {
    weekday: "short",
    day: "numeric",
    timeZone: "Europe/Belgrade",
  });

  return [1, 2, 3, 4, 5, 6].map((offset) => {
    const day = new Date(weekStart);
    day.setDate(day.getDate() + offset - 1);
    const key = new Intl.DateTimeFormat("sv-SE", {
      timeZone: "Europe/Belgrade",
    }).format(day);
    return {
      key,
      label: formatter.format(day),
      shortLabel: shortFormatter.format(day),
    };
  });
}

const POLL_INTERVAL_MS = 30_000;

type WeekCalendarProps = {
  isAdmin?: boolean;
  shopPhone?: string;
};

type BookingIntent = "additional" | "reschedule" | null;

export function WeekCalendar({ isAdmin = false, shopPhone }: WeekCalendarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const weekParam = searchParams.get("week");

  const [data, setData] = useState<SlotsResponse | null>(null);
  const [pending, setPending] = useState<PendingAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<ApiSlot | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [customerNote, setCustomerNote] = useState("");
  const [rejectMessage, setRejectMessage] = useState("");
  const [manualForm, setManualForm] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
  });
  const [bookingIntent, setBookingIntent] = useState<BookingIntent>(null);

  const loadData = useCallback(async (options?: { silent?: boolean }) => {
    const silent = options?.silent ?? false;

    if (!silent) {
      setLoading(true);
      setError(null);
    }

    try {
      const weekQuery = weekParam ? `?week=${weekParam}` : "";
      const [slotsRes, pendingRes] = await Promise.all([
        fetch(`/api/slots${weekQuery}`),
        isAdmin ? fetch("/api/admin/pending") : Promise.resolve(null),
      ]);

      if (!slotsRes.ok) throw new Error(msg.loadSlotsFailed);

      const slotsData: SlotsResponse = await slotsRes.json();
      setData(slotsData);

      if (pendingRes) {
        const pendingData = await pendingRes.json();
        setPending(pendingData.pending ?? []);
      }
    } catch (err) {
      if (!silent) {
        setError(err instanceof Error ? err.message : msg.error);
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, [weekParam, isAdmin]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const poll = () => {
      if (document.visibilityState === "visible") {
        void loadData({ silent: true });
      }
    };

    const intervalId = window.setInterval(poll, POLL_INTERVAL_MS);
    const onVisible = () => poll();
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [loadData]);

  useEffect(() => {
    if (!data || !selectedSlot) return;

    const updated = data.slots.find((slot) => slot.start === selectedSlot.start);
    if (updated && updated.status !== selectedSlot.status) {
      setSelectedSlot(updated);
    }
  }, [data, selectedSlot]);

  const timeLabels = useMemo(
    () => (data ? getUniqueTimeLabels(data.slots) : []),
    [data],
  );

  const dayLabels = useMemo(
    () => (data ? getDayLabels(data.weekStart) : []),
    [data],
  );

  const slotGrid = useMemo(() => {
    const grid = new Map<string, Map<string, ApiSlot>>();
    if (!data) return grid;

    for (const slot of data.slots) {
      if (!grid.has(slot.dayKey)) grid.set(slot.dayKey, new Map());
      grid.get(slot.dayKey)!.set(slot.timeLabel, slot);
    }
    return grid;
  }, [data]);

  const approvedSlotThisWeek = useMemo(
    () => data?.slots.find((slot) => slot.status === "mine_approved") ?? null,
    [data],
  );

  const previousWeekLabel = useMemo(
    () => (data ? formatWeekLabel(parseWeekParam(data.previousWeek)) : ""),
    [data],
  );

  const nextWeekLabel = useMemo(
    () => (data ? formatWeekLabel(parseWeekParam(data.nextWeek)) : ""),
    [data],
  );

  function closeModal() {
    setSelectedSlot(null);
    setBookingIntent(null);
    setCustomerNote("");
    setRejectMessage("");
  }

  function navigateWeek(week: string) {
    router.push(`?week=${week}`);
  }

  async function submitBooking(options?: { rescheduleAppointmentId?: string }) {
    if (!selectedSlot) return;
    setActionLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slotStart: selectedSlot.start,
          customerNote: customerNote || undefined,
          rescheduleAppointmentId: options?.rescheduleAppointmentId,
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? msg.sendRequestFailed);

      closeModal();
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : msg.error);
    } finally {
      setActionLoading(false);
    }
  }

  async function requestSlot() {
    await submitBooking();
  }

  async function rescheduleSlot() {
    if (!approvedSlotThisWeek?.appointmentId) return;
    await submitBooking({
      rescheduleAppointmentId: approvedSlotThisWeek.appointmentId,
    });
  }

  async function adminAction(action: "approve" | "reject" | "cancel") {
    if (!selectedSlot?.appointmentId) return;
    setActionLoading(true);
    setError(null);

    try {
      const body =
        action === "reject"
          ? { action, adminMessage: rejectMessage }
          : { action };

      const response = await fetch(
        `/api/admin/appointments/${selectedSlot.appointmentId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
      );

      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? msg.error);

      setSelectedSlot(null);
      setRejectMessage("");
      setBookingIntent(null);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : msg.error);
    } finally {
      setActionLoading(false);
    }
  }

  async function createManualBooking() {
    if (!selectedSlot) return;

    const customerName = manualForm.customerName.trim();
    if (customerName.length < 2) {
      setError(msg.nameRequired);
      return;
    }

    setActionLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slotStart: selectedSlot.start,
          customerName,
          customerPhone: manualForm.customerPhone.trim(),
          customerEmail: manualForm.customerEmail.trim(),
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? msg.error);

      setSelectedSlot(null);
      setManualForm({ customerName: "", customerPhone: "", customerEmail: "" });
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : msg.error);
    } finally {
      setActionLoading(false);
    }
  }

  function handleSlotClick(slot: ApiSlot) {
    if (isAdmin) {
      if (
        slot.status === "free" ||
        slot.status === "pending" ||
        slot.status === "approved" ||
        slot.status === "manual" ||
        slot.status === "mine_pending" ||
        slot.status === "mine_approved"
      ) {
        setSelectedSlot(slot);
        setBookingIntent(null);
        setError(null);
      }
      return;
    }

    if (
      slot.status === "free" ||
      slot.status === "mine_pending" ||
      slot.status === "mine_approved"
    ) {
      setSelectedSlot(slot);
      setBookingIntent(null);
      setError(null);
    }
  }

  if (loading && !data) {
    return <LoadingSpinner message={msg.loadingCalendar} />;
  }

  if (!data) {
    return <p className="text-center text-red-600">{error ?? msg.calendarDataUnavailable}</p>;
  }

  const showBookingChoice =
    !isAdmin &&
    selectedSlot?.status === "free" &&
    !!approvedSlotThisWeek &&
    !bookingIntent;

  const showAdditionalBookingForm =
    !isAdmin &&
    selectedSlot?.status === "free" &&
    !showBookingChoice &&
    bookingIntent !== "reschedule";

  const showRescheduleForm =
    !isAdmin &&
    selectedSlot?.status === "free" &&
    bookingIntent === "reschedule" &&
    !!approvedSlotThisWeek;

  return (
    <div className="space-y-6">
      {isAdmin && pending.length > 0 && (
        <section className="glass-card rounded-3xl border-amber-200/70 bg-amber-50/70 p-5">
          <h2 className="mb-3 text-xl font-semibold text-amber-900">
            {msg.pendingRequests} ({pending.length})
          </h2>
          <ul className="space-y-2">
            {pending.map((item) => (
              <li
                key={item.id}
                className="flex flex-col gap-2 rounded-2xl border border-white/70 bg-white/80 p-4 shadow-sm backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium text-stone-900">
                    {formatSlotDateTime(item.slotStart)}
                  </p>
                  <p className="text-sm text-stone-600">
                    {formatCustomerLine(item.customerName, item.customerPhone)}
                  </p>
                  {item.customerNote && (
                    <p className="text-sm text-stone-500">{item.customerNote}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const slot = data.slots.find((s) => s.appointmentId === item.id);
                    if (slot) setSelectedSlot(slot);
                  }}
                  className="btn-primary min-h-11 w-full px-4 py-3 text-sm sm:w-auto sm:py-2"
                >
                  {msg.process}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <GlassCard className="p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-xl font-semibold text-stone-900 sm:text-2xl">
              {msg.weeklySchedule}
            </h2>
            <p className="mt-0.5 text-sm text-stone-500">{msg.scheduleHours}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              disabled={!data.canGoPrevious}
              onClick={() => navigateWeek(data.previousWeek)}
              className="btn-secondary min-h-10 min-w-[5.5rem] px-2 py-1.5 disabled:opacity-40 sm:min-h-11 sm:min-w-[7rem] sm:px-2.5 sm:py-2"
            >
              <span className="flex flex-col items-center leading-tight">
                <span className="text-xs sm:text-sm">{msg.previousWeek}</span>
                <span className="mt-0.5 text-[10px] font-normal text-stone-500 sm:text-xs">
                  {previousWeekLabel}
                </span>
              </span>
            </button>
            <button
              type="button"
              disabled={!data.canGoNext}
              onClick={() => navigateWeek(data.nextWeek)}
              className="btn-secondary min-h-10 min-w-[5.5rem] px-2 py-1.5 disabled:opacity-40 sm:min-h-11 sm:min-w-[7rem] sm:px-2.5 sm:py-2"
            >
              <span className="flex flex-col items-center leading-tight">
                <span className="text-xs sm:text-sm">{msg.nextWeek}</span>
                <span className="mt-0.5 text-[10px] font-normal text-stone-500 sm:text-xs">
                  {nextWeekLabel}
                </span>
              </span>
            </button>
          </div>
        </div>
      </GlassCard>

      <SlotLegend />

      {error && (
        <p className="rounded-xl border border-red-100 bg-red-50/90 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <GlassCard className="overflow-hidden p-2 sm:p-3">
        <MobileWeekCalendar
          dayLabels={dayLabels}
          timeLabels={timeLabels}
          slotGrid={slotGrid}
          onSlotClick={handleSlotClick}
          isAdmin={isAdmin}
        />

        <div className="hidden md:block">
          <p className="mb-2 px-1 text-xs text-stone-400">{msg.scrollCalendarHint}</p>
          <div className="calendar-scroll overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr>
                  <th className="sticky left-0 z-10 bg-white/95 px-2 py-3 text-left text-xs font-semibold uppercase tracking-wide text-stone-400 shadow-[4px_0_8px_-4px_rgba(28,25,23,0.08)] backdrop-blur-sm">
                    {msg.timeColumn}
                  </th>
                {dayLabels.map((day) => (
                  <th
                    key={day.key}
                    className="min-w-[100px] px-1 py-3 text-center text-xs font-semibold capitalize text-stone-700"
                  >
                    {day.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timeLabels.map((time) => (
                <tr key={time} className="border-t border-stone-100">
                  <td className="sticky left-0 z-10 bg-white/95 px-2 py-1 text-xs font-medium text-stone-600 shadow-[4px_0_8px_-4px_rgba(28,25,23,0.08)] backdrop-blur-sm">
                    {time}
                  </td>
                  {dayLabels.map((day) => {
                    const slot = slotGrid.get(day.key)?.get(time);
                    if (!slot) {
                      return (
                        <td key={day.key} className="px-1 py-1">
                          <div className="min-h-14 rounded-lg bg-stone-50" />
                        </td>
                      );
                    }
                    return (
                      <td key={day.key} className="px-1 py-1">
                        <SlotCell
                          slot={slot}
                          onClick={handleSlotClick}
                          compact
                          isAdmin={isAdmin}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      </GlassCard>

      {loading && data && (
        <div className="pointer-events-none fixed inset-x-0 top-20 z-30 flex justify-center">
          <div className="flex items-center gap-2 rounded-full border border-white/80 bg-white/90 px-4 py-2 text-sm text-stone-600 shadow-lg backdrop-blur-md">
            <ScissorsIcon size={16} className="animate-scissors-spin text-amber-700" />
            {msg.loading}
          </div>
        </div>
      )}

      {selectedSlot && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-stone-900/35 p-0 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="glass-card max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:rounded-3xl sm:p-7">
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-stone-200 sm:hidden" />
            <h3 className="text-xl font-semibold text-stone-900 sm:text-2xl">
              {formatSlotDateTime(selectedSlot.start)}
            </h3>

            {actionLoading && (
              <div className="mt-4 flex items-center justify-center gap-2 py-6 text-sm text-stone-500">
                <ScissorsIcon size={20} className="animate-scissors-spin text-amber-700" />
                {msg.sending}
              </div>
            )}

            {!actionLoading && showBookingChoice && (
              <div className="mt-4 space-y-4">
                <p className="text-sm leading-relaxed text-stone-600">
                  {msg.weeklyBookingQuestion}
                </p>
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => setBookingIntent("additional")}
                    className="btn-primary min-h-11 w-full px-4 py-3 text-sm sm:py-2"
                  >
                    {msg.bookAdditional}
                  </button>
                  <button
                    type="button"
                    onClick={() => setBookingIntent("reschedule")}
                    className="btn-secondary min-h-11 w-full px-4 py-3 text-sm sm:py-2"
                  >
                    {msg.rescheduleExisting}
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="btn-secondary min-h-11 w-full px-4 py-3 text-sm sm:py-2"
                  >
                    {msg.cancel}
                  </button>
                </div>
              </div>
            )}

            {!actionLoading && showAdditionalBookingForm && (
              <div className="mt-4 space-y-4">
                {approvedSlotThisWeek && bookingIntent === "additional" ? (
                  <button
                    type="button"
                    onClick={() => setBookingIntent(null)}
                    className="text-sm font-medium text-amber-800 transition hover:text-amber-900"
                  >
                    ← {msg.goBack}
                  </button>
                ) : null}
                <p className="text-sm text-stone-600">{msg.requestDescription}</p>
                <textarea
                  value={customerNote}
                  onChange={(event) => setCustomerNote(event.target.value)}
                  placeholder={msg.noteOptional}
                  rows={3}
                  className="w-full rounded-xl border border-stone-300 px-3 py-3 text-base outline-none sm:text-sm"
                />
                <div className="flex flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="btn-secondary min-h-11 flex-1 px-4 py-3 text-sm sm:py-2"
                  >
                    {msg.cancel}
                  </button>
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={requestSlot}
                    className="btn-primary min-h-11 flex-1 px-4 py-3 text-sm sm:py-2"
                  >
                    {msg.sendRequest}
                  </button>
                </div>
              </div>
            )}

            {!actionLoading && showRescheduleForm && approvedSlotThisWeek && (
              <div className="mt-4 space-y-4">
                <button
                  type="button"
                  onClick={() => setBookingIntent(null)}
                  className="text-sm font-medium text-amber-800 transition hover:text-amber-900"
                >
                  ← {msg.goBack}
                </button>
                <p className="text-sm text-stone-600">{msg.rescheduleDescription}</p>
                <div className="rounded-xl border border-stone-200/80 bg-stone-50/80 px-4 py-3 text-sm text-stone-700">
                  <p>
                    <span className="font-medium text-stone-900">
                      {formatSlotDateTime(approvedSlotThisWeek.start)}
                    </span>
                  </p>
                  <p className="mt-2 text-stone-500">↓</p>
                  <p>
                    <span className="font-medium text-stone-900">
                      {formatSlotDateTime(selectedSlot.start)}
                    </span>
                  </p>
                </div>
                <textarea
                  value={customerNote}
                  onChange={(event) => setCustomerNote(event.target.value)}
                  placeholder={msg.noteOptional}
                  rows={3}
                  className="w-full rounded-xl border border-stone-300 px-3 py-3 text-base outline-none sm:text-sm"
                />
                <div className="flex flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="btn-secondary min-h-11 flex-1 px-4 py-3 text-sm sm:py-2"
                  >
                    {msg.cancel}
                  </button>
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={rescheduleSlot}
                    className="btn-primary min-h-11 flex-1 px-4 py-3 text-sm sm:py-2"
                  >
                    {msg.rescheduleConfirm}
                  </button>
                </div>
              </div>
            )}

            {!actionLoading &&
              !isAdmin &&
              (selectedSlot.status === "mine_pending" ||
                selectedSlot.status === "mine_approved") && (
                <div className="mt-4 space-y-3">
                  <p className="text-sm text-stone-600">
                    {selectedSlot.status === "mine_pending"
                      ? msg.pendingMessage
                      : msg.confirmedMessage}
                  </p>
                  {shopPhone && (
                    <p className="rounded-xl border border-stone-200/80 bg-stone-50/80 px-4 py-3 text-sm text-stone-600">
                      {msg.cancelByPhone}{" "}
                      <a
                        href={`tel:${shopPhone.replace(/\s/g, "")}`}
                        className="font-semibold text-stone-800 transition hover:text-amber-800"
                      >
                        {shopPhone}
                      </a>
                      .
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={() => setSelectedSlot(null)}
                    className="btn-secondary min-h-11 w-full px-4 py-3 text-sm sm:py-2"
                  >
                    {msg.close}
                  </button>
                </div>
              )}

            {!actionLoading && isAdmin && selectedSlot.status === "free" && (
              <div className="mt-4 space-y-3">
                <p className="text-sm text-stone-600">{msg.manualBookingHint}</p>
                <input
                  value={manualForm.customerName}
                  onChange={(event) =>
                    setManualForm((prev) => ({ ...prev, customerName: event.target.value }))
                  }
                  placeholder={msg.clientNamePlaceholder}
                  className="w-full rounded-xl border border-stone-300 px-3 py-3 text-base sm:text-sm"
                />
                <input
                  value={manualForm.customerPhone}
                  onChange={(event) =>
                    setManualForm((prev) => ({ ...prev, customerPhone: event.target.value }))
                  }
                  placeholder={msg.phoneOptional}
                  className="w-full rounded-xl border border-stone-300 px-3 py-3 text-base sm:text-sm"
                />
                <input
                  value={manualForm.customerEmail}
                  onChange={(event) =>
                    setManualForm((prev) => ({ ...prev, customerEmail: event.target.value }))
                  }
                  placeholder={msg.emailOptional}
                  type="email"
                  className="w-full rounded-xl border border-stone-300 px-3 py-3 text-base sm:text-sm"
                />
                <div className="flex flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => setSelectedSlot(null)}
                    className="btn-secondary min-h-11 flex-1 px-4 py-3 text-sm sm:py-2"
                  >
                    {msg.cancel}
                  </button>
                  <button
                    type="button"
                    disabled={actionLoading || manualForm.customerName.trim().length < 2}
                    onClick={createManualBooking}
                    className="btn-primary min-h-11 flex-1 px-4 py-3 text-sm sm:py-2"
                  >
                    {msg.save}
                  </button>
                </div>
              </div>
            )}

            {!actionLoading && isAdmin && selectedSlot.status === "pending" && (
              <div className="mt-4 space-y-3">
                <p className="text-sm text-stone-600">
                  {formatCustomerLine(
                    selectedSlot.customerName,
                    selectedSlot.customerPhone,
                  )}
                </p>
                {selectedSlot.customerNote && (
                  <p className="text-sm text-stone-500">{selectedSlot.customerNote}</p>
                )}
                <textarea
                  value={rejectMessage}
                  onChange={(event) => setRejectMessage(event.target.value)}
                  placeholder={msg.rejectReasonPlaceholder}
                  rows={3}
                  className="w-full rounded-xl border border-stone-300 px-3 py-3 text-base sm:text-sm"
                />
                <div className="grid grid-cols-1 gap-2">
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => adminAction("approve")}
                    className="min-h-11 rounded-xl bg-emerald-700 px-4 py-3 text-sm font-medium text-white sm:py-2"
                  >
                    {msg.approve}
                  </button>
                  <button
                    type="button"
                    disabled={actionLoading || !rejectMessage.trim()}
                    onClick={() => adminAction("reject")}
                    className="min-h-11 rounded-xl bg-red-700 px-4 py-3 text-sm font-medium text-white disabled:opacity-60 sm:py-2"
                  >
                    {msg.reject}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedSlot(null)}
                    className="btn-secondary min-h-11 rounded-xl px-4 py-3 text-sm sm:py-2"
                  >
                    {msg.close}
                  </button>
                </div>
              </div>
            )}

            {!actionLoading &&
              isAdmin &&
              (selectedSlot.status === "approved" ||
                selectedSlot.status === "manual" ||
                selectedSlot.status === "mine_approved") && (
                <div className="mt-4 space-y-3">
                  <p className="text-sm text-stone-600">
                    {formatCustomerLine(
                      selectedSlot.customerName,
                      selectedSlot.customerPhone,
                    )}
                  </p>
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => adminAction("cancel")}
                    className="min-h-11 w-full rounded-xl bg-red-700 px-4 py-3 text-sm font-medium text-white disabled:opacity-60 sm:py-2"
                  >
                    {msg.cancelAppointment}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedSlot(null)}
                    className="btn-secondary min-h-11 w-full px-4 py-3 text-sm sm:py-2"
                  >
                    {msg.close}
                  </button>
                </div>
              )}
          </div>
        </div>
      )}
    </div>
  );
}
