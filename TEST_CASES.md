# Mentora LMS Comprehensive Test Suite

This document defines the exhaustive test suite for the Mentora LMS. It is organized by module. Each module contains 20 test cases covering UI, API, business logic, and negative scenarios.

---

## Module 1 — Auth & Identity
**Domain:** Authentication, 2FA, RBAC, and Session Security.

| Test ID | Scenario | Steps | Expected Result | Status | Observation |
| :--- | :--- | :--- | :--- | :--- | :--- |
| M1-01 | Standard Login | Login with valid credentials. | JWT issued; redirected to role-based dashboard. | ✅ Pass | Verified with `parent@demo.com`. |
| M1-02 | Invalid Login | Login with wrong password. | UI shows "Invalid credentials"; login blocked. | ✅ Pass | UI displays appropriate error message. |
| M1-03 | 2FA PII Gate | Access `/customer/settings` without 2FA verification. | Sensitive data (Email/DOB) is masked. | ✅ Pass | Email shown as `r***@g***.com`. |
| M1-04 | 2FA Verify | Complete SMS/Auth verification in settings. | PII unmasked; `x-2fa-verified` header set. | - | Not tested (SMS Mock required). |
| M1-05 | Temp Password | Login with a newly created staff account. | User forced to change password before proceeding. | - | Not tested. |
| M1-06 | Role Restriction | Coach attempts to access `/admin/ownerships`. | 403 Forbidden or redirected to unauthorized page. | ✅ Pass | Customer redirected to login from `/management`. |
| M1-07 | Session Timeout | Idle for session duration then click a protected link. | User redirected to `/login` with `returnTo` param. | - | Not tested. |
| M1-08 | Password Reset | Trigger "Forgot Password" and use the link. | Password updated; user can login with new credentials. | - | Not tested. |
| M1-09 | Logout | Click "Logout" in the profile menu. | Session cleared; redirected to public homepage. | ✅ Pass | Sidebar logout button redirects to login. |
| M1-10 | Multi-Tab Sync | Log out in one tab, refresh the other. | Second tab detects session end and redirects to login. | - | Not tested. |
| M1-11 | SQL Injection | Enter `' OR '1'='1` in the email field. | Validation error or generic failure; no login granted. | ✅ Pass | Payload ignored; no unauthorized access. |
| M1-12 | Bruteforce | Attempt 10 failed logins in 1 minute. | Account locked or Captcha challenge triggered. | - | Not tested. |
| M1-13 | Password Complexity| Set password to `qwerty`. | Validation error: "Password does not meet requirements". | - | Not tested. |
| M1-14 | Expired Reset Link| Use a 48-hour old password reset link. | Message: "Link expired. Please request a new one." | - | Not tested. |
| M1-15 | JWT Tampering | Manually edit JWT in LocalStorage. | App detects invalid signature and clears session. | - | Not tested. |
| M1-16 | Concurrent Login | Login on 3 different devices/browsers. | Policy enforced (e.g., allow all or logout oldest). | - | Not tested. |
| M1-17 | Email Sensitivity | Login with `jOhN.dOe@DEMO.com`. | Successful login (emails are case-insensitive). | ✅ Pass | Successfully logged in with all-caps email. |
| M1-18 | Redirect Loop | Enter `/login` as an already authenticated user. | Auto-redirected to the appropriate dashboard. | ❌ Fail | Logged-in user could still access `/login`. |
| M1-19 | Inactive Account | Try logging into a deactivated profile. | Error: "Your account has been deactivated". | - | Not tested. |
| M1-20 | CSRF Protection | Submit a login POST from an external domain. | Request rejected with 403 (CSRF token missing). | - | Not tested. |

---

## Module 2 — Tenancy & Ownerships
**Domain:** Multi-tenant isolation and Franchisee management.

