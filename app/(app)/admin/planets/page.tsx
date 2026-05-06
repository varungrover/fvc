"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { PageHeader } from "@/components/layout/PageHeader";
import { TLP, planetStyle } from "@/lib/theme/tokens";
import { PLANETS } from "@/lib/mock/planets";
import { LEVELS_BY_PLANET } from "@/lib/mock/levels";
import { VARIANTS_BY_LEVEL } from "@/lib/mock/courseVariants";
import type { Planet } from "@/lib/types";

export default function PlanetsPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeStates, setActiveStates] = useState<Record<string, boolean>>(
    Object.fromEntries(PLANETS.map((p) => [p.id, p.isActive])),
  );
  const [showAddPlanet, setShowAddPlanet] = useState(false);
  const [showAddLevel, setShowAddLevel] = useState<string | null>(null);
  const [addPlanetForm, setAddPlanetForm] = useState({ name: "", description: "" });
  const [addLevelForm, setAddLevelForm] = useState({ name: "" });
  const [extraPlanets, setExtraPlanets] = useState<Planet[]>([]);

  const allPlanets = [...PLANETS, ...extraPlanets];

  function toggleActive(planetId: string) {
    setActiveStates((s) => ({ ...s, [planetId]: !s[planetId] }));
  }

  function handleAddPlanet() {
    if (!addPlanetForm.name) return;
    const newPlanet: Planet = {
      id: `pl_custom_${Date.now()}`,
      name: addPlanetForm.name,
      description: addPlanetForm.description || undefined,
      isActive: true,
    };
    setExtraPlanets((prev) => [...prev, newPlanet]);
    setActiveStates((s) => ({ ...s, [newPlanet.id]: true }));
    setShowAddPlanet(false);
    setAddPlanetForm({ name: "", description: "" });
  }

  return (
    <div style={{ padding: 24 }}>
      <PageHeader
        title="Planets & Levels"
        subtitle="Manage learning planets, levels, and course pricing"
        actions={
          <Button variant="primary" icon="➕" onClick={() => { setAddPlanetForm({ name: "", description: "" }); setShowAddPlanet(true); }}>
            Add Planet
          </Button>
        }
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: 16,
          alignItems: "start",
        }}
      >
        {allPlanets.map((planet) => {
          const pStyle = planetStyle(planet.name);
          const levels = LEVELS_BY_PLANET[planet.id] ?? [];
          const isActive = activeStates[planet.id] ?? planet.isActive;
          const isExpanded = expandedId === planet.id;

          return (
            <Card key={planet.id} style={{ padding: 0, overflow: "hidden" }}>
              {/* Planet header */}
              <div style={{ padding: "18px 20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 12,
                      background: isActive ? pStyle.bg : TLP.gray100,
                      color: isActive ? pStyle.color : TLP.gray400,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 26,
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {pStyle.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontWeight: 800, fontSize: 17, color: isActive ? TLP.navy : TLP.gray500 }}>
                        {planet.name}
                      </span>
                      <Badge
                        label={isActive ? "Active" : "Inactive"}
                        color={isActive ? TLP.green : TLP.gray500}
                        bg={isActive ? TLP.greenLight : TLP.gray100}
                      />
                    </div>
                    <div style={{ fontSize: 12, color: TLP.gray500, marginTop: 3, lineHeight: 1.4 }}>
                      {planet.description ?? "No description"}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <div style={{ fontSize: 12, color: TLP.gray500, flex: 1 }}>
                    <span style={{ fontWeight: 700, color: TLP.navy }}>{levels.length}</span> level{levels.length !== 1 ? "s" : ""}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    style={{ color: isActive ? TLP.amber : TLP.green, fontSize: 11 }}
                    onClick={() => toggleActive(planet.id)}
                  >
                    {isActive ? "Deactivate" : "Activate"}
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setExpandedId(isExpanded ? null : planet.id)}
                  >
                    {isExpanded ? "▲ Collapse" : "▼ Levels"}
                  </Button>
                </div>
              </div>

              {/* Expanded levels */}
              {isExpanded && (
                <div style={{ borderTop: `1px solid ${TLP.gray100}`, background: TLP.gray50, padding: "16px 20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: TLP.gray500, textTransform: "uppercase", letterSpacing: "0.4px" }}>
                      Levels & Pricing
                    </span>
                    <Button
                      variant="primary"
                      size="sm"
                      icon="➕"
                      onClick={() => { setAddLevelForm({ name: "" }); setShowAddLevel(planet.id); }}
                    >
                      Add Level
                    </Button>
                  </div>

                  {levels.length === 0 ? (
                    <p style={{ margin: 0, fontSize: 13, color: TLP.gray400 }}>No levels yet.</p>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {levels.map((level) => {
                        const variants = VARIANTS_BY_LEVEL[level.id] ?? [];

                        return (
                          <div
                            key={level.id}
                            style={{
                              background: TLP.white,
                              borderRadius: 10,
                              border: `1px solid ${TLP.gray200}`,
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                padding: "10px 14px",
                                background: pStyle.bg,
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                              }}
                            >
                              <span style={{ fontWeight: 700, fontSize: 14, color: pStyle.color }}>
                                {pStyle.icon} {level.name}
                              </span>
                              <Badge
                                label={level.isActive ? "Active" : "Inactive"}
                                color={level.isActive ? TLP.green : TLP.gray500}
                                bg={level.isActive ? TLP.greenLight : TLP.gray100}
                              />
                            </div>

                            {/* Pricing table */}
                            {variants.length > 0 && (
                              <div>
                                <div
                                  style={{
                                    display: "grid",
                                    gridTemplateColumns: "1fr 1fr 1fr",
                                    padding: "6px 14px",
                                    background: TLP.gray50,
                                    fontSize: 10,
                                    fontWeight: 700,
                                    color: TLP.gray500,
                                    textTransform: "uppercase",
                                    letterSpacing: "0.3px",
                                    borderBottom: `1px solid ${TLP.gray100}`,
                                  }}
                                >
                                  <span>1x / week</span>
                                  <span>2x / week</span>
                                  <span>3x / week</span>
                                </div>
                                <div
                                  style={{
                                    display: "grid",
                                    gridTemplateColumns: "1fr 1fr 1fr",
                                    padding: "8px 14px",
                                    fontSize: 14,
                                    fontWeight: 700,
                                    color: TLP.navy,
                                  }}
                                >
                                  {variants.map((v) => (
                                    <span key={v.id}>${v.price}/mo</span>
                                  ))}
                                </div>
                                <div
                                  style={{
                                    padding: "4px 14px 8px",
                                    fontSize: 11,
                                    color: TLP.gray500,
                                  }}
                                >
                                  Setup fee: ${variants[0]?.setupFee ?? 25} (one-time)
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Add Planet Modal */}
      <Modal
        open={showAddPlanet}
        onClose={() => setShowAddPlanet(false)}
        title="Add Planet"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowAddPlanet(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleAddPlanet} disabled={!addPlanetForm.name}>
              Add Planet
            </Button>
          </>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Input
            label="Planet Name"
            value={addPlanetForm.name}
            onChange={(e) => setAddPlanetForm((f) => ({ ...f, name: e.target.value }))}
            required
            placeholder="e.g. Science"
          />
          <Input
            label="Description (optional)"
            value={addPlanetForm.description}
            onChange={(e) => setAddPlanetForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Brief description of this learning area"
          />
          <div
            style={{
              background: TLP.tealLight,
              borderRadius: 8,
              padding: "10px 14px",
              fontSize: 12,
              color: TLP.gray700,
            }}
          >
            After adding the planet, you can add levels and configure pricing from the planet card.
          </div>
        </div>
      </Modal>

      {/* Add Level Modal */}
      <Modal
        open={!!showAddLevel}
        onClose={() => setShowAddLevel(null)}
        title={`Add Level — ${showAddLevel ? (allPlanets.find((p) => p.id === showAddLevel)?.name ?? "") : ""}`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowAddLevel(null)}>Cancel</Button>
            <Button variant="primary" onClick={() => setShowAddLevel(null)} disabled={!addLevelForm.name}>
              Add Level
            </Button>
          </>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Input
            label="Level Name"
            value={addLevelForm.name}
            onChange={(e) => setAddLevelForm({ name: e.target.value })}
            required
            placeholder="e.g. Grade 3, Beginner, PP"
          />
          <p style={{ margin: 0, fontSize: 13, color: TLP.gray500, lineHeight: 1.6 }}>
            This is a prototype — pricing will be auto-generated based on the base price you configure.
          </p>
        </div>
      </Modal>
    </div>
  );
}
