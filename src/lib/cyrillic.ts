const map: Record<string, string> = {
  a: "а", b: "б", v: "в", g: "г", d: "д", đ: "ђ", e: "е", ž: "ж", z: "з",
  i: "и", j: "ј", k: "к", l: "л", m: "м", n: "н", o: "о", p: "п", r: "р",
  s: "с", t: "т", u: "у", f: "ф", h: "х", c: "ц", č: "ч", ć: "ћ", š: "ш",
  A: "А", B: "Б", V: "В", G: "Г", D: "Д", Đ: "Ђ", E: "Е", Ž: "Ж", Z: "З",
  I: "И", J: "Ј", K: "К", L: "Л", M: "М", N: "Н", O: "О", P: "П", R: "Р",
  S: "С", T: "Т", U: "У", F: "Ф", H: "Х", C: "Ц", Č: "Ч", Ć: "Ћ", Š: "Ш",
};

const PRESERVE_PATTERN =
  /https?:\/\/\S+|[\w.+-]+@[\w.-]+\.\w+|Auth\.js JWT|Google OAuth|Google Calendar API|Neon PostgreSQL|Third-party access|calendar\.events|openid, email i profile|openid, email, profile|\bGoogle\b|\bEmail\b|\bemail\b|\bOAuth\b|\bHTTPS\b|\bVercel\b|\bResend\b|\bNeon\b|\bPostgreSQL\b|\bJWT\b|\bprofile\b|\bopenid\b|\bSecurity\b|\bAPI\b/gi;

/** Fix nj/lj split as н+j / л+j after naive conversion. */
export function fixSerbianDigraphs(text: string): string {
  return text
    .replace(/Н(?=ј)/g, "Њ")
    .replace(/н(?=ј)/g, "њ")
    .replace(/Л(?=ј)/g, "Љ")
    .replace(/л(?=ј)/g, "љ");
}

function convertLatinLetters(text: string): string {
  return text
    .replace(/DŽ/g, "Џ")
    .replace(/Dž/g, "Џ")
    .replace(/dž/g, "џ")
    .replace(/LJ/g, "Љ")
    .replace(/Lj/g, "Љ")
    .replace(/lj/g, "љ")
    .replace(/NJ/g, "Њ")
    .replace(/Nj/g, "Њ")
    .replace(/nj/g, "њ")
    .replace(/[A-Za-zčćđšžČĆĐŠŽ]/g, (ch) => map[ch] ?? ch);
}

export function toCyr(text: string): string {
  const preserved: string[] = [];
  const safe = text.replace(PRESERVE_PATTERN, (match) => {
    preserved.push(match);
    return `\uE000${preserved.length - 1}\uE001`;
  });

  const converted = fixSerbianDigraphs(convertLatinLetters(safe));

  return converted.replace(/\uE000(\d+)\uE001/g, (_, index) => preserved[Number(index)]);
}
