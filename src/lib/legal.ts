import { msg } from "@/lib/messages";
import { toCyr } from "@/lib/cyrillic";
import { getShopInfo } from "@/lib/shop";

const t = toCyr;

export type LegalContactInfo = {
  brandName: string;
  shopName: string;
  address: string;
  phone: string;
  hours: string;
  website: string;
  supportEmail: string;
  developerEmail: string;
  lastUpdated: string;
};

function getWebsiteUrl(): string {
  const authUrl = process.env.AUTH_URL?.replace(/\/$/, "");
  if (authUrl && authUrl.startsWith("http")) return authUrl;
  return "https://vesna.hair";
}

export function getLegalContactInfo(): LegalContactInfo {
  const shop = getShopInfo();
  const supportEmail =
    process.env.SUPPORT_EMAIL?.trim() ||
    process.env.ADMIN_EMAILS?.split(",")[0]?.trim() ||
    "milos.d.arsic@gmail.com";
  const developerEmail =
    process.env.DEVELOPER_EMAIL?.trim() || "arsa.etf@gmail.com";

  return {
    brandName: msg.navBrand,
    shopName: shop.name,
    address: shop.address,
    phone: shop.phone,
    hours: shop.hours,
    website: getWebsiteUrl(),
    supportEmail,
    developerEmail,
    lastUpdated: "26. мај 2026.",
  };
}

export type LegalSection = {
  id: string;
  title: string;
  paragraphs?: string[];
  bullets?: string[];
};

export function getPrivacyPolicySections(info: LegalContactInfo): LegalSection[] {
  return [
    {
      id: "uvod",
      title: t("1. Uvod"),
      paragraphs: [
        t(
          `${info.brandName} („mi“, „salon“, „aplikacija“) obezbeđuje online zakazivanje termina preko veb aplikacije na ${info.website}.`,
        ),
        t(
          "Ova politika privatnosti objašnjava koje podatke prikupljamo, kako ih koristimo i koja prava imate. Aplikacija je namenjena klijentima frizerskog salona i administratoru salona.",
        ),
      ],
    },
    {
      id: "kontroler",
      title: t("2. Rukovalac podataka"),
      paragraphs: [
        t(`Rukovalac podataka: ${info.shopName}`),
        t(`Adresa: ${info.address}`),
        info.phone ? t(`Telefon: ${info.phone}`) : "",
        t(`Email za privatnost i podršku: ${info.supportEmail}`),
        t(`Tehnički razvoj aplikacije: ${info.developerEmail}`),
      ].filter(Boolean),
    },
    {
      id: "prikupljanje",
      title: t("3. Koje podatke prikupljamo"),
      paragraphs: [
        t("Prikupljamo samo podatke potrebne za zakazivanje i vođenje termina:"),
      ],
      bullets: [
        t("Ime i prezime (iz Google naloga pri prijavi)"),
        t("Email adresa (iz Google naloga pri prijavi)"),
        t("Broj telefona (korisnik ga unosi u profilu radi kontakta oko termina)"),
        t("Podaci o terminima (datum, vreme, status, opciona napomena)"),
        t("Tehnički identifikatori sesije (Auth.js JWT) radi prijave"),
        t(
          "Google OAuth tokeni (čuvaju se u bazi) samo ako korisnik dobrovoljno poveže Google kalendar",
        ),
      ],
    },
    {
      id: "google-prijava",
      title: t("4. Google prijava (openid, email, profile)"),
      paragraphs: [
        t(
          "Za prijavu koristimo Google OAuth. Tražimo sledeće opsege: openid, email i profile.",
        ),
        t(
          "Koristimo ih isključivo da biste se prijavili, da vas prepoznamo u aplikaciji i da vam pošaljemo email obaveštenja o statusu termina.",
        ),
        t("Ne prodajemo, ne iznajmljujemo i ne delimo vaše Google podatke oglašivačima."),
      ],
    },
    {
      id: "google-kalendar",
      title: t("5. Google kalendar (calendar.events)"),
      paragraphs: [
        t(
          "Povezivanje Google kalendara je potpuno dobrovoljno. Opseg https://www.googleapis.com/auth/calendar.events tražimo samo kada kliknete „Poveži Google kalendar“.",
        ),
        t(
          "Aplikacija koristi pristup isključivo da bi, nakon odobrenja termina, kreirala događaj u vašem Google kalendaru sa vremenom, nazivom salona i adresom.",
        ),
        t("Ako se termin otkaže ili promeni, aplikacija može obrisati ili ažurirati taj događaj."),
        t("Ne čitamo, ne prikazujemo i ne skladištimo vaše ostale kalendarske događaje."),
        t("Pristup možete opozvati u Google nalogu (Security → Third-party access)."),
      ],
    },
    {
      id: "koriscenje",
      title: t("6. Kako koristimo podatke"),
      bullets: [
        t("Prikaz i upravljanje terminima u nedeljnom kalendaru"),
        t("Obaveštavanje administratora o novim zahtevima"),
        t("Slanje email poruka o odobrenju, odbijanju ili otkazivanju termina"),
        t("Kreiranje događaja u Google kalendaru (samo ako ste povezali kalendar)"),
        t("Ručno unošenje termina od strane administratora za telefonske rezervacije"),
      ],
    },
    {
      id: "deljenje",
      title: t("7. Deljenje sa trećim stranama"),
      paragraphs: [
        t("Podatke ne prodajemo. Delimo ih samo sa pružaocima usluga neophodnim za rad aplikacije:"),
        t("Svi pružaoci su ugovorno obavezni da štite podatke u okviru svojih usluga."),
      ],
      bullets: [
        t("Google (OAuth prijava i Google Calendar API) — samo uz vašu saglasnost"),
        t("Neon PostgreSQL — baza podataka (termini, profil)"),
        t("Vercel — hosting aplikacije"),
        t("Resend — slanje transakcionih email obaveštenja"),
      ],
    },
    {
      id: "cuvanje",
      title: t("8. Čuvanje podataka"),
      paragraphs: [
        t(
          "Podatke o terminima i profilu čuvamo dok postoji aktivan nalog ili dok je potrebno radi vođenja salona.",
        ),
        t(
          "Zapis o terminu (datum, status, ime i telefon ako su uneti) automatski se briše najkasnije 12 meseci nakon datuma termina. Korisnički nalog i ostali podaci se time ne brišu.",
        ),
        t(
          "Možete zatražiti brisanje naloga i povezanih podataka kontaktiranjem na email naveden u odeljku 2.",
        ),
        t(
          "Nakon brisanja, rezervne kopije u bazi mogu postojati ograničeno vreme u skladu sa pravilima hosting provajdera.",
        ),
      ],
    },
    {
      id: "bezbednost",
      title: t("9. Bezbednost"),
      paragraphs: [
        t(
          "Komunikacija sa aplikacijom odvija se preko HTTPS. Lozinke se ne čuvaju — prijava isključivo preko Google naloga.",
        ),
        t("Pristup administratorskom delu aplikacije ograničen je na ovlašćene email adrese."),
      ],
    },
    {
      id: "prava",
      title: t("10. Vaša prava"),
      paragraphs: [
        t(
          "Imate pravo da zatražite pristup, ispravku ili brisanje svojih podataka, kao i da opozovete pristup Google kalendaru.",
        ),
        t(`Za sve zahteve pišite na: ${info.supportEmail}. Odgovorićemo u razumnom roku.`),
      ],
    },
    {
      id: "deca",
      title: t("11. Deca"),
      paragraphs: [
        t("Aplikacija nije namenjena deci mlađoj od 16 godina. Ne prikupljamo svesno podatke dece."),
      ],
    },
    {
      id: "izmene",
      title: t("12. Izmene politike"),
      paragraphs: [
        t(
          "Ovu politiku možemo ažurirati. Datum poslednje izmene biće naveden na vrhu stranice. Nastavak korišćenja aplikacije posle izmene podrazumeva saglasnost sa novom verzijom.",
        ),
      ],
    },
  ];
}

