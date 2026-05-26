"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { msg } from "@/lib/messages";

export type NavUser = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: "customer" | "admin";
};

function getInitials(name?: string | null, email?: string | null) {
  const source = name?.trim() || email?.trim() || "?";
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}

export function UserMenu({ user }: { user: NavUser }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const displayName = user.name?.trim() || user.email || msg.client;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-2 rounded-full border border-white/80 bg-white/70 py-1 pl-1 pr-1 shadow-sm backdrop-blur-sm transition hover:bg-white hover:shadow-md sm:gap-3 sm:pr-3"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        {user.image ? (
          <Image
            src={user.image}
            alt={displayName}
            width={40}
            height={40}
            className="h-10 w-10 rounded-full object-cover ring-2 ring-stone-200"
          />
        ) : (
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-700 text-sm font-semibold text-white ring-2 ring-amber-100">
            {getInitials(user.name, user.email)}
          </span>
        )}
        <span className="hidden max-w-[160px] truncate text-sm font-medium text-stone-800 sm:block">
          {displayName}
        </span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-48 overflow-hidden rounded-2xl border border-stone-200/80 bg-white/90 py-1 shadow-xl backdrop-blur-xl"
        >
          <Link
            href="/profile"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="block px-4 py-2.5 text-sm text-stone-700 transition hover:bg-stone-50"
          >
            {msg.profile}
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="block w-full px-4 py-2.5 text-left text-sm text-stone-700 transition hover:bg-stone-50"
          >
            {msg.signOut}
          </button>
        </div>
      )}
    </div>
  );
}
