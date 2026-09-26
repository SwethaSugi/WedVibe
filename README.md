# WedVibe — Modern Wedding Invitation Platform

Create and share beautiful digital wedding invitations through a live, shareable URL.

## Stack

- **Next.js 16** (App Router, TypeScript) — single app serves the customer site, editor,
  public invitation pages and the admin panel via `src/app/`.
- **Prisma** + SQLite for local development (`prisma/schema.prisma`). Point `DATABASE_URL`
  at Postgres/MySQL and change the `provider` in the schema for production.
- **Tailwind CSS 4** for styling.
- Provider abstractions for WhatsApp OTP, payments and file storage
  (`src/lib/providers/`) — each defaults to a "mock" mode so the whole flow runs without
  external credentials, and can be swapped for a real integration by env vars alone.

## Getting started

```bash
npm install
cp .env.example .env      # then fill in the values (see comments in the file)
npx prisma db push        # create the SQLite schema
npx prisma db seed        # templates + admin account
npm run dev
```

Open http://localhost:3000.

- Customer site: `/`, `/templates`, `/templates/[slug]`, `/login`, `/editor/[id]`,
  `/dashboard`, `/invite/[slug]`, `/custom-invitation`, `/contact`
- Policies: `/terms`, `/privacy`, `/refund-policy`
- Admin panel: `/admin/login` — the account comes from `ADMIN_USERNAME` / `ADMIN_PASSWORD`
  in `.env` when you seed. If `ADMIN_PASSWORD` is empty, the seed generates a random
  password and prints it once. There is no built-in default password.

`.env` holds secrets and is git-ignored — never commit it. In production `JWT_SECRET` is
required.

## Integrations

| Concern | Local / mock behaviour | Real integration |
| --- | --- | --- |
| WhatsApp OTP | OTP shown on screen in dev and logged to the console (refused in production) | `WHATSAPP_PROVIDER=meta` + `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_OTP_TEMPLATE` (Meta WhatsApp Cloud API, Authentication template) |
| Payments | Simulated checkout (refused in production) | `PAYMENT_PROVIDER=razorpay` with `PAYMENT_GATEWAY_KEY` / `PAYMENT_GATEWAY_SECRET` |
| Payment webhook | — | `RAZORPAY_WEBHOOK_SECRET`; point a Razorpay webhook (`payment.captured`, `order.paid`, `payment.failed`) at `/api/payments/webhook` |
| Image storage | Files saved under `public/uploads` | Set `STORAGE_PROVIDER` and implement it in `src/lib/providers/storage.ts` |

Payments are never trusted from the browser alone: `POST /api/payments/verify` checks
Razorpay's HMAC signature, and the webhook (also signature-checked) activates invitations
whose checkout never reported back. Both go through `src/lib/payment-activation.ts`, so an
invitation is activated exactly once.

## Adding a new template

Templates are reusable React components, not one-off pages:

1. Add a component under `src/templates/components/` that accepts `{ data: InvitationData }`.
2. Register it in `src/templates/renderer.tsx` under a unique `componentKey`.
3. Add a `Template` row (via `/admin/templates` or a Prisma seed) with that `componentKey`,
   name, category, price and preview image.

The editor, live preview, template marketplace and public invitation page all render
templates through the same `TemplateRenderer` — no other code changes are needed.

## Project structure

```
prisma/                  schema + seed script
src/
  app/                    routes (customer site, editor, dashboard, admin, API)
  components/             shared UI (Header, editor fields, admin shell)
  lib/                    auth, prisma client, invitation data types, provider adapters
  templates/               the template rendering engine + registered template components
```

## What's implemented vs. deferred

This build covers the full customer journey end-to-end (browse → preview → WhatsApp OTP /
PIN login → editor with live preview → image upload → payment (Razorpay or simulated) →
public URL → WhatsApp share → dashboard), custom design requests, policy pages, and an admin
panel (dashboard stats, template/user/invitation/payment/request management). Deferred for a
later phase: RSVP/guest list, background music, PDF/video invitations,
multi-language support, coupons, analytics beyond view counts, and a visual (no-code)
template builder — the architecture (JSON invitation data + a template registry) is built
to support all of these without a rewrite.

## Docker

```bash
docker compose up --build
```

`docker-compose.yml` provisions a Postgres database; update `DATABASE_URL` in `.env` and
`prisma/schema.prisma`'s `provider` to `postgresql` before deploying with it.
