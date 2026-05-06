"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Tabs } from "@/components/ui/Tabs";
import { PageHeader } from "@/components/layout/PageHeader";
import { TLP } from "@/lib/theme/tokens";
import { PRICE_REQUESTS } from "@/lib/mock/priceRequests";
import { TENANT_BY_ID } from "@/lib/mock/tenants";
import { VARIANT_BY_ID } from "@/lib/mock/courseVariants";
import { LEVEL_BY_ID } from "@/lib/mock/levels";
import { PLANET_BY_ID } from "@/lib/mock/planets";
import type { PriceChangeRequest, PriceChangeStatus } from "@/lib/types";

const TABS = [
  { id: "pending", label: "Pending Review" },
  { id: "approved", label: "Approved" },
  { id: "rejected", label: "Rejected" },
];

function variantLabel(variantId: string) {
  const variant = VARIANT_BY_ID[variantId];
  if (!variant) return variantId;
  const level = LEVEL_BY_ID[variant.levelId];
  const planet = level ? PLANET_BY_ID[level.planetId] : null;
  const freq = variant.frequencyPerWeek === 1 ? "1x/wk" : variant.frequencyPerWeek === 2 ? "2x/wk" : "3x/wk";
  return `${planet?.name ?? "—"} · ${level?.name ?? "—"} (${freq})`;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" });
}

