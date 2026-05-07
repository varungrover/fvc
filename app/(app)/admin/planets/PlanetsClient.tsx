"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { PageHeader } from "@/components/layout/PageHeader";
import { TLP, planetStyle } from "@/lib/theme/tokens";
import type { Planet, Level, CourseVariant } from "@/lib/types";

interface PlanetWithDetails extends Planet {
  products: (Level & { product_variants: CourseVariant[] })[];
}

interface PlanetsClientProps {
  initialPlanets: PlanetWithDetails[];
}

export default function PlanetsClient({ initialPlanets }: PlanetsClientProps) {
  const [planets, setPlanets] = useState<PlanetWithDetails[]>(initialPlanets);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAddPlanet, setShowAddPlanet] = useState(false);
  const [addPlanetForm, setAddPlanetForm] = useState({ name: "", description: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddLevel, setShowAddLevel] = useState<string | null>(null); // planetId
  const [addLevelForm, setAddLevelForm] = useState({ name: "", sortOrder: 0 });
  const [showAddVariant, setShowAddVariant] = useState<string | null>(null); // levelId
  const [addVariantForm, setAddVariantForm] = useState({ name: "", frequencyPerWeek: 1, price: 0, setupFee: 0 });

  async function handleAddPlanet() {
    if (!addPlanetForm.name) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/planets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addPlanetForm),
      });
      if (!res.ok) throw new Error("Failed to add planet");
      const newPlanet = await res.json();
      setPlanets((prev) => [...prev, { ...newPlanet, products: [] }]);
      setShowAddPlanet(false);
      setAddPlanetForm({ name: "", description: "" });
    } catch (err) {
      console.error(err);
      alert("Error adding planet");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleAddLevel() {
    if (!addLevelForm.name || !showAddLevel) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/levels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...addLevelForm,
          planetId: showAddLevel,
          productClassId: "8d9ae3b4-0f9c-448c-8837-64fdaf1a8cba" // UUID for 'Course'
        }),
      });
      if (!res.ok) throw new Error("Failed to add level");
      const newLevel = await res.json();
      
      setPlanets(prev => prev.map(p => 
        p.id === showAddLevel 
          ? { ...p, products: [...(p.products || []), { ...newLevel, product_variants: [] }] }
          : p
      ));
      setShowAddLevel(null);
      setAddLevelForm({ name: "", sortOrder: 0 });
    } catch (err) {
      console.error(err);
      alert("Error adding level");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleAddVariant() {
    if (!showAddVariant) return;

    // Client-side check for duplicate frequency
    const currentPlanet = planets.find(p => p.products.some(l => l.id === showAddVariant));
    const currentLevel = currentPlanet?.products.find(l => l.id === showAddVariant);
    if (currentLevel?.product_variants.some(v => v.frequencyPerWeek === addVariantForm.frequencyPerWeek)) {
      alert(`A variant with ${addVariantForm.frequencyPerWeek}x per week already exists for this level.`);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/course-variants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...addVariantForm,
          levelId: showAddVariant
        }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add variant");

      setPlanets(prev => prev.map(p => ({
        ...p,
        products: p.products.map(l => 
          l.id === showAddVariant 
            ? { ...l, product_variants: [...(l.product_variants || []), data] }
            : l
        )
      })));
      setShowAddVariant(null);
      setAddVariantForm({ name: "", frequencyPerWeek: 1, price: 0, setupFee: 0 });
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Error adding variant");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <PageHeader
        title="Planets & Levels"
        subtitle="Manage learning planets, levels, and course pricing"
        actions={
          <Button 
            variant="primary" 
            icon="➕" 
            onClick={() => setShowAddPlanet(true)}
          >
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
        {planets.map((planet) => {
          const pStyle = planetStyle(planet.name);
          const levels = planet.products || [];
          const isActive = planet.isActive;
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
                        size="sm" 
                        variant="secondary" 
                        icon="➕"
                        onClick={() => setShowAddLevel(planet.id)}
                      >
                        Add Level
                      </Button>
                    </div>

                  {levels.length === 0 ? (
                    <p style={{ margin: 0, fontSize: 13, color: TLP.gray400 }}>No levels yet.</p>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {levels.map((level) => {
                        const variants = level.product_variants || [];

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
                                    gridTemplateColumns: "repeat(3, 1fr)",
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
                                  {variants.map(v => (
                                    <span key={v.id}>{v.frequencyPerWeek}x / week</span>
                                  ))}
                                </div>
                                <div
                                  style={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(3, 1fr)",
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
                                      display: "flex",
                                      justifyContent: "space-between",
                                      alignItems: "center"
                                    }}
                                  >
                                    <span>Setup fee: ${variants[0]?.setupFee ?? 0} (one-time)</span>
                                    <Button 
                                      size="sm" 
                                      variant="secondary" 
                                      icon="➕"
                                      onClick={() => setShowAddVariant(level.id)}
                                    >
                                      Variant
                                    </Button>
                                  </div>
                                </div>
                              )}
                              
                              {variants.length === 0 && (
                                <div style={{ padding: "12px 14px", textAlign: "center" }}>
                                  <Button 
                                    size="sm" 
                                    variant="secondary" 
                                    icon="➕"
                                    onClick={() => setShowAddVariant(level.id)}
                                  >
                                    Add First Variant
                                  </Button>
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
            <Button variant="primary" onClick={handleAddPlanet} disabled={!addPlanetForm.name || isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Planet"}
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
        </div>
      </Modal>

      {/* Add Level Modal */}
      <Modal
        open={!!showAddLevel}
        onClose={() => setShowAddLevel(null)}
        title="Add Level"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowAddLevel(null)}>Cancel</Button>
            <Button variant="primary" onClick={handleAddLevel} disabled={!addLevelForm.name || isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Level"}
            </Button>
          </>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Input
            label="Level Name"
            value={addLevelForm.name}
            onChange={(e) => setAddLevelForm((f) => ({ ...f, name: e.target.value }))}
            required
            placeholder="e.g. Level 1"
          />
          <Input
            label="Sort Order"
            type="number"
            value={addLevelForm.sortOrder}
            onChange={(e) => setAddLevelForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))}
          />
        </div>
      </Modal>

      {/* Add Variant Modal */}
      <Modal
        open={!!showAddVariant}
        onClose={() => setShowAddVariant(null)}
        title="Add Course Variant"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowAddVariant(null)}>Cancel</Button>
            <Button variant="primary" onClick={handleAddVariant} disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Variant"}
            </Button>
          </>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Input
            label="Variant Name"
            value={addVariantForm.name}
            onChange={(e) => setAddVariantForm((f) => ({ ...f, name: e.target.value }))}
            required
            placeholder="e.g. Standard, Premium, etc."
          />
          <Input
            label="Frequency (days per week)"
            type="number"
            value={addVariantForm.frequencyPerWeek}
            onChange={(e) => setAddVariantForm((f) => ({ ...f, frequencyPerWeek: Number(e.target.value) }))}
            required
          />
          <Input
            label="Base Price (per month)"
            type="number"
            value={addVariantForm.price}
            onChange={(e) => setAddVariantForm((f) => ({ ...f, price: Number(e.target.value) }))}
            required
          />
          <Input
            label="Setup Fee (one-time)"
            type="number"
            value={addVariantForm.setupFee}
            onChange={(e) => setAddVariantForm((f) => ({ ...f, setupFee: Number(e.target.value) }))}
          />
        </div>
      </Modal>
    </div>
  );
}
