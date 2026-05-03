# Mentora Prototype — Implementation Plan

_Last updated: 2026-05-03_

## Product context

**Mentora** is a multi-tenant SaaS LMS for learning academies. Tenants
(franchise organizations) host their public course catalog on Mentora and use
its authenticated app to run their operations (enrollment, attendance,
billing, content, reporting).

- **First two tenants seeded:** The Learning Planet (TLP) and Maple Leaf Academy
- **Source of truth for data shapes:** [Mentora_ER_Diagram.mermaid](Mentora_ER_Diagram.mermaid)
- **Source of truth for product requirements:** [Requirements/Design/user_stories.txt](Requirements/Design/user_stories.txt)
- **Source of truth for visual design:** [Requirements/Design/](Requirements/Design/) (HTML/JSX prototype + components)

## Scope of this prototype

**Frontend only, read-only.** No Supabase, no Stripe, no real auth. Mock data
is typed after the ER diagram and immutable — forms submit and visually
confirm but do not persist. To be wired to real backends in a later phase.

## Locked decisions

| Topic | Decision |
|---|---|
| Backend | None for prototype. Mock data only. |
| Auth | Mock login page with email + password (any password works); demo emails map to roles. **No session persistence** — refresh kicks back to login. |
| Role switching | No top-bar switcher. Log out, log back in as a different role. |
| State | React state only. No global store, no localStorage, no sessionStorage. |
| UI components | Hand-rolled in `components/ui/`. No shadcn, no MUI, no Radix. Pixel-match the prototype. |
| Tenant routing | Path-based: `/t/[tenant]/...` for the prototype. Subdomain/custom-domain deferred. |
| Tenant branding | Per-tenant logo + colors. Stored on the `Ownership` type (mock-data extension; ER diagram not yet edited). |
| Public storefront | Catalog browsing only — no public checkout, no public trial booking. CTA bounces to login. |
| Marketing home (`/`) | Lists demo tenants for prototype reviewers to try. |
| Phase scope | Build everything with a design mockup; design-consistent best-guess for ER-modeled features without a mockup; skip "Later Phase" items entirely. |

## Stack

- **Framework:** Next.js 16.2.2 (App Router, Turbopack) + React 19
- **Styling:** Tailwind 4 with custom `@theme` tokens
- **Font:** Nunito Sans (Google Fonts)
- **Brand colors:** navy `#0d1b3e`, teal `#0a9b8a`, amber `#f5a623`, light gray bg `#f4f6fa`
- **Icons:** inline SVG / emoji (matches the prototype)
- **No new dependencies** — staying with the current `package.json`

## Route map

```
app/
├── layout.tsx                          # root <html>, font, globals.css
├── page.tsx                            # marketing home: lists demo tenants
├── login/
│   └── page.tsx                        # email/password form, demo accounts listed inline
├── (app)/                              # role group: shared sidebar + topbar shell
│   ├── layout.tsx                      # role-aware sidebar
│   ├── customer/
│   │   ├── dashboard/page.tsx
│   │   ├── members/page.tsx
│   │   ├── enroll/page.tsx             # multi-step (planet → location → schedule → pay)
│   │   ├── lms/page.tsx                # learning portal + quiz
│   │   ├── payments/page.tsx
│   │   └── settings/page.tsx
│   ├── coach/
│   │   ├── dashboard/page.tsx
│   │   ├── sessions/page.tsx           # attendance modal
│   │   ├── students/page.tsx
│   │   ├── lms/page.tsx                # LMS content authoring
│   │   └── availability/page.tsx
│   ├── admin/                          # franchisor admin
│   │   ├── dashboard/page.tsx
│   │   ├── locations/page.tsx          # list + batch drill-down
│   │   ├── coaches/page.tsx
│   │   ├── customers/page.tsx
│   │   ├── roster/page.tsx             # list / calendar / by-coach views
│   │   ├── payments/page.tsx
│   │   ├── discounts/page.tsx
│   │   ├── holidays/page.tsx
│   │   └── planets/page.tsx
│   ├── franchisee-admin/
│   │   ├── dashboard/page.tsx
│   │   ├── locations/page.tsx
│   │   ├── coaches/page.tsx
│   │   ├── customers/page.tsx
│   │   ├── roster/page.tsx
│   │   ├── price-requests/page.tsx
│   │   └── tickets/page.tsx
│   └── management/
│       ├── dashboard/page.tsx
│       ├── revenue/page.tsx            # pivot: time × ownership × location × planet × level
│       ├── pricing/page.tsx            # franchisor: review/approve. franchisee: submit/track
│       ├── locations/page.tsx
│       └── reports/page.tsx
└── t/[tenant]/
    └── page.tsx                        # public storefront, one long scroll
```

## Mock data architecture

