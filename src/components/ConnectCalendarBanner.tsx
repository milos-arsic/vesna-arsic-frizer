"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { connectGoogleCalendar } from "@/lib/google-auth";
import { msg } from "@/lib/messages";

export function ConnectCalendarBanner() {
  const searchParams = useSearchParams();
  const oauthError = searchParams.get("error");
  const [connected, setConnected] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadStatus() {
      try {
        const response = await fetch("/api/user/calendar-status");
        if (!response.ok) return;
        const data = await response.json();
        setConnected(data.connected === true);
      } catch {
        setConnected(null);
      }
    }

    loadStatus();
  }, []);

  if (connected !== false) return null;

  const showAccessDenied = oauthError === "AccessDenied";

  return (
    <div className="space-y-3">
      {showAccessDenied && (
        <p className="rounded-xl border border-red-100 bg-red-50/90 px-4 py-3 text-sm text-red-700">
          {msg.calendarConnectDenied}
        </p>
      )}

      <div className="rounded-2xl border border-amber-200/80 bg-amber-50/80 px-4 py-4 text-sm text-amber-950 shadow-sm backdrop-blur-sm">
        <p className="font-medium">{msg.calendarConnectTitle}</p>
        <p className="mt-1 leading-relaxed text-amber-900/90">
          {msg.calendarConnectDescription}
        </p>
        <button
          type="button"
          disabled={loading}
          onClick={() => {
            setLoading(true);
            connectGoogleCalendar("/calendar");
          }}
          className="btn-primary mt-3 min-h-11 px-4 py-2.5 text-sm"
        >
          {loading ? msg.loading : msg.calendarConnectButton}
        </button>
      </div>
    </div>
  );
}
