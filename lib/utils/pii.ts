import type { CustomerRow } from "@/lib/db/customers";
import type { MemberRow } from "@/lib/db/members";
import type { SessionUser } from "@/lib/auth/types";

// Check if session has aal2 (Authenticator Assurance Level 2)
export function is2FAVerified(session: any): boolean {
  // Supabase sets aal = 'aal2' when MFA is completed
  return session?.aal === 'aal2' || session?.user?.aal === 'aal2';
}

export function maskEmail(email: string | null): string | null {
  if (!email) return null;
  const parts = email.split("@");
  if (parts.length !== 2) return email;
  const [local, domain] = parts;
  return local.slice(0, 2) + "•••@" + domain;
}

export function maskPhone(phone: string | null): string | null {
  if (!phone) return null;
  // +1-416-555-0100 -> +1-•••-•••-0100
  if (phone.length > 4) {
    return phone.slice(0, 3) + "•••-•••-" + phone.slice(-4);
  }
  return "••••";
}

export function maskDate(dateString: string | null): string | null {
  if (!dateString) return null;
  // 1990-05-15 -> ••••-••-••
  return "••••-••-••";
}

export function applyCustomerPIIMasking(customer: CustomerRow, session: any): CustomerRow {
  // Global admins don't need PII masking
  if (session?.role === 'franchisor_admin' || session?.role === 'franchisor_mgmt') {
    return customer;
  }
  
  // If user is accessing their own profile and is 2FA verified, no masking
  if (customer.profile_id === session?.id && is2FAVerified(session)) {
    return customer;
  }

  // Otherwise mask PII
  return {
    ...customer,
    email: customer.email ? maskEmail(customer.email) : customer.email,
    phone: customer.phone ? maskPhone(customer.phone) : customer.phone,
    emergency_contact: customer.emergency_contact ? maskPhone(customer.emergency_contact) : customer.emergency_contact,
  } as CustomerRow;
}

export function applyMemberPIIMasking(member: MemberRow, session: any, customerProfileId: string): MemberRow {
  // Global admins don't need PII masking
  if (session?.role === 'franchisor_admin' || session?.role === 'franchisor_mgmt') {
    return member;
  }
  
  // If user is accessing their own members and is 2FA verified, no masking
  if (customerProfileId === session?.id && is2FAVerified(session)) {
    return member;
  }

  // Otherwise mask PII
  return {
    ...member,
    dob: member.dob ? maskDate(member.dob) : member.dob,
    gender: member.gender ? "•••" : member.gender,
  } as MemberRow;
}