export function getTermsSections(info: LegalContactInfo): LegalSection[] {
  return [
    {
      id: "uvod",
      title: t("1. Prihvatanje uslova"),
      paragraphs: [
        t(
          `Korišćenjem aplikacije ${info.brandName} na ${info.website} prihvatate ove uslove. Aplikacija služi za online zakazivanje termina u frizerskom salonu.`,
        ),
      ],
    },
    {
      id: "usluga",
      title: t("2. Opis usluge"),
      paragraphs: [
        t(
          "Klijenti mogu pregledati slobodne termine, poslati zahtev za termin i dobiti obaveštenje kada administrator odobri ili odbije zahtev.",
        ),
        t("Administrator odlučuje o svakom zahtevu. Slanje zahteva ne garantuje termin dok administrator ne odobri."),
        t("Opciono možete povezati Google kalendar da biste dobili događaj nakon odobrenja."),
      ],
    },
    {
      id: "nalog",
      title: t("3. Nalog i tačni podaci"),
      paragraphs: [
        t("Prijava je moguća putem Google naloga. Dužni ste da unesete tačan broj telefona kako bi vas salon mogao kontaktirati."),
        t("Odgovorni ste za aktivnosti na svom nalogu."),
      ],
    },
    {
      id: "otkazivanje",
      title: t("4. Otkazivanje termina"),
      paragraphs: [
        info.phone
          ? t(`Za otkazivanje odobrenog termina kontaktirajte salon telefonom: ${info.phone}.`)
          : t("Za otkazivanje odobrenog termina kontaktirajte salon putem kontakt podataka u aplikaciji."),
        t("Salon zadržava pravo da otkaže termin u izuzetnim slučajevima (bolest, kvar, vanredne okolnosti)."),
      ],
    },
    {
      id: "zabranjeno",
      title: t("5. Zabranjeno korišćenje"),
      bullets: [
        t("Lažno predstavljanje ili zakazivanje u tuđe ime bez dozvole"),
        t("Pokušaj ometanja rada aplikacije ili neovlašćenog pristupa"),
        t("Automatsko masovno zakazivanje (botovi)"),
      ],
    },
    {
      id: "odgovornost",
      title: t("6. Ograničenje odgovornosti"),
      paragraphs: [
        t(
          "Aplikacija se pruža „kakva jeste“. Ne odgovaramo za privremenu nedostupnost usled održavanja ili grešaka trećih strana (Google, hosting).",
        ),
        t(
          "Salon nije odgovoran za tehničke probleme van svoje kontrole, ali će nastojati da ih reši u razumnom roku.",
        ),
      ],
    },
    {
      id: "privatnost",
      title: t("7. Privatnost"),
      paragraphs: [
        t(`Obrada podataka opisana je u Politici privatnosti: ${info.website}/privacy`),
      ],
    },
    {
      id: "kontakt",
      title: t("8. Kontakt"),
      paragraphs: [
        t(`${info.shopName}`),
        t(`Adresa: ${info.address}`),
        info.phone ? t(`Telefon: ${info.phone}`) : "",
        t(`Email: ${info.supportEmail}`),
        t(`Radno vreme: ${info.hours}`),
      ].filter(Boolean),
    },
  ];
}
