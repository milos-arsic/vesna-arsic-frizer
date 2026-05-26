import { purgeExpiredAppointments } from "@/lib/purge-appointments";
import { NextResponse } from "next/server";

function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;

  const authHeader = request.headers.get("authorization");
  return authHeader === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await purgeExpiredAppointments();
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error("[cron/purge-appointments]", error);
    return NextResponse.json({ error: "Purge failed" }, { status: 500 });
  }
}
