/**
 * Domain types mirroring the Mentora ER diagram.
 * Source: Mentora_ER_Diagram.mermaid
 *
 * Two prototype-only extensions on top of the canonical schema:
 *   - Ownership has tenant-branding fields (slug, logoUrl, brandPrimary, brandAccent, tagline)
 *   - Role string union (the ER diagram uses a roles table; we inline the values)
 */

export type ID = string;
export type ISODate = string; // YYYY-MM-DD
export type ISODateTime = string; // ISO 8601

export type Role =
  | "customer"
  | "coach"
  | "franchisor_admin"
  | "franchisee_admin"
  | "franchisor_mgmt"
  | "franchisee_mgmt";

export type OwnershipType = "corporate" | "franchisee";

// ============================================================
// Section 1: Geography & organization
// ============================================================

export interface Ownership {
  id: ID;
  fullName: string;
  email: string;
  ownershipType: OwnershipType;
  isActive: boolean;
  // Prototype tenant-branding extensions:
  slug: string; // URL slug, e.g. "learning-planet"
  logoUrl?: string;
  brandPrimary: string; // CSS color
  brandAccent: string; // CSS color
  tagline?: string;
}

export interface Location {
  id: ID;
  ownershipId: ID;
  name: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  stateProvince: string;
  country: string;
  postalCode?: string;
  isActive: boolean;
}

export interface Holiday {
  id: ID;
  ownershipId?: ID; // null = system-wide
  locationId?: ID; // null = all locations under ownership
  holidayDate: ISODate;
  description: string;
}

// ============================================================
// Section 2: Planets / Levels / Pricing
// ============================================================

export interface Planet {
  id: ID;
  name: string; // e.g. "Chess" | "Math" | "English"
  description?: string;
  isActive: boolean;
}

export interface Level {
  id: ID;
  planetId: ID;
  productClassId: ID;
  name: string; // e.g. "Grade-7" | "PP" | "RR"
  sortOrder: number;
  isActive: boolean;
}

export interface CourseVariant {
  id: ID;
  levelId: ID;
  frequencyPerWeek: 1 | 2 | 3;
  price: number;
  setupFee: number;
  imageUrl?: string;
}

export interface MultiPlanetDiscount {
  id: ID;
  ownershipId?: ID; // null = franchisor default
  planetsCount: number; // 2, 3, 4, ...
  discountPct: number;
}

export interface LocationCourseOffering {
  id: ID;
  locationId: ID;
  productVariantId: ID;
  price: number;
  setupFee: number;
  isActive: boolean;
}

export type PriceChangeStatus = "pending" | "approved" | "rejected";

export interface PriceChangeRequest {
  id: ID;
  requestingOwnershipId: ID;
  courseVariantId: ID;
  reviewedBy?: ID;
  currentPrice: number;
  requestedPrice: number;
  reason: string;
  status: PriceChangeStatus;
  submittedAt: ISODateTime;
  reviewedAt?: ISODateTime;
}

export interface PriceChangeAttachment {
  id: ID;
  priceChangeRequestId: ID;
  fileUrl: string;
  fileName: string;
}

// ============================================================
// Section 3: Users / roles / accounts
// ============================================================

export interface User {
  id: ID;
  email: string;
  role: Role;
  ownershipId?: ID; // null for non-staff (parents)
  fullName: string;
  mustResetPw: boolean;
  twoFaPhone?: string;
}

export interface Customer {
  id: ID;
  userId: ID;
  fullName: string;
  dob: ISODate;
  phone: string;
  emergencyContact?: string;
  gender?: string;
  cfcId?: string;
  termsAccepted: boolean;
  loyaltyPoints: number;
}

export interface CustomerLocation {
  id: ID;
  customerId: ID;
  locationId: ID;
  isPreferred: boolean;
}

export type TshirtSize = "XS" | "S" | "M" | "L" | "XL" | "XXL";

export interface Member {
  id: ID;
  customerId: ID;
  fullName: string;
  dob: ISODate;
  email?: string;
  cfcId?: string;
  grade?: string;
  tshirtSize?: TshirtSize;
  preferredColor?: string;
  isSelf: boolean;
}

