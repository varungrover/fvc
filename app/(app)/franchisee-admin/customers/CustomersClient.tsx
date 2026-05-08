"use client";

import { useState } from "react";
import { Plus, Download, Star } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { PageHeader } from "@/components/layout/PageHeader";
import { Select } from "@/components/ui/Select";
import { TLP } from "@/lib/theme/tokens";
import type { CustomerRow } from "@/lib/db/customers";
import { useRouter } from "next/navigation";

const AVATAR_COLORS = [TLP.teal, TLP.purple, TLP.navy, TLP.blue, TLP.green];

function maskEmail(email: string) {
  if (!email) return "—";
  const parts = email.split("@");
  if (parts.length !== 2) return email;
  const [local, domain] = parts;
  return local.slice(0, 2) + "•••@" + domain;
}

type AddForm = {
  fullName: string;
  dob: string;
  phone: string;
  email: string;
  gender: string;
  cfcId: string;
};

const BLANK_FORM: AddForm = { fullName: "", dob: "", phone: "", email: "", gender: "", cfcId: "" };

const GENDER_OPTIONS = [
  { value: "", label: "Select gender" },
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
  { value: "Non-binary", label: "Non-binary" },
  { value: "Prefer not to say", label: "Prefer not to say" },
];

export default function CustomersClient({ initialCustomers }: { initialCustomers: CustomerRow[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<AddForm>(BLANK_FORM);
  const [saving, setSaving] = useState(false);

  const filtered = initialCustomers.filter(
    (c) =>
      c.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      (c.phone ?? "").includes(search) ||
      (c.email ?? "").toLowerCase().includes(search.toLowerCase())
  );

  async function handleAdd() {
    if (!form.fullName || !form.email) return;
    setSaving(true);
    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create customer");
      }
      setShowAdd(false);
      setForm(BLANK_FORM);
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  }

  function set(field: keyof AddForm) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  return (
    <div style={{ padding: 24 }}>
      <PageHeader
        title="Customers"
        subtitle={`${initialCustomers.length} registered customers`}
        actions={
          <div style={{ display: "flex", gap: 8 }}>
            <Button variant="secondary" icon={<Download size={15} strokeWidth={2.5} />}>
              Export CSV
            </Button>
            <Button variant="primary" icon={<Plus size={15} strokeWidth={2.5} />} onClick={() => { setForm(BLANK_FORM); setShowAdd(true); }}>
              Add Customer
            </Button>
          </div>
        }
      />

      <div style={{ marginBottom: 20, maxWidth: 400 }}>
        <Input
          placeholder="Search by name, email or phone…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Card style={{ overflow: "hidden", padding: 0 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 180px 90px 110px 100px 90px",
            padding: "10px 20px",
            background: TLP.gray50,
            fontSize: 11,
            fontWeight: 700,
            color: TLP.gray500,
            textTransform: "uppercase",
            letterSpacing: "0.4px",
            gap: 8,
            borderBottom: `1px solid ${TLP.gray100}`,
          }}
        >
          <span>Customer</span>
          <span>Email</span>
          <span>Members</span>
          <span>Enrollments</span>
          <span>Loyalty</span>
          <span>Last Invoice</span>
        </div>

        {filtered.map((customer, i) => {
          const isExpanded = expandedId === customer.id;
          const color = AVATAR_COLORS[i % AVATAR_COLORS.length];

          return (
            <div key={customer.id}>
              <div
                onClick={() => setExpandedId(isExpanded ? null : customer.id)}
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 180px 90px 110px 100px 90px",
                  padding: "13px 20px",
                  fontSize: 13,
                  gap: 8,
                  borderBottom: `1px solid ${TLP.gray100}`,
                  alignItems: "center",
                  cursor: "pointer",
                  background: isExpanded ? TLP.gray50 : "transparent",
                  transition: "background 0.1s",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Avatar name={customer.full_name || ""} size={34} color={color} />
                  <div>
                    <div style={{ fontWeight: 700, color: TLP.navy }}>{customer.full_name}</div>
                    <div style={{ fontSize: 11, color: TLP.gray500 }}>{customer.phone || "—"}</div>
                  </div>
                </div>
                <span style={{ color: TLP.gray600, fontSize: 12 }}>{maskEmail(customer.email || "")}</span>
                <span style={{ fontWeight: 600, color: TLP.navy }}>{customer.member_count}</span>
                <span style={{ fontWeight: 600, color: TLP.navy }}>0</span>
                <span style={{ color: TLP.amber, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Star size={12} fill={TLP.amber} strokeWidth={0} /> {customer.loyalty_points || 0}
                </span>
                <span style={{ color: TLP.gray400, fontSize: 12 }}>—</span>
              </div>

              {isExpanded && (
                <div
                  style={{
                    padding: "16px 20px 20px",
                    borderBottom: `1px solid ${TLP.gray100}`,
                    background: TLP.gray50,
                    display: "grid",
                    gridTemplateColumns: "1fr",
                    gap: 20,
                  }}
                >
                  <div style={{ fontSize: 13, color: TLP.gray600 }}>
                    <p><strong>CFC ID:</strong> {customer.cfc_id || "None"}</p>
                    <p><strong>Gender:</strong> {customer.gender || "Not specified"}</p>
                    <p><strong>Emergency Contact:</strong> {customer.emergency_contact || "Not specified"}</p>
                    <p><strong>Terms Accepted:</strong> {customer.terms_accepted ? "Yes" : "No"}</p>
                    <p><strong>Joined:</strong> {new Date(customer.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </Card>

      <Modal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        title="Add Customer"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowAdd(false)} disabled={saving}>Cancel</Button>
            <Button
              variant="primary"
              onClick={handleAdd}
              disabled={!form.fullName || !form.email || saving}
            >
              {saving ? "Creating..." : "Add Customer"}
            </Button>
          </>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Input
            label="Full Name"
            value={form.fullName}
            onChange={set("fullName")}
            required
            placeholder="e.g. Priya Patel"
          />
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={set("email")}
            required
            placeholder="customer@example.com"
          />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Input
              label="Date of Birth"
              type="date"
              value={form.dob}
              onChange={set("dob")}
            />
            <Select
              label="Gender"
              value={form.gender}
              onChange={set("gender")}
              options={GENDER_OPTIONS}
            />
          </div>
          <Input
            label="Phone"
            value={form.phone}
            onChange={set("phone")}
            placeholder="+1-416-555-0100"
          />
          <Input
            label="CFC ID (optional)"
            value={form.cfcId}
            onChange={set("cfcId")}
            hint="Only required for Chess tournaments"
            placeholder="CFC-2025-XXXX"
          />
        </div>
      </Modal>
    </div>
  );
}
