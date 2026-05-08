"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { AlertTriangle, XCircle, PartyPopper, CheckCircle, Trophy, Calendar, Bell } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/layout/PageHeader";
import { TLP } from "@/lib/theme/tokens";
import { NOTIFICATIONS } from "@/lib/mock/notifications";

const TYPE_ICON: Record<string, ReactNode> = {
  missed_class: <AlertTriangle size={20} strokeWidth={2} />,
  payment_failed: <XCircle size={20} strokeWidth={2} />,
  new_event: <PartyPopper size={20} strokeWidth={2} />,
  enrollment_confirmed: <CheckCircle size={20} strokeWidth={2} />,
  achievement: <Trophy size={20} strokeWidth={2} />,
  upcoming_class: <Calendar size={20} strokeWidth={2} />,
};

const TYPE_COLOR: Record<string, { color: string; bg: string; label: string }> = {
  missed_class: { color: TLP.amber, bg: TLP.amberLight, label: "Missed Class" },
  payment_failed: { color: TLP.red, bg: TLP.redLight, label: "Payment" },
  new_event: { color: TLP.blue, bg: TLP.blueLight, label: "Event" },
  enrollment_confirmed: { color: TLP.green, bg: TLP.greenLight, label: "Enrollment" },
  achievement: { color: TLP.purple, bg: TLP.purpleLight, label: "Achievement" },
  upcoming_class: { color: TLP.teal, bg: TLP.tealLight, label: "Class Info" },
};

function fmtRelative(iso: string) {
  const now = new Date("2026-05-04T12:00:00Z");
  const then = new Date(iso);
  const diffMs = now.getTime() - then.getTime();
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return then.toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" });
}

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState(
    [...NOTIFICATIONS].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  );
  const [filterUnread, setFilterUnread] = useState(false);

  const unreadCount = notifs.filter((n) => !n.isRead).length;

  const displayed = filterUnread ? notifs.filter((n) => !n.isRead) : notifs;

  function markRead(id: string) {
    setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  }

  function markAllRead() {
    setNotifs((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }

  return (
    <div style={{ padding: 24 }}>
      <PageHeader
        title="Notifications"
        subtitle={unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
        actions={
          unreadCount > 0 ? (
            <Button variant="secondary" onClick={markAllRead}>
              Mark all read
            </Button>
          ) : undefined
        }
      />

      {/* Filter row */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <Button
          variant={!filterUnread ? "primary" : "secondary"}
          size="sm"
          onClick={() => setFilterUnread(false)}
        >
          All ({notifs.length})
        </Button>
        <Button
          variant={filterUnread ? "primary" : "secondary"}
          size="sm"
          onClick={() => setFilterUnread(true)}
        >
          Unread ({unreadCount})
        </Button>
      </div>

      {displayed.length === 0 ? (
        <div style={{ padding: "60px 0", textAlign: "center", color: TLP.gray400, fontSize: 14 }}>
          No unread notifications.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {displayed.map((n) => {
            const typeInfo = TYPE_COLOR[n.type] ?? { color: TLP.gray500, bg: TLP.gray100, label: n.type };
            const icon = TYPE_ICON[n.type] ?? <Bell size={20} strokeWidth={2} />;

            return (
              <Card
                key={n.id}
                style={{
                  padding: "16px 20px",
                  cursor: n.isRead ? "default" : "pointer",
                  background: n.isRead ? TLP.white : `${TLP.blue}05`,
                  border: n.isRead ? undefined : `1.5px solid ${TLP.blue}30`,
                  transition: "background 0.15s",
                }}
                onClick={() => !n.isRead && markRead(n.id)}
              >
                <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                  {/* Icon bubble */}
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      background: typeInfo.bg,
                      color: typeInfo.color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {icon}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 4 }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                        <span style={{ fontWeight: n.isRead ? 500 : 700, fontSize: 14, color: TLP.navy }}>
                          {n.title}
                        </span>
                        <Badge label={typeInfo.label} color={typeInfo.color} bg={typeInfo.bg} />
                        {!n.isRead && (
                          <span
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              background: TLP.blue,
                              display: "inline-block",
                              flexShrink: 0,
                            }}
                          />
                        )}
                      </div>
                      <span style={{ fontSize: 11, color: TLP.gray400, flexShrink: 0 }}>
                        {fmtRelative(n.createdAt)}
                      </span>
                    </div>
                    <div style={{ fontSize: 13, color: TLP.gray600, lineHeight: 1.5 }}>
                      {n.body}
                    </div>
                    {!n.isRead && (
                      <div style={{ marginTop: 8 }}>
                        <Button
                          variant="ghost"
                          size="sm"
                          style={{ color: TLP.teal, fontSize: 12, padding: "2px 0" }}
                          onClick={(e) => { e.stopPropagation(); markRead(n.id); }}
                        >
                          Mark as read
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