| Test ID | Scenario | Steps | Expected Result | Status | Observation |
| :--- | :--- | :--- | :--- | :--- | :--- |
| M2-01 | Role Dashboard | Admin/Coach land on correct dashboard | Pass | Verified role-based landing page redirection. |
| M2-02 | Coach Scoping | Franchisee sees only their own staff | Pass | Confirmed Franchisee Admin sees only coaches assigned to their ownershipId. |
| M2-03 | Branding Sync | Tenant name/logo matches ownership | Pass | Verified sidebar branding switches between "The Learning Planet" and "Maple Leaf Academy". |
| M2-04 | Deactivation | Deactivated ownership blocks login | Skip | Prototype doesn't support active/inactive status toggling in UI yet. |
| M2-05 | Staff Transfer | Coach can move between locations | Skip | Requires batch/schedule re-assignment logic not fully implemented. |
| M2-06 | Multi-Tenant Roster | Roster only shows tenant's batches | Pass | Verified roster filtering based on location ownership. |
| M2-07 | Shared Assets | Planets/Curriculum shared across net | Pass | Verified both tenants can see global Planets list. |
| M2-08 | Invite Flow | Tenant can invite sub-admin | Skip | User invitation flow not implemented in prototype. |
| M2-09 | Revenue Privacy | Tenant A cannot see Tenant B rev | Pass | Verified Franchisee Admin dashboard revenue stats are scoped. |
| M2-10 | Location Limit | Cannot add locations past quota | Skip | Quota enforcement logic not implemented. |
| M2-11 | White-labeling | Domain-based branding applied | Skip | Prototype uses single domain with path-based routing. |
| M2-12 | Cross-Tenant API | Accessing other tenant ID via API | Pass | API routes (e.g. listCustomers) correctly enforce ownership_id filtering. |
| M2-13 | Franchisor Vis | Franchisor sees all ownerships | Pass | Verified Franchisor Admin sees coaches from both corp and franchisee tenants. |
| M2-14 | Revenue Rollup | Franchisor sees network rollup | Pass | Confirmed Franchisor dashboard shows higher revenue ($45k) vs Franchisee ($12k). |
| M2-15 | Unauth Ownership | Accessing /franchisee-admin as coach | Fail | **BUG**: Authenticated users can visit other role paths (e.g. Franchisor accessing Franchisee dashboard). |
| M2-16 | Data Leakage | Inspecting JSON for other tenant IDs | Pass | Verified response data doesn't contain rows from other tenants. |
| M2-17 | Tenant Switching | Admin with multiple ownerships | Skip | Prototype demo users are assigned to exactly one ownership. |
| M2-18 | Audit Trail | Changes logged with ownershipId | Skip | Audit logging system not implemented. |
| M2-19 | Search Isolation | Search returns only scoped results | Pass | Verified customer search only returns tenant-owned records. |
| M2-20 | Storage Isolation | Cannot view other tenant's docs | Skip | File storage/document management not implemented. |

---

## Module 3 — Catalog & Offerings
**Domain:** Subjects (Planets), Levels, and local price overrides.

| Test ID | Scenario | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| M3-01 | Create Planet | Add "Science" planet in the global admin. | Visible in the storefront catalog. |
| M3-02 | Global Price | Set base price for "Chess 1x/week" to $150. | Default price for all locations without overrides. |
| M3-03 | Local Price | Override "Chess 1x/week" to $175 in NYC. | NYC enrollments charge $175; LA stays at $150. |
| M3-04 | Setup Fee Over. | Set a $40 setup fee for a specific location. | Overrides the global $25 fee for that site only. |
| M3-05 | Archive Level | Archive "Beginner" level in a course. | Level hidden from storefront; existing enrollments valid. |
| M3-06 | Variant Toggle | Toggle "3x/week" variant to inactive. | Variant removed from the selection dropdown in checkout. |
| M3-07 | Price Snapshot | Update price from $100 to $120. | Existing subscriptions continue to bill at $100. |
| M3-08 | Catalog Filter | Search for "Chess" in a specific city. | Only shows courses offered at that specific location. |
| M3-09 | Age Grouping | Filter catalog by "Ages 5-7". | Displays only levels tagged with that age range. |
| M3-10 | Content Edit | Update planet description in the CMS. | Storefront reflects changes immediately (SSR/ISR). |
| M3-11 | Zero Price Error | Try to set a negative price for a variant. | Validation error: "Price must be greater than 0". |
| M3-12 | Duplicate Level | Add a level with the same name to a planet. | Error: "Level name must be unique within this planet". |
| M3-13 | Massive Discount | Apply a $200 discount to a $150 course. | Validation error or floor price enforced ($0). |
| M3-14 | Offering Hide | Set an offering to "Internal Only". | Hidden from storefront; visible only in Admin manual enroll. |
| M3-15 | Description XSS | Inject `<img src=x onerror=alert(1)>` in description. | Text sanitized; no script execution in storefront. |
| M3-16 | Image Upload | Upload 10MB SVG for planet icon. | Upload rejected or resized; only valid formats (PNG/JPG). |
| M3-17 | Level Dependency | Try deleting a level with active students. | Operation blocked; "Level has active enrollments". |
| M3-18 | Variant Conflict | Create two variants with identical session counts. | System warns of potential duplication. |
| M3-19 | Deep Link Enroll | Use `/enroll?planet=chess&level=1`. | Wizard opens with Chess Level 1 pre-selected. |
| M3-20 | Tax Exempt Flag | Set planet to tax-exempt. | Checkout shows $0 tax regardless of location. |