export default function PricingPage() {
  const [tab, setTab] = useState("pending");
  const [statuses, setStatuses] = useState<Record<string, PriceChangeStatus>>(
    Object.fromEntries(PRICE_REQUESTS.map((r) => [r.id, r.status])),
  );

  const [approveTarget, setApproveTarget] = useState<PriceChangeRequest | null>(null);
  const [rejectTarget, setRejectTarget] = useState<PriceChangeRequest | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const requests = PRICE_REQUESTS.map((r) => ({ ...r, status: statuses[r.id] ?? r.status }));
  const filtered = requests.filter((r) => r.status === tab);

  function handleApprove() {
    if (!approveTarget) return;
    setStatuses((prev) => ({ ...prev, [approveTarget.id]: "approved" }));
    setSuccessBanner(`Price request approved for ${variantLabel(approveTarget.courseVariantId)}.`);
    setApproveTarget(null);
    setTimeout(() => setSuccessBanner(null), 4000);
    if (tab === "pending" && filtered.filter((r) => r.id !== approveTarget.id).length === 0) {
      setTab("approved");
    }
  }

  function handleReject() {
    if (!rejectTarget) return;
    setStatuses((prev) => ({ ...prev, [rejectTarget.id]: "rejected" }));
    setSuccessBanner(`Price request rejected for ${variantLabel(rejectTarget.courseVariantId)}.`);
    setRejectTarget(null);
    setRejectReason("");
    setTimeout(() => setSuccessBanner(null), 4000);
  }

  const pendingCount = requests.filter((r) => r.status === "pending").length;

  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader
        title="Pricing Requests"
        subtitle="Review and approve pricing change requests from franchise ownerships"
      />

      {successBanner && (
        <div
          style={{
            padding: "12px 18px",
            background: TLP.greenLight,
            border: `1.5px solid ${TLP.green}`,
            borderRadius: 10,
            fontSize: 13,
            color: TLP.green,
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span>✓</span> {successBanner}
        </div>
      )}

      <Card style={{ padding: "20px 24px" }}>
        <div style={{ marginBottom: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div />
          {pendingCount > 0 && (
            <span
              style={{
                background: TLP.amberLight,
                color: TLP.amber,
                fontSize: 12,
                fontWeight: 700,
                padding: "3px 10px",
                borderRadius: 20,
              }}
            >
              {pendingCount} pending
            </span>
          )}
        </div>

        <Tabs tabs={TABS} active={tab} onChange={setTab} />

        {filtered.length === 0 ? (
          <div
            style={{
              padding: "40px 20px",
              textAlign: "center",
              color: TLP.gray400,
              fontSize: 14,
            }}
          >
            No {tab} requests.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {filtered.map((req) => {
              const ownership = TENANT_BY_ID[req.requestingOwnershipId];
              const delta = req.requestedPrice - req.currentPrice;
              return (
                <div
                  key={req.id}
                  style={{
                    border: `1.5px solid ${TLP.gray200}`,
                    borderRadius: 10,
                    padding: "16px 20px",
                    display: "flex",
                    gap: 16,
                    alignItems: "flex-start",
                  }}
                >
                  {/* Left: details */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          color: ownership?.ownershipType === "corporate" ? TLP.navy : TLP.teal,
                          background: ownership?.ownershipType === "corporate" ? "#f0f2f8" : TLP.tealLight,
                          padding: "2px 8px",
                          borderRadius: 4,
                        }}
                      >
                        {ownership?.fullName ?? req.requestingOwnershipId}
                      </span>
                      {req.status === "pending" && (
                        <Badge label="Pending Review" color={TLP.amber} bg={TLP.amberLight} />
                      )}
                      {req.status === "approved" && (
                        <Badge label="Approved" color={TLP.green} bg={TLP.greenLight} />
                      )}
                      {req.status === "rejected" && (
                        <Badge label="Rejected" color={TLP.red} bg={TLP.redLight} />
                      )}
                    </div>

                    <div style={{ fontSize: 15, fontWeight: 700, color: TLP.navy, marginBottom: 4 }}>
                      {variantLabel(req.courseVariantId)}
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <span style={{ fontSize: 13, color: TLP.gray600 }}>
                        <span style={{ textDecoration: "line-through", color: TLP.gray400 }}>
                          ${req.currentPrice}
                        </span>
                        {" → "}
                        <span style={{ fontWeight: 700, color: TLP.navy }}>${req.requestedPrice}</span>
                      </span>
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          color: TLP.green,
                          background: TLP.greenLight,
                          padding: "2px 8px",
                          borderRadius: 4,
                        }}
                      >
                        +${delta} (+{Math.round((delta / req.currentPrice) * 100)}%)
                      </span>
                    </div>

                    <div
                      style={{
                        fontSize: 13,
                        color: TLP.gray600,
                        background: TLP.gray50,
                        padding: "8px 12px",
                        borderRadius: 7,
                        borderLeft: `3px solid ${TLP.gray300}`,
                        lineHeight: 1.5,
                        marginBottom: 8,
                      }}
                    >
                      {req.reason}
                    </div>

                    <div style={{ fontSize: 11, color: TLP.gray400 }}>
                      Submitted {fmtDate(req.submittedAt)}
                      {req.reviewedAt && (
                        <> · Reviewed {fmtDate(req.reviewedAt)}</>
                      )}
                    </div>
                  </div>

                  {/* Right: actions */}
                  {req.status === "pending" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, flexShrink: 0 }}>
                      <Button
                        variant="primary"
                        size="sm"
                        icon="✓"
                        onClick={() => setApproveTarget(req)}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        icon="✕"
                        onClick={() => {
                          setRejectTarget(req);
                          setRejectReason("");
                        }}
                      >
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Approve modal */}
      <Modal
        open={!!approveTarget}
        onClose={() => setApproveTarget(null)}
        title="Approve Price Request"
        footer={
          <>
            <Button variant="ghost" onClick={() => setApproveTarget(null)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleApprove}>
              Confirm Approval
            </Button>
          </>
        }
      >
        {approveTarget && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <p style={{ margin: 0, fontSize: 14, color: TLP.gray700, lineHeight: 1.6 }}>
              You are approving a price increase for{" "}
              <strong>{variantLabel(approveTarget.courseVariantId)}</strong> from{" "}
              <strong>${approveTarget.currentPrice}</strong> to{" "}
              <strong>${approveTarget.requestedPrice}</strong>.
            </p>
            <div
              style={{
                padding: "12px 16px",
                background: TLP.greenLight,
                borderRadius: 8,
                border: `1px solid ${TLP.green}30`,
                fontSize: 13,
                color: TLP.gray700,
              }}
            >
              <div style={{ fontWeight: 600, color: TLP.green, marginBottom: 4 }}>Ownership reason:</div>
              {approveTarget.reason}
            </div>
            <p style={{ margin: 0, fontSize: 13, color: TLP.gray500 }}>
              This action will notify Maple Leaf Academy that their request has been approved.
              The new price will take effect immediately.
            </p>
          </div>
        )}
      </Modal>

      {/* Reject modal */}
      <Modal
        open={!!rejectTarget}
        onClose={() => {
          setRejectTarget(null);
          setRejectReason("");
        }}
        title="Reject Price Request"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => {
                setRejectTarget(null);
                setRejectReason("");
              }}
            >
              Cancel
            </Button>
            <Button variant="danger" onClick={handleReject}>
              Confirm Rejection
            </Button>
          </>
        }
      >
        {rejectTarget && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <p style={{ margin: 0, fontSize: 14, color: TLP.gray700, lineHeight: 1.6 }}>
              You are rejecting the price request for{" "}
              <strong>{variantLabel(rejectTarget.courseVariantId)}</strong>{" "}
              (${rejectTarget.currentPrice} → ${rejectTarget.requestedPrice}).
            </p>
            <Input
              label="Reason for rejection (optional)"
              placeholder="e.g. Price increase too aggressive for current market conditions."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <p style={{ margin: 0, fontSize: 13, color: TLP.gray500 }}>
              Maple Leaf Academy will be notified of this rejection.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}
