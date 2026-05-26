import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { toCyr } from "../src/lib/cyrillic.ts";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const messagesPath = path.join(root, "src/lib/messages.ts");

const latin = {
  homeMetaDescription:
    "Online zakazivanje termina za muški frizerski salon Vesna Arsić. Pregled slobodnih termina, Google prijava i opciono dodavanje u Google kalendar.",
  homeIntro:
    "Zakažite termin online u frizerskom salonu Vesna. Pregledajte nedeljni raspored, pošaljite zahtev i dobijte obaveštenje kada salon odobri ili odbije rezervaciju.",
  homeLoginCta: "Zakaži termin",
  homeDirectionsCta: "Adresa salona",
  homeFeaturesTitle: "Šta aplikacija radi",
  homeFeatures: [
    "Nedeljni prikaz slobodnih termina",
    "Prijava putem Google naloga (email i ime)",
    "Slanje zahteva za termin sa opcionalnom napomenom",
    "Email obaveštenja o odobrenju ili odbijanju",
    "Opciono: događaj u Google kalendaru nakon odobrenja",
  ],
  homeContactTitle: "Kontakt salona",
  homeGoogleTitle: "Google nalog i kalendar",
  homeGoogleDescription:
    "Za prijavu koristimo Google (email, ime, profil). Google kalendar se traži samo ako kliknete „Poveži Google kalendar“ — tada aplikacija kreira događaj za odobreni termin. Detalji su u Politici privatnosti.",
  homePageLink: "Početna",
  privacyPolicy: "Politika privatnosti",
  termsOfService: "Uslovi korišćenja",
  privacyMetaTitle: "Politika privatnosti – Vesna Arsić",
  privacyMetaDescription:
    "Kako frizerski salon Vesna prikuplja, koristi i štiti vaše podatke, uključujući Google prijavu i Google kalendar.",
  termsMetaTitle: "Uslovi korišćenja – Vesna Arsić",
  termsMetaDescription: "Uslovi korišćenja aplikacije za online zakazivanje termina.",
  privacyIntro:
    "Ova politika opisuje obradu ličnih podataka u aplikaciji za zakazivanje termina frizerskog salona Vesna Arsić.",
  termsIntro: "Ovi uslovi regulišu korišćenje veb aplikacije za online zakazivanje termina.",
  lastUpdatedLabel: "Poslednje ažuriranje",
  loginPrivacyNotice: "Prijava putem Google naloga. Pročitajte",
  loginPrivacyLink: "Politiku privatnosti",
};

let content = fs.readFileSync(messagesPath, "utf8");

for (const [key, value] of Object.entries(latin)) {
  if (Array.isArray(value)) {
    const cyrItems = value.map((item) => toCyr(item));
    const arrayLiteral = `[\n${cyrItems.map((item) => `    "${item.replace(/"/g, '\\"')}",`).join("\n")}\n  ]`;
    const pattern = new RegExp(`${key}:\\s*\\[[\\s\\S]*?\\],`, "m");
    content = content.replace(pattern, `${key}: ${arrayLiteral},`);
  } else {
    const cyr = toCyr(value).replace(/"/g, '\\"');
    const pattern = new RegExp(`(${key}:\\s*)("(?:\\\\.|[^"\\\\])*")`, "m");
    content = content.replace(pattern, `$1"${cyr}"`);
  }
}

fs.writeFileSync(messagesPath, content);
console.log("Updated messages.ts with Cyrillic strings.");
