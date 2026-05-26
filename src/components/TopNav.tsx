import Link from "next/link";
import { NavScissorsIcon } from "@/components/icons/NavScissorsIcon";
import { UserMenu, type NavUser } from "@/components/UserMenu";
import { msg } from "@/lib/messages";

type TopNavProps = {
  user: NavUser;
};

export function TopNav({ user }: TopNavProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/60 bg-white/70 shadow-[0_8px_30px_rgba(28,25,23,0.04)] backdrop-blur-xl pt-[env(safe-area-inset-top)]">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-3 sm:h-16 sm:px-6">
        <Link
          href={user.role === "admin" ? "/admin" : "/calendar"}
          className="group flex min-w-0 flex-1 items-center gap-2 transition sm:gap-2.5"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-600 to-amber-800 text-white shadow-md shadow-amber-900/20 transition group-hover:scale-105">
            <NavScissorsIcon size={18} />
          </span>
          <span className="truncate text-sm font-semibold leading-tight tracking-tight text-stone-900 transition group-hover:text-amber-800 sm:text-lg">
            {msg.navBrand}
          </span>
        </Link>

        <div className="shrink-0">
          <UserMenu user={user} />
        </div>
      </div>
    </header>
  );
}
