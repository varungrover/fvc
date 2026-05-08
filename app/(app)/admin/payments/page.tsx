"use client";

import { useState } from "react";
import { Download, CircleCheck, TriangleAlert, Clock, FileText } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatTile } from "@/components/ui/StatTile";
import { Tabs } from "@/components/ui/Tabs";
import { TLP } from "@/lib/theme/tokens";
import { INVOICES } from "@/lib/mock/invoices";
import { CUSTOMER_BY_ID } from "@/lib/mock/customers";
import type { Invoice } from "@/lib/types";

type FilterTab = "all" | "paid" | "failed" | "pending";

const FILTER_TABS = [
  { id: "all", label: "All" },
  { id: "paid", label: "Paid" },
  { id: "failed", label: "Failed" },
  { id: "pending", label: "Pending" },
];

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-CA", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function fmtPeriod(iso: string) {
  return new Date(iso).toLocaleDateString("en-CA", { month: "long", year: "numeric" });
}

const totalCollected = INVOICES.filter(
  (i) => i.status === "paid" && i.issuedAt.startsWith("2026-04"),
).reduce((s, i) => s + i.total, 0);

const totalFailed = INVOICES.filter((i) => i.status === "failed").length;
const totalPending = INVOICES.filter((i) => i.status === "pending").length;

export default function PaymentsPage() {
  const [filter, setFilter] = useState<FilterTab>("all");
  const [charged, setCharged] = useState<Set<string>>(new Set());

  const filtered = INVOICES.filter((inv) => {
    if (filter === "all") return true;
    return inv.status === filter;
  });

  const failedInvoices = INVOICES.filter((i) => i.status === "failed" && !charged.has(i.id));

  return (
    <div style={{ padding: 24 }}>
      <PageHeader
        title="Payments"
        subtitle="All invoices across The Learning Planet"
        actions={
          <Button variant="secondary" icon={<Download size={15} strokeWidth={2} />}>
            Export CSV
          </Button>
        }
      />

      {/* Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 14,
          marginBottom: 24,
        }}
      >
        <StatTile
          label="Collected (April)"
          value={`$${totalCollected.toFixed(0)}`}
          icon={<CircleCheck size={22} strokeWidth={1.75} />}
          iconBg={TLP.greenLight}
          iconColor={TLP.green}
        />
        <StatTile
          label="Missed Payments"
          value={totalFailed}
          icon={<TriangleAlert size={22} strokeWidth={1.75} />}
          iconBg={TLP.redLight}
          iconColor={TLP.red}
        />
        <StatTile
          label="Pending"
          value={totalPending}
          icon={<Clock size={22} strokeWidth={1.75} />}
          iconBg={TLP.amberLight}
          iconColor={TLP.amber}
        />
        <StatTile
          label="Total Invoices"
          value={INVOICES.length}
          icon={<FileText size={22} strokeWidth={1.75} />}
          iconBg={TLP.blueLight}
          iconColor={TLP.blue}
        />
      </div>

      {/* Missed payments alert section */}
      {failedInvoices.length > 0 && (
        <Card style={{ padding: 0, overflow: "hidden", border: `1.5px solid ${TLP.red}`, marginBottom: 24 }}>
          <div
            style={{
              padding: "12px 20px",
              background: TLP.redLight,
              borderBottom: `1px solid ${TLP.red}20`,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <TriangleAlert size={18} strokeWidth={2} color={TLP.red} />
            <span style={{ fontWeight: 700, color: TLP.red, fontSize: 14 }}>
              Missed Payments — Immediate Attention Required
            </span>
          </div>
          {failedInvoices.map((inv, i) => {
            const customer = CUSTOMER_BY_ID[inv.customerId];
            return (
              <div
                key={inv.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px 20px",
                  borderBottom: i < failedInvoices.length - 1 ? `1px solid ${TLP.gray100}` : "none",
                  gap: 12,
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: TLP.navy }}>
                    {customer?.fullName ?? inv.customerId}
                  </div>
                  <div style={{ fontSize: 12, color: TLP.gray500 }}>
                    {fmtPeriod(inv.issuedAt)} · ${inv.total.toFixed(2)}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setCharged((c) => new Set([...c, inv.id]))}
                  >
                    Charge Failed
                  </Button>
                </div>
              </div>
            );
          })}
        </Card>
      )}

      {/* Invoice table */}
      <Card style={{ overflow: "hidden", padding: 0 }}>
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${TLP.gray100}` }}>
          <Tabs tabs={FILTER_TABS} active={filter} onChange={(id) => setFilter(id as FilterTab)} />
        </div>

        {/* Table header */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 160px 100px 100px 110px 120px",
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
          <span>Period</span>
          <span>Amount</span>
          <span>Tax</span>
          <span>Status</span>
          <span>Payment Method</span>
        </div>

        {filtered.map((inv, i) => {
          const customer = CUSTOMER_BY_ID[inv.customerId];
          const isLast = i === filtered.length - 1;
          const isFailed = inv.status === "failed";

          return (
            <div
              key={inv.id}
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 160px 100px 100px 110px 120px",
                padding: "13px 20px",
                fontSize: 13,
                gap: 8,
                borderBottom: isLast ? "none" : `1px solid ${TLP.gray100}`,
                alignItems: "center",
                background: isFailed ? TLP.redLight : "transparent",
              }}
            >
              <div>
                <div style={{ fontWeight: 700, color: TLP.navy }}>
                  {customer?.fullName ?? inv.customerId}
                </div>
                <div style={{ fontSize: 11, color: TLP.gray500 }}>
                  Issued {fmtDate(inv.issuedAt)}
                </div>
              </div>
              <span style={{ color: TLP.gray600 }}>{fmtPeriod(inv.issuedAt)}</span>
              <span style={{ fontWeight: 700, color: TLP.navy }}>${inv.amount.toFixed(2)}</span>
              <span style={{ color: TLP.gray600 }}>${inv.tax.toFixed(2)}</span>
              <InvoiceStatusBadge inv={inv} charged={charged} />
              <span style={{ fontSize: 12, color: TLP.gray500 }}>
                {inv.paymentMethodId ? "Visa •••• 4242" : "—"}
              </span>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div style={{ padding: "32px 20px", textAlign: "center", color: TLP.gray400, fontSize: 13 }}>
            No invoices for this filter.
          </div>
        )}
      </Card>
    </div>
  );
}

function InvoiceStatusBadge({ inv, charged }: { inv: Invoice; charged: Set<string> }) {
  if (charged.has(inv.id)) {
    return <Badge label="Retried" color={TLP.blue} bg={TLP.blueLight} />;
  }
  if (inv.status === "paid") return <Badge label="Paid" color={TLP.green} bg={TLP.greenLight} />;
  if (inv.status === "failed") return <Badge label="Failed" color={TLP.red} bg={TLP.redLight} />;
  if (inv.status === "pending") return <Badge label="Pending" color={TLP.amber} bg={TLP.amberLight} />;
  return <Badge label={inv.status} color={TLP.gray500} bg={TLP.gray100} />;
}
