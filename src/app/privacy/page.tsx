import type { Metadata } from "next";
import { LegalDocument } from "@/components/LegalDocument";
import { LegalFooterLinks } from "@/components/LegalFooterLinks";
import { PublicHeader } from "@/components/PublicHeader";
import {
  getLegalContactInfo,
  getPrivacyPolicySections,
} from "@/lib/legal";
import { msg } from "@/lib/messages";

export const metadata: Metadata = {
  title: msg.privacyMetaTitle,
  description: msg.privacyMetaDescription,
};

export default function PrivacyPage() {
  const info = getLegalContactInfo();

  return (
    <div className="flex min-h-full flex-col">
      <PublicHeader showLogin={false} />

      <main className="mx-auto w-full max-w-7xl flex-1 px-3 py-8 sm:px-6 sm:py-10">
        <LegalDocument
          title={msg.privacyPolicy}
          lastUpdated={`${msg.lastUpdatedLabel}: ${info.lastUpdated}`}
          intro={msg.privacyIntro}
          sections={getPrivacyPolicySections(info)}
        />
      </main>

      <footer className="border-t border-stone-200/70 bg-white/50 px-3 py-6 sm:px-6">
        <LegalFooterLinks />
      </footer>
    </div>
  );
}
