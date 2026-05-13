// Manually-maintained DB types. Replace with `supabase gen types typescript`
// output once a live project exists.

export type TariffCode = "basic" | "pro" | "premium";
export type EventStatus = "draft" | "active" | "archived" | "expired";
export type MediaKind = "photo" | "video" | "audio";
export type MediaStatus = "pending" | "ready" | "hidden" | "flagged";

export interface Tariff {
  code: TariffCode;
  name: string;
  price_uzs: number;
  max_guests: number;
  photos_per_guest: number;
  videos_per_guest: number;
  retention_days: number;
  features: Record<string, boolean>;
}

export interface Couple {
  id: string;
  user_id: string | null;
  bride_name: string;
  groom_name: string;
  phone: string;
  email: string | null;
  created_at: string;
}

export interface EventRow {
  id: string;
  short_code: string;
  couple_id: string;
  tariff_code: TariffCode;
  status: EventStatus;
  title: string;
  wedding_date: string;
  brand_color: string | null;
  cover_image_path: string | null;
  music_path: string | null;
  venue_name: string | null;
  venue_lat: number | null;
  venue_lng: number | null;
  venue_radius_m: number;
  geofence_enabled: boolean;
  active_from: string;
  active_to: string;
  expires_at: string;
  photos_count: number;
  videos_count: number;
  guests_count: number;
}

export interface Guest {
  id: string;
  event_id: string;
  device_id: string;
  display_name: string | null;
  photos_taken: number;
  videos_taken: number;
}

export interface Media {
  id: string;
  event_id: string;
  guest_id: string;
  kind: MediaKind;
  status: MediaStatus;
  storage_path: string;
  preview_path: string | null;
  mime: string;
  size_bytes: number | null;
  width: number | null;
  height: number | null;
  duration_ms: number | null;
  taken_at: string;
  nsfw_score: number | null;
  highlight_score: number | null;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  wedding_date: string | null;
  guests_estimate: number | null;
  source: string | null;
  status: "new" | "contacted" | "won" | "lost";
  notes: string | null;
  created_at: string;
}