export interface Coach {
  id: ID;
  userId: ID;
  ownershipId: ID;
  fullName: string;
  email: string;
  phone?: string;
  locationId?: ID;
  status: "active" | "on_leave" | "inactive";
  planetIds: ID[]; // planets this coach can teach
  is_active: boolean; // Field from profiles
}

export interface StaffAvailability {
  id: ID;
  profileId: ID;
  dayOfWeek: string; // 'Monday', 'Tuesday', etc.
  startTime: string; // HH:MM:SS
  endTime: string; // HH:MM:SS
  isActive: boolean;
}

export interface StaffLeave {
  id: ID;
  profileId: ID;
  startDate: ISODate;
  endDate: ISODate;
  reason?: string;
  status: "pending" | "approved" | "rejected";
}

// ============================================================
// Section 4: Payment & billing
// ============================================================

export type CardBrand = "visa" | "mastercard" | "amex" | "discover" | "other";

export interface PaymentMethod {
  id: ID;
  customerId: ID;
  stripePmId: string;
  last4: string;
  cardBrand: CardBrand;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
}

export type InvoiceStatus = "draft" | "open" | "paid" | "void" | "uncollectible";

export interface Invoice {
  id: ID;
  customerId: ID;
  ownershipId: ID;
  amountCents: number;
  status: InvoiceStatus;
  dueDate: ISODate;
  paidAt?: ISODateTime;
  stripeInvoiceId?: string;
  createdAt: ISODateTime;
}

export interface Payment {
  id: ID;
  invoiceId: ID;
  amountCents: number;
  method: "stripe" | "cash" | "transfer";
  stripePaymentIntentId?: string;
  status: "succeeded" | "failed" | "pending";
  createdAt: ISODateTime;
}

export interface Membership {
  id: ID;
  memberId: ID;
  ownershipId: ID;
  stripeCustomerId?: string;
  status: "active" | "paused" | "cancelled" | "past_due";
  billingCycleAnchor: ISODate;
  nextBillingDate: ISODate;
  createdAt: ISODateTime;
}

export interface InvoiceLineItem {
  id: ID;
  invoiceId: ID;
  enrollmentId?: ID;
  description: string;
  amount: number;
  discountAmount: number;
  referenceType: "enrollment" | "setup_fee" | "trial" | "adjustment";
  referenceId?: ID;
}

export interface DiscountTier {
  id: ID;
  planetsCount: number;
  discountPct: number;
  isActive: boolean;
}

// ============================================================
// Section 5: Batches & enrollments
// ============================================================

export interface Batch {
  id: ID;
  locationId: ID;
  levelId: ID;
  dayOfWeek: string; // 'Monday' | 'Tuesday' | ...
  startTime: string; // HH:MM:SS
  endTime: string; // HH:MM:SS
  maxCapacity: number;
  isActive: boolean;
  createdAt?: ISODateTime;
}

export type EnrollmentStatus = "active" | "dropped" | "completed";

export interface Enrollment {
  id: ID;
  memberId: ID;
  customerId: ID;
  productVariantId: ID;
  locationId: ID;
  ownershipId: ID;
  offeringPrice: number;
  status: EnrollmentStatus;
  enrolledAt: ISODateTime;
  cancelledAt?: ISODateTime;
  cancellationReason?: string;
}

export interface EnrollmentBatch {
  id: ID;
  enrollmentId: ID;
  batchId: ID;
}

export interface EnrollmentDiscount {
  id: ID;
  enrollmentId: ID;
  planetsCount: number;
  discountPct: number;
}

// ============================================================
// Section 6: Roster
// ============================================================

export interface Roster {
  id: ID;
  locationId: ID;
  weekStartDate: ISODate;
  publishedAt?: ISODateTime;
}

export interface RosterAssignment {
  id: ID;
  rosterId: ID;
  coachId?: ID; // null = unassigned
  batchId: ID;
  sessionDate: ISODate;
}

// ============================================================
// Section 7: Attendance & session notes
// ============================================================

export interface Session {
  id: ID;
  rosterAssignmentId: ID;
  batchId: ID;
  sessionDate: ISODate;
}

export type AttendanceStatus = "expected" | "present" | "absent" | "makeup";

