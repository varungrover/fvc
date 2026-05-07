# Mentora LMS Comprehensive Test Suite

This document defines the exhaustive test suite for the Mentora LMS. It is organized by module as defined in the **Project Delivery Map**. Each module contains 10+ test cases covering UI, API, and core business logic.

---

## Module 1 — Auth & Identity
**Domain:** Authentication, 2FA, RBAC, and Session Security.

| Test ID | Scenario | Steps | API / Logic | Expected Result |
| :--- | :--- | :--- | :--- | :--- |
| M1-01 | Standard Login | Login with valid credentials. | `POST /api/auth/login` | JWT issued; redirected to role-based landing page. |
| M1-02 | Invalid Login | Login with wrong password. | Error Handling | UI shows "Invalid credentials"; 401 response. |
| M1-03 | 2FA PII Gate | Access `/customer/settings` (No 2FA). | Middleware | Email/DOB masked (e.g., `v***@g***.com`). |
| M1-04 | 2FA Verify | Complete SMS/Auth verification. | `POST /api/auth/2fa/verify` | Header `x-2fa-verified: true`; PII unmasked. |
| M1-05 | Temp Password | Login with newly created staff account. | `profiles.is_temporary` | User redirected to mandatory password change screen. |
| M1-06 | Role Restriction | Coach tries to access `/admin/ownerships`.| RBAC | Redirected to `/unauthorized` or 403 Forbidden. |
| M1-07 | Session Timeout | Let session expire and click a link. | JWT Expiry | User redirected to `/login` with `returnTo` param. |
| M1-08 | Password Reset | Trigger "Forgot Password" flow. | `POST /api/auth/reset` | Email sent; link allows password update without old pw. |
| M1-09 | Logout | Click "Logout" in profile menu. | Auth Cleanup | Cookies cleared; redirected to public homepage. |
| M1-10 | Multi-Tab Sync | Log out in one tab, refresh the other. | Auth State | Second tab detects logged-out state and redirects. |

---

## Module 2 — Tenancy & Ownerships
**Domain:** Multi-tenant isolation and Franchisee management.

| Test ID | Scenario | Steps | API / Logic | Expected Result |
| :--- | :--- | :--- | :--- | :--- |
| M2-01 | Create Ownership| FA creates a new Franchisee entity. | `POST /api/ownerships` | Record created; temporary manager account generated. |
| M2-02 | Data Leak Check | XA-1 views members of Ownership-2. | Scoping Logic | API returns 404 or empty; no cross-tenant leakage. |
| M2-03 | Branding Sync | Update Ownership colors in Admin. | `brand_config` | Storefront `/t/slug` updates primary colors immediately. |
| M2-04 | Deactivation | FA deactivates a Franchisee. | `ownerships.status` | All staff and customers of that entity lose access. |
| M2-05 | Local Holiday | XA adds a location-specific holiday. | `locations_holidays` | Roster generator skips this date for that location only. |
| M2-06 | Corp Holiday | FA adds a global corporate holiday. | `holidays` | All rosters across all ownerships skip this date. |
| M2-07 | Staff Scoping | FA views all staff across all locations. | FA Access Level | Full list shown; can filter by Ownership. |
| M2-08 | Dashboard Stats | XA views monthly revenue on dashboard. | Ownership Filter | Stats only include revenue from their specific entity. |
| M2-09 | Planet Access | FA restricts a Planet for a Franchisee. | `ownership_planets` | Franchisee cannot enroll members in that Planet. |
| M2-10 | Manager Update | Change the Manager Email for an Ownership.| Profile Logic | New manager receives a "Claim Account" invitation. |

---

## Module 3 — Catalog & Offerings
**Domain:** Subjects (Planets), Levels, and local price overrides.

