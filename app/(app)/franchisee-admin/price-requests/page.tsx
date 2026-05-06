"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { PageHeader } from "@/components/layout/PageHeader";
import { Select } from "@/components/ui/Select";
import { TLP } from "@/lib/theme/tokens";
import { PRICE_REQUESTS } from "@/lib/mock/priceRequests";
import type { PriceChangeRequest, PriceChangeStatus } from "@/lib/types";

const COURSE_VARIANT_OPTIONS = [
  { value: "", label: "Select course variant" },
  { value: "lvl_chess_pp_1x", label: "Chess PP · 1x/week" },
  { value: "lvl_chess_rr_1x", label: "Chess RR · 1x/week" },
  { value: "lvl_math_g5_1x", label: "Math Grade 5 · 1x/week" },
  { value: "lvl_math_g7_1x", label: "Math Grade 7 · 1x/week" },
  { value: "lvl_fin_basics_1x", label: "Finance Basics · 1x/week" },
  { value: "lvl_fin_invest_1x", label: "Finance Investment · 1x/week" },
  { value: "lvl_eng_g5_1x", label: "English Grade 5 · 1x/week" },
  { value: "lvl_arts_beg_1x", label: "Arts Beginner · 1x/week" },
];

const VARIANT_LABEL: Record<string, string> = Object.fromEntries(
  COURSE_VARIANT_OPTIONS.filter((o) => o.value).map((o) => [o.value, o.label]),
);

const STATUS_FILTER_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

function statusBadge(status: PriceChangeStatus) {
  if (status === "pending") return <Badge label="Pending" color={TLP.amber} bg={TLP.amberLight} />;
  if (status === "approved") return <Badge label="Approved" color={TLP.green} bg={TLP.greenLight} />;
  return <Badge label="Rejected" color={TLP.red} bg={TLP.redLight} />;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" });
}

type AddForm = {
  courseVariantId: string;
  requestedPrice: string;
  reason: string;
};

const BLANK_FORM: AddForm = { courseVariantId: "", requestedPrice: "", reason: "" };

export default function PriceRequestsPage() {
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<AddForm>(BLANK_FORM);
  const [extraRequests, setExtraRequests] = useState<PriceChangeRequest[]>([]);

  const allRequests = [...PRICE_REQUESTS, ...extraRequests];

  const filtered = allRequests.filter(
    (r) => !statusFilter || r.status === statusFilter,
  );

  const pendingCount = allRequests.filter((r) => r.status === "pending").length;

  function handleSubmit() {
    if (!form.courseVariantId || !form.requestedPrice || !form.reason) return;
    const newRequest: PriceChangeRequest = {
      id: `pcr_new_${Date.now()}`,
      requestingOwnershipId: "ten_mla",
      courseVariantId: form.courseVariantId,
      currentPrice: 0,
      requestedPrice: Number(form.requestedPrice),
      reason: form.reason,
      status: "pending",
      submittedAt: new Date().toISOString(),
    };
    setExtraRequests((prev) => [...prev, newRequest]);
    setShowAdd(false);
    setForm(BLANK_FORM);
  }

  return (
    <div style={{ padding: 24 }}>
      <PageHeader
        title="Price Requests"
        subtitle={`Maple Leaf Academy — ${pendingCount} pending`}
        actions={
          <Button variant="primary" icon="➕" onClick={() => { setForm(BLANK_FORM); setShowAdd(true); }}>
            Submit Request
          </Button>
        }
      />

      <div style={{ marginBottom: 20, display: "flex", gap: 12, alignItems: "center" }}>
        <div style={{ width: 200 }}>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={STATUS_FILTER_OPTIONS}
          />
        </div>
        <span style={{ fontSize: 13, color: TLP.gray500 }}>
          {filtered.length} request{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      <Card style={{ overflow: "hidden", padding: 0 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 110px 110px 110px 140px 100px",
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
          <span>Course Variant</span>
          <span>Current</span>
          <span>Requested</span>
          <span>Status</span>
          <span>Submitted</span>
          <span>Reviewed</span>
        </div>

        {filtered.length === 0 ? (
          <div style={{ padding: "40px 20px", textAlign: "center", color: TLP.gray400, fontSize: 14 }}>
            No price requests match the selected filter.
          </div>
        ) : (
          filtered
            .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))
            .map((req, i) => (
              <div key={req.id}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 110px 110px 110px 140px 100px",
                    padding: "14px 20px",
                    fontSize: 13,
                    gap: 8,
                    borderBottom: i < filtered.length - 1 ? `1px solid ${TLP.gray100}` : "none",
                    alignItems: "center",
                    background: req.status === "pending" ? `${TLP.amber}08` : "transparent",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, color: TLP.navy }}>
                      {VARIANT_LABEL[req.courseVariantId] ?? req.courseVariantId}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: TLP.gray500,
                        marginTop: 3,
                        maxWidth: 360,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {req.reason}
                    </div>
                  </div>
                  <span style={{ color: TLP.gray600 }}>
                    {req.currentPrice > 0 ? `$${req.currentPrice}` : "—"}
                  </span>
                  <span style={{ fontWeight: 700, color: TLP.navy }}>${req.requestedPrice}</span>
                  <span>{statusBadge(req.status)}</span>
                  <span style={{ color: TLP.gray500 }}>{fmtDate(req.submittedAt)}</span>
                  <span style={{ color: TLP.gray500 }}>
                    {req.reviewedAt ? fmtDate(req.reviewedAt) : "—"}
                  </span>
                </div>
              </div>
            ))
        )}
      </Card>

      <Modal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        title="Submit Price Request"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={!form.courseVariantId || !form.requestedPrice || !form.reason}
            >
              Submit Request
            </Button>
          </>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Select
            label="Course Variant"
            value={form.courseVariantId}
            onChange={(e) => setForm((f) => ({ ...f, courseVariantId: e.target.value }))}
            options={COURSE_VARIANT_OPTIONS}
          />
          <Input
            label="Requested Price (CAD)"
            type="number"
            value={form.requestedPrice}
            onChange={(e) => setForm((f) => ({ ...f, requestedPrice: e.target.value }))}
            required
            placeholder="e.g. 149"
            hint="Enter the new monthly price you are requesting"
          />
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: TLP.gray700, display: "block", marginBottom: 4 }}>
              Reason <span style={{ color: TLP.red }}>*</span>
            </label>
            <textarea
              value={form.reason}
              onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
              placeholder="Explain the business reason for this price change…"
              rows={4}
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
          <div
            style={{
              background: TLP.blueLight,
              borderRadius: 8,
              padding: "10px 14px",
              fontSize: 12,
              color: TLP.blue,
            }}
          >
            ℹ️ Requests are reviewed by The Learning Planet management team. You will be notified once a decision is made.
          </div>
        </div>
      </Modal>
    </div>
  );
}
