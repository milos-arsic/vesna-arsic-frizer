import { WeekCalendar } from "@/components/WeekCalendar";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { PageHeader } from "@/components/PageHeader";
import { getShopInfo } from "@/lib/shop";
import { msg } from "@/lib/messages";
import { Suspense } from "react";

export default function CalendarPage() {
  const { phone } = getShopInfo();

  return (
    <div className="space-y-8">
      <PageHeader title={msg.bookingTitle} />

      <Suspense fallback={<LoadingSpinner message={msg.loadingCalendar} />}>
        <WeekCalendar shopPhone={phone} />
      </Suspense>
    </div>
  );
}
