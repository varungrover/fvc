"use client";

import { useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge, PlanetBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { PageHeader } from "@/components/layout/PageHeader";
import { Select } from "@/components/ui/Select";
import { TLP } from "@/lib/theme/tokens";
import { MEMBERS_BY_CUSTOMER } from "@/lib/mock/members";
import { ENROLLMENTS_BY_MEMBER } from "@/lib/mock/enrollments";
import { BATCH_BY_ID } from "@/lib/mock/batches";
import { LEVEL_BY_ID } from "@/lib/mock/levels";
import { PLANET_BY_ID } from "@/lib/mock/planets";
import type { Member } from "@/lib/types";

const CUSTOMER_ID = "cust_raj";
const AVATAR_COLORS = [TLP.teal, TLP.purple, TLP.navy, TLP.blue, TLP.green];

const TSHIRT_OPTIONS = [
  { value: "XS", label: "XS" },
  { value: "S", label: "S" },
  { value: "M", label: "M" },
  { value: "L", label: "L" },
  { value: "XL", label: "XL" },
  { value: "XXL", label: "XXL" },
];

function getPlanetNames(memberId: string): string[] {
  const enrollments = ENROLLMENTS_BY_MEMBER[memberId] ?? [];
  const names = enrollments
    .filter((e) => e.status === "active")
    .map((e) => {
      const batch = BATCH_BY_ID[e.batchId];
      const level = batch ? LEVEL_BY_ID[batch.levelId] : null;
      const planet = level ? PLANET_BY_ID[level.planetId] : null;
      return planet?.name;
    })
    .filter(Boolean) as string[];
  return [...new Set(names)];
}

type FormState = {
  fullName: string;
  dob: string;
  grade: string;
  tshirtSize: string;
  cfcId: string;
  email: string;
};

const BLANK_FORM: FormState = {
  fullName: "",
  dob: "",
  grade: "",
  tshirtSize: "M",
  cfcId: "",
  email: "",
};

export default function MembersPage() {
  const baseMembers = MEMBERS_BY_CUSTOMER[CUSTOMER_ID] ?? [];
  const [extraMembers, setExtraMembers] = useState<Member[]>([]);
  const members = [...baseMembers, ...extraMembers];

  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState<Member | null>(null);
  const [form, setForm] = useState<FormState>(BLANK_FORM);

  function openAdd() {
    setForm(BLANK_FORM);
    setShowAdd(true);
  }

  function openEdit(m: Member) {
    setForm({
      fullName: m.fullName,
      dob: m.dob,
      grade: m.grade ?? "",
      tshirtSize: m.tshirtSize ?? "M",
      cfcId: m.cfcId ?? "",
      email: m.email ?? "",
    });
    setShowEdit(m);
  }

  function handleAddMember() {
    if (!form.fullName || !form.dob) return;
    const newMember: Member = {
      id: `mem_new_${Date.now()}`,
      customerId: CUSTOMER_ID,
      fullName: form.fullName,
      dob: form.dob,
      grade: form.grade || undefined,
      tshirtSize: (form.tshirtSize as Member["tshirtSize"]) || undefined,
      cfcId: form.cfcId || undefined,
      email: form.email || undefined,
      isSelf: false,
    };
    setExtraMembers((prev) => [...prev, newMember]);
    setShowAdd(false);
  }

  function set(field: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  return (
    <div style={{ padding: 24 }}>
      <PageHeader
        title="Member Profiles"
        subtitle="Manage family members and learners on your account"
        actions={
          <Button variant="primary" onClick={openAdd} icon="➕">
            Add Member
          </Button>
        }
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: 16,
        }}
      >
        {members.map((m, i) => {
          const planets = getPlanetNames(m.id);
          const color = AVATAR_COLORS[i % AVATAR_COLORS.length];
          return (
            <Card key={m.id} style={{ padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
                <Avatar name={m.fullName} size={48} color={color} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16, color: TLP.navy }}>
                    {m.fullName}
                  </div>
                  <div style={{ fontSize: 12, color: TLP.gray500, marginTop: 2 }}>
                    {m.grade ?? "Adult"}
                    {m.isSelf && (
                      <Badge
                        label="You"
                        color={TLP.teal}
                        bg={TLP.tealLight}
                        size="sm"
                      />
                    )}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13 }}>
                <Row label="Date of Birth" value="••/••/••••" />
                <Row label="T-Shirt Size" value={m.tshirtSize ?? "—"} />
                <Row label="CFC ID" value={m.cfcId ?? "—"} />
                {m.email && <Row label="Email" value="••••@••••.com" />}
                <div
                  style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
                >
                  <span style={{ color: TLP.gray500 }}>Planets</span>
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap", justifyContent: "flex-end" }}>
                    {planets.length > 0
                      ? planets.map((p) => <PlanetBadge key={p} planet={p} />)
                      : <span style={{ color: TLP.gray400, fontSize: 12 }}>None enrolled</span>}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                <Button
                  variant="secondary"
                  size="sm"
                  style={{ flex: 1 }}
                  onClick={() => openEdit(m)}
                >
                  Edit Profile
                </Button>
                <Button variant="primary" size="sm" style={{ flex: 1 }}>
                  View Progress
                </Button>
              </div>
            </Card>
          );
        })}

        {/* Add member card */}
        <AddCard onClick={openAdd} />
      </div>

      {/* Add Member Modal */}
      <Modal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        title="Add Member Profile"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowAdd(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleAddMember}
              disabled={!form.fullName || !form.dob}
            >
              Add Member
            </Button>
          </>
        }
      >
        <MemberForm form={form} set={set} />
      </Modal>

      {/* Edit Member Modal */}
      <Modal
        open={!!showEdit}
        onClose={() => setShowEdit(null)}
        title={`Edit — ${showEdit?.fullName}`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowEdit(null)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => setShowEdit(null)}>
              Save Changes
            </Button>
          </>
        }
      >
        <MemberForm form={form} set={set} />
        <div
          style={{
            marginTop: 14,
            padding: "10px 14px",
            background: TLP.amberLight,
            borderRadius: 8,
            fontSize: 12,
            color: TLP.gray700,
            display: "flex",
            gap: 8,
          }}
        >
          <span>🔒</span>
          <span>
            To edit personal information, 2FA verification is required in production.
          </span>
        </div>
      </Modal>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <span style={{ color: TLP.gray500 }}>{label}</span>
      <span style={{ color: TLP.gray700, fontWeight: 500 }}>{value}</span>
    </div>
  );
}

