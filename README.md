# Vesna Arsić – Scheduler

Jednostavna web aplikacija za zakazivanje termina u frizerskom salonu.

## Funkcionalnosti

- Prijava putem Google naloga
- Unos broja telefona pri prvom logovanju
- Nedeljni kalendar sa slobodnim i zauzetim terminima
- Klijenti šalju zahtev za termin; admin odobrava ili odbija sa porukom
- Email obaveštenja (klijent + admin) preko Resend-a
- Admin može ručno uneti telefonske termine
- Admin vidi ime i telefon klijenta u zauzetim terminima
- Admin može otkazati termin (slot postaje slobodan)
- Pri odobrenju termina, klijent dobija događaj u Google kalendaru (podsetnik 30 min pre)
- Otkazivanje od strane klijenta: poziv na broj salona (za sada)

## Radno vreme

- **Ponedeljak–Petak:** 08:00–12:00 i 16:00–20:00 (termini na 30 min)
- **Subota:** 08:00–14:00 (termini na 30 min)
- **Nedelja:** neradni dan

## Besplatan stack

| Servis | Uloga | Free tier |
|--------|-------|-----------|
| [Vercel](https://vercel.com) | Hosting | Da |
| [Neon](https://neon.tech) | PostgreSQL baza | Da |
| [Google Cloud Console](https://console.cloud.google.com) | OAuth prijava | Da |
| [Resend](https://resend.com) | Email obaveštenja | 3.000 emailova/mesec |

## Lokalno pokretanje

### 1. Kloniraj i instaliraj

```bash
npm install
```

### 2. Podesi `.env`

Kopiraj `.env.example` u `.env` i popuni vrednosti:

```bash
cp .env.example .env
```

### 3. Neon baza

1. Napravi besplatan nalog na [neon.tech](https://neon.tech)
2. Kreiraj projekat i kopiraj connection string u `DATABASE_URL`
3. Push-uj šemu:

```bash
npm run db:push
```

### 4. Google OAuth i Calendar

1. Idi na [Google Cloud Console](https://console.cloud.google.com)
2. U projektu uključi **Google Calendar API** (APIs & Services → Library)
3. Kreiraj OAuth 2.0 Client ID (Web application)
4. Authorized redirect URI: `http://localhost:3002/api/auth/callback/google`
5. Kopiraj `GOOGLE_CLIENT_ID` i `GOOGLE_CLIENT_SECRET`

**Google kalendar za klijente:** pri odobrenju termina aplikacija kreira događaj u kalendaru klijenta (podsetnik 30 min pre). Klijenti koji su se prijavili pre dodavanja ove funkcije moraju **jednom da se odjave i ponovo prijave** da bi dali dozvolu za kalendar.

### 5. Auth secret

```bash
openssl rand -base64 32
```

Stavi rezultat u `AUTH_SECRET`.

### 6. Resend email

1. Napravi nalog na [resend.com](https://resend.com)
2. Kopiraj API ključ u `RESEND_API_KEY`
3. Za testiranje koristi `onboarding@resend.dev` kao `EMAIL_FROM`
4. Za produkciju verifikuj svoj domen

### 7. Admin pristup

Stavi Google email tvoje majke u `ADMIN_EMAILS`:

```
ADMIN_EMAILS=vesna@gmail.com
```

### 8. Pokreni

```bash
npm run dev
```

Otvori [http://localhost:3002](http://localhost:3002).

## Deploy na Vercel

1. Push-uj repo na GitHub
2. Importuj projekat u Vercel
3. Dodaj sve env varijable iz `.env`
4. Promeni `AUTH_URL` na produkcijski URL
5. Dodaj produkcijski redirect URI u Google OAuth:
   `https://tvoj-domen.vercel.app/api/auth/callback/google`
6. Proveri da je Google Calendar API uključen u istom Google Cloud projektu

## Struktura

```
src/
  app/
    calendar/     # Klijentski kalendar
    admin/        # Admin panel
    onboarding/   # Unos telefona
    login/        # Google prijava
    api/          # API rute
  components/     # UI komponente
  lib/
    slots.ts      # Generisanje termina
    email.ts      # Email obaveštenja
    db/           # Drizzle šema
```

## Kasnije (v2)

- Otkazivanje termina od strane klijenata u aplikaciji
- SMS obaveštenja
- Blokiranje dana (odsustvo, praznici)