```
lib/
├── types.ts                            # TS types mirroring the ER diagram
├── mock/
│   ├── tenants.ts                      # TLP (purple/yellow), Maple Leaf Academy (teal/orange)
│   ├── locations.ts                    # 3-4 locations per tenant
│   ├── planets.ts                      # Chess, Math, English, Finance, Arts
│   ├── levels.ts                       # PP/RR for chess, Grade 1-10 for math, etc.
│   ├── courseVariants.ts               # 1x/2x/3x weekly per level w/ pricing
│   ├── batches.ts                      # day + start/end + capacity per location/level
│   ├── customers.ts                    # demo customer (Raj Sharma)
│   ├── members.ts                      # 2-3 members under the demo customer
│   ├── coaches.ts                      # 6 coaches incl. James Park (on leave)
│   ├── enrollments.ts                  # active enrollments for demo members
│   ├── roster.ts                       # next 2 weeks of assignments
│   ├── sessions.ts                     # historical sessions w/ attendance
│   ├── lmsContent.ts                   # Chess fully authored, others stubbed
│   ├── invoices.ts                     # paid + 1 missed payment
│   └── auth.ts                         # demo accounts → role mapping
└── theme/
    └── tokens.ts                       # design tokens + per-tenant brand overrides
```

Mock data is **immutable** — exported as `const`. Mutations from UI are no-ops.

## Components

```
components/
├── ui/                                 # primitives, hand-rolled
│   ├── Button.tsx                      # primary / secondary / ghost / destructive
│   ├── Card.tsx
│   ├── Modal.tsx                       # backdrop + dialog + focus trap
│   ├── Input.tsx
│   ├── Select.tsx
│   ├── Tabs.tsx
│   ├── Badge.tsx                       # planet badges, status pills
│   ├── ProgressBar.tsx
│   ├── Stepper.tsx                     # multi-step flow indicator
│   ├── EmptyState.tsx
│   └── StatTile.tsx
├── layout/
│   ├── AppShell.tsx                    # sidebar + topbar wrapper
│   ├── Sidebar.tsx                     # role-aware nav, collapsible
│   ├── TopBar.tsx                      # tenant logo, role badge, logout
│   └── PageHeader.tsx
└── shared/
    ├── PlanetIcon.tsx
    ├── CapacityChip.tsx
    ├── CoachChip.tsx
    └── BatchCard.tsx                   # reused on locations + roster
```

## Demo accounts

All passwords: `demo`

| Email | Role | Lands on |
|---|---|---|
| `parent@demo.com` | Customer | `/customer/dashboard` |
| `coach@demo.com` | Coach | `/coach/dashboard` |
| `franchisor.admin@demo.com` | Franchisor Admin | `/admin/dashboard` |
| `franchisee.admin@demo.com` | Franchisee Admin | `/franchisee-admin/dashboard` |
| `franchisor.mgmt@demo.com` | Franchisor Management | `/management/dashboard` |
| `franchisee.mgmt@demo.com` | Franchisee Management | `/management/dashboard` |

## Sprint plan

| # | Sprint | Deliverable |
|---|---|---|
| 1 | **Foundation** | Theme tokens, `Sidebar`, `TopBar`, `AppShell`, `Button`/`Card`/`Modal`/`Input`/`Select`, `lib/types.ts` from ER diagram |
| 2 | **Mock data + login + marketing home** | All `lib/mock/` files seeded; `/login` page; `/` lists demo tenants; redirect-to-role on login |
| 3 | **Customer flow** | Dashboard, Members, Enroll (multi-step), LMS portal, Payments, Settings |
| 4 | **Coach flow** | Dashboard, Sessions w/ attendance modal, Students, Availability, LMS authoring |
| 5 | **Admin (franchisor)** | Dashboard, Locations + Batch drill-down, Coaches, Customers, Roster (3 views), Payments, Discounts, Holidays, Planets |
| 6 | **Franchisee admin** | Subset of admin + Price Requests + Tickets |
| 7 | **Management** | Revenue pivot, Pricing approval/request, Locations, Reports |
| 8 | **Public storefront** | `/t/[tenant]` long-scroll w/ per-tenant branding |
| 9 | **Schema-only screens** | Events, Holidays, Tickets, Notifications, Achievements — design-consistent best-guess |
| 10 | **Polish pass** | Empty states, hover/focus states, responsive breakpoints, README |

## To revisit during development

- **Tenant URL strategy** — path-based works for prototype; production likely needs subdomain or custom-domain CNAME support. Discuss before going live.
- **Login → enrollment deep-link** — public storefront CTA needs a URL contract like `/login?next=/customer/enroll&course_variant=…`. Spec when sprint 8 lands.
- **Tenant branding fields** — added to mock `Ownership` type but not to the ER diagram. Sync when wiring the real schema.
- **Two admin variants and two management variants** — built as separate route groups to keep nav clean. Consider consolidation in sprint 10.
- **LMS authoring UX** — basic Planet → Level → Module → Topic + quiz builder for now; likely needs a dedicated design pass.
- **Responsive / mobile** — desktop-first. Breakpoints added in sprint 10, not per-screen mobile optimization.
- **Later Phase features** — SMS notifications, parent meet RSVP, coach↔parent messaging, badge unlocking, loyalty redemption — explicitly out of scope.
