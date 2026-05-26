import { toCyr } from "@/lib/cyrillic";
import { msg } from "@/lib/messages";

const DEFAULT_ADDRESS = "Žarka Jelića 5a, Dobanovci 11272";

export function getShopInfo() {
  const addressRaw = process.env.SHOP_ADDRESS ?? DEFAULT_ADDRESS;

  return {
    name: process.env.SHOP_NAME ?? "Vesna Arsić – Frizer",
    phone: process.env.SHOP_PHONE ?? "",
    address: toCyr(addressRaw),
    hours: msg.scheduleHours,
    mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressRaw)}`,
  };
}
