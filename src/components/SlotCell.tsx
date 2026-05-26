"use client";

import {
  formatSlotDateTime,
  slotStatusClasses,
  SLOT_STATUS_LABELS,
  type ApiSlot,
} from "@/lib/calendar-types";

type SlotCellProps = {
  slot: ApiSlot;
  onClick?: (slot: ApiSlot) => void;
  compact?: boolean;
  mobileList?: boolean;
  isAdmin?: boolean;
};

const OCCUPIED_STATUSES: ApiSlot["status"][] = [
  "pending",
  "approved",
  "manual",
  "mine_pending",
  "mine_approved",
];

function showAdminDetails(isAdmin: boolean | undefined, slot: ApiSlot): boolean {
  return (
    !!isAdmin &&
    OCCUPIED_STATUSES.includes(slot.status) &&
    !!(slot.customerName || slot.customerPhone)
  );
}

export function SlotCell({
  slot,
  onClick,
  compact,
  mobileList,
  isAdmin,
}: SlotCellProps) {
  const clickable =
    slot.status === "free" ||
    (slot.status === "pending" && onClick) ||
    (slot.status === "approved" && onClick) ||
    (slot.status === "manual" && onClick) ||
    slot.status === "mine_pending" ||
    slot.status === "mine_approved";

  const label = SLOT_STATUS_LABELS[slot.status];
  const adminDetails = showAdminDetails(isAdmin, slot);

  if (mobileList) {
    return (
      <button
        type="button"
        disabled={!clickable}
        onClick={() => onClick?.(slot)}
        className={`flex min-h-12 w-full items-center rounded-xl border px-4 py-3 text-left shadow-sm transition ${slotStatusClasses(slot.status)} ${!clickable ? "cursor-default opacity-80" : "active:scale-[0.99] hover:shadow-md"}`}
      >
        {adminDetails ? (
          <span className="flex min-w-0 flex-col gap-0.5">
            <span className="truncate text-sm font-semibold">{slot.customerName}</span>
            <span className="truncate text-sm opacity-80">{slot.customerPhone}</span>
          </span>
        ) : (
          <span className="text-sm font-semibold">{label}</span>
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      disabled={!clickable}
      onClick={() => onClick?.(slot)}
      className={`min-h-14 w-full rounded-xl border px-1 py-1.5 text-center shadow-sm transition ${slotStatusClasses(slot.status)} ${!clickable ? "cursor-default" : "hover:shadow-md"} ${adminDetails ? "min-h-[3.25rem]" : ""}`}
      title={
        adminDetails
          ? `${slot.customerName ?? ""} ${slot.customerPhone ?? ""}`.trim()
          : label
      }
    >
      {adminDetails ? (
        <span className="flex flex-col gap-0.5 leading-tight">
          <span
            className={`block truncate font-semibold ${compact ? "text-[9px]" : "text-[10px]"}`}
          >
            {slot.customerName}
          </span>
          <span
            className={`block truncate font-normal opacity-80 ${compact ? "text-[9px]" : "text-[10px]"}`}
          >
            {slot.customerPhone}
          </span>
        </span>
      ) : (
        <span className={`block font-medium ${compact ? "text-[10px]" : "text-xs"}`}>
          {label}
        </span>
      )}
    </button>
  );
}

export function SlotLegend() {
  const items: ApiSlot["status"][] = [
    "free",
    "mine_pending",
    "mine_approved",
    "pending",
    "approved",
    "manual",
  ];

  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-2 rounded-2xl border border-stone-200/70 bg-white/50 px-4 py-3 text-xs text-stone-600 backdrop-blur-sm sm:flex sm:flex-wrap sm:gap-3">
      {items.map((status) => (
        <div key={status} className="flex items-center gap-2">
          <span
            className={`inline-block h-3 w-3 shrink-0 rounded border ${slotStatusClasses(status).split(" ").slice(0, 2).join(" ")}`}
          />
          <span className="leading-tight">{SLOT_STATUS_LABELS[status]}</span>
        </div>
      ))}
    </div>
  );
}

export { formatSlotDateTime };
