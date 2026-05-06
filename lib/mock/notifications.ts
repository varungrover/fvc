import type { Notification } from "@/lib/types";

export const NOTIFICATIONS: Notification[] = [
  {
    id: "notif_1",
    userId: "user_parent",
    type: "missed_class",
    title: "Aarav missed Chess class",
    body: "Aarav Sharma was marked absent for Chess PP on Monday, Apr 28 at Surrey Central.",
    isRead: false,
    referenceType: "session",
    referenceId: "sess_1",
    createdAt: "2026-04-28T17:00:00Z",
  },
  {
    id: "notif_2",
    userId: "user_parent",
    type: "payment_failed",
    title: "Payment failed for May invoice",
    body: "Your payment of $180.00 due on May 1 could not be processed. Please update your payment method.",
    isRead: false,
    referenceType: "invoice",
    referenceId: "inv_2",
    createdAt: "2026-05-01T09:00:00Z",
  },
  {
    id: "notif_3",
    userId: "user_parent",
    type: "new_event",
    title: "New event: Spring Chess Open 2026",
    body: "Register your members for the Spring Chess Open on Jun 7 at Surrey Central. Only 48 spots available!",
    isRead: true,
    referenceType: "event",
    referenceId: "evt_chess_open",
    createdAt: "2026-04-20T10:00:00Z",
  },
  {
    id: "notif_4",
    userId: "user_parent",
    type: "enrollment_confirmed",
    title: "Anaya enrolled in Math Grade 7",
    body: "Anaya Sharma has been successfully enrolled in Math Grade 7 (2x/week) at Surrey Central.",
    isRead: true,
    referenceType: "enrollment",
    referenceId: "enr_anaya_math",
    createdAt: "2026-04-10T14:30:00Z",
  },
  {
    id: "notif_5",
    userId: "user_parent",
    type: "achievement",
    title: "Aarav earned a badge! 🏆",
    body: 'Coach Priya awarded Aarav the "Knight\'s Gambit" badge for exceptional chess problem solving.',
    isRead: true,
    referenceType: "achievement",
    referenceId: "ach_aarav_knight",
    createdAt: "2026-04-15T16:00:00Z",
  },
  {
    id: "notif_6",
    userId: "user_parent",
    type: "upcoming_class",
    title: "Classes resume after Victoria Day",
    body: "A reminder that classes will resume on Tuesday, May 19 following the Victoria Day holiday.",
    isRead: true,
    referenceType: "holiday",
    referenceId: "h_victoria",
    createdAt: "2026-05-15T08:00:00Z",
  },
];

export const NOTIF_BY_USER: Record<string, Notification[]> = NOTIFICATIONS.reduce(
  (acc, n) => {
    (acc[n.userId] ??= []).push(n);
    return acc;
  },
  {} as Record<string, Notification[]>,
);