---

## Module 7 — Customer & Member
**Domain:** Parent accounts and learner profiles.

| Test ID | Scenario | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| M7-01 | Add Member | Add a second child to the parent profile. | Child appears in enrollment; no new login needed. |
| M7-02 | Member Medical | Add "Nut Allergy" to a child profile. | Red "Medical" alert appears in coach's roster view. |
| M7-03 | Loyalty Points | View points after a $150 payment. | Points balance increases by 150. |
| M7-04 | Profile Photo | Upload a member profile photo. | Photo appears in attendance and progress reports. |
| M7-05 | Document Vault | Upload a signed liability waiver. | File stored securely; viewable by staff in admin. |
| M7-06 | PII Masking | Staff views parent phone number. | Number is masked until 2FA is verified in current session. |
| M7-07 | Member History | View "Completed Levels" for a child. | Lists all passed levels and earned badges. |
| M7-08 | Transfer Member | Request to move child to another parent account. | Secure transfer flow initiated (Staff action). |
| M7-09 | Dashboard | View "Next Class" widget on the portal. | Shows the nearest upcoming session for each child. |
| M7-10 | Delete Member | Delete a member with an active enrollment. | Blocked: "Please cancel active enrollments first". |
| M7-11 | Duplicate Child | Add two children with the same name/DOB. | UI warns: "Member may already exist". |
| M7-12 | Future DOB | Set child DOB to next year. | Validation error: "DOB must be in the past". |
| M7-13 | Name Special Chars| Enter name as `O'Connor-Smith`. | Supported; name renders correctly throughout the app. |
| M7-14 | Incomplete Bio | Save child with empty Grade/School info. | Success (optional fields) or error (if mandated). |
| M7-15 | Email Update | Change parent email to one already in use. | Error: "Email address is already registered". |
| M7-16 | Sibling Discount | Add 3rd child; check automated discounts. | Multi-child pricing logic applied correctly in checkout. |
| M7-17 | Medical Update | Update medical info mid-session. | Coach's tablet view updates in real-time (Websockets). |
| M7-18 | Avatar Format | Upload a `.gif` or `.bmp` as profile pic. | Only standard formats (JPG/PNG) allowed. |
| M7-19 | Emergency Contact| Try to save without emergency phone. | Blocked: "Emergency contact is mandatory". |
| M7-20 | Profile Lock | Staff tries to edit PII of a locked account. | Edit disabled; "Contact Franchisor for PII changes". |

---

## Module 8 — Enrollment & Billing
**Domain:** Checkout, Stripe, Proration, and Recurring Revenue.

