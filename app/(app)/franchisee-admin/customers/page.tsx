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
import { CUSTOMERS } from "@/lib/mock/customers";
import { MEMBERS_BY_CUSTOMER } from "@/lib/mock/members";
import { ENROLLMENTS } from "@/lib/mock/enrollments";
import { BATCH_BY_ID } from "@/lib/mock/batches";
import { LEVEL_BY_ID } from "@/lib/mock/levels";
import { PLANET_BY_ID } from "@/lib/mock/planets";
import { INVOICES_BY_CUSTOMER } from "@/lib/mock/invoices";
import type { Customer } from "@/lib/types";

const AVATAR_COLORS = [TLP.teal, TLP.purple, TLP.navy, TLP.blue, TLP.green];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function fmtTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "pm" : "am";
  const hr = h > 12 ? h - 12 : h || 12;
  return m === 0 ? `${hr}${ampm}` : `${hr}:${String(m).padStart(2, "0")}${ampm}`;
}

function maskEmail(email: string) {
  const [local, domain] = email.split("@");
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

export default function FranchiseeCustomersPage() {
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<AddForm>(BLANK_FORM);
  const [extraCustomers, setExtraCustomers] = useState<Customer[]>([]);

  const allCustomers = [...CUSTOMERS, ...extraCustomers];

  const filtered = allCustomers.filter(
    (c) =>
      c.fullName.toLowerCase().includes(search.toLowerCase()) ||
      (c.phone ?? "").includes(search),
  );

  function handleAdd() {
    if (!form.fullName || !form.dob || !form.phone) return;
    const newCustomer: Customer = {
      id: `cust_new_${Date.now()}`,
      userId: `user_new_${Date.now()}`,
      fullName: form.fullName,
      dob: form.dob,
      phone: form.phone,
      gender: form.gender || undefined,
      cfcId: form.cfcId || undefined,
      termsAccepted: true,
      loyaltyPoints: 0,
    };
    setExtraCustomers((prev) => [...prev, newCustomer]);
    setShowAdd(false);
    setForm(BLANK_FORM);
  }

  function set(field: keyof AddForm) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  return (
    <div style={{ padding: 24 }}>
      <PageHeader
        title="Customers"
        subtitle={`${allCustomers.length} registered customers`}
        actions={
          <div style={{ display: "flex", gap: 8 }}>
            <Button variant="secondary" icon="⬇">
              Export CSV
            </Button>
            <Button variant="primary" icon="➕" onClick={() => { setForm(BLANK_FORM); setShowAdd(true); }}>
              Add Customer
            </Button>
          </div>
        }
      />

      <div style={{ marginBottom: 20, maxWidth: 400 }}>
        <Input
          placeholder="Search by name or phone…"
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
          const members = MEMBERS_BY_CUSTOMER[customer.id] ?? [];
          const activeEnrollments = ENROLLMENTS.filter(
            (e) => e.customerId === customer.id && e.status === "active",
          );
          const invoices = [...(INVOICES_BY_CUSTOMER[customer.id] ?? [])].reverse();
          const lastInvoice = invoices[0];
          const isExpanded = expandedId === customer.id;
          const color = AVATAR_COLORS[i % AVATAR_COLORS.length];
          const emailStub = `${customer.fullName.toLowerCase().replace(/\s+/g, ".")}@demo.com`;

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
                  <Avatar name={customer.fullName} size={34} color={color} />
                  <div>
                    <div style={{ fontWeight: 700, color: TLP.navy }}>{customer.fullName}</div>
                    <div style={{ fontSize: 11, color: TLP.gray500 }}>{customer.phone}</div>
                  </div>
                </div>
                <span style={{ color: TLP.gray600, fontSize: 12 }}>{maskEmail(emailStub)}</span>
                <span style={{ fontWeight: 600, color: TLP.navy }}>{members.length}</span>
                <span style={{ fontWeight: 600, color: TLP.navy }}>{activeEnrollments.length}</span>
                <span style={{ color: TLP.amber, fontWeight: 600 }}>⭐ {customer.loyaltyPoints}</span>
                {lastInvoice ? (
                  <Badge
                    label={lastInvoice.status === "paid" ? "Paid" : lastInvoice.status === "failed" ? "Failed" : lastInvoice.status}
                    color={lastInvoice.status === "paid" ? TLP.green : TLP.red}
                    bg={lastInvoice.status === "paid" ? TLP.greenLight : TLP.redLight}
                  />
                ) : (
                  <span style={{ color: TLP.gray400, fontSize: 12 }}>—</span>
                )}
              </div>

              {isExpanded && (
                <div
                  style={{
                    padding: "16px 20px 20px",
                    borderBottom: `1px solid ${TLP.gray100}`,
                    background: TLP.gray50,
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 20,
                  }}
                >
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: TLP.gray500, textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 8 }}>
                      Members
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {members.map((m) => (
                        <div
                          key={m.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            padding: "8px 12px",
                            background: TLP.white,
                            borderRadius: 8,
                            border: `1px solid ${TLP.gray200}`,
                          }}
                        >
                          <Avatar name={m.fullName} size={28} color={TLP.teal} />
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: TLP.navy }}>{m.fullName}</div>
                            <div style={{ fontSize: 11, color: TLP.gray500 }}>{m.grade ?? "Adult"}</div>
                          </div>
                          {m.isSelf && <Badge label="Self" color={TLP.teal} bg={TLP.tealLight} />}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: TLP.gray500, textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 8 }}>
                      Active Enrollments
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {activeEnrollments.length === 0 ? (
                        <p style={{ margin: 0, fontSize: 13, color: TLP.gray400 }}>None.</p>
                      ) : (
                        activeEnrollments.map((enr) => {
                          const batch = BATCH_BY_ID[enr.batchId];
                          const level = batch ? LEVEL_BY_ID[batch.levelId] : null;
                          const planet = level ? PLANET_BY_ID[level.planetId] : null;
                          return (
                            <div
                              key={enr.id}
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                padding: "8px 12px",
                                background: TLP.white,
                                borderRadius: 8,
                                border: `1px solid ${TLP.gray200}`,
                                fontSize: 13,
                              }}
                            >
                              <span style={{ color: TLP.gray700 }}>
                                {planet?.name} · {level?.name}
                              </span>
                              <span style={{ fontSize: 12, color: TLP.gray500 }}>
                                {DAYS[batch?.dayOfWeek ?? 0]}s {fmtTime(batch?.startTime ?? "")}
                              </span>
                            </div>
                          );
                        })
                      )}
                    </div>
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
            <Button variant="secondary" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button
              variant="primary"
              onClick={handleAdd}
              disabled={!form.fullName || !form.dob || !form.phone}
            >
              Add Customer
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
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Input
              label="Date of Birth"
              type="date"
              value={form.dob}
              onChange={set("dob")}
              required
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
            required
            placeholder="+1-416-555-0100"
          />
          <Input
            label="Email (optional)"
            type="email"
            value={form.email}
            onChange={set("email")}
            placeholder="customer@example.com"
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
