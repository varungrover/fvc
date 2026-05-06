"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { PageHeader } from "@/components/layout/PageHeader";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { TLP } from "@/lib/theme/tokens";
import { LOCATIONS } from "@/lib/mock/locations";
import { TENANTS, TENANT_BY_ID } from "@/lib/mock/tenants";
import { BATCHES_BY_LOCATION } from "@/lib/mock/batches";
import { COACHES } from "@/lib/mock/coaches";
import { ENROLLMENTS_BY_BATCH } from "@/lib/mock/enrollments";

const OWNERSHIP_OPTIONS = [
  { value: "all", label: "All Ownerships" },
  ...TENANTS.map((t) => ({ value: t.id, label: t.fullName })),
];

function getLocationStats(locId: string) {
  const batches = BATCHES_BY_LOCATION[locId] ?? [];
  const coaches = new Set(
    batches.flatMap((b) => (b.coachId ? [b.coachId] : [])),
  );
  const students = new Set(
    batches.flatMap((b) => (ENROLLMENTS_BY_BATCH[b.id] ?? []).map((e) => e.memberId)),
  );
  return {
    batches: batches.length,
    coaches: coaches.size,
    students: students.size,
  };
}

export default function LocationsPage() {
  const [search, setSearch] = useState("");
  const [ownershipFilter, setOwnershipFilter] = useState("all");

  const filtered = LOCATIONS.filter((loc) => {
    const matchOwnership = ownershipFilter === "all" || loc.ownershipId === ownershipFilter;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      loc.name.toLowerCase().includes(q) ||
      loc.city.toLowerCase().includes(q) ||
      loc.stateProvince.toLowerCase().includes(q);
    return matchOwnership && matchSearch;
  });

  const tlpLocs = filtered.filter((l) => l.ownershipId === "ten_tlp");
  const mlaLocs = filtered.filter((l) => l.ownershipId === "ten_mla");

  const groups = [
    { ownership: TENANT_BY_ID["ten_tlp"], locations: tlpLocs },
    { ownership: TENANT_BY_ID["ten_mla"], locations: mlaLocs },
  ].filter((g) => g.locations.length > 0);

  function coachCountForLocation(locId: string) {
    return COACHES.filter((c) => c.locationId === locId).length;
  }

  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader
        title="All Locations"
        subtitle="Read-only overview of all locations across the network"
      />

      {/* Summary row */}
      <div style={{ display: "flex", gap: 14 }}>
        {[
          { label: "Total Locations", value: LOCATIONS.length, color: TLP.navy },
          { label: "TLP Locations", value: LOCATIONS.filter((l) => l.ownershipId === "ten_tlp").length, color: TLP.purple },
          { label: "MLA Locations", value: LOCATIONS.filter((l) => l.ownershipId === "ten_mla").length, color: TLP.teal },
          { label: "Active Locations", value: LOCATIONS.filter((l) => l.isActive).length, color: TLP.green },
        ].map((tile) => (
          <Card key={tile.label} style={{ padding: "16px 20px", flex: 1 }}>
            <div style={{ fontSize: 12, color: TLP.gray500, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 6 }}>
              {tile.label}
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: tile.color }}>{tile.value}</div>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card style={{ padding: "14px 20px" }}>
        <div style={{ display: "flex", gap: 14, alignItems: "flex-end", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <Input
              label="Search"
              placeholder="Search by city or location name…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div style={{ minWidth: 200 }}>
            <Select
              label="Ownership"
              value={ownershipFilter}
              onChange={(e) => setOwnershipFilter(e.target.value)}
              options={OWNERSHIP_OPTIONS}
            />
          </div>
        </div>
      </Card>

      {/* Location groups */}
      {groups.map((group) => {
        const isTLP = group.ownership.id === "ten_tlp";
        const accentColor = isTLP ? TLP.navy : TLP.teal;
        const accentBg = isTLP ? "#f0f2f8" : TLP.tealLight;

        return (
          <div key={group.ownership.id}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 12,
                padding: "8px 16px",
                background: accentBg,
                borderRadius: 10,
                borderLeft: `4px solid ${accentColor}`,
              }}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: accentColor }}>
                  {group.ownership.fullName}
                </div>
                <div style={{ fontSize: 12, color: TLP.gray500 }}>
                  {group.ownership.ownershipType === "corporate" ? "Corporate" : "Franchisee"} ·{" "}
                  {group.ownership.tagline}
                </div>
              </div>
              <div style={{ marginLeft: "auto" }}>
                <Badge
                  label={`${group.locations.length} location${group.locations.length !== 1 ? "s" : ""}`}
                  color={accentColor}
                  bg={accentBg}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
              {group.locations.map((loc) => {
                const stats = getLocationStats(loc.id);
                const coachCount = coachCountForLocation(loc.id);
                const adminPath = isTLP ? "/admin/locations" : "/franchisee-admin/locations";

                return (
                  <Card key={loc.id} style={{ padding: "18px 20px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: TLP.navy, marginBottom: 2 }}>
                          {loc.name}
                        </div>
                        <div style={{ fontSize: 12, color: TLP.gray500 }}>
                          {loc.city}, {loc.stateProvince} · {loc.postalCode}
                        </div>
                        <div style={{ fontSize: 11, color: TLP.gray400, marginTop: 2 }}>
                          {loc.addressLine1}
                        </div>
                      </div>
                      <Badge
                        label={loc.isActive ? "Active" : "Inactive"}
                        color={loc.isActive ? TLP.green : TLP.gray500}
                        bg={loc.isActive ? TLP.greenLight : TLP.gray100}
                      />
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(3, 1fr)",
                        gap: 8,
                        padding: "10px 0",
                        borderTop: `1px solid ${TLP.gray100}`,
                        borderBottom: `1px solid ${TLP.gray100}`,
                        marginBottom: 12,
                      }}
                    >
                      {[
                        { label: "Batches", value: stats.batches, icon: "📚" },
                        { label: "Coaches", value: coachCount, icon: "🧑‍🏫" },
                        { label: "Students", value: stats.students, icon: "🎓" },
                      ].map((stat) => (
                        <div key={stat.label} style={{ textAlign: "center" }}>
                          <div style={{ fontSize: 16, marginBottom: 2 }}>{stat.icon}</div>
                          <div style={{ fontSize: 18, fontWeight: 800, color: TLP.navy }}>
                            {stat.value}
                          </div>
                          <div style={{ fontSize: 11, color: TLP.gray500 }}>{stat.label}</div>
                        </div>
                      ))}
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      style={{ width: "100%", justifyContent: "center" }}
                      onClick={() => window.open(adminPath, "_self")}
                    >
                      View Details →
                    </Button>
                  </Card>
                );
              })}
            </div>
          </div>
        );
      })}

      {filtered.length === 0 && (
        <Card style={{ padding: "40px 20px" }}>
          <div style={{ textAlign: "center", color: TLP.gray400, fontSize: 14 }}>
            No locations match your search.
          </div>
        </Card>
      )}
    </div>
  );
}
