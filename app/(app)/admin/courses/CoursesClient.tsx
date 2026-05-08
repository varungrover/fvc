"use client";

import { useState } from "react";
import { Plus, Crown, Calculator, BookOpen, DollarSign, Palette, Briefcase, Globe, Pencil } from "lucide-react";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { PageHeader } from "@/components/layout/PageHeader";
import { TLP, planetStyle } from "@/lib/theme/tokens";
import type { Planet, Level, CourseVariant } from "@/lib/types";

const PLANET_ICONS: Record<string, ReactNode> = {
  Chess:    <Crown      size={18} strokeWidth={1.75} />,
  Math:     <Calculator size={18} strokeWidth={1.75} />,
  Maths:    <Calculator size={18} strokeWidth={1.75} />,
  English:  <BookOpen   size={18} strokeWidth={1.75} />,
  Finance:  <DollarSign size={18} strokeWidth={1.75} />,
  Arts:     <Palette    size={18} strokeWidth={1.75} />,
  Business: <Briefcase  size={18} strokeWidth={1.75} />,
};

const PLANET_PALETTE: { color: string; bg: string }[] = [
  { color: "#0a9b8a", bg: "#e6f7f5" },
  { color: "#3182ce", bg: "#ebf8ff" },
  { color: "#805ad5", bg: "#faf5ff" },
  { color: "#f5a623", bg: "#fef3dc" },
  { color: "#38a169", bg: "#f0fff4" },
  { color: "#e67e22", bg: "#fef9f0" },
  { color: "#d53f8c", bg: "#fff0f8" },
  { color: "#2b6cb0", bg: "#ebf4ff" },
];

function getPlanetStyle(name: string, tlpPlanetStyle: (n: string) => { color: string; bg: string; icon: string }) {
  const known = tlpPlanetStyle(name);
  if (known.color !== "#6b7280") return known; // not gray fallback
  const idx = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % PLANET_PALETTE.length;
  return { ...PLANET_PALETTE[idx], icon: "" };
}

interface PlanetWithDetails extends Planet {
  products: (Level & { product_variants: CourseVariant[] })[];
}

interface CoursesClientProps {
  initialPlanets: PlanetWithDetails[];
}

