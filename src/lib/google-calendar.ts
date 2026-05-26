import { addMinutes } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { accounts } from "@/lib/db/schema";
import { getShopInfo } from "@/lib/shop";
import { TIMEZONE } from "@/lib/slots";

const CALENDAR_SCOPE = "https://www.googleapis.com/auth/calendar.events";

function formatCalendarDateTime(date: Date): string {
  return formatInTimeZone(date, TIMEZONE, "yyyy-MM-dd'T'HH:mm:ss");
}

async function getGoogleAccount(userId: string) {
  return db.query.accounts.findFirst({
    where: and(eq(accounts.userId, userId), eq(accounts.provider, "google")),
  });
}

async function getAccessToken(userId: string): Promise<string | null> {
  const account = await getGoogleAccount(userId);
  if (!account?.refresh_token) return null;

  const now = Math.floor(Date.now() / 1000);
  if (
    account.access_token &&
    account.expires_at &&
    account.expires_at > now + 60
  ) {
    return account.access_token;
  }

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      grant_type: "refresh_token",
      refresh_token: account.refresh_token,
    }),
  });

  if (!response.ok) {
    console.warn("[google-calendar] token refresh failed:", await response.text());
    return null;
  }

  const data = (await response.json()) as {
    access_token: string;
    expires_in: number;
  };

  await db
    .update(accounts)
    .set({
      access_token: data.access_token,
      expires_at: now + data.expires_in,
    })
    .where(
      and(
        eq(accounts.provider, "google"),
        eq(accounts.providerAccountId, account.providerAccountId),
      ),
    );

  return data.access_token;
}

function hasCalendarScope(scope: string | null | undefined): boolean {
  return scope?.includes("calendar.events") ?? false;
}

export async function createCustomerCalendarEvent(params: {
  userId: string;
  slotStart: Date;
  customerName: string;
}): Promise<string | null> {
  const account = await getGoogleAccount(params.userId);
  if (!account || !hasCalendarScope(account.scope)) {
    console.warn("[google-calendar] user missing calendar scope, skipping event");
    return null;
  }

  const accessToken = await getAccessToken(params.userId);
  if (!accessToken) return null;

  const shop = getShopInfo();
  const slotEnd = addMinutes(params.slotStart, 30);

  const response = await fetch(
    "https://www.googleapis.com/calendar/v3/calendars/primary/events",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        summary: shop.name,
        description: `Termin – ${shop.name}\n${shop.address}`,
        location: shop.address,
        start: {
          dateTime: formatCalendarDateTime(params.slotStart),
          timeZone: TIMEZONE,
        },
        end: {
          dateTime: formatCalendarDateTime(slotEnd),
          timeZone: TIMEZONE,
        },
        reminders: {
          useDefault: false,
          overrides: [{ method: "popup", minutes: 30 }],
        },
      }),
    },
  );

  if (!response.ok) {
    console.warn("[google-calendar] create event failed:", await response.text());
    return null;
  }

  const event = (await response.json()) as { id?: string };
  return event.id ?? null;
}

export async function deleteCustomerCalendarEvent(params: {
  userId: string;
  eventId: string;
}): Promise<void> {
  const accessToken = await getAccessToken(params.userId);
  if (!accessToken) return;

  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events/${encodeURIComponent(params.eventId)}`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  );

  if (!response.ok && response.status !== 404) {
    console.warn("[google-calendar] delete event failed:", await response.text());
  }
}
