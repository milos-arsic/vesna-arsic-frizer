import { auth } from "@/auth";
import { WeekCalendar } from "@/components/WeekCalendar";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { PageHeader } from "@/components/PageHeader";
import { msg } from "@/lib/messages";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export default async function AdminPage() {
  const session = await auth();
  if (session?.user.role !== "admin") redirect("/calendar");

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={msg.adminPanel}
        title={msg.adminTitle}
        description={msg.adminDescription}
      />

      <Suspense fallback={<LoadingSpinner message={msg.loadingCalendar} />}>
        <WeekCalendar isAdmin />
      </Suspense>
    </div>
  );
}