export interface Attendance {
  id: ID;
  sessionId: ID;
  memberId: ID;
  enrollmentId: ID;
  status: AttendanceStatus;
  markedAt?: ISODateTime;
}

export interface SessionNote {
  id: ID;
  sessionId: ID;
  coachId: ID;
  topicCovered?: string;
  homeworkNotes?: string;
  generalNotes?: string;
}

export interface MemberSessionNote {
  id: ID;
  sessionId: ID;
  memberId: ID;
  coachId: ID;
  homeworkDone: boolean;
  privateNote?: string;
}

// ============================================================
// Section 8: Trials
// ============================================================

export type TrialStatus = "scheduled" | "completed" | "no_show" | "converted";

export interface Trial {
  id: ID;
  memberId: ID;
  customerId: ID;
  locationId: ID;
  levelId: ID;
  batchId: ID;
  trialDate: ISODate;
  status: TrialStatus;
}

export interface TrialAssessment {
  id: ID;
  trialId: ID;
  coachId: ID;
  recommendedBatchId?: ID;
  assessmentText?: string;
  attachmentUrl?: string;
}

// ============================================================
// Section 9: Events & camps
// ============================================================

export type EventType = "tournament" | "camp" | "event";

export interface Event {
  id: ID;
  ownershipId: ID;
  locationId?: ID; // null = all
  title: string;
  description?: string;
  eventType: EventType;
  startDate: ISODate;
  endDate: ISODate;
  price: number;
  capacity: number;
}

export type EventCustomFieldType = "text" | "number" | "date" | "boolean" | "select";

export interface EventCustomField {
  id: ID;
  eventId: ID;
  fieldName: string;
  fieldType: EventCustomFieldType;
  isRequired: boolean;
  options?: string[];
}

export type EventRegistrationStatus = "registered" | "cancelled" | "waitlisted";

export interface EventRegistration {
  id: ID;
  eventId: ID;
  memberId: ID;
  customerId: ID;
  invoiceId?: ID;
  customData?: Record<string, unknown>;
  status: EventRegistrationStatus;
}

// ============================================================
// Section 10: LMS
// ============================================================

export interface LmsModule {
  id: ID;
  levelId: ID;
  title: string;
  sortOrder: number;
}

export type LmsContentType = "text" | "pdf" | "youtube";

export interface LmsTopic {
  id: ID;
  moduleId: ID;
  title: string;
  contentType: LmsContentType;
  contentBody?: string;
  contentUrl?: string;
  sortOrder: number;
}

export type LmsQuizScopeType = "module" | "topic";

export interface LmsQuiz {
  id: ID;
  referenceType: LmsQuizScopeType;
  referenceId: ID; // module or topic ID
  title: string;
  passingScorePct: number;
}

export interface LmsQuizQuestion {
  id: ID;
  quizId: ID;
  questionText: string;
  options: string[];
  correctAnswer: string;
  sortOrder: number;
}

export interface LmsQuizAttempt {
  id: ID;
  quizId: ID;
  memberId: ID;
  score: number;
  attemptedAt: ISODateTime;
}

export interface MemberAchievement {
  id: ID;
  memberId: ID;
  awardedBy: ID; // coach ID
  badgeName: string;
  notes?: string;
  awardedAt: ISODateTime;
}

// ============================================================
// Section 11: Notifications & tickets
// ============================================================

export interface Notification {
  id: ID;
  userId: ID;
  type: string; // e.g. "missed_class" | "payment_failed" | "new_event"
  title: string;
  body: string;
  isRead: boolean;
  referenceType?: string;
  referenceId?: ID;
  createdAt: ISODateTime;
}

export type SupportTicketCategory = "IT" | "Non-IT";
export type SupportTicketStatus = "open" | "in_progress" | "resolved" | "closed";

export interface SupportTicket {
  id: ID;
  ownershipId: ID;
  locationId?: ID;
  raisedBy: ID;
  category: SupportTicketCategory;
  shortDescription: string;
  status: SupportTicketStatus;
  createdAt: ISODateTime;
}

// ============================================================
// Section 12: Loyalty
// ============================================================

export interface LoyaltyTransaction {
  id: ID;
  customerId: ID;
  pointsDelta: number;
  referenceType?: string;
  referenceId?: ID;
  description: string;
  createdAt: ISODateTime;
}
