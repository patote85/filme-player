export const AUDIO_SRC = "/film/trilha.m4a";
export const RUNTIME = 168.33;
export const ASK_AT = 158;

const RESUME_LEAD = 3;

export function canResume(seconds: number): boolean {
  return Number.isFinite(seconds) && seconds > RESUME_LEAD && seconds < ASK_AT;
}

export function atAsk(seconds: number): boolean {
  return Number.isFinite(seconds) && seconds >= ASK_AT;
}

export type Still = { t: number; image: string };

export type Chapter = {
  id: string;
  t: number;
  title: string;
  line: string;
  image: string;
};

export type Line = { t: number; line: string };

/**
 * Fotos do filme. Para trocar uma imagem, substitua o arquivo em public/film/
 * (mesmo nome) ou mude o caminho aqui. Nenhum outro arquivo aponta foto.
 */
export const stills = {
  a: "/film/cena-1.jpg",
  b: "/film/cena-2.jpg",
  c: "/film/cena-3.jpg",
  d: "/film/cena-4.jpg",
  e: "/film/cena-5.jpg",
  f: "/film/cena-6.jpg",
  g: "/film/cena-7.jpg",
  h: "/film/cena-8.jpg",
} as const;

export const poster = stills.a;

export const lyrics: readonly [Line, ...Line[]] = [
  { t: 0, line: "" },
  { t: 11.5, line: "Frase." },
  { t: 15.36, line: "Frase." },
  { t: 20.48, line: "Frase." },
  { t: 25.6, line: "Frase." },
  { t: 28.16, line: "Frase." },
  { t: 33.28, line: "Frase." },
  { t: 38.4, line: "Frase." },
  { t: 41.244, line: "Frase." },
  { t: 46.933, line: "Frase." },
  { t: 49.778, line: "Frase." },
  { t: 55.467, line: "Frase." },
  { t: 58.311, line: "Frase." },
  { t: 64, line: "Frase." },
  { t: 66.844, line: "Frase." },
  { t: 72.533, line: "Frase." },
  { t: 78.222, line: "Frase." },
  { t: 81.067, line: "Frase." },
  { t: 86.756, line: "Frase." },
  { t: 89.6, line: "Frase." },
  { t: 92.444, line: "Frase." },
  { t: 98.133, line: "Frase." },
  { t: 100.978, line: "Frase." },
  { t: 106.667, line: "Frase." },
  { t: 109.511, line: "Frase." },
  { t: 112.356, line: "Frase." },
  { t: 115.2, line: "" },
  { t: 136, line: "Frase." },
  { t: 140, line: "Frase." },
  { t: 142.6, line: "Frase." },
  { t: 145, line: "Frase." },
  { t: 148, line: "Frase." },
  { t: 151, line: "Frase." },
];

function lineAt(t: number): string {
  const found = lyrics.find((item) => item.t === t);
  if (!found?.line) throw new Error(`Sem legenda em ${t}`);
  return found.line;
}

export const scenes: readonly [Still, ...Still[]] = [
  { t: 0, image: stills.a },
  { t: 33.28, image: stills.c },
  { t: 41.244, image: stills.d },
  { t: 64, image: stills.h },
  { t: 72.533, image: stills.f },
  { t: 78.222, image: stills.g },
  { t: 92.444, image: stills.d },
  { t: 136, image: stills.a },
];

export const chapters: Chapter[] = [
  {
    id: "cena-1",
    t: 11.5,
    title: "Abertura",
    line: lineAt(11.5),
    image: stills.a,
  },
  {
    id: "cena-2",
    t: 33.28,
    title: "Cena 2",
    line: lineAt(33.28),
    image: stills.c,
  },
  {
    id: "cena-3",
    t: 41.244,
    title: "Cena 3",
    line: lineAt(41.244),
    image: stills.d,
  },
  {
    id: "cena-4",
    t: 64,
    title: "Cena 4",
    line: lineAt(64),
    image: stills.h,
  },
  {
    id: "cena-5",
    t: 66.844,
    title: "Cena 5",
    line: lineAt(66.844),
    image: stills.e,
  },
  {
    id: "cena-6",
    t: 72.533,
    title: "Cena 6",
    line: lineAt(72.533),
    image: stills.f,
  },
  {
    id: "cena-7",
    t: 78.222,
    title: "Cena 7",
    line: lineAt(78.222),
    image: stills.g,
  },
  {
    id: "cena-8",
    t: 136,
    title: "Final",
    line: lineAt(136),
    image: stills.a,
  },
];

export function atTime<T extends { t: number }>(items: readonly [T, ...T[]], time: number): T {
  let current = items[0];
  for (const item of items) {
    if (time + 0.08 >= item.t) current = item;
    else break;
  }
  return current;
}

export function clock(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) seconds = 0;
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function fold(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
}

export const replies = [
  { text: "Quero", yes: true },
  { text: "Quero, pra sempre", yes: true },
  { text: "Deixa eu te responder", yes: false },
] as const;

export const WHATSAPP = "";

export function replyHref(text: string): string {
  if (!WHATSAPP) return "#";
  return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`;
}
