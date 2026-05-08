"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { PageHeader } from "@/components/layout/PageHeader";
import { TLP, planetStyle } from "@/lib/theme/tokens";
import type { Planet } from "@/lib/types";

interface PlanetsClientProps {
  initialPlanets: Planet[];
}

export default function PlanetsClient({ initialPlanets }: PlanetsClientProps) {
  const [planets, setPlanets] = useState<Planet[]>(initialPlanets);
  const [showAddPlanet, setShowAddPlanet] = useState(false);
  const [addPlanetForm, setAddPlanetForm] = useState({ name: "", description: "" });
  const [editingPlanet, setEditingPlanet] = useState<Planet | null>(null);
  const [editPlanetForm, setEditPlanetForm] = useState({ name: "", description: "", isActive: true });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Debug: Log planets on change
  useEffect(() => {
    console.log("Current Planets in State:", planets);
  }, [planets]);

  async function handleAddPlanet() {
    if (!addPlanetForm.name) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/planets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addPlanetForm),
      });
      
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to add planet");
      }

      // Ensure the new planet has an ID and correctly mapped isActive
      const newPlanet: Planet = {
        id: data.id,
        name: data.name,
        description: data.description,
        isActive: data.isActive ?? data.is_active ?? true
      };
      
      setPlanets((prev) => [...prev, newPlanet]);
      setShowAddPlanet(false);
      setAddPlanetForm({ name: "", description: "" });
    } catch (err: any) {
      console.error("Add Planet Error:", err);
      alert(err.message || "Error adding planet");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleEditPlanet() {
    if (!editingPlanet?.id) {
      console.error("Attempted to edit planet without ID:", editingPlanet);
      alert("Error: Missing Planet ID. Please refresh the page.");
      return;
    }

    if (!editPlanetForm.name) return;
    
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/planets/${editingPlanet.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editPlanetForm.name,
          description: editPlanetForm.description,
          isActive: editPlanetForm.isActive,
        }),
      });
      
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update planet");
      }
      
      // Update the planet in the list, ensuring ID is preserved and fields are updated
      setPlanets((prev) => prev.map(p => {
        if (p.id === editingPlanet.id) {
          return {
            ...p,
            name: data.name,
            description: data.description,
            isActive: data.isActive ?? data.is_active ?? p.isActive
          };
        }
        return p;
      }));
      
      setEditingPlanet(null);
    } catch (err: any) {
      console.error("Edit Planet Error:", err);
      alert(err.message || "Error updating planet");
    } finally {
      setIsSubmitting(false);
    }
  }

  function startEditing(planet: Planet) {
    if (!planet.id) {
      console.warn("Planet object missing ID:", planet);
    }
    setEditingPlanet(planet);
    setEditPlanetForm({
      name: planet.name,
      description: planet.description || "",
      isActive: planet.isActive,
    });
  }

  return (
    <div style={{ padding: 24 }}>
      <PageHeader
        title="Planets"
        subtitle="Manage learning planets and subject areas"
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
          const isActive = planet.isActive;

          return (
            <Card key={planet.id || Math.random().toString()} style={{ padding: 0, overflow: "hidden" }}>
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

                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                  <Button variant="secondary" size="sm" onClick={() => startEditing(planet)}>
                    Edit
                  </Button>
                </div>
              </div>
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

      {/* Edit Planet Modal */}
      <Modal
        open={!!editingPlanet}
        onClose={() => setEditingPlanet(null)}
        title="Edit Planet"
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditingPlanet(null)}>Cancel</Button>
            <Button variant="primary" onClick={handleEditPlanet} disabled={!editPlanetForm.name || isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Input
            label="Planet Name"
            value={editPlanetForm.name}
            onChange={(e) => setEditPlanetForm((f) => ({ ...f, name: e.target.value }))}
            required
          />
          <Input
            label="Description"
            value={editPlanetForm.description}
            onChange={(e) => setEditPlanetForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Brief description of this learning area"
          />
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
            <input
              type="checkbox"
              id="planet-active"
              checked={editPlanetForm.isActive}
              onChange={(e) => setEditPlanetForm((f) => ({ ...f, isActive: e.target.checked }))}
            />
            <label htmlFor="planet-active" style={{ fontSize: 14, fontWeight: 600, color: TLP.navy }}>
              Active
            </label>
          </div>
        </div>
      </Modal>
    </div>
  );
}
