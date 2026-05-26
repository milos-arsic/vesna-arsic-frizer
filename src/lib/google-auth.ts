"use client";

import { signIn } from "next-auth/react";

export const GOOGLE_CALENDAR_SCOPE =
  "https://www.googleapis.com/auth/calendar.events";

const GOOGLE_LOGIN_SCOPES = ["openid", "email", "profile"].join(" ");

/** Basic Google login — no calendar scope (avoids 403 during sign-in). */
export function signInWithGoogle(callbackUrl: string) {
  void signIn("google", { callbackUrl }, {
    scope: GOOGLE_LOGIN_SCOPES,
    access_type: "offline",
    prompt: "select_account",
  });
}

/** Ask Google for calendar access after the user is already signed in. */
export function connectGoogleCalendar(callbackUrl: string) {
  void signIn(
    "google",
    { callbackUrl },
    {
      scope: `${GOOGLE_LOGIN_SCOPES} ${GOOGLE_CALENDAR_SCOPE}`,
      access_type: "offline",
      prompt: "consent",
      include_granted_scopes: "true",
    },
  );
}
