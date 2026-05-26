"use client";

import { useEffect, useMemo, useState } from "react";
import { SlotCell } from "@/components/SlotCell";
import type { ApiSlot } from "@/lib/calendar-types";
import { msg } from "@/lib/messages";

export type DayLabel = {
  key: string;
  label: string;
  shortLabel: string;
};

type MobileWeekCalendarProps = {
  dayLabels: DayLabel[];
  timeLabels: string[];
  slotGrid: Map<string, Map<string, ApiSlot>>;
  onSlotClick: (slot: ApiSlot) => void;
  isAdmin?: boolean;
};

function getTodayKey(): string {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Belgrade",
  }).format(new Date());
}

export function MobileWeekCalendar({
  dayLabels,
  timeLabels,
  slotGrid,
  onSlotClick,
  isAdmin = false,
}: MobileWeekCalendarProps) {
  const defaultDayKey = useMemo(() => {
    const todayKey = getTodayKey();
    if (dayLabels.some((day) => day.key === todayKey)) return todayKey;
    return dayLabels[0]?.key ?? "";
  }, [dayLabels]);

  const [selectedDayKey, setSelectedDayKey] = useState(defaultDayKey);

  useEffect(() => {
    setSelectedDayKey(defaultDayKey);
  }, [defaultDayKey]);

  const selectedDay = dayLabels.find((day) => day.key === selectedDayKey);

  return (
    <div className="space-y-4 md:hidden">
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {dayLabels.map((day) => {
          const isSelected = day.key === selectedDayKey;
          return (
            <button
              key={day.key}
              type="button"
              onClick={() => setSelectedDayKey(day.key)}
              className={`shrink-0 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                isSelected
                  ? "bg-amber-700 text-white shadow-md shadow-amber-900/20"
                  : "border border-stone-200 bg-white/90 text-stone-700"
              }`}
            >
              {day.shortLabel}
            </button>
          );
        })}
      </div>

      {selectedDay ? (
        <p className="text-sm font-medium capitalize text-stone-600">{selectedDay.label}</p>
      ) : null}

      <div className="space-y-2">
        {timeLabels.map((time) => {
          const slot = slotGrid.get(selectedDayKey)?.get(time);
          if (!slot) return null;

          return (
            <div
              key={time}
              className="grid grid-cols-[4.25rem_minmax(0,1fr)] items-stretch gap-3"
            >
              <div className="flex items-center text-sm font-semibold text-stone-600">
                {time}
              </div>
              <SlotCell
                slot={slot}
                onClick={onSlotClick}
                isAdmin={isAdmin}
                mobileList
              />
            </div>
          );
        })}
      </div>

      {timeLabels.every((time) => !slotGrid.get(selectedDayKey)?.get(time)) ? (
        <p className="rounded-xl border border-stone-200 bg-white/70 px-4 py-6 text-center text-sm text-stone-500">
          {msg.noSlotsForDay}
        </p>
      ) : null}
    </div>
  );
}
