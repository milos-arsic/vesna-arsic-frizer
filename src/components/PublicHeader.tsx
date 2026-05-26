import Link from "next/link";
import { NavScissorsIcon } from "@/components/icons/NavScissorsIcon";
import { msg } from "@/lib/messages";

type PublicHeaderProps = {
  showLogin?: boolean;
};

export function PublicHeader({ showLogin = true }: PublicHeaderProps) {
  return (
    <header className="border-b border-stone-200/70 bg-white/50 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-3 py-4 sm:px-6">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-2.5 text-stone-900 transition hover:text-amber-800"
        >
          <NavScissorsIcon size={22} className="text-amber-800" />
          <span className="truncate text-sm font-semibold sm:text-base">
            {msg.navBrand}
          </span>
        </Link>
        <nav className="flex shrink-0 items-center gap-2 sm:gap-4">
          <Link
            href="/privacy"
            className="hidden text-sm text-stone-600 transition hover:text-amber-800 sm:inline"
          >
            {msg.privacyPolicy}
          </Link>
          <Link
            href="/terms"
            className="hidden text-sm text-stone-600 transition hover:text-amber-800 sm:inline"
          >
            {msg.termsOfService}
          </Link>
          {showLogin ? (
            <Link href="/login" className="btn-primary px-3 py-2 text-sm sm:px-4">
              {msg.homeLoginCta}
            </Link>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
