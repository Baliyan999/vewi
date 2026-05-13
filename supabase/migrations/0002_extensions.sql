-- =============================================================================
-- 0002: extensions — phases 3-6 additions
-- =============================================================================

-- ---- Telegram link for couples ---------------------------------------------
alter table couples
  add column if not exists telegram_chat_id text;

-- ---- Branding JSON for richer event customisation --------------------------
alter table events
  add column if not exists branding jsonb not null default '{}'::jsonb;
  -- example shape: { "primary": "#c89c66", "accent": "#85553c",
  --                  "cover_path": "events/{id}/cover.jpg",
  --                  "music_path": "events/{id}/music.mp3",
  --                  "welcome_text": "Алишер и Дильноза приглашают вас..." }

-- ---- Highlight tagging (for AI picks) --------------------------------------
alter table media
  add column if not exists is_highlight boolean not null default false;
create index if not exists media_highlight_idx
  on media(event_id, is_highlight)
  where is_highlight = true;

-- ---- Couple uploaded reactions / shortlist ---------------------------------
create table if not exists media_reactions (
  id uuid primary key default gen_random_uuid(),
  media_id uuid not null references media(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  emoji text not null check (char_length(emoji) <= 4),
  created_at timestamptz not null default now()
);
create index if not exists media_reactions_media_idx on media_reactions(media_id);

-- ---- Storage extensions (upsell) -------------------------------------------
create table if not exists storage_extensions (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  extends_by_days integer not null check (extends_by_days > 0),
  price_uzs integer not null,
  order_id uuid references orders(id) on delete set null,
  applied_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists storage_extensions_event_idx on storage_extensions(event_id);

-- Trigger: when storage_extensions.applied_at flips from null, push expires_at
create or replace function apply_storage_extension() returns trigger as $$
begin
  if new.applied_at is not null and (old is null or old.applied_at is null) then
    update events
      set expires_at = expires_at + (new.extends_by_days || ' days')::interval
      where id = new.event_id;
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists storage_extensions_apply on storage_extensions;
create trigger storage_extensions_apply
  after insert or update of applied_at on storage_extensions
  for each row execute function apply_storage_extension();

-- ---- Print orders (album / USB upsell) -------------------------------------
create type print_kind as enum ('album', 'usb', 'photobook');
create type fulfilment_status as enum (
  'pending', 'in_production', 'shipped', 'delivered', 'cancelled'
);

create table if not exists print_orders (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  couple_id uuid not null references couples(id) on delete cascade,
  kind print_kind not null,
  price_uzs integer not null,
  order_id uuid references orders(id) on delete set null,
  delivery_address text,
  delivery_phone text,
  status fulfilment_status not null default 'pending',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists print_orders_event_idx on print_orders(event_id);

-- ---- Referrals (phase 6: B2B / agents) -------------------------------------
create table if not exists referral_codes (
  code text primary key,
  owner_name text not null,
  owner_phone text not null,
  percent integer not null default 15 check (percent between 0 and 100),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists referrals (
  id uuid primary key default gen_random_uuid(),
  code text not null references referral_codes(code) on delete cascade,
  event_id uuid not null references events(id) on delete cascade,
  order_id uuid references orders(id) on delete set null,
  commission_uzs integer,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  unique (event_id)
);
create index if not exists referrals_code_idx on referrals(code);

-- ---- RLS for new tables ----------------------------------------------------
alter table media_reactions     enable row level security;
alter table storage_extensions  enable row level security;
alter table print_orders        enable row level security;
alter table referral_codes      enable row level security;
alter table referrals           enable row level security;

create policy "reactions_couple_read" on media_reactions for select
  using (
    is_admin(auth.uid())
    or exists (
      select 1 from media m
      join events e on e.id = m.event_id
      join couples c on c.id = e.couple_id
      where m.id = media_reactions.media_id and c.user_id = auth.uid()
    )
  );

create policy "extensions_couple_read" on storage_extensions for select
  using (
    is_admin(auth.uid())
    or exists (
      select 1 from events e
      join couples c on c.id = e.couple_id
      where e.id = storage_extensions.event_id and c.user_id = auth.uid()
    )
  );
create policy "extensions_admin_write" on storage_extensions for all
  using (is_admin(auth.uid())) with check (is_admin(auth.uid()));

create policy "print_couple_read" on print_orders for select
  using (
    is_admin(auth.uid())
    or exists (select 1 from couples c where c.id = print_orders.couple_id and c.user_id = auth.uid())
  );
create policy "print_admin_write" on print_orders for all
  using (is_admin(auth.uid())) with check (is_admin(auth.uid()));

create policy "referral_codes_admin_all" on referral_codes for all
  using (is_admin(auth.uid())) with check (is_admin(auth.uid()));

create policy "referrals_admin_all" on referrals for all
  using (is_admin(auth.uid())) with check (is_admin(auth.uid()));

-- ---- Helpful materialised stats (gallery counters) -------------------------
create or replace view event_stats as
  select
    e.id as event_id,
    count(*) filter (where m.kind = 'photo' and m.status = 'ready') as photos,
    count(*) filter (where m.kind = 'video' and m.status = 'ready') as videos,
    count(distinct m.guest_id) as participating_guests,
    max(m.created_at) as last_upload_at
  from events e
  left join media m on m.event_id = e.id
  group by e.id;
