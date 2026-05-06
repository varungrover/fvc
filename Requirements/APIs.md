# Mentora — API Route Specification

_Derived from: sprint 1–9 prototype pages + ER schema_
_Generated: 2026-05-04_

---

## Architecture

Each **brand** (e.g. The Learning Planet, Maple Leaf Academy) gets one Vercel deployment
and one Supabase database. Within that deployment, all ownerships coexist — the franchisor
(corporate) and all its franchisees, their locations, coaches, customers, and data.

```
The Learning Planet  →  Vercel A  +  Supabase DB A
Maple Leaf Academy   →  Vercel B  +  Supabase DB B
```

`ownership_id` is used within each DB to scope data between the corporate ownership and
franchisee ownerships. All roles (FA, FM, XA, XM, CO, CX) exist in the same DB and
deployment — there is no cross-deployment communication.

**Role abbreviations:**
- `CX` — Customer
- `CO` — Coach
- `FA` — Franchisor Admin
- `XA` — Franchisee Admin
- `FM` — Franchisor Management
- `XM` — Franchisee Management

Authentication is enforced on every route via JWT. Tenant scope (which brand's DB) is
determined by which deployment receives the request. Ownership scope within the DB is
enforced in route handler logic based on the caller's `ownership_id` claim in the JWT.

---

## 1. Auth

| Method | Path | Description | Roles |
|--------|------|-------------|-------|
| POST | `/api/auth/login` | Verify credentials, return JWT + role | Public |
| POST | `/api/auth/logout` | Invalidate session | All |
| GET | `/api/auth/me` | Return current user profile + role | All |
| POST | `/api/auth/change-password` | Change password (requires current password) | All |
| POST | `/api/auth/2fa/verify` | Verify 2FA token before exposing PII | CX, FA, XA |

---

## 2. Ownerships

| Method | Path | Description | Roles |
|--------|------|-------------|-------|
| GET | `/api/ownerships` | List all ownerships in this deployment | FA, FM |
| POST | `/api/ownerships` | Create an ownership (corporate or franchisee) | FA |
| GET | `/api/ownerships/:id` | Get single ownership details | FA, FM, XA, XM |
| PATCH | `/api/ownerships/:id` | Update name, email, active status | FA |

---

## 3. Locations

| Method | Path | Description | Roles |
|--------|------|-------------|-------|
| GET | `/api/locations?ownershipId=` | List locations (FA/FM see all; XA/XM see own only) | FA, FM, XA, XM, CO |
| POST | `/api/locations` | Create a location under an ownership | FA, XA |
| GET | `/api/locations/:id` | Get location details + stats | FA, FM, XA, XM, CO |
| PATCH | `/api/locations/:id` | Update name, address, active status | FA, XA |
| GET | `/api/locations/:id/offerings` | List course offerings enabled at this location | FA, XA, CO, CX |
| POST | `/api/locations/:id/offerings` | Enable a course variant at this location | FA, XA |
| PATCH | `/api/locations/:id/offerings/:offeringId` | Update price or active status of an offering | FA, XA |

---

## 4. Planets

| Method | Path | Description | Roles |
|--------|------|-------------|-------|
| GET | `/api/planets` | List all active planets | All |
| POST | `/api/planets` | Create a planet (e.g. Chess, Math) | FA |
| PATCH | `/api/planets/:id` | Edit name, description, active status | FA |
| DELETE | `/api/planets/:id` | Deactivate a planet | FA |

---

## 5. Levels

| Method | Path | Description | Roles |
|--------|------|-------------|-------|
| GET | `/api/levels?planetId=` | List levels under a planet | All |
| POST | `/api/levels` | Create a level under a planet | FA |
| PATCH | `/api/levels/:id` | Edit name, sort order, image, active status | FA |
| DELETE | `/api/levels/:id` | Deactivate a level | FA |

---

## 6. Course Variants

| Method | Path | Description | Roles |
|--------|------|-------------|-------|
| GET | `/api/course-variants?levelId=` | List variants (1x/2x/3x) with pricing | All |
| POST | `/api/course-variants` | Create a variant under a level | FA |
| PATCH | `/api/course-variants/:id` | Edit frequency, price, setup fee, active status | FA |
| DELETE | `/api/course-variants/:id` | Deactivate a variant | FA |

---

## 7. Batches

| Method | Path | Description | Roles |
|--------|------|-------------|-------|
| GET | `/api/batches?locationId=&levelId=` | List batches with capacity + enrolled count | All |
| POST | `/api/batches` | Create a recurring batch slot | FA, XA |
| PATCH | `/api/batches/:id` | Edit day, time, capacity, active status | FA, XA |
| DELETE | `/api/batches/:id` | Deactivate a batch | FA, XA |

---

## 8. Customers

| Method | Path | Description | Roles |
|--------|------|-------------|-------|
| GET | `/api/customers?ownershipId=` | List customers (FA sees all; XA sees own ownership) | FA, XA, FM, XM |
| POST | `/api/customers` | Create customer account | FA, XA, CX (self-register) |
| GET | `/api/customers/:id` | Get customer profile (PII masked unless 2FA passed) | CX (own), FA, XA |
| PATCH | `/api/customers/:id` | Update profile (PII fields require 2FA header) | CX (own), FA, XA |

---

## 9. Members

| Method | Path | Description | Roles |
|--------|------|-------------|-------|
| GET | `/api/members?customerId=` | List members under a customer | CX (own), FA, XA, CO |
| POST | `/api/members` | Add a member | CX, FA, XA |
| GET | `/api/members/:id` | Get member details (PII masked unless 2FA) | CX (own), FA, XA, CO |
| PATCH | `/api/members/:id` | Edit member profile (PII requires 2FA header) | CX (own), FA, XA |
| DELETE | `/api/members/:id` | Soft-delete a member | FA, XA |

---

## 10. Enrollments

| Method | Path | Description | Roles |
|--------|------|-------------|-------|
| GET | `/api/enrollments?customerId=` | List enrollments for a customer | CX (own), FA, XA |
| GET | `/api/enrollments?memberId=` | List enrollments for a member | CX (own), FA, XA, CO |
| GET | `/api/enrollments?batchId=` | List enrollments in a batch | FA, XA, CO |
| POST | `/api/enrollments` | Enroll a member (creates enrollment + batch links + invoice) | CX, FA, XA |
| PATCH | `/api/enrollments/:id` | Suspend or cancel an enrollment | FA, XA |
| GET | `/api/enrollments/:id/batches` | List batch slots for a multi-frequency enrollment | CX, FA, XA, CO |

---

## 11. Invoices & Payments

| Method | Path | Description | Roles |
|--------|------|-------------|-------|
| GET | `/api/invoices?customerId=` | List invoices for a customer | CX (own), FA, XA |
| GET | `/api/invoices?ownershipId=&status=` | List invoices across an ownership | FA, XA, FM, XM |
| GET | `/api/invoices/:id` | Get invoice with line items | CX (own), FA, XA |
| POST | `/api/invoices/:id/retry` | Retry a failed payment via Stripe | FA, XA |
| GET | `/api/payment-methods?customerId=` | List saved cards for a customer | CX (own), FA, XA |
| POST | `/api/payment-methods` | Add a payment method (Stripe redirect) | CX, FA, XA |
| PATCH | `/api/payment-methods/:id` | Set as default | CX (own), FA, XA |
| DELETE | `/api/payment-methods/:id` | Remove a card | CX (own), FA, XA |

---

## 12. Coaches (Staff)

| Method | Path | Description | Roles |
|--------|------|-------------|-------|
| GET | `/api/coaches?ownershipId=` | List coaches (FA sees all; XA sees own) | FA, XA, FM, XM |
| POST | `/api/coaches` | Create coach account + send temp-password email | FA, XA |
| GET | `/api/coaches/:id` | Get coach profile + planet assignments + status | FA, XA, CO (own) |
| PATCH | `/api/coaches/:id` | Edit details, planets, active status | FA, XA |
| GET | `/api/coaches/:id/availability` | Get weekly availability schedule | FA, XA, CO (own) |
| PUT | `/api/coaches/:id/availability` | Replace full availability schedule | CO (own), FA, XA |
| GET | `/api/coaches/:id/leaves` | List upcoming leaves | FA, XA, CO (own) |
| POST | `/api/coaches/:id/leaves` | Add a leave entry | CO (own), FA, XA |
| DELETE | `/api/coaches/:id/leaves/:leaveId` | Remove a leave entry | CO (own), FA, XA |

---

## 13. Roster

| Method | Path | Description | Roles |
|--------|------|-------------|-------|
| GET | `/api/rosters?locationId=&weekStartDate=` | Get roster for a location + week | FA, XA, CO |
| POST | `/api/rosters` | Create a roster for a location + week | FA, XA |
| POST | `/api/rosters/:id/publish` | Publish roster (visible to coaches) | FA, XA |
| GET | `/api/rosters/:id/assignments` | List all session assignments in a roster | FA, XA, CO |
| POST | `/api/rosters/:id/assignments` | Assign a coach to a batch/session slot | FA, XA |
| PATCH | `/api/rosters/:id/assignments/:assignmentId` | Reassign coach (absence cover) | FA, XA |
| DELETE | `/api/rosters/:id/assignments/:assignmentId` | Remove an assignment | FA, XA |

---

## 14. Sessions, Attendance & Notes

| Method | Path | Description | Roles |
|--------|------|-------------|-------|
| GET | `/api/sessions?coachId=&from=&to=` | List sessions for a coach | CO, FA, XA |
| GET | `/api/sessions?batchId=` | List sessions for a batch (historical) | FA, XA, CO |
| GET | `/api/sessions/:id/attendance` | Get attendance sheet for a session | CO, FA, XA |
| PATCH | `/api/sessions/:id/attendance` | Bulk-mark attendance | CO |
| GET | `/api/sessions/:id/notes` | Get session-level notes | CO, FA, XA |
| POST | `/api/sessions/:id/notes` | Create session note | CO |
| PATCH | `/api/sessions/:id/notes/:noteId` | Edit session note | CO |
| GET | `/api/sessions/:id/member-notes` | Get per-member private notes | CO, FA, XA |
| POST | `/api/sessions/:id/member-notes` | Add per-member note | CO |

---

## 15. Trials

| Method | Path | Description | Roles |
|--------|------|-------------|-------|
| GET | `/api/trials?memberId=` | List trials for a member | CX (own), FA, XA, CO |
| POST | `/api/trials` | Book a free trial slot | CX, FA, XA |
| PATCH | `/api/trials/:id` | Update status (completed, no_show, converted) | CO, FA, XA |
| POST | `/api/trials/:id/assessment` | Submit trial assessment + batch recommendation | CO |
| GET | `/api/trials/:id/assessment` | Get assessment (visible to admin + parent dashboard) | CX (own), FA, XA |

---

## 16. Events & Registrations

| Method | Path | Description | Roles |
|--------|------|-------------|-------|
| GET | `/api/events?ownershipId=&type=` | List events (FA sees all; XA sees own) | All |
| POST | `/api/events` | Create an event / tournament / camp | FA, XA |
| PATCH | `/api/events/:id` | Edit event details, capacity, pricing | FA, XA |
| DELETE | `/api/events/:id` | Cancel or remove event | FA, XA |
| GET | `/api/events/:id/registrations` | List registrations for an event | FA, XA |
| POST | `/api/events/:id/registrations` | Register a member (creates invoice) | CX, FA, XA |
| DELETE | `/api/events/:id/registrations/:regId` | Cancel registration | CX (own), FA, XA |

---

## 17. Discounts (Multi-planet)

| Method | Path | Description | Roles |
|--------|------|-------------|-------|
| GET | `/api/discounts` | List discount tiers | FA, FM |
| POST | `/api/discounts` | Create a discount tier | FA |
| PATCH | `/api/discounts/:id` | Edit discount percentage for a tier | FA |
| DELETE | `/api/discounts/:id` | Remove a discount tier | FA |

---

## 18. Holidays

| Method | Path | Description | Roles |
|--------|------|-------------|-------|
| GET | `/api/holidays?ownershipId=&locationId=` | List holidays (FA sees all; XA sees own) | FA, XA, CO |
| POST | `/api/holidays` | Add a holiday date | FA, XA |
| DELETE | `/api/holidays/:id` | Remove a holiday date | FA, XA |

---

## 19. Price Change Requests

| Method | Path | Description | Roles |
|--------|------|-------------|-------|
| GET | `/api/price-requests?status=` | List requests (FA/FM see all; XA/XM see own) | FA, XA, FM, XM |
| POST | `/api/price-requests` | Submit a price change request | XA, XM |
| POST | `/api/price-requests/:id/attachments` | Attach a supporting document | XA, XM |
| PATCH | `/api/price-requests/:id/review` | Approve or reject a request | FA, FM |

---

## 20. Support Tickets

| Method | Path | Description | Roles |
|--------|------|-------------|-------|
| GET | `/api/tickets?ownershipId=` | List tickets (FA sees all; XA sees own) | FA, XA, FM, XM |
| POST | `/api/tickets` | Raise an IT or Non-IT ticket | FA, XA, FM, XM |
| PATCH | `/api/tickets/:id` | Update ticket status | FA, FM |

---

## 21. Notifications

| Method | Path | Description | Roles |
|--------|------|-------------|-------|
| GET | `/api/notifications` | List notifications for the current user | All |
| PATCH | `/api/notifications/:id` | Mark a notification as read | All |
| POST | `/api/notifications/read-all` | Mark all notifications read | All |

---

## 22. LMS — Content

| Method | Path | Description | Roles |
|--------|------|-------------|-------|
| GET | `/api/lms/modules?levelId=` | List modules (published only for CX; all for CO/admin) | CX, CO, FA, XA |
| POST | `/api/lms/modules` | Create a draft module | CO |
| PATCH | `/api/lms/modules/:id` | Edit title, sort order, publish status | CO, FA |
| DELETE | `/api/lms/modules/:id` | Remove a module | FA |
| GET | `/api/lms/modules/:id/topics` | List topics under a module | CX, CO, FA, XA |
| POST | `/api/lms/modules/:id/topics` | Create a topic (text / PDF / YouTube) | CO |
| PATCH | `/api/lms/topics/:id` | Edit content, type, publish status | CO, FA |
| DELETE | `/api/lms/topics/:id` | Remove a topic | FA |

---

## 23. LMS — Quizzes

| Method | Path | Description | Roles |
|--------|------|-------------|-------|
| GET | `/api/lms/quizzes?moduleId=` | List quizzes for a module | CX, CO, FA, XA |
| POST | `/api/lms/quizzes` | Create a quiz | CO |
| PATCH | `/api/lms/quizzes/:id` | Edit title, passing score | CO, FA |
| POST | `/api/lms/quizzes/:id/questions` | Add a question + answer options | CO |
| PATCH | `/api/lms/questions/:id` | Edit question text or options | CO |
| DELETE | `/api/lms/questions/:id` | Remove a question | CO |
| POST | `/api/lms/quizzes/:id/attempts` | Submit attempt (score calculated server-side) | CX |
| GET | `/api/lms/attempts?memberId=&quizId=` | Get attempt history for a member | CX (own), CO, FA, XA |

---

## 24. Achievements

| Method | Path | Description | Roles |
|--------|------|-------------|-------|
| GET | `/api/achievements?memberId=` | List achievements for a member | CX (own), CO, FA, XA |
| POST | `/api/achievements` | Award a badge to a member | CO, FA, XA |

---

## 25. Reports

All report endpoints return JSON. Append `?format=csv` for CSV export.

| Method | Path | Description | Roles |
|--------|------|-------------|-------|
| GET | `/api/reports/revenue` | Revenue pivot: time × ownership × location × planet × level | FM, XM, FA, XA |
| GET | `/api/reports/enrollments` | Enrollment counts by course, location, ownership | FM, XM, FA, XA |
| GET | `/api/reports/failed-registrations` | Enrollment attempts blocked by full batches | FM, XM, FA, XA |
| GET | `/api/reports/attendance` | Attendance rate by coach, batch, location, period | FM, XM, FA, XA |

**Common query params:** `ownershipId`, `locationId`, `planetId`, `levelId`, `from` (YYYY-MM-DD), `to` (YYYY-MM-DD)

> FM and FA see the full network (all ownerships). XM and XA see only their own ownership.
> Enforced server-side by comparing `ownershipId` param against the caller's JWT claim.

---

## 26. Public Storefront

Unauthenticated. Served by `/t/[tenant]/page.tsx`.

| Method | Path | Description | Roles |
|--------|------|-------------|-------|
| GET | `/api/public/storefront` | Brand info, logo, colors for this deployment | Public |
| GET | `/api/public/planets` | Planets + levels + pricing for the storefront | Public |
| GET | `/api/public/events` | Upcoming public events | Public |

---

## Summary

| Section | Routes |
|---------|--------|
| Auth | 5 |
| Ownerships | 4 |
| Locations + Offerings | 7 |
| Planets | 4 |
| Levels | 4 |
| Course Variants | 4 |
| Batches | 4 |
| Customers | 4 |
| Members | 5 |
| Enrollments | 6 |
| Invoices + Payments | 8 |
| Coaches + Availability + Leaves | 9 |
| Roster + Assignments | 7 |
| Sessions + Attendance + Notes | 9 |
| Trials | 5 |
| Events + Registrations | 7 |
| Discounts | 4 |
| Holidays | 3 |
| Price Change Requests | 4 |
| Support Tickets | 3 |
| Notifications | 3 |
| LMS Content | 8 |
| LMS Quizzes + Attempts | 8 |
| Achievements | 2 |
| Reports | 4 |
| Public Storefront | 3 |
| **Total** | **136** |
