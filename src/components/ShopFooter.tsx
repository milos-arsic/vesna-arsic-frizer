import { getShopInfo } from "@/lib/shop";
import { msg } from "@/lib/messages";

function MapPinIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 21s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

export function ShopFooter() {
  const shop = getShopInfo();

  return (
    <footer className="mt-auto border-t border-stone-200/70 bg-white/50 pb-[env(safe-area-inset-bottom)] backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-3 py-6 sm:px-6 sm:py-8">
        <div className="glass-card grid gap-5 p-4 sm:grid-cols-3 sm:gap-8 sm:p-6">
          <div className="space-y-1">
            <p className="text-lg font-semibold text-stone-900">
              {msg.navBrand}
            </p>
            <p className="text-sm text-stone-500">{msg.loginSubtitle}</p>
          </div>

          <div className="space-y-3 text-sm text-stone-600">
            <div className="flex gap-3">
              <span className="mt-0.5 shrink-0 text-amber-700">
                <MapPinIcon />
              </span>
              <div>
                <p className="font-medium text-stone-800">{msg.footerAddress}</p>
                <a
                  href={shop.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-0.5 inline-block leading-relaxed transition hover:text-amber-800"
                >
                  {shop.address}
                </a>
              </div>
            </div>

            {shop.phone ? (
              <div className="flex gap-3">
                <span className="mt-0.5 shrink-0 text-amber-700">
                  <PhoneIcon />
                </span>
                <div>
                  <p className="font-medium text-stone-800">{msg.footerPhone}</p>
                  <a
                    href={`tel:${shop.phone.replace(/\s/g, "")}`}
                    className="transition hover:text-amber-800"
                  >
                    {shop.phone}
                  </a>
                </div>
              </div>
            ) : null}
          </div>

          <div className="flex gap-3 text-sm text-stone-600">
            <span className="mt-0.5 shrink-0 text-amber-700">
              <ClockIcon />
            </span>
            <div>
              <p className="font-medium text-stone-800">{msg.footerHours}</p>
              <p className="mt-0.5 leading-relaxed">{shop.hours}</p>
              <p className="mt-1 text-xs text-stone-400">{msg.footerSundayClosed}</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
