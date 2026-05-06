import type { Enrollment } from "@/lib/types";

export const ENROLLMENTS: Enrollment[] = [
  // Aarav: Chess PP (Mon) + Math G3? he's grade 3 — but no batch shown. Use Chess PP only.
  {
    id: "enr_aarav_chess",
    memberId: "mem_aarav",
    batchId: "bat_chess_pp_mon",
    customerId: "cust_raj",
    invoiceId: "inv_raj_apr_chess_aarav",
    setupFeePaid: true,
    status: "active",
    enrolledAt: "2026-01-15T17:30:00Z",
  },
  // Anaya: Chess RR (Tue) + Math G7 (Wed) + English G5 (Tue)
  {
    id: "enr_anaya_chess",
    memberId: "mem_anaya",
    batchId: "bat_chess_rr_tue",
    customerId: "cust_raj",
    invoiceId: "inv_raj_apr_chess_anaya",
    setupFeePaid: true,
    status: "active",
    enrolledAt: "2026-01-15T17:30:00Z",
  },
  {
    id: "enr_anaya_math",
    memberId: "mem_anaya",
    batchId: "bat_math_g7_wed",
    customerId: "cust_raj",
    invoiceId: "inv_raj_apr_math_anaya",
    setupFeePaid: true,
    status: "active",
    enrolledAt: "2026-02-03T14:10:00Z",
  },
  // Raj (self): Finance basics (Sat)
  {
    id: "enr_raj_finance",
    memberId: "mem_raj_self",
    batchId: "bat_fin_basics_sat",
    customerId: "cust_raj",
    invoiceId: "inv_raj_apr_finance",
    setupFeePaid: true,
    status: "active",
    enrolledAt: "2026-03-12T19:55:00Z",
  },
  // Other customers (admin/coach views)
  {
    id: "enr_lin_chess",
    memberId: "mem_lin_chen",
    batchId: "bat_chess_pp_mon",
    customerId: "cust_chen",
    setupFeePaid: true,
    status: "active",
    enrolledAt: "2026-01-22T15:00:00Z",
  },
  {
    id: "enr_kai_math",
    memberId: "mem_kai_chen",
    batchId: "bat_math_g7_wed",
    customerId: "cust_chen",
    setupFeePaid: true,
    status: "active",
    enrolledAt: "2026-01-22T15:00:00Z",
  },
  {
    id: "enr_ada_chess",
    memberId: "mem_ada_okafor",
    batchId: "bat_chess_pp_mon",
    customerId: "cust_okafor",
    setupFeePaid: true,
    status: "active",
    enrolledAt: "2026-02-10T11:20:00Z",
  },
  {
    id: "enr_arjun_chess",
    memberId: "mem_arjun_kumar",
    batchId: "bat_chess_pp_mon",
    customerId: "cust_kumar",
    setupFeePaid: true,
    status: "active",
    enrolledAt: "2026-02-15T16:00:00Z",
  },
  {
    id: "enr_arjun_math",
    memberId: "mem_arjun_kumar",
    batchId: "bat_math_g5_wed",
    customerId: "cust_kumar",
    setupFeePaid: true,
    status: "active",
    enrolledAt: "2026-02-15T16:00:00Z",
  },
  {
    id: "enr_liam_chess",
    memberId: "mem_oconnor_son",
    batchId: "bat_chess_pp_mon",
    customerId: "cust_oconnor",
    setupFeePaid: true,
    status: "active",
    enrolledAt: "2026-04-01T10:00:00Z",
  },
];

export const ENROLLMENT_BY_ID: Record<string, Enrollment> = Object.fromEntries(
  ENROLLMENTS.map((e) => [e.id, e]),
);

export const ENROLLMENTS_BY_MEMBER: Record<string, Enrollment[]> = ENROLLMENTS.reduce(
  (acc, e) => {
    (acc[e.memberId] ??= []).push(e);
    return acc;
  },
  {} as Record<string, Enrollment[]>,
);

export const ENROLLMENTS_BY_BATCH: Record<string, Enrollment[]> = ENROLLMENTS.reduce(
  (acc, e) => {
    (acc[e.batchId] ??= []).push(e);
    return acc;
  },
  {} as Record<string, Enrollment[]>,
);