export default function CoursesClient({ initialPlanets }: CoursesClientProps) {
  const [planets, setPlanets] = useState<PlanetWithDetails[]>(initialPlanets);
  const [selectedPlanetId, setSelectedPlanetId] = useState<string>(initialPlanets[0]?.id || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Add State
  const [showAddLevel, setShowAddLevel] = useState(false);
  const [addLevelForm, setAddLevelForm] = useState({ name: "", sortOrder: 0 });
  const [showAddVariant, setShowAddVariant] = useState<string | null>(null); // levelId
  const [addVariantForm, setAddVariantForm] = useState({ name: "", frequencyPerWeek: 1, price: 0, setupFee: 0 });

  // Edit State
  const [editingLevel, setEditingLevel] = useState<Level | null>(null);
  const [editLevelForm, setEditLevelForm] = useState({ name: "", sortOrder: 0, isActive: true });
  const [editingVariant, setEditingVariant] = useState<CourseVariant | null>(null);
  const [editVariantForm, setEditVariantForm] = useState({ name: "", frequencyPerWeek: 1, price: 0, setupFee: 0, isActive: true });

  const selectedPlanet = planets.find(p => p.id === selectedPlanetId);
  const pStyle = selectedPlanet ? getPlanetStyle(selectedPlanet.name, planetStyle) : { bg: "#f3f4f6", color: "#0d1b3e" };
  const levels = selectedPlanet?.products || [];

  async function handleAddLevel() {
    if (!addLevelForm.name || !selectedPlanetId) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/levels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...addLevelForm,
          planetId: selectedPlanetId,
          productClassId: "8d9ae3b4-0f9c-448c-8837-64fdaf1a8cba" // UUID for 'Course'
        }),
      });
      if (!res.ok) throw new Error("Failed to add level");
      const newLevel = await res.json();
      
      setPlanets(prev => prev.map(p => 
        p.id === selectedPlanetId 
          ? { ...p, products: [...(p.products || []), { ...newLevel, product_variants: [] }] }
          : p
      ));
      setShowAddLevel(false);
      setAddLevelForm({ name: "", sortOrder: 0 });
    } catch (err) {
      console.error(err);
      alert("Error adding level");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleEditLevel() {
    if (!editingLevel) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/levels/${editingLevel.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editLevelForm),
      });
      if (!res.ok) throw new Error("Failed to update level");
      const updated = await res.json();

      setPlanets(prev => prev.map(p => ({
        ...p,
        products: p.products.map(l => l.id === editingLevel.id ? { ...l, ...updated } : l)
      })));
      setEditingLevel(null);
    } catch (err) {
      console.error(err);
      alert("Error updating level");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleAddVariant() {
    if (!showAddVariant) return;

    // Client-side check for duplicate frequency
    const currentLevel = levels.find(l => l.id === showAddVariant);
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

  async function handleEditVariant() {
    if (!editingVariant) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/course-variants/${editingVariant.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editVariantForm),
      });
      if (!res.ok) throw new Error("Failed to update variant");
      const updated = await res.json();

      setPlanets(prev => prev.map(p => ({
        ...p,
        products: p.products.map(l => ({
          ...l,
          product_variants: l.product_variants.map(v => v.id === editingVariant.id ? { ...v, ...updated } : v)
        }))
      })));
      setEditingVariant(null);
    } catch (err) {
      console.error(err);
      alert("Error updating variant");
    } finally {
      setIsSubmitting(false);
    }
  }

  function startEditingLevel(level: Level) {
    setEditingLevel(level);
    setEditLevelForm({
      name: level.name,
      sortOrder: level.sortOrder,
      isActive: level.isActive
    });
  }

  function startEditingVariant(v: CourseVariant) {
    setEditingVariant(v);
    setEditVariantForm({
      name: (v as any).name || "",
      frequencyPerWeek: v.frequencyPerWeek,
      price: v.price,
      setupFee: v.setupFee,
      isActive: v.isActive
    });
  }

  return (
    <div style={{ padding: 24 }}>
      <PageHeader
        title="Courses"
        subtitle="Manage course levels and pricing variants for each planet"
        actions={
          <Button 
            variant="primary" 
            icon={<Plus size={15} strokeWidth={2.5} />} 
            onClick={() => setShowAddLevel(true)}
            disabled={!selectedPlanetId}
          >
            Add Level
          </Button>
        }
      />

      {/* Planet Selector Tabs */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24, overflowX: "auto", paddingBottom: 8 }}>
        {planets.map(p => (
          <button
            key={p.id}
            onClick={() => setSelectedPlanetId(p.id)}
            style={{
              padding: "10px 20px",
              borderRadius: 12,
              border: `2px solid ${selectedPlanetId === p.id ? getPlanetStyle(p.name, planetStyle).color : TLP.gray200}`,
              background: selectedPlanetId === p.id ? getPlanetStyle(p.name, planetStyle).bg : TLP.white,
              color: selectedPlanetId === p.id ? getPlanetStyle(p.name, planetStyle).color : TLP.gray500,
              fontWeight: 800,
              fontSize: 14,
              cursor: "pointer",
              whiteSpace: "nowrap",
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              gap: 8
            }}
          >
            <span style={{ display: "flex", alignItems: "center" }}>
              {PLANET_ICONS[p.name] ?? <Globe size={18} strokeWidth={1.75} />}
            </span>
            {p.name}
          </button>
        ))}
      </div>

      {selectedPlanet ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))", gap: 20 }}>
          {levels.map((level) => {
            const variants = level.product_variants || [];
            return (
              <Card key={level.id} style={{ padding: 0, overflow: "hidden" }}>
                <div
                  style={{
                    padding: "14px 20px",
                    background: pStyle.bg,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ display: "flex", alignItems: "center", color: pStyle.color }}>
                      {PLANET_ICONS[selectedPlanet?.name ?? ""] ?? <Globe size={20} strokeWidth={1.75} />}
                    </span>
                    <span 
                      style={{ fontWeight: 800, fontSize: 16, color: pStyle.color, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
                      onClick={() => startEditingLevel(level)}
                    >
                      {level.name}
                      <Pencil size={13} strokeWidth={2} style={{ opacity: 0.6 }} />
                    </span>
                  </div>
                  <Badge
                    label={level.isActive ? "Active" : "Inactive"}
                    color={level.isActive ? TLP.green : TLP.gray500}
                    bg={level.isActive ? TLP.greenLight : TLP.gray100}
                  />
                </div>

                <div style={{ padding: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: TLP.gray500, textTransform: "uppercase", letterSpacing: "0.4px" }}>
                      Pricing Variants
                    </span>
                    <Button 
                      size="sm" 
                      variant="secondary" 
                      icon={<Plus size={13} strokeWidth={2.5} />}
                      onClick={() => setShowAddVariant(level.id)}
                    >
                      Add Variant
                    </Button>
                  </div>

                  {variants.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "20px 0", background: TLP.gray50, borderRadius: 10, border: `1px dashed ${TLP.gray300}` }}>
                      <p style={{ margin: 0, fontSize: 13, color: TLP.gray500 }}>No pricing variants defined yet.</p>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {variants.map((v) => (
                        <div
                          key={v.id}
                          onClick={() => startEditingVariant(v)}
                          style={{
                            padding: "12px 16px",
                            background: TLP.white,
                            borderRadius: 10,
                            border: `1px solid ${TLP.gray200}`,
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            cursor: "pointer",
                            transition: "all 0.2s",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.02)"
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 14, color: TLP.navy }}>
                              {v.frequencyPerWeek}x per week
                            </div>
                            <div style={{ fontSize: 12, color: TLP.gray500 }}>
                              {(v as any).name || "Standard"} · Setup: ${v.setupFee}
                            </div>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <div style={{ fontWeight: 800, fontSize: 18, color: TLP.teal }}>
                              ${v.price}
                              <span style={{ fontSize: 12, fontWeight: 600, color: TLP.gray400 }}>/mo</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
          {levels.length === 0 && (
            <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "60px 0", background: TLP.white, borderRadius: 14, border: `2px dashed ${TLP.gray200}` }}>
              <h3 style={{ color: TLP.navy }}>No levels for {selectedPlanet.name}</h3>
              <p style={{ color: TLP.gray500 }}>Create levels to organize courses for this planet.</p>
              <Button variant="primary" icon={<Plus size={15} strokeWidth={2.5} />} onClick={() => setShowAddLevel(true)}>Create First Level</Button>
            </div>
          )}
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: 60 }}>
          <p>Please create a planet first to manage courses.</p>
        </div>
      )}

      {/* Add Level Modal */}
      <Modal
        open={showAddLevel}
        onClose={() => setShowAddLevel(false)}
        title="Add Level"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowAddLevel(false)}>Cancel</Button>
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

      {/* Edit Level Modal */}
      <Modal
        open={!!editingLevel}
        onClose={() => setEditingLevel(null)}
        title="Edit Level"
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditingLevel(null)}>Cancel</Button>
            <Button variant="primary" onClick={handleEditLevel} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Input
            label="Level Name"
            value={editLevelForm.name}
            onChange={(e) => setEditLevelForm((f) => ({ ...f, name: e.target.value }))}
            required
          />
          <Input
            label="Sort Order"
            type="number"
            value={editLevelForm.sortOrder}
            onChange={(e) => setEditLevelForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))}
          />
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input
              type="checkbox"
              id="level-active"
              checked={editLevelForm.isActive}
              onChange={(e) => setEditLevelForm((f) => ({ ...f, isActive: e.target.checked }))}
            />
            <label htmlFor="level-active" style={{ fontSize: 14, fontWeight: 600 }}>Active</label>
          </div>
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

      {/* Edit Variant Modal */}
      <Modal
        open={!!editingVariant}
        onClose={() => setEditingVariant(null)}
        title="Edit Course Variant"
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditingVariant(null)}>Cancel</Button>
            <Button variant="primary" onClick={handleEditVariant} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Input
            label="Variant Name"
            value={editVariantForm.name}
            onChange={(e) => setEditVariantForm((f) => ({ ...f, name: e.target.value }))}
            required
          />
          <Input
            label="Frequency (days per week)"
            type="number"
            value={editVariantForm.frequencyPerWeek}
            onChange={(e) => setEditVariantForm((f) => ({ ...f, frequencyPerWeek: Number(e.target.value) }))}
            required
          />
          <Input
            label="Base Price (per month)"
            type="number"
            value={editVariantForm.price}
            onChange={(e) => setEditVariantForm((f) => ({ ...f, price: Number(e.target.value) }))}
            required
          />
          <Input
            label="Setup Fee (one-time)"
            type="number"
            value={editVariantForm.setupFee}
            onChange={(e) => setEditVariantForm((f) => ({ ...f, setupFee: Number(e.target.value) }))}
          />
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input
              type="checkbox"
              id="variant-active"
              checked={editVariantForm.isActive}
              onChange={(e) => setEditVariantForm((f) => ({ ...f, isActive: e.target.checked }))}
            />
            <label htmlFor="variant-active" style={{ fontSize: 14, fontWeight: 600 }}>Active</label>
          </div>
        </div>
      </Modal>
    </div>
  );
}