| Test ID | Scenario | Steps | API / Logic | Expected Result |
| :--- | :--- | :--- | :--- | :--- |
| M3-01 | Create Planet | FA adds "Science" subject. | `POST /api/planets` | Visible in catalog; default $25 setup fee applies. |
| M3-02 | Global Price | FA sets Chess 1x/week base to $150. | `course_variants` | Default price for all new locations. |
| M3-03 | Local Price | XA overrides Chess 1x to $175 in NYC. | `offerings` Override | NYC enrollments charge $175; global remains $150. |
| M3-04 | Setup Fee Over. | XA sets a $40 setup fee for NYC Math. | `location_offerings` | Overrides the global $25 fee for this site. |
| M3-05 | Archive Level | FA archives "Beginner" level. | `levels.status` | Hidden from new enrollments; existing stay active. |
| M3-06 | Variant Toggle | Toggle "3x/week" variant to inactive. | `variants.is_active` | Removed from storefront selection immediately. |
| M3-07 | Price Snapshot | Change global price from $100 to $120. | Snapshot Logic | Existing active enrollments stay at $100. |
| M3-08 | Catalog Filter | Search for "Chess" in "Vancouver". | Catalog API | Only Chess levels offered in Vancouver are returned. |
| M3-09 | Age Grouping | View course variants by age (5-7). | Level Metadata | Levels tagged with 5-7 age range appear. |
| M3-10 | Description Edit| Update Planet description in CMS. | `planets.description`| Storefront details page reflects changes. |

---

## Module 5 — Scheduling & Batches
**Domain:** Recurring class slots and seat capacity.

| Test ID | Scenario | Steps | API / Logic | Expected Result |
| :--- | :--- | :--- | :--- | :--- |
| M5-01 | Create Batch | Add "Tues 4PM Math" batch. | `POST /api/batches` | Appears in enrollment slot selection. |
| M5-02 | Capacity Block | Enroll 7th student in 6-seat batch. | `max_capacity` | API returns "Batch Full" error; UI disables slot. |
| M5-03 | Multi-Freq Slot | Select 1 slot for 2x/week variant. | Validation Logic | UI prevents proceeding; must select exactly 2 slots. |
| M5-04 | Batch Overlap | Assign Coach to two 4PM batches. | Conflict Logic | System warns "Coach already assigned to another slot". |
| M5-05 | Room Overlap | Assign two batches to "Room A" @ 4PM. | Conflict Logic | System warns "Room already in use". |
| M5-06 | Slot Transition | Move batch from Tues 4PM to Wed 4PM. | `roster_assignments`| All student sessions for future dates are moved. |
| M5-07 | Batch Filter | View batches with < 2 seats remaining. | Capacity Filter | Quick view for XA to find slots needing marketing. |
| M5-08 | Start/End Dates | Create batch starting next month. | Date Range Logic | Not visible for current month attendance/roster. |
| M5-09 | Batch Deletion | Delete batch with active students. | Constraint | Blocked; must move students to other batches first. |
| M5-10 | Coach Selection| Filter coach list by Batch Planet. | `staff_planets` | Only Chess-qualified coaches appear for Chess batches. |

---

## Module 6 — Coach & Staff
**Domain:** Staff profiles, qualifications, and leave.

| Test ID | Scenario | Steps | API / Logic | Expected Result |
| :--- | :--- | :--- | :--- | :--- |
| M6-01 | Profile Update | Coach updates phone number. | `PATCH /api/profiles` | DB updated; visible to XA in roster views. |
| M6-02 | Qualify Coach | FA assigns "Math" to Coach John. | `staff_planets` | John now appears in Math batch assignment dropdowns. |
| M6-03 | Leave Request | Coach submits leave for Dec 20-25. | `POST /api/leaves` | Status set to `pending`; notified to XA. |
| M6-04 | Leave Conflict | XA assigns on-leave coach to a batch. | Leave Overlap | UI shows "On Leave" warning on the specific dates. |
| M6-05 | Availability | Coach sets "Mondays: 4PM-8PM". | `availability` | Roster auto-generator only suggests for Mon slots. |
| M6-06 | Session History | Coach views list of past classes. | `attendance` Join | Shows student counts and topics covered per date. |
| M6-07 | Staff Document | Upload "First Aid Certificate". | `staff_docs` | Saved in Supabase Storage; expiry date tracked. |
| M6-08 | 2FA for Staff | Coach accesses student allergy info. | 2FA Gate | Forced to verify via SMS if not done in last 2 hours. |
| M6-09 | Dashboard | View "Upcoming Sessions" widget. | Roster Sync | Shows next 3 sessions with student roster links. |
| M6-10 | Termination | XA deactivates a coach account. | `profiles.status` | Immediate logout; removed from all future roster dropdowns. |

