# VEWI · Wedding OS

SaaS-платформа для свадеб «под ключ» в High-End Editorial стиле: QR-коды на столах → гости сканируют → цифровой одноразовый фотоаппарат в браузере → молодожёны получают кураторский альбом.

Полный план продукта и дорожная карта: [план проекта](/Users/baliyan99/.claude/plans/curious-strolling-lighthouse.md).

## Стек

- **Next.js 15** (App Router) + **React 19** + TypeScript
- **Tailwind v4** + локальные UI-примитивы в `src/components/ui/*`
- **Supabase** — Postgres, Auth, Storage, Realtime
- **next-intl** — i18n (RU / UZ)
- **@react-pdf/renderer** + `qrcode` — генерация PDF-наборов QR на столы
- **browser-image-compression** — сжатие фото перед отправкой
- **FingerprintJS (OSS)** — лимит 20 фото / устройство
- **archiver** — стриминговая упаковка ZIP-альбома

## Запуск локально

```bash
pnpm install
cp .env.example .env.local   # затем заполнить значения Supabase + Telegram
pnpm dev
```

Откройте:

- `http://localhost:3000/` — лендинг
- `http://localhost:3000/e/demo` — гостевая камера в демо-режиме (без БД)
- `http://localhost:3000/admin` — админка (требуется вход)
- `http://localhost:3000/dashboard` — кабинет молодожёнов

## Структура

```
src/
├─ app/
│  ├─ [locale]/
│  │  ├─ page.tsx              # лендинг
│  │  ├─ (guest)/e/[id]/       # PWA для гостей: splash, ввод имени, камера
│  │  ├─ (couple)/dashboard/   # кабинет молодожёнов
│  │  └─ (admin)/admin/        # создание событий, заявки
│  ├─ _actions/                # серверные actions (лиды, и т.д.)
│  ├─ api/
│  │  ├─ guest/upload/         # загрузка фото от гостя
│  │  ├─ admin/qr-pdf/[id]/    # PDF с QR-кодами для печати
│  │  └─ couple/zip/[id]/      # streaming ZIP-альбома
│  └─ layout.tsx
├─ components/
│  ├─ marketing/               # секции лендинга
│  ├─ camera/                  # CameraView (getUserMedia + canvas)
│  └─ ui/                      # button, input, card
├─ lib/
│  ├─ supabase/                # browser + server клиенты
│  ├─ qr.ts                    # генерация QR
│  ├─ qr-pdf.tsx               # PDF-документ для печати
│  ├─ fingerprint.ts           # device id
│  └─ upload-queue.ts          # отправка фото на /api/guest/upload
├─ i18n/                       # routing, request, navigation для next-intl
├─ messages/                   # ru.json, uz.json
└─ middleware.ts
supabase/
└─ migrations/0001_init.sql    # схема БД + RLS-политики
```

## Что готово (фаза 1, скелет)

- Лендинг с hero, шагами, фичами, ценами и формой заявки (отправка в Telegram).
- Гостевой маршрут: splash → ввод имени → камера с превью, переснять, отправить, переключение фронт/тыл, торч.
- Лимит 20 фото / устройство через `localStorage` + сервер-проверку по `device_id`.
- Админ-логин по email-OTP, форма создания события, список свадеб + заявок.
- API: `/api/guest/upload` (multipart, валидация тарифа), `/api/admin/qr-pdf/[id]` (PDF), `/api/couple/zip/[id]` (стриминг).
- Кабинет пары: вход по SMS-OTP, список событий, кнопка скачать ZIP.
- Полная DB-схема + RLS под multi-tenant в `supabase/migrations/0001_init.sql`.

## Что дальше (фаза 2-4)

См. план в `~/.claude/plans/curious-strolling-lighthouse.md`. Ближайшие шаги:

1. **Запустить Supabase-проект** в облаке (или локально), применить миграцию,
   создать три storage-бакета: `event-photos`, `event-videos`, `event-assets`.
2. **Service Worker + IndexedDB-очередь** в `public/sw.js` для офлайн-загрузки.
3. **Live-слайдшоу** `/e/[id]/live` через Supabase Realtime.
4. **Видео-клипы** через `MediaRecorder` API в гостевой PWA.
5. **Кастом-брендинг события** — цвет, фото пары на splash, музыка в слайдшоу.
6. **Telegram-бот** для уведомлений пары о новых фото и таймере удаления.
7. **Геофенс** на upload-эндпоинте: блокировать загрузку вне радиуса.
8. **Self-serve чекаут**: Click / Payme интеграция, тариф-аплгрейд из кабинета.

## Полезные команды

```bash
pnpm dev          # дев-сервер с Turbopack
pnpm build        # прод-сборка
pnpm start        # запуск собранной версии
pnpm typecheck    # проверка типов без emit
pnpm lint         # ESLint
```
