"use client";

import { useState } from "react";
import { Plus, Info, CalendarClock, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { PageHeader } from "@/components/layout/PageHeader";
import { TLP } from "@/lib/theme/tokens";

type DiscountTier = {
  id: string;
  planetsCount: number;
  discountPct: number;
};

const INITIAL_TIERS: DiscountTier[] = [
  { id: "tier_2", planetsCount: 2, discountPct: 5 },
  { id: "tier_3", planetsCount: 3, discountPct: 10 },
  { id: "tier_4", planetsCount: 4, discountPct: 15 },
];

export default function DiscountsPage() {
  const [tiers, setTiers] = useState<DiscountTier[]>(INITIAL_TIERS);
  const [editValues, setEditValues] = useState<Record<string, string>>(
    Object.fromEntries(INITIAL_TIERS.map((t) => [t.id, String(t.discountPct)])),
  );
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ planetsCount: "5", discountPct: "20" });

  function handleSave(tierId: string) {
    const val = parseFloat(editValues[tierId] ?? "0");
    if (isNaN(val) || val < 0 || val > 100) return;
    setTiers((prev) => prev.map((t) => (t.id === tierId ? { ...t, discountPct: val } : t)));
    setSavedIds((s) => new Set([...s, tierId]));
    setTimeout(() => setSavedIds((s) => { const n = new Set(s); n.delete(tierId); return n; }), 2000);
  }

  function handleAddTier() {
    const count = parseInt(addForm.planetsCount);
    const pct = parseFloat(addForm.discountPct);
    if (isNaN(count) || isNaN(pct)) return;
    const newTier: DiscountTier = {
      id: `tier_${count}`,
      planetsCount: count,
      discountPct: pct,
    };
    setTiers((prev) => [...prev, newTier].sort((a, b) => a.planetsCount - b.planetsCount));
    setEditValues((ev) => ({ ...ev, [newTier.id]: String(pct) }));
    setShowAdd(false);
    setAddForm({ planetsCount: "5", discountPct: "20" });
  }

  return (
    <div style={{ padding: 24 }}>
      <PageHeader
        title="Multi-Planet Discounts"
        subtitle="Configure automatic discounts for members enrolled in multiple planets"
        actions={
          <Button variant="primary" icon={<Plus size={15} strokeWidth={2.5} />} onClick={() => setShowAdd(true)}>
            Add Tier
          </Button>
        }
      />

      {/* Explanation card */}
      <Card style={{ padding: "16px 20px", marginBottom: 24, background: TLP.blueLight, border: `1px solid ${TLP.blue}30` }}>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
          <Info size={20} strokeWidth={1.75} color={TLP.blue} style={{ flexShrink: 0, marginTop: 1 }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: TLP.navy, marginBottom: 4 }}>
              How multi-planet discounts work
            </div>
            <p style={{ margin: 0, fontSize: 13, color: TLP.gray700, lineHeight: 1.6 }}>
              Discounts apply per member, recomputed monthly when enrolled in multiple planets.
              The highest applicable tier is used — they do not stack. Discounts are applied
              automatically at the next billing cycle after eligibility is confirmed.
            </p>
          </div>
        </div>
      </Card>

      {/* Discount tiers table */}
      <Card style={{ overflow: "hidden", padding: 0, marginBottom: 20 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 200px 1fr 160px",
            padding: "10px 24px",
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
          <span>Planets Enrolled</span>
          <span>Discount %</span>
          <span>Example Saving</span>
          <span>Action</span>
        </div>

        {tiers.map((tier, i) => {
          const isLast = i === tiers.length - 1;
          const exampleBase = 300;
          const saving = (exampleBase * tier.discountPct) / 100;
          const saved = savedIds.has(tier.id);

          return (
            <div
              key={tier.id}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 200px 1fr 160px",
                padding: "16px 24px",
                gap: 8,
                borderBottom: isLast ? "none" : `1px solid ${TLP.gray100}`,
                alignItems: "center",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    background: TLP.tealLight,
                    color: TLP.teal,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 800,
                    fontSize: 16,
                    flexShrink: 0,
                  }}
                >
                  {tier.planetsCount}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: TLP.navy }}>
                    {tier.planetsCount} Planet{tier.planetsCount !== 1 ? "s" : ""}
                  </div>
                  <div style={{ fontSize: 12, color: TLP.gray500 }}>enrolled simultaneously</div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 80 }}>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    value={editValues[tier.id] ?? String(tier.discountPct)}
                    onChange={(e) =>
                      setEditValues((ev) => ({ ...ev, [tier.id]: e.target.value }))
                    }
                    style={{
                      border: `1.5px solid ${TLP.gray200}`,
                      borderRadius: 8,
                      padding: "6px 10px",
                      fontSize: 14,
                      fontWeight: 700,
                      color: TLP.navy,
                      outline: "none",
                      width: "100%",
                      background: TLP.white,
                      textAlign: "center",
                    }}
                  />
                </div>
                <span style={{ fontSize: 14, fontWeight: 600, color: TLP.gray600 }}>%</span>
              </div>

              <div style={{ fontSize: 13, color: TLP.gray600 }}>
                e.g. saves{" "}
                <span style={{ fontWeight: 700, color: TLP.green }}>
                  ${saving.toFixed(0)}/mo
                </span>{" "}
                on a $300 invoice
              </div>

              <Button
                variant={saved ? "secondary" : "primary"}
                size="sm"
                onClick={() => handleSave(tier.id)}
                style={saved ? { color: TLP.green, borderColor: TLP.green } : {}}
              >
                {saved ? <><Check size={13} strokeWidth={2.5} style={{ marginRight: 4 }} />Saved</> : "Save"}
              </Button>
            </div>
          );
        })}
      </Card>

      {/* Note */}
      <div
        style={{
          background: TLP.amberLight,
          border: `1px solid ${TLP.amber}40`,
          borderRadius: 10,
          padding: "12px 16px",
          fontSize: 13,
          color: TLP.gray700,
          display: "flex",
          gap: 10,
          alignItems: "flex-start",
        }}
      >
        <CalendarClock size={18} strokeWidth={1.75} color={TLP.amber} style={{ flexShrink: 0, marginTop: 1 }} />
        <span>
          <strong>Note:</strong> Discounts are applied automatically at the next billing cycle.
          Changes made here take effect from the following month.
        </span>
      </div>

      {/* Add Tier Modal */}
      <Modal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        title="Add Discount Tier"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleAddTier}>Add Tier</Button>
          </>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Input
            label="Number of Planets"
            type="number"
            min="2"
            max="10"
            value={addForm.planetsCount}
            onChange={(e) => setAddForm((f) => ({ ...f, planetsCount: e.target.value }))}
            hint="Minimum 2"
          />
          <Input
            label="Discount %"
            type="number"
            min="0"
            max="100"
            step="0.5"
            value={addForm.discountPct}
            onChange={(e) => setAddForm((f) => ({ ...f, discountPct: e.target.value }))}
            hint="e.g. 20 for 20%"
          />
          <div
            style={{
              background: TLP.tealLight,
              borderRadius: 8,
              padding: "10px 14px",
              fontSize: 13,
              color: TLP.gray700,
            }}
          >
            A member enrolled in <strong>{addForm.planetsCount} planets</strong> will receive{" "}
            <strong style={{ color: TLP.teal }}>{addForm.discountPct}% off</strong> their monthly invoice.
          </div>
        </div>
      </Modal>
    </div>
  );
}