---

## Module 7 — Customer & Member
**Domain:** Parent accounts and learner profiles.

| Test ID | Scenario | Steps | API / Logic | Expected Result |
| :--- | :--- | :--- | :--- | :--- |
| M7-01 | Add Member | CX adds 2nd child to profile. | `POST /api/members` | Child appears in enrollment dropdown; no extra login. |
| M7-02 | Member Medical | Update "Peanut Allergy" for child. | `members.medical` | Visible as "Red Flag" icon in Coach's class roster. |
| M7-03 | Loyalty Points | Parent views points after payment. | DB Trigger | 1 point per $1 spent; history log shows increments. |
| M7-04 | Profile Photo | Upload member photo. | Supabase Storage | Thumbnail appears in coach's attendance view. |
| M7-05 | Document Vault | Upload signed "Liability Waiver". | `customer_docs` | Tracked against parent profile; XA can verify. |
| M7-06 | PII Masking | Guest views parent email in Admin. | Security Check | Masked unless 2FA is verified in current session. |
| M7-07 | Member History | View "Completed Courses" for child. | LMS Progress Join | Shows badges/certificates earned across planets. |
| M7-08 | Transfer Member| Move member to a different parent. | ID Re-assignment | All attendance/LMS progress stays with the child. |
| M7-09 | Dashboard | View "Next Class" for each child. | Attendance Join | Shows Date, Time, and Location for each member. |
| M7-10 | Delete Member | Delete child with active enrollment. | Constraint | Blocked; must cancel enrollment first. |

---

## Module 8 — Enrollment & Billing
**Domain:** Checkout, Stripe, Proration, and Recurring Revenue.

| Test ID | Scenario | Steps | API / Logic | Expected Result |
| :--- | :--- | :--- | :--- | :--- |
| M8-01 | Prorated Month | Enroll on the 15th of 30-day month. | `computeFirstMonth`| First charge = (Monthly Price / 30) * 16. |
| M8-02 | Multi-Planet Dis.| Enroll in a 2nd Planet. | `computeDiscount` | 10% discount applied to the 2nd line item. |
| M8-03 | Setup Fee | Enroll in a new Planet. | `planet_setup_fees`| $25 fee added if member never attended this planet. |
| M8-04 | Setup Fee Waiver| Enroll in a planet previously attended.| Check exists | Setup fee is skipped ($0). |
| M8-05 | Stripe Checkout | Submit payment for enrollment. | Stripe PI | Status set to `pending`; `paid` upon webhook success. |
| M8-06 | 15-Day Rule | Cancel on June 25 for July 1 billing. | Date Validation | Request blocked; notice must be > 15 days. |
| M8-07 | Failed Payment | Stripe payment fails (insufficient funds).| Webhook `failed` | Invoice status = `failed`; customer notified. |
| M8-08 | Payment Update | Add new default credit card. | Stripe SDK | Future monthly invoices use the new PM ID. |
| M8-09 | Invoice PDF | Click "Download Invoice". | PDF Generation | Returns valid PDF with items, taxes, and totals. |
| M8-10 | Retry Flow | XA clicks "Retry" on a failed invoice. | `POST /retry` | System re-attempts Stripe charge immediately. |

---

## Module 9 — Roster
**Domain:** Staff scheduling and class management.

| Test ID | Scenario | Steps | API / Logic | Expected Result |
| :--- | :--- | :--- | :--- | :--- |
| M9-01 | Auto-Gen Draft | Trigger roster for next week. | Suggestion Engine | Draft created based on Coach Availability + Quals. |
| M9-02 | Conflict Flag | Assign coach to overlapping batches. | Collision Logic | Red warning in UI; save blocked or flagged. |
| M9-03 | Publish Roster | Set draft status to `published`. | Status Logic | Coaches receive push/email alerts for their sessions. |
| M9-04 | Sub Assignment | Assign a different coach for one session.| `roster_overrides` | Only that specific date is changed; recurring stays same. |
| M9-05 | Print Roster | Generate PDF of today's schedule. | Print View | Clean layout with Coach, Batch, and Room columns. |
| M9-06 | Attendance Rate | View "Expected vs Present" in roster. | Attendance Count | Summary stats shown per session in the roster list. |
| M9-07 | Room Assignment | Assign "Batch 1" to "Room 2". | Room Logic | Prevents assigning "Batch 2" to "Room 2" at same time. |
| M9-08 | View Scoping | Coach views their weekly schedule. | `coach_id` Filter | Only sessions where they are assigned are visible. |
| M9-09 | Bulk Edit | Move all Monday classes to 5PM. | Batch Update | All associated roster assignments shifted in one go. |
| M9-10 | Historical View | Look back at Roster for 3 months ago. | Time-travel query | Correct data (who taught what) is preserved. |

