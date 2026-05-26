import Link from "next/link";
import { GlassCard } from "@/components/GlassCard";
import { LegalFooterLinks } from "@/components/LegalFooterLinks";
import { PublicHeader } from "@/components/PublicHeader";
import { ScissorsIcon } from "@/components/icons/ScissorsIcon";
import { getLegalContactInfo } from "@/lib/legal";
import { msg } from "@/lib/messages";
import { getShopInfo } from "@/lib/shop";

export function PublicHomePage() {
  const shop = getShopInfo();
  const legal = getLegalContactInfo();

  return (
    <div className="flex min-h-full flex-col">
      <PublicHeader />

      <main className="mx-auto w-full max-w-4xl flex-1 px-3 py-8 sm:px-6 sm:py-12">
        <GlassCard className="relative overflow-hidden p-6 sm:p-10">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-6 -top-6 text-amber-900/5"
          >
            <ScissorsIcon size={140} />
          </div>

          <div className="relative space-y-8">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700/90">
                {msg.loginSubtitle}
              </p>
              <h1 className="text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
                {msg.navBrand}
              </h1>
              <p className="max-w-2xl text-base leading-relaxed text-stone-600">
                {msg.homeIntro}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/login" className="btn-primary min-h-11 px-6 py-3 text-center text-sm">
                {msg.homeLoginCta}
              </Link>
              <a
                href={shop.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary min-h-11 px-6 py-3 text-center text-sm"
              >
                {msg.homeDirectionsCta}
              </a>
            </div>

            <section className="space-y-4 rounded-2xl border border-stone-200/80 bg-white/50 p-5">
              <h2 className="text-lg font-semibold text-stone-900">{msg.homeFeaturesTitle}</h2>
              <ul className="grid gap-3 text-sm leading-relaxed text-stone-600 sm:grid-cols-2">
                {msg.homeFeatures.map((feature) => (
                  <li key={feature} className="flex gap-2">
                    <span className="text-amber-700" aria-hidden="true">
                      ✓
                    </span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="space-y-3 text-sm text-stone-600">
              <h2 className="text-lg font-semibold text-stone-900">{msg.homeContactTitle}</h2>
              <p>
                <span className="font-medium text-stone-800">{msg.footerAddress}: </span>
                {shop.address}
              </p>
              {shop.phone ? (
                <p>
                  <span className="font-medium text-stone-800">{msg.footerPhone}: </span>
                  <a href={`tel:${shop.phone.replace(/\s/g, "")}`} className="hover:text-amber-800">
                    {shop.phone}
                  </a>
                </p>
              ) : null}
              <p>
                <span className="font-medium text-stone-800">{msg.footerHours}: </span>
                {shop.hours}
              </p>
              <p>
                <span className="font-medium text-stone-800">{msg.emailLabel}: </span>
                <a href={`mailto:${legal.supportEmail}`} className="hover:text-amber-800">
                  {legal.supportEmail}
                </a>
              </p>
            </section>

            <section className="space-y-2 rounded-2xl border border-amber-200/60 bg-amber-50/50 p-5 text-sm text-stone-600">
              <h2 className="font-semibold text-stone-900">{msg.homeGoogleTitle}</h2>
              <p>{msg.homeGoogleDescription}</p>
            </section>
          </div>
        </GlassCard>
      </main>

      <footer className="border-t border-stone-200/70 bg-white/50 px-3 py-6 sm:px-6">
        <LegalFooterLinks />
      </footer>
    </div>
  );
}
