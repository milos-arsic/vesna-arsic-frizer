import Link from "next/link";
import { msg } from "@/lib/messages";

export function LegalFooterLinks() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 border-t border-stone-200/60 pt-4 text-sm text-stone-500">
      <Link href="/privacy" className="transition hover:text-amber-800">
        {msg.privacyPolicy}
      </Link>
      <span aria-hidden="true" className="text-stone-300">
        ·
      </span>
      <Link href="/terms" className="transition hover:text-amber-800">
        {msg.termsOfService}
      </Link>
      <span aria-hidden="true" className="text-stone-300">
        ·
      </span>
      <Link href="/" className="transition hover:text-amber-800">
        {msg.homePageLink}
      </Link>
    </div>
  );
}