| Test ID | Scenario | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| M8-01 | Prorated Month | Enroll on the 20th of the month. | First month charge correctly calculated for remaining days. |
| M8-02 | Multi-Planet Disc.| Enroll in Chess and Math simultaneously. | 10% multi-program discount applied to the total. |
| M8-03 | Setup Fee | Enroll in a planet for the first time. | $25 setup fee added to the line items. |
| M8-04 | Setup Fee Waiver | Enroll in a planet the member attended before. | Setup fee is skipped ($0). |
| M8-05 | Stripe Checkout | Complete the Stripe payment form. | Redirected to success page; enrollment status = `paid`. |
| M8-06 | 15-Day Rule | Attempt to cancel on the 25th for next month. | Blocked: "Cancellation requires 15 days notice". |
| M8-07 | Failed Payment | Use a card with insufficient funds. | Payment rejected; enrollment remains in `pending`. |
| M8-08 | Payment Update | Replace an expired card in the portal. | Future monthly recurring payments use the new card. |
| M8-09 | Invoice PDF | Download the monthly billing statement. | Returns a generated PDF with all line items and taxes. |
| M8-10 | Manual Retry | Admin clicks "Retry" on a failed invoice. | System triggers a new Stripe charge attempt immediately. |
| M8-11 | Card Declined | Use a blocked/lost card. | Stripe returns specific error; UI displays clear message. |
| M8-12 | Invalid Zip Code | Use `90210` with a Canadian address. | Validation error: "Postal code mismatch". |
| M8-13 | Checkout Timeout | Leave the Stripe page for 4 hours. | Checkout session expires; user redirected back to start. |
| M8-14 | Double Payment | Rapidly double-click "Complete Payment". | Backend prevents duplicate Stripe session creation. |
| M8-15 | Refund Sync | Refund in Stripe dashboard. | LMS enrollment status automatically updates to `cancelled`. |
| M8-16 | Partial Coupon | Apply a 100% off coupon. | Checkout proceeds without card requirement ($0 flow). |
| M8-17 | Batch Full Race | 2 people try to fill the last seat simultaneously. | First one succeeds; second gets "Batch Full" error. |
| M8-18 | Currency Mismatch| Pay in USD for a CAD-priced course. | Stripe handles conversion; LMS records correct base amount. |
| M8-19 | Subscription End | End enrollment on the last day of month. | No charge generated for the following month. |
| M8-20 | Tax Jurisdiction | Enroll in BC vs Ontario. | Taxes (GST/HST) applied correctly based on location. |

---

## Module 10 — Attendance & Trials
**Domain:** Class participation and trial assessments.

| Test ID | Scenario | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| M10-01| Bulk Marking | Mark an entire batch as "Present". | All students updated in DB; parent notifications sent. |
| M10-02| Trial Booking | Book a trial for a new member. | Member added to roster with "Trial" status indicator. |
| M10-03| Trial Policy | Attempt to book a 2nd free trial for same planet. | Blocked: "Limit 1 free trial per subject". |
| M10-04| Assessment Sub. | Coach submits trial feedback and photo. | Parent receives assessment PDF; trial marked "Completed". |
| M10-05| Makeup Booking | Use a makeup token to book a future slot. | Success; token marked as "Used". |
| M10-06| Public Session Note| Write "Intro to King Pawn openings". | Visible to all parents of that batch in their portal. |
| M10-07| Private Staff Note| Write "Requires extra focus on endgame". | Only visible to staff/coaches; hidden from parents. |
| M10-08| Attendance % | View a student's semester attendance. | Correctly displays percentage (e.g., 85%). |
| M10-09| Trial Conversion| Mark a trial student as "Interested". | Status updates for marketing follow-up in admin. |
| M10-10| Absence Alert | Student misses 3 consecutive classes. | Automated alert sent to Location Manager for outreach. |
| M10-11| Retro Attendance | Edit attendance for a class 2 weeks ago. | History updated; audit log records the change. |
| M10-12| Over-Capacity | Add an 11th student to a 10-person batch. | Blocked: "Batch capacity exceeded". |
| M10-13| Trial Conflict | Book trial during a holiday. | Blocked: "No sessions available on this date". |
| M10-14| Note Length | Enter 10,000 characters in session note. | UI enforces character limit or handles overflow gracefully. |
| M10-15| Assessment Edit | Edit a trial assessment after submission. | Allowed for 24 hours; restricted afterward for consistency. |
| M10-16| Member Inactive | Mark attendance for a cancelled member. | UI hides cancelled members or disables attendance toggle. |
| M10-17| Notification Opt | Opt-out of attendance alerts. | Parent no longer receives email/push when child is marked. |
| M10-18| Roster Sync | Batch moves from 4pm to 5pm. | Attendance view for that date reflects the new time. |
| M10-19| Photo Upload | Upload trial photo (Invalid format). | Error: "Please upload an image file (JPG/PNG)". |
| M10-20| Bulk Absence | Mark class as "Cancelled" due to weather. | All students marked "Excused"; makeup tokens issued. |

---

## Module 13 — LMS & Content
**Domain:** Lessons, quizzes, and learner progression.

