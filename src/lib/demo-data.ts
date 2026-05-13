/**
 * Демо-данные для просмотра кабинета без Supabase.
 * Используются на маршрутах /dashboard/demo/*.
 *
 * Модель: одно событие → много гостей (устройств) → у каждого гостя свой
 * альбом из 5–25 кадров. В реальном кабинете эти же поля приходят из
 * `guests` + `media` через Supabase.
 */

export const DEMO_COUPLE = {
  bride_name: "Дильноза",
  groom_name: "Алишер",
  phone: "+998 90 123 45 67",
  telegram_chat_id: null as string | null,
};

const today = new Date();
const inFiveDays = new Date(today.getTime() + 5 * 86_400_000);
const inThirtyDays = new Date(today.getTime() + 30 * 86_400_000);

export const DEMO_EVENTS = [
  {
    id: "demo-1",
    title: "Алишер и Дильноза",
    wedding_date: inFiveDays.toISOString().slice(0, 10),
    status: "active" as const,
    expires_at: inThirtyDays.toISOString(),
    photos_count: 247,
    videos_count: 18,
    guests_count: 12,
    brand_color: "#c89c66",
    tariff_code: "pro",
    cover_url: null as string | null,
  },
];

type DemoGuest = {
  id: string;
  display_name: string | null;
  /** Used to color the avatar deterministically */
  hue_seed: number;
  /** How many photos this guest contributed (we generate exactly this many) */
  count: number;
  /** Some guests also send videos */
  video_count?: number;
};

const GUESTS: DemoGuest[] = [
  { id: "g1", display_name: "Камилла",   hue_seed: 18, count: 18, video_count: 2 },
  { id: "g2", display_name: "Бахром",    hue_seed: 70, count: 12 },
  { id: "g3", display_name: "Малика",    hue_seed: 30, count: 22, video_count: 3 },
  { id: "g4", display_name: "Аббос",     hue_seed: 50, count: 9 },
  { id: "g5", display_name: "Шахзода",   hue_seed: 90, count: 16, video_count: 1 },
  { id: "g6", display_name: "Жасур",     hue_seed: 22, count: 7 },
  { id: "g7", display_name: "Динара",    hue_seed: 60, count: 14 },
  { id: "g8", display_name: "Темур",     hue_seed: 40, count: 11 },
  { id: "g9", display_name: null,        hue_seed: 75, count: 6 }, // безымянный гость
  { id: "g10", display_name: "Нодира",   hue_seed: 12, count: 19 },
  { id: "g11", display_name: "Сардор",   hue_seed: 80, count: 8 },
  { id: "g12", display_name: "Робия",    hue_seed: 100, count: 5 },
];

type DemoMedia = {
  id: string;
  kind: "photo";
  url: string;
  hue: number;
  status: "ready" | "hidden";
  highlight: boolean;
  guest_id: string;
  guest_name: string | null;
  /** Sort key (in real data this is `taken_at`) */
  taken_at: string;
};

const items: DemoMedia[] = [];
let counter = 0;
const startTime = today.getTime() - 4 * 3600 * 1000;
for (const g of GUESTS) {
  for (let i = 0; i < g.count; i++) {
    const idx = counter++;
    items.push({
      id: `demo-photo-${idx}`,
      kind: "photo",
      url: "",
      // Each guest has a tight hue range — their album reads as visually cohesive
      hue: g.hue_seed + ((i * 7) % 18) - 9,
      // ~9% hidden, ~20% highlighted, deterministic by index
      status: idx % 11 === 0 ? "hidden" : "ready",
      highlight: idx % 5 === 0,
      guest_id: g.id,
      guest_name: g.display_name,
      taken_at: new Date(startTime + idx * 60_000).toISOString(),
    });
  }
}

// Order by taken_at descending — newest first for the chronological feed
items.sort((a, b) => b.taken_at.localeCompare(a.taken_at));

export const DEMO_GUESTS = GUESTS;

export const DEMO_EVENT_DETAIL = {
  ...DEMO_EVENTS[0],
  photos_count: items.length,
  guests_count: GUESTS.length,
  videos_count: GUESTS.reduce((sum, g) => sum + (g.video_count ?? 0), 0),
  highlights_count: items.filter((i) => i.highlight && i.status !== "hidden").length,
  items,
  extensions: [],
};