---

## Module 10 — Attendance & Trials
**Domain:** Class participation and trial assessments.

| Test ID | Scenario | Steps | API / Logic | Expected Result |
| :--- | :--- | :--- | :--- | :--- |
| M10-01| Bulk Marking | Mark 10 students "Present" at once. | `POST /bulk-update`| DB updated; parent notifications triggered. |
| M10-02| Trial Booking | Book a "Free Trial" via wizard. | `status = trial` | Student added to roster with "Trial" badge. |
| M10-03| Trial Policy | Book 2nd free trial for Chess. | Trial Gating | Blocked; member already had a trial for this planet. |
| M10-04| Assessment Sub. | Coach submits trial feedback + photo. | `trial_assessment`| PDF/Link emailed to parent; trial status = `completed`. |
| M10-05| Makeup Booking | Parent books makeup for an absence. | Makeup Token | Only allowed if they have an unused "Absence" token. |
| M10-06| Public Notes | Coach writes "Topic: Arrays". | `session_notes` | Visible to parents in their dashboard. |
| M10-07| Private Notes | Coach writes "Student struggled today".| `member_notes` | Only visible to coaches and staff; hidden from parent. |
| M10-08| Attendance % | View member's overall attendance rate. | Aggregation | UI shows percentage (e.g., 92%) over lifetime. |
| M10-09| Trial Conversion| Mark trial as "Enrolled". | Status Logic | Trial record linked to new enrollment for ROI tracking. |
| M10-10| Absence Alert | Student missed 3 classes in a row. | Automation Trigger| XA receives alert to call the parent. |

---

## Module 13 — LMS & Content
**Domain:** Lessons, quizzes, and learner progression.

| Test ID | Scenario | Steps | API / Logic | Expected Result |
| :--- | :--- | :--- | :--- | :--- |
| M13-01| Content Gating | Access Topic 2 (Topic 1 incomplete). | Gating Middleware | Blocked; must finish Topic 1 first. |
| M13-02| Video Tracking | Watch 50% of a video. | `lms_progress` | Refreshing page resumes video at 50%. |
| M13-03| Quiz (Single) | Pass quiz with 100% correct. | Grading Logic | Score recorded; next Topic unlocked. |
| M13-04| Quiz (Fail) | Fail quiz (score < 80%). | Grading Logic | Score recorded; "Try Again" button shown; Next Topic locked. |
| M13-05| Quiz (Multi) | Answer quiz with 2/3 correct options. | Partial Credit | Graded as Incorrect (must select all correct). |
| M13-06| Retake Limit | Attempt quiz 4th time (Limit = 3). | `retake_policy` | Blocked; message "Contact coach to unlock quiz". |
| M13-07| CMS Markdown | Admin edits lesson text with Bold/Links.| Render Logic | Lessons display formatted text correctly. |
| M13-08| Search Content | Search for "Pawn Endings". | Search Index | Returns relevant Chess Level lessons. |
| M13-09| Mobile Lesson | Open lesson on iPhone. | Responsive CSS | Video and text scale; sidebar collapses correctly. |
| M13-10| Badge Award | Complete all topics in a Planet Level. | Badge Logic | "Level 1 Certified" badge appears in profile. |

---

## Module 15 — Notifications
**Domain:** Alerts and event-driven communication.

