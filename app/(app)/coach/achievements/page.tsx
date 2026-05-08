"use client";

import { useState } from "react";
import { Trophy } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { PageHeader } from "@/components/layout/PageHeader";
import { Select } from "@/components/ui/Select";
import { TLP } from "@/lib/theme/tokens";
import { ACHIEVEMENTS } from "@/lib/mock/achievements";
import { MEMBERS } from "@/lib/mock/members";
import type { MemberAchievement } from "@/lib/types";

const DEMO_COACH_ID = "coach_priya";

const MEMBER_OPTIONS = [
  { value: "", label: "Select member…" },
  ...MEMBERS.map((m) => ({ value: m.id, label: m.fullName })),
];

const BADGE_PRESETS = [
  "Knight's Gambit",
  "Rook Star",
  "Opening Master",
  "Queen's Defender",
  "Algebra Ace",
  "Speed Solver",
  "Problem Pioneer",
  "Perfect Attendance",
  "Most Improved",
  "Team Player",
];

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-CA", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function memberName(id: string) {
  return MEMBERS.find((m) => m.id === id)?.fullName ?? id;
}

type AwardForm = {
  memberId: string;
  badgeName: string;
  notes: string;
};

const BLANK_FORM: AwardForm = { memberId: "", badgeName: "", notes: "" };

export default function CoachAchievementsPage() {
  const [achievements, setAchievements] = useState<MemberAchievement[]>(ACHIEVEMENTS);
  const [showAward, setShowAward] = useState(false);
  const [form, setForm] = useState<AwardForm>(BLANK_FORM);
  const [memberFilter, setMemberFilter] = useState("");

  const myAchievements = achievements.filter((a) => a.awardedBy === DEMO_COACH_ID);
  const displayed = memberFilter
    ? myAchievements.filter((a) => a.memberId === memberFilter)
    : myAchievements;

  function handleAward() {
    if (!form.memberId || !form.badgeName) return;
    const newAch: MemberAchievement = {
      id: `ach_new_${Date.now()}`,
      memberId: form.memberId,
      awardedBy: DEMO_COACH_ID,
      badgeName: form.badgeName,
      notes: form.notes || undefined,
      awardedAt: new Date().toISOString(),
    };
    setAchievements((prev) => [newAch, ...prev]);
    setShowAward(false);
    setForm(BLANK_FORM);
  }

  function field(k: keyof AwardForm) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));
  }

  // Group displayed by member
  const byMember = displayed.reduce(
    (acc, a) => {
      (acc[a.memberId] ??= []).push(a);
      return acc;
    },
    {} as Record<string, MemberAchievement[]>,
  );

  return (
    <div style={{ padding: 24 }}>
      <PageHeader
        title="Student Achievements"
        subtitle={`${myAchievements.length} badges awarded by you`}
        actions={
          <Button variant="primary" icon={<Trophy size={16} strokeWidth={2.5} />} onClick={() => { setForm(BLANK_FORM); setShowAward(true); }}>
            Award Badge
          </Button>
        }
      />

      {/* Filter */}
      <div style={{ marginBottom: 20, width: 220 }}>
        <Select
          value={memberFilter}
          onChange={(e) => setMemberFilter(e.target.value)}
          options={[{ value: "", label: "All students" }, ...MEMBERS.map((m) => ({ value: m.id, label: m.fullName }))]}
        />
      </div>

      {Object.keys(byMember).length === 0 ? (
        <div style={{ padding: "60px 0", textAlign: "center", color: TLP.gray400, fontSize: 14 }}>
          No achievements yet. Award your first badge!
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {Object.entries(byMember).map(([memberId, achs]) => (
            <div key={memberId}>
              <div style={{ fontSize: 13, fontWeight: 700, color: TLP.gray600, marginBottom: 8 }}>
                {memberName(memberId)}
                <span style={{ fontWeight: 400, color: TLP.gray400, marginLeft: 8 }}>
                  {achs.length} badge{achs.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {achs
                  .sort((a, b) => b.awardedAt.localeCompare(a.awardedAt))
                  .map((ach) => (
                    <Card key={ach.id} style={{ padding: "14px 18px" }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                        <div
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: 10,
                            background: TLP.amberLight,
                            color: TLP.amber,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <Trophy size={22} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                            <div style={{ fontWeight: 700, fontSize: 14, color: TLP.navy }}>
                              {ach.badgeName}
                            </div>
                            <span style={{ fontSize: 11, color: TLP.gray400 }}>
                              {fmtDate(ach.awardedAt)}
                            </span>
                          </div>
                          {ach.notes && (
                            <div style={{ fontSize: 12, color: TLP.gray600, marginTop: 4, lineHeight: 1.5 }}>
                              {ach.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Award badge modal */}
      <Modal
        open={showAward}
        onClose={() => setShowAward(false)}
        title="Award Badge"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowAward(false)}>Cancel</Button>
            <Button
              variant="primary"
              onClick={handleAward}
              disabled={!form.memberId || !form.badgeName}
            >
              Award Badge
            </Button>
          </>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Select
            label="Student"
            value={form.memberId}
            onChange={field("memberId")}
            options={MEMBER_OPTIONS}
            required
          />

          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: TLP.gray700, display: "block", marginBottom: 4 }}>
              Badge Name <span style={{ color: TLP.red }}>*</span>
            </label>
            <Input
              value={form.badgeName}
              onChange={field("badgeName")}
              placeholder="e.g. Knight's Gambit"
            />
            <div style={{ marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap" }}>
              {BADGE_PRESETS.map((preset) => (
                <button
                  key={preset}
                  onClick={() => setForm((f) => ({ ...f, badgeName: preset }))}
                  style={{
                    padding: "3px 10px",
                    borderRadius: 99,
                    border: `1px solid ${form.badgeName === preset ? TLP.teal : TLP.gray200}`,
                    background: form.badgeName === preset ? TLP.tealLight : TLP.white,
                    color: form.badgeName === preset ? TLP.teal : TLP.gray600,
                    fontSize: 12,
                    cursor: "pointer",
                  }}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: TLP.gray700, display: "block", marginBottom: 4 }}>
              Notes (optional)
            </label>
            <textarea
              value={form.notes}
              onChange={field("notes")}
              rows={3}
              placeholder="Describe what earned this badge…"
              style={{
                width: "100%",
                border: `1.5px solid ${TLP.gray200}`,
                borderRadius: 8,
                padding: "9px 12px",
                fontSize: 14,
                color: TLP.gray800,
                outline: "none",
                resize: "vertical",
                fontFamily: "inherit",
                background: TLP.white,
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8, background: TLP.purpleLight, borderRadius: 8, padding: "10px 14px", fontSize: 12, color: TLP.purple }}>
            <Trophy size={16} />
            The parent will receive a notification when this badge is awarded.
          </div>
        </div>
      </Modal>
    </div>
  );
}
