"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { StatTile } from "@/components/ui/StatTile";
import { PageHeader } from "@/components/layout/PageHeader";
import { TLP, planetStyle } from "@/lib/theme/tokens";
import { Banknote, GraduationCap, Building2, Map, ChevronRight, ChevronDown, Crown, Calculator, BookOpen, DollarSign, Palette, Briefcase, Globe } from "lucide-react";
import type { ReactNode } from "react";

const PLANET_ICONS: Record<string, ReactNode> = {
  Chess:    <Crown      size={14} strokeWidth={2} />,
  Math:     <Calculator size={14} strokeWidth={2} />,
  Maths:    <Calculator size={14} strokeWidth={2} />,
  English:  <BookOpen   size={14} strokeWidth={2} />,
  Finance:  <DollarSign size={14} strokeWidth={2} />,
  Arts:     <Palette    size={14} strokeWidth={2} />,
  Business: <Briefcase  size={14} strokeWidth={2} />,
};

function getPlanetIcon(name: string) {
  return PLANET_ICONS[name] || <Globe size={14} strokeWidth={2} />;
}

type PivotRow = {
  locationId: string;
  locationName: string;
  ownershipId: string;
  ownershipName: string;
  planet: string;
  revenue: number;
  enrollments: number;
};

const ALL_ROWS: PivotRow[] = [
  { locationId: "loc_tlp_surrey", locationName: "Surrey Central", ownershipId: "ten_tlp", ownershipName: "The Learning Planet", planet: "Chess", revenue: 1200, enrollments: 9 },
  { locationId: "loc_tlp_surrey", locationName: "Surrey Central", ownershipId: "ten_tlp", ownershipName: "The Learning Planet", planet: "Math", revenue: 900, enrollments: 6 },
  { locationId: "loc_tlp_surrey", locationName: "Surrey Central", ownershipId: "ten_tlp", ownershipName: "The Learning Planet", planet: "Finance", revenue: 500, enrollments: 4 },
  { locationId: "loc_tlp_surrey", locationName: "Surrey Central", ownershipId: "ten_tlp", ownershipName: "The Learning Planet", planet: "Arts", revenue: 200, enrollments: 2 },
  { locationId: "loc_tlp_abbotsford", locationName: "Abbotsford", ownershipId: "ten_tlp", ownershipName: "The Learning Planet", planet: "Math", revenue: 400, enrollments: 3 },
  { locationId: "loc_tlp_langley", locationName: "Langley", ownershipId: "ten_tlp", ownershipName: "The Learning Planet", planet: "English", revenue: 600, enrollments: 4 },
  { locationId: "loc_mla_toronto", locationName: "Toronto Downtown", ownershipId: "ten_mla", ownershipName: "Maple Leaf Academy", planet: "Chess", revenue: 800, enrollments: 6 },
  { locationId: "loc_mla_toronto", locationName: "Toronto Downtown", ownershipId: "ten_mla", ownershipName: "Maple Leaf Academy", planet: "Finance", revenue: 600, enrollments: 4 },
  { locationId: "loc_mla_mississauga", locationName: "Mississauga", ownershipId: "ten_mla", ownershipName: "Maple Leaf Academy", planet: "Chess", revenue: 700, enrollments: 5 },
  { locationId: "loc_mla_mississauga", locationName: "Mississauga", ownershipId: "ten_mla", ownershipName: "Maple Leaf Academy", planet: "Math", revenue: 500, enrollments: 4 },
  { locationId: "loc_mla_brampton", locationName: "Brampton", ownershipId: "ten_mla", ownershipName: "Maple Leaf Academy", planet: "English", revenue: 300, enrollments: 2 },
];

const MARCH_ROWS: PivotRow[] = ALL_ROWS.map((r) => ({
  ...r,
  revenue: Math.round(r.revenue * 0.92),
  enrollments: Math.max(1, r.enrollments - 1),
}));

const FEB_ROWS: PivotRow[] = ALL_ROWS.map((r) => ({
  ...r,
  revenue: Math.round(r.revenue * 0.85),
  enrollments: Math.max(1, r.enrollments - 2),
}));

const Q1_ROWS: PivotRow[] = ALL_ROWS.map((r) => ({
  ...r,
  revenue: Math.round(r.revenue * 2.77),
  enrollments: r.enrollments,
}));

const PERIOD_DATA: Record<string, PivotRow[]> = {
  apr: ALL_ROWS,
  mar: MARCH_ROWS,
  feb: FEB_ROWS,
  q1: Q1_ROWS,
};

const PERIOD_OPTIONS = [
  { value: "apr", label: "April 2026" },
  { value: "mar", label: "March 2026" },
  { value: "feb", label: "February 2026" },
  { value: "q1", label: "Q1 2026 (Combined)" },
];

const OWNERSHIP_OPTIONS = [
  { value: "all", label: "All Ownerships" },
  { value: "ten_tlp", label: "The Learning Planet" },
  { value: "ten_mla", label: "Maple Leaf Academy" },
];