| Test ID | Scenario | Steps | API / Logic | Expected Result |
| :--- | :--- | :--- | :--- | :--- |
| M15-01| Billing Alert | Stripe payment fails. | Webhook Trigger | Parent receives "Action Required" notification. |
| M15-02| Roster Alert | Roster published. | Publish Trigger | Coach receives "New Schedule" notification. |
| M15-03| Enrollment Conf.| Complete checkout. | Post-Enrollment | Email sent with batch details and link to portal. |
| M15-04| In-App Read | Click a notification in the bell menu. | `mark_as_read` | Count decrements; item styling changes. |
| M15-05| Preferences | Opt-out of SMS marketing. | `user_settings` | Automation engine skips SMS for this user. |
| M15-06| Broadcast | FA sends "Holiday Notice" to all users. | Global Notification| Every logged-in user sees a banner or alert. |
| M15-07| Expiry Alert | Credit card expires in 30 days. | Date Scan Cron | "Update Payment Method" alert appears. |
| M15-08| Trial Reminder | 24 hours before a trial session. | Cron Trigger | Parent and Coach receive reminders. |
| M15-09| Quiz Pass Alert| Student passes level final. | Event Trigger | Parent notified of child's achievement. |
| M15-10| Emergency Alert| XA triggers "Location Closed today". | Realtime Push | All affected parents receive instant push/SMS. |

---

## Module 16 — Reporting
**Domain:** Dashboards and management data.

| Test ID | Scenario | Steps | API / Logic | Expected Result |
| :--- | :--- | :--- | :--- | :--- |
| M16-01| Revenue Report | View revenue by Location + Month. | Aggregation API | Accurate totals shown with drill-down to line items. |
| M16-02| Enrollment ROI | View "Trial to Enrollment" % report. | Conversion Logic | Shows which locations have highest conversion rate. |
| M16-03| Absence Report | View students with < 50% attendance. | Filtered Query | Actionable list for XA to contact parents. |
| M16-04| Capacity Report | View all batches with > 1 seat free. | Capacity Scan | Marketing team sees which slots to promote. |
| M16-05| CSV Export | Click "Export to CSV" on Staff report. | Stream Logic | Downloads file compatible with Excel/Sheets. |
| M16-06| Failed Log | View `enrollment_attempt` failures. | Log Table | Shows date/time when someone tried to join a full batch. |
| M16-07| Performance | View average Quiz scores by Location. | LMS Aggregation | Highlights levels/locations needing instructor focus. |
| M16-08| Churn Report | View cancellations in last 30 days. | `cancelled_at` | Shows count and reasons provided by parents. |
| M16-09| Staff Hours | View coach hours taught this month. | Attendance Join | Used for payroll verification. |
| M16-10| Chart Inter. | Hover over bar chart in Admin. | Tooltip Logic | Shows specific data point details (Recharts). |

---

## Module 19 — Public Storefront
**Domain:** Marketing and Landing Pages.

| Test ID | Scenario | Steps | API / Logic | Expected Result |
| :--- | :--- | :--- | :--- | :--- |
| M19-01| Tenant URL | Navigate to `/t/maple-academy`. | URL Parsing | Shows Maple Academy logo, colors, and specific location list. |
| M19-02| Catalog Sync | FA adds a Planet in Admin. | Realtime/SSR | Instantly appears in the storefront catalog. |
| M19-03| Course Search | Search for "Chess" in storefront. | Search Filter | Correct levels shown; metadata (Price/Age) matches Admin. |
| M19-04| SEO Metadata | View Page Source on a Level page. | Meta Tag Logic | Correct Title and OG tags for social sharing. |
| M19-05| Mobile Nav | Open menu on a phone. | Hamburger UI | Smooth transition; all links (Planets/Contact) accessible. |
| M19-06| Contact Form | Submit "Request Info" form. | Ticket Creation | Support ticket created in Module 17; confirmation shown. |
| M19-07| Hero CTA | Click "Get Started" on Homepage. | Deep Link | Landed directly on the Location/Planet selection wizard. |
| M19-08| Footer Links | Click "Terms of Service". | Static Rendering | Displays latest version of global TOS. |
| M19-09| 404 Handling | Navigate to `/t/non-existent-slug`. | Error Handling | Shows generic "Academy Not Found" with link to main site. |
| M19-10| Performance | Check PageSpeed for Storefront home. | Optimization | Score > 90 due to Next.js image optimization and SSR. |