function MemberForm({
  form,
  set,
}: {
  form: FormState;
  set: (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <Input
        label="Full Name"
        value={form.fullName}
        onChange={set("fullName")}
        required
        placeholder="e.g. Aiden Sharma"
      />
      <Input
        label="Date of Birth"
        type="date"
        value={form.dob}
        onChange={set("dob")}
        required
      />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Input
          label="Grade"
          value={form.grade}
          onChange={set("grade")}
          placeholder="e.g. Grade 5"
        />
        <Select
          label="T-Shirt Size"
          value={form.tshirtSize}
          onChange={set("tshirtSize")}
          options={TSHIRT_OPTIONS}
        />
      </div>
      <Input
        label="CFC ID (optional)"
        value={form.cfcId}
        onChange={set("cfcId")}
        hint="Only required for Chess tournaments"
        placeholder="e.g. CFC-1234"
      />
      <Input
        label="Email (optional)"
        type="email"
        value={form.email}
        onChange={set("email")}
        hint="For individual login in a future phase"
        placeholder="e.g. aiden@example.com"
      />
    </div>
  );
}

function AddCard({ onClick }: { onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        border: `2px dashed ${hovered ? TLP.teal : TLP.gray200}`,
        borderRadius: 12,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        padding: 40,
        cursor: "pointer",
        color: hovered ? TLP.teal : TLP.gray400,
        transition: "border-color 0.15s, color 0.15s",
        minHeight: 200,
      }}
    >
      <span style={{ fontSize: 32 }}>➕</span>
      <span style={{ fontSize: 13, fontWeight: 600 }}>Add Member</span>
    </div>
  );
}
