-- =============================================================================
-- VEWI Wedding OS: initial schema
-- =============================================================================
-- Multi-tenant: events belong to couples; guests are anonymous (device-id based);
-- admin is a special role on auth.users; payments tracked in orders.
-- Guest uploads go through a server-side API that uses the service role; RLS
-- policies below cover the couple/admin dashboard access only.
-- =============================================================================

create extension if not exists "pgcrypto";
create extension if not exists "citext";

-- -----------------------------------------------------------------------------
-- Enums
-- -----------------------------------------------------------------------------
create type tariff_code as enum ('basic', 'pro', 'premium');
create type event_status as enum ('draft', 'active', 'archived', 'expired');
create type lead_status as enum ('new', 'contacted', 'won', 'lost');
create type order_status as enum ('pending', 'paid', 'refunded', 'failed');
create type media_kind as enum ('photo', 'video', 'audio');
create type media_status as enum ('pending', 'ready', 'hidden', 'flagged');

-- -----------------------------------------------------------------------------
-- Tariffs (configuration table; can be edited from admin UI)
-- -----------------------------------------------------------------------------
create table tariffs (
  code tariff_code primary key,
  name text not null,
  price_uzs integer not null,
  max_guests integer not null,
  photos_per_guest integer not null,
  videos_per_guest integer not null default 0,
  retention_days integer not null,
  features jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

insert into tariffs (code, name, price_uzs, max_guests, photos_per_guest, videos_per_guest, retention_days, features) values
  ('basic', 'Basic', 390000, 100, 20, 0, 14, '{"live_slideshow": false, "branding": false, "telegram_bot": false, "ai_highlights": false}'),
  ('pro', 'Pro', 790000, 250, 30, 5, 30, '{"live_slideshow": true, "branding": true, "telegram_bot": true, "ai_highlights": false}'),
  ('premium', 'Premium', 1690000, 9999, 9999, 9999, 180, '{"live_slideshow": true, "branding": true, "telegram_bot": true, "ai_highlights": true, "custom_domain": true, "drive_export": true}');

-- -----------------------------------------------------------------------------
-- Couples — paying clients (linked to auth.users via phone)
-- -----------------------------------------------------------------------------
create table couples (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  bride_name text not null,
  groom_name text not null,
  phone text not null,
  email citext,
  created_at timestamptz not null default now(),
  unique (phone)
);

create index couples_user_id_idx on couples(user_id);

-- -----------------------------------------------------------------------------
-- Events — one wedding
-- -----------------------------------------------------------------------------
create table events (
  id uuid primary key default gen_random_uuid(),
  short_code text not null unique,           -- short URL-friendly slug for QR
  couple_id uuid not null references couples(id) on delete cascade,
  tariff_code tariff_code not null references tariffs(code),
  status event_status not null default 'draft',

  -- Display
  title text not null,                       -- e.g. "Алишер и Дильноза"
  wedding_date date not null,
  brand_color text,                          -- hex, e.g. #c89c66
  cover_image_path text,                     -- storage key in event-assets
  music_path text,                           -- storage key in event-assets

  -- Geofence
  venue_name text,
  venue_lat numeric(9, 6),
  venue_lng numeric(9, 6),
  venue_radius_m integer not null default 500,
  geofence_enabled boolean not null default true,

  -- Activity window (defaults to wedding_date ± 12h via trigger)
  active_from timestamptz not null,
  active_to timestamptz not null,

  -- Retention
  expires_at timestamptz not null,           -- when media is auto-deleted

  -- Aggregates (kept in sync via triggers or recalculated nightly)
  photos_count integer not null default 0,
  videos_count integer not null default 0,
  guests_count integer not null default 0,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index events_couple_idx on events(couple_id);
create index events_status_idx on events(status);
create index events_expires_idx on events(expires_at) where status <> 'archived';

-- -----------------------------------------------------------------------------
-- Guests — anonymous device-bound participants
-- -----------------------------------------------------------------------------
create table guests (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  device_id text not null,                   -- FingerprintJS visitorId
  display_name text,                         -- optional self-provided
  user_agent text,
  ip inet,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  photos_taken integer not null default 0,
  videos_taken integer not null default 0,
  unique (event_id, device_id)
);

create index guests_event_idx on guests(event_id);

-- -----------------------------------------------------------------------------
-- Media — photos, videos, audio
-- -----------------------------------------------------------------------------
create table media (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  guest_id uuid not null references guests(id) on delete cascade,
  kind media_kind not null,
  status media_status not null default 'pending',

  storage_path text not null,                -- object key in event-{photos|videos}
  preview_path text,                         -- low-res thumbnail
  mime text not null,
  size_bytes bigint,
  width integer,
  height integer,
  duration_ms integer,                       -- for video/audio
  taken_at timestamptz not null default now(),

  nsfw_score real,                           -- 0–1, from nsfwjs
  highlight_score real,                      -- 0–1, AI ranking for highlights

  hidden_by uuid references auth.users(id),  -- who moderated it out
  hidden_at timestamptz,

  created_at timestamptz not null default now()
);

create index media_event_idx on media(event_id, taken_at desc);
create index media_guest_idx on media(guest_id);
create index media_event_status_idx on media(event_id, status) where status = 'ready';

-- -----------------------------------------------------------------------------
-- Leads — landing form submissions
-- -----------------------------------------------------------------------------
create table leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  wedding_date date,
  guests_estimate integer,
  source text,                               -- "landing", "instagram", "referral"
  status lead_status not null default 'new',
  notes text,
  created_at timestamptz not null default now()
);

create index leads_status_idx on leads(status, created_at desc);

-- -----------------------------------------------------------------------------
-- Orders — payment records (phase 2 self-serve; phase 1 = manual cash)
-- -----------------------------------------------------------------------------
create table orders (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references events(id) on delete set null,
  couple_id uuid references couples(id) on delete set null,
  tariff_code tariff_code not null references tariffs(code),
  amount_uzs integer not null,
  provider text,                             -- "click", "payme", "cash", "transfer"
  provider_ref text,
  status order_status not null default 'pending',
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create index orders_event_idx on orders(event_id);

-- -----------------------------------------------------------------------------
-- Admin roles
-- -----------------------------------------------------------------------------
create table admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function is_admin(uid uuid) returns boolean
  language sql stable security definer as $$
  select exists (select 1 from admin_users where user_id = uid);
$$;

-- -----------------------------------------------------------------------------
-- Triggers
-- -----------------------------------------------------------------------------
create or replace function set_event_defaults() returns trigger as $$
declare
  t tariffs%rowtype;
begin
  if new.active_from is null then
    new.active_from := (new.wedding_date::timestamptz - interval '12 hours');
  end if;
  if new.active_to is null then
    new.active_to := (new.wedding_date::timestamptz + interval '36 hours');
  end if;
  if new.expires_at is null then
    select * into t from tariffs where code = new.tariff_code;
    new.expires_at := new.active_to + (t.retention_days || ' days')::interval;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger events_set_defaults
  before insert on events
  for each row execute function set_event_defaults();

create or replace function bump_updated_at() returns trigger as $$
begin
  new.updated_at := now();
  return new;
end;
$$ language plpgsql;

create trigger events_updated_at
  before update on events
  for each row execute function bump_updated_at();

-- -----------------------------------------------------------------------------
-- Row-Level Security
-- -----------------------------------------------------------------------------
alter table couples       enable row level security;
alter table events        enable row level security;
alter table guests        enable row level security;
alter table media         enable row level security;
alter table leads         enable row level security;
alter table orders        enable row level security;
alter table tariffs       enable row level security;
alter table admin_users   enable row level security;

-- Tariffs: public read
create policy "tariffs_public_read" on tariffs for select using (true);

-- Couples: a couple sees only their own row; admin sees all
create policy "couples_self_read" on couples for select
  using (user_id = auth.uid() or is_admin(auth.uid()));
create policy "couples_self_update" on couples for update
  using (user_id = auth.uid() or is_admin(auth.uid()));
create policy "couples_admin_insert" on couples for insert
  with check (is_admin(auth.uid()));

-- Events: couple sees their events; admin sees all
create policy "events_couple_read" on events for select
  using (
    is_admin(auth.uid())
    or exists (select 1 from couples c where c.id = events.couple_id and c.user_id = auth.uid())
  );
create policy "events_admin_write" on events for all
  using (is_admin(auth.uid()))
  with check (is_admin(auth.uid()));

-- Guests: only admin/couple read; writes go via service role from API
create policy "guests_couple_read" on guests for select
  using (
    is_admin(auth.uid())
    or exists (
      select 1 from events e
      join couples c on c.id = e.couple_id
      where e.id = guests.event_id and c.user_id = auth.uid()
    )
  );

-- Media: couple sees their event's media; admin all; writes via service role
create policy "media_couple_read" on media for select
  using (
    is_admin(auth.uid())
    or exists (
      select 1 from events e
      join couples c on c.id = e.couple_id
      where e.id = media.event_id and c.user_id = auth.uid()
    )
  );
create policy "media_couple_moderate" on media for update
  using (
    is_admin(auth.uid())
    or exists (
      select 1 from events e
      join couples c on c.id = e.couple_id
      where e.id = media.event_id and c.user_id = auth.uid()
    )
  );

-- Leads: public can insert; only admin reads/updates
create policy "leads_public_insert" on leads for insert with check (true);
create policy "leads_admin_all" on leads for all
  using (is_admin(auth.uid()))
  with check (is_admin(auth.uid()));

-- Orders: couple reads their own; admin all
create policy "orders_couple_read" on orders for select
  using (
    is_admin(auth.uid())
    or exists (select 1 from couples c where c.id = orders.couple_id and c.user_id = auth.uid())
  );
create policy "orders_admin_write" on orders for all
  using (is_admin(auth.uid()))
  with check (is_admin(auth.uid()));

-- Admin self read
create policy "admin_self_read" on admin_users for select
  using (user_id = auth.uid());

-- -----------------------------------------------------------------------------
-- Storage buckets (created via Supabase Dashboard or `supabase storage`)
-- -----------------------------------------------------------------------------
-- event-photos:  private, RLS-protected, served via signed URLs from API
-- event-videos:  same
-- event-assets:  couple-owned (cover, music)
-- qr-pdfs:       admin-only
-- =============================================================================