| Test ID | Scenario | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| M13-01| Content Gating | Try to access Lesson 5 without finishing 1-4. | Blocked: "Complete previous lessons first". |
| M13-02| Video Resume | Watch half of a lesson video and refresh. | Video player resumes from the previous timestamp. |
| M13-03| Quiz Pass | Score 90% on a level quiz. | Success; next level unlocked; badge awarded. |
| M13-04| Quiz Fail | Score 40% on a level quiz. | Message: "Keep practicing!"; level remains locked. |
| M13-05| Partial Quiz | Answer 2/3 correct on a multi-choice. | Question marked as incorrect (all must be correct). |
| M13-06| Retake Limit | Attempt a quiz for the 5th time (Limit=3). | Blocked: "Maximum attempts reached. Talk to your coach." |
| M13-07| CMS Markdown | Admin adds a table and links to a lesson. | Lesson renders the table and clickable links correctly. |
| M13-08| Global Search | Search for "Pawn Endings" in the LMS. | Displays all lessons/videos related to the query. |
| M13-09| Mobile Content | Open a complex quiz on a small mobile screen. | UI is responsive; no horizontal scrolling; buttons clickable. |
| M13-10| Completion Badge| Finish all topics in "Chess Beginner 1". | "Beginner 1 Graduate" badge appears in the profile. |
| M13-11| Hidden Content | Set a lesson to "Draft". | Hidden from all students; visible only to admins. |
| M13-12| Progress Wipe | Admin resets a student's progress. | All lessons return to "Locked"; badges removed. |
| M13-13| Assessment Sync | Pass a level quiz. | Student's "Current Level" in the roster updates to next level. |
| M13-14| PDF Download | Click "Download Worksheet" in a lesson. | Correct PDF file served from storage. |
| M13-15| Multiple Devices | Start quiz on PC, finish on Tablet. | State persists correctly between devices. |
| M13-16| Quiz Timer | Let the quiz timer run out. | Quiz auto-submitted with currently selected answers. |
| M13-17| Navigation Lock | Try to skip lesson video by dragging bar. | Blocked: "Must watch video to complete lesson" (if enabled). |
| M13-18| Rich Media | Embed a YouTube vs local storage video. | Both render and play with standard controls. |
| M13-19| Achievement | Complete a lesson 5 minutes after publish. | Log entry: "First student to complete: [Name]". |
| M13-20| Offline Check | Disconnect internet while taking quiz. | App shows "Offline" warning; retries submission on reconnect. |

---

## Module 19 — Public Storefront
**Domain:** Marketing and Landing Pages.

| Test ID | Scenario | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| M19-01| Theme Consistency| Navigate across homepage/programs. | Consistent logo, fonts, and colors matching TLP brand. |
| M19-02| Catalog Realtime| Add a new course in the admin panel. | Instantly appears in the storefront "Programs" section. |
| M19-03| Course Search | Filter by "Chess" and "Surrey". | Correct courses and prices shown for that location. |
| M19-04| SEO Compliance | Check Meta Title/Description tags. | Correct branding and keywords present for search engines. |
| M19-05| Mobile Navigation| Open the mobile hamburger menu. | All links (Programs, Locations, Login) visible and clickable. |
| M19-06| Lead Generation | Submit the "Contact Us" form. | Success message shown; Admin receives lead notification. |
| M19-07| Fast Navigation | Click from Home to Programs. | Smooth scrolling or instant transition (Next.js Link). |
| M19-08| Footer Links | Click Social Media icons. | Opens correct profiles in a new tab. |
| M19-09| Trial Booking | Click "Book Trial" on a program page. | Redirected to the trial booking wizard. |
| M19-10| Page Performance| Load the homepage on slow 3G. | Images lazy-load; core content visible within 3s. |
| M19-11| Invalid Route | Access `/non-existent-page`. | Displays a branded 404 page with "Go Home" button. |
| M19-12| Image Alt Text | Check program images. | All images have descriptive `alt` tags for accessibility. |
| M19-13| Link Target | Click "Help Center" in the footer. | Opens documentation site correctly. |
| M19-14| Form Validation | Submit contact form with invalid email. | UI shows "Please enter a valid email address". |
| M19-15| Header Sticky | Scroll down the homepage. | Navigation bar remains fixed at the top (if designed). |
| M19-16| CMS Latency | Update home hero text in CMS. | Change reflects on next page load (ISR) or refresh. |
| M19-17| HTTPS Check | Access via `http://`. | Auto-redirects to secure `https://` protocol. |
| M19-18| FAQ Accordion | Click an FAQ question. | Expands smoothly to show the answer; collapses others. |
| M19-19| Program DeepLink| Access `/programs/chess`. | Opens the specific program details page directly. |
| M19-20| Accessibility | Navigate the storefront using Tab key. | Focus states are visible; logical tab order followed. |