const PLANET_OPTIONS = [
  { value: "all", label: "All Planets" },
  { value: "Chess", label: "Chess" },
  { value: "Math", label: "Math" },
  { value: "English", label: "English" },
  { value: "Finance", label: "Finance" },
  { value: "Arts", label: "Arts" },
];

function fmt(n: number) {
  return `$${n.toLocaleString()}`;
}

function pct(part: number, total: number) {
  if (total === 0) return "—";
  return `${Math.round((part / total) * 100)}%`;
}

type LocationGroup = {
  locationId: string;
  locationName: string;
  ownershipId: string;
  ownershipName: string;
  rows: PivotRow[];
  total: number;
  totalEnrollments: number;
};

export default function RevenuePivotPage() {
  const [period, setPeriod] = useState("apr");
  const [ownership, setOwnership] = useState("all");
  const [planet, setPlanet] = useState("all");
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const source = PERIOD_DATA[period] ?? ALL_ROWS;

  const filtered = source.filter((r) => {
    if (ownership !== "all" && r.ownershipId !== ownership) return false;
    if (planet !== "all" && r.planet !== planet) return false;
    return true;
  });

  const networkTotal = filtered.reduce((s, r) => s + r.revenue, 0);
  const networkEnrollments = filtered.reduce((s, r) => s + r.enrollments, 0);

  const locationMap: Record<string, LocationGroup> = {};
  for (const row of filtered) {
    if (!locationMap[row.locationId]) {
      locationMap[row.locationId] = {
        locationId: row.locationId,
        locationName: row.locationName,
        ownershipId: row.ownershipId,
        ownershipName: row.ownershipName,
        rows: [],
        total: 0,
        totalEnrollments: 0,
      };
    }
    locationMap[row.locationId].rows.push(row);
    locationMap[row.locationId].total += row.revenue;
    locationMap[row.locationId].totalEnrollments += row.enrollments;
  }

  const groups = Object.values(locationMap);
  const tlpGroups = groups.filter((g) => g.ownershipId === "ten_tlp");
  const mlaGroups = groups.filter((g) => g.ownershipId === "ten_mla");
  const orderedGroups = [...tlpGroups, ...mlaGroups];

  const tlpTotal = tlpGroups.reduce((s, g) => s + g.total, 0);
  const mlaTotal = mlaGroups.reduce((s, g) => s + g.total, 0);

  function toggleLocation(id: string) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const COL = "1fr 120px 100px 100px 90px";

  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 24 }}>
      <PageHeader title="Revenue Pivot" subtitle="Network-wide revenue by location, planet, and time period" />

      {/* Summary tiles */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 14 }}>
        <StatTile
          label="Network Revenue"
          value={fmt(networkTotal)}
          icon={<Banknote size={22} strokeWidth={1.75} />}
          iconBg={TLP.amberLight}
          iconColor={TLP.amber}
        />
        <StatTile
          label="Total Enrollments"
          value={networkEnrollments}
          icon={<GraduationCap size={22} strokeWidth={1.75} />}
          iconBg={TLP.tealLight}
          iconColor={TLP.teal}
        />
        <StatTile
          label="TLP Revenue"
          value={fmt(tlpTotal)}
          delta={pct(tlpTotal, networkTotal) + " of network"}
          deltaColor={TLP.gray500}
          icon={<Building2 size={22} strokeWidth={1.75} />}
          iconBg={TLP.purpleLight}
          iconColor={TLP.purple}
        />
        <StatTile
          label="MLA Revenue"
          value={fmt(mlaTotal)}
          delta={pct(mlaTotal, networkTotal) + " of network"}
          deltaColor={TLP.gray500}
          icon={<Map size={22} strokeWidth={1.75} />}
          iconBg={TLP.tealLight}
          iconColor={TLP.teal}
        />
      </div>

      {/* Filters */}
      <Card style={{ padding: "16px 20px" }}>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div style={{ minWidth: 160 }}>
            <Select
              label="Time Period"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              options={PERIOD_OPTIONS}
            />
          </div>
          <div style={{ minWidth: 200 }}>
            <Select
              label="Ownership"
              value={ownership}
              onChange={(e) => setOwnership(e.target.value)}
              options={OWNERSHIP_OPTIONS}
            />
          </div>
          <div style={{ minWidth: 160 }}>
            <Select
              label="Planet"
              value={planet}
              onChange={(e) => setPlanet(e.target.value)}
              options={PLANET_OPTIONS}
            />
          </div>
        </div>
      </Card>

      {/* Pivot table */}
      <Card style={{ padding: 0, overflow: "hidden" }}>
        {/* Header */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: COL,
            padding: "10px 20px",
            background: TLP.gray50,
            fontSize: 11,
            fontWeight: 700,
            color: TLP.gray500,
            textTransform: "uppercase",
            letterSpacing: "0.4px",
            gap: 8,
            borderBottom: `1px solid ${TLP.gray200}`,
          }}
        >
          <span>Location / Planet</span>
          <span style={{ textAlign: "right" }}>Revenue</span>
          <span style={{ textAlign: "right" }}>Enrollments</span>
          <span style={{ textAlign: "right" }}>Avg / Student</span>
          <span style={{ textAlign: "right" }}>% Network</span>
        </div>

        {orderedGroups.length === 0 ? (
          <div style={{ padding: "40px 20px", textAlign: "center", color: TLP.gray500, fontSize: 14 }}>
            No data matches the selected filters.
          </div>
        ) : null}

        {orderedGroups.map((group, gi) => {
          const isCollapsed = collapsed.has(group.locationId);
          const isTLP = group.ownershipId === "ten_tlp";
          const accentColor = isTLP ? TLP.navy : TLP.teal;
          const accentBg = isTLP ? "#f0f2f8" : TLP.tealLight;
          const isLastInOwnership =
            gi === orderedGroups.length - 1 ||
            orderedGroups[gi + 1].ownershipId !== group.ownershipId;

          return (
            <div
              key={group.locationId}
              style={{ borderBottom: isLastInOwnership ? `2px solid ${TLP.gray200}` : `1px solid ${TLP.gray100}` }}
            >
              {/* Location row */}
              <button
                onClick={() => toggleLocation(group.locationId)}
                style={{
                  display: "grid",
                  gridTemplateColumns: COL,
                  padding: "12px 20px",
                  background: accentBg,
                  gap: 8,
                  width: "100%",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  alignItems: "center",
                  borderLeft: `3px solid ${accentColor}`,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 12, color: accentColor, opacity: 0.7, width: 12, display: "flex", alignItems: "center" }}>
                    {isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                  </span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: accentColor }}>
                      {group.locationName}
                    </div>
                    <div style={{ fontSize: 11, color: TLP.gray500 }}>{group.ownershipName}</div>
                  </div>
                </div>
                <div style={{ textAlign: "right", fontWeight: 700, fontSize: 14, color: TLP.navy }}>
                  {fmt(group.total)}
                </div>
                <div style={{ textAlign: "right", fontSize: 13, color: TLP.gray700 }}>
                  {group.totalEnrollments}
                </div>
                <div style={{ textAlign: "right", fontSize: 13, color: TLP.gray700 }}>
                  {group.totalEnrollments > 0 ? fmt(Math.round(group.total / group.totalEnrollments)) : "—"}
                </div>
                <div style={{ textAlign: "right", fontSize: 13, color: TLP.gray600 }}>
                  {pct(group.total, networkTotal)}
                </div>
              </button>

              {/* Planet sub-rows */}
              {!isCollapsed &&
                group.rows.map((row, ri) => {
                  const ps = planetStyle(row.planet);
                  return (
                    <div
                      key={`${group.locationId}-${row.planet}`}
                      style={{
                        display: "grid",
                        gridTemplateColumns: COL,
                        padding: "10px 20px 10px 44px",
                        gap: 8,
                        borderBottom: ri < group.rows.length - 1 ? `1px solid ${TLP.gray50}` : "none",
                        alignItems: "center",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span
                          style={{
                            fontSize: 14,
                            width: 28,
                            height: 28,
                            borderRadius: 6,
                            background: ps.bg,
                            color: ps.color,
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          {getPlanetIcon(row.planet)}
                        </span>
                        <span style={{ fontSize: 13, color: TLP.gray700, fontWeight: 500 }}>{row.planet}</span>
                      </div>
                      <div style={{ textAlign: "right", fontSize: 13, fontWeight: 600, color: TLP.navy }}>
                        {fmt(row.revenue)}
                      </div>
                      <div style={{ textAlign: "right", fontSize: 13, color: TLP.gray600 }}>
                        {row.enrollments}
                      </div>
                      <div style={{ textAlign: "right", fontSize: 13, color: TLP.gray600 }}>
                        {row.enrollments > 0 ? fmt(Math.round(row.revenue / row.enrollments)) : "—"}
                      </div>
                      <div style={{ textAlign: "right", fontSize: 13, color: TLP.gray500 }}>
                        {pct(row.revenue, networkTotal)}
                      </div>
                    </div>
                  );
                })}
            </div>
          );
        })}

        {/* Totals footer */}
        {orderedGroups.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: COL,
              padding: "14px 20px",
              gap: 8,
              background: TLP.gray50,
              alignItems: "center",
              borderTop: `2px solid ${TLP.gray300}`,
            }}
          >
            <span style={{ fontWeight: 700, fontSize: 13, color: TLP.navy }}>Network Total</span>
            <span style={{ textAlign: "right", fontWeight: 800, fontSize: 14, color: TLP.navy }}>
              {fmt(networkTotal)}
            </span>
            <span style={{ textAlign: "right", fontWeight: 700, fontSize: 13, color: TLP.navy }}>
              {networkEnrollments}
            </span>
            <span style={{ textAlign: "right", fontSize: 13, color: TLP.gray700 }}>
              {networkEnrollments > 0 ? fmt(Math.round(networkTotal / networkEnrollments)) : "—"}
            </span>
            <span style={{ textAlign: "right", fontSize: 13, color: TLP.gray500 }}>100%</span>
          </div>
        )}
      </Card>
    </div>
  );
}
