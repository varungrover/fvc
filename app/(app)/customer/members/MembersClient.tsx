"use client";

import { useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { PageHeader } from "@/components/layout/PageHeader";
import { Select } from "@/components/ui/Select";
import { TLP } from "@/lib/theme/tokens";
import type { MemberRow } from "@/lib/db/members";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const AVATAR_COLORS = [TLP.teal, TLP.purple, TLP.navy, TLP.blue, TLP.green];

const TSHIRT_OPTIONS = [
  { value: "XS", label: "XS" },
  { value: "S", label: "S" },
  { value: "M", label: "M" },
  { value: "L", label: "L" },
  { value: "XL", label: "XL" },
  { value: "XXL", label: "XXL" },
];

type FormState = {
  id?: string;
  fullName: string;
  dob: string;
  grade: string;
  tshirtSize: string;
  preferredColor: string;
  gender: string;
};

const BLANK_FORM: FormState = {
  fullName: "",
  dob: "",
  grade: "",
  tshirtSize: "M",
  preferredColor: "",
  gender: "",
};

export default function MembersClient({ 
  initialMembers,
  customerId 
}: { 
  initialMembers: MemberRow[];
  customerId: string;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [members, setMembers] = useState<MemberRow[]>(initialMembers);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState<MemberRow | null>(null);
  const [form, setForm] = useState<FormState>(BLANK_FORM);
  const [saving, setSaving] = useState(false);

  function openAdd() {
    setForm(BLANK_FORM);
    setShowAdd(true);
  }

  function openEdit(m: MemberRow) {
    setForm({
      id: m.id,
      fullName: m.full_name,
      dob: m.dob,
      grade: m.grade ?? "",
      tshirtSize: m.t_shirt_size ?? "M",
      preferredColor: m.preferred_color ?? "",
      gender: m.gender ?? "",
    });
    setShowEdit(m);
  }

  async function handleSaveMember() {
    if (!form.fullName || !form.dob) return;
    setSaving(true);
    
    try {
      const payload = {
        id: form.id,
        customer_id: customerId,
        full_name: form.fullName,
        dob: form.dob,
        grade: form.grade || null,
        t_shirt_size: form.tshirtSize || null,
        preferred_color: form.preferredColor || null,
        gender: form.gender || null,
        is_active: true
      };

      const { data, error } = await supabase
        .from('members')
        .upsert(payload)
        .select()
        .single();

      if (error) throw error;

      setMembers(prev => {
        if (form.id) {
          return prev.map(m => m.id === form.id ? data : m);
        }
        return [...prev, data];
      });

      setShowAdd(false);
      setShowEdit(null);
      router.refresh();
    } catch (err) {
      console.error("Failed to save member:", err);
      alert("Failed to save member. Please try again.");
    } finally {
      setSaving(false);
    }
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
          const color = AVATAR_COLORS[i % AVATAR_COLORS.length];
          return (
            <Card key={m.id} style={{ padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
                <Avatar name={m.full_name} size={48} color={color} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16, color: TLP.navy }}>
                    {m.full_name}
                  </div>
                  <div style={{ fontSize: 12, color: TLP.gray500, marginTop: 2 }}>
                    {m.grade ?? "No Grade"}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13 }}>
                <Row label="Date of Birth" value="••/••/••••" />
                <Row label="T-Shirt Size" value={m.t_shirt_size ?? "—"} />
                <Row label="Gender" value={m.gender ?? "—"} />
                <Row label="Preferred Color" value={m.preferred_color ?? "—"} />
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
            <Button variant="secondary" onClick={() => setShowAdd(false)} disabled={saving}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveMember}
              disabled={!form.fullName || !form.dob || saving}
            >
              {saving ? "Saving..." : "Add Member"}
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
        title={`Edit — ${showEdit?.full_name}`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowEdit(null)} disabled={saving}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveMember} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
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
            To edit personal information securely, 2FA verification is required in production.
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
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Input
          label="Gender"
          value={form.gender}
          onChange={set("gender")}
          placeholder="e.g. Male"
        />
        <Input
          label="Preferred Color"
          value={form.preferredColor}
          onChange={set("preferredColor")}
          placeholder="e.g. Blue"
        />
      </div>
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
