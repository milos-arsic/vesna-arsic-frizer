import { auth } from "@/auth";
import { GlassCard } from "@/components/GlassCard";
import { PageHeader } from "@/components/PageHeader";
import { ProfileForm } from "@/components/ProfileForm";
import { msg } from "@/lib/messages";

export default async function ProfilePage() {
  const session = await auth();
  const needsPhone = !session?.user?.phone;

  return (
    <div className="space-y-8">
      <PageHeader title={msg.profileTitle} description={msg.profileDescription} />

      {needsPhone && (
        <div className="rounded-2xl border border-amber-200/80 bg-amber-50/80 px-4 py-3 text-sm text-amber-900 shadow-sm backdrop-blur-sm">
          {msg.profilePhoneRequired}
        </div>
      )}

      <GlassCard className="p-6 sm:p-8">
        <ProfileForm needsPhone={needsPhone} />
      </GlassCard>
    </div>
  );
}
