"use client";

import { useState } from "react";
import { Crown, Calculator, BookOpen, DollarSign, Palette, Briefcase, Globe } from "lucide-react";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { PageHeader } from "@/components/layout/PageHeader";
import { TLP, planetStyle } from "@/lib/theme/tokens";
import type { Planet, Level, CourseVariant, LocationCourseOffering } from "@/lib/types";

const PLANET_ICONS: Record<string, ReactNode> = {
  Chess:    <Crown      size={15} strokeWidth={1.75} />,
  Math:     <Calculator size={15} strokeWidth={1.75} />,
  Maths:    <Calculator size={15} strokeWidth={1.75} />,
  English:  <BookOpen   size={15} strokeWidth={1.75} />,
  Finance:  <DollarSign size={15} strokeWidth={1.75} />,
  Arts:     <Palette    size={15} strokeWidth={1.75} />,
  Business: <Briefcase  size={15} strokeWidth={1.75} />,
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

function getPlanetColors(name: string): { color: string; bg: string } {
  const known = planetStyle(name);
  if (known.color !== "#6b7280") return known;
  const idx = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % PLANET_PALETTE.length;
  return PLANET_PALETTE[idx];
}

interface VariantWithOffering extends CourseVariant {
  offering?: LocationCourseOffering;
}

interface LevelWithOfferings extends Level {
  product_variants: VariantWithOffering[];
}

interface PlanetWithOfferings extends Planet {
  products: LevelWithOfferings[];
}

interface OfferingsClientProps {
  locationName: string;
  locationId: string;
  catalog: PlanetWithOfferings[];
  backHref?: string;
}

export default function OfferingsClient({ locationName, locationId, catalog, backHref = "/franchisee-admin/locations" }: OfferingsClientProps) {
  const [activePlanetId, setActivePlanetId] = useState(catalog[0]?.id);
  const [localCatalog, setLocalCatalog] = useState(catalog);
  const [saving, setSaving] = useState<string | null>(null);

  const activePlanet = localCatalog.find(p => p.id === activePlanetId);

  async function handleToggleLevel(levelId: string, enabled: boolean) {
    setSaving(levelId);
    try {
      // Find all variants for this level
      const level = activePlanet?.products.find(l => l.id === levelId);
      if (!level) return;

      const variantIds = level.product_variants.map(v => v.id);

      const res = await fetch(`/api/locations/${locationId}/offerings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          levelId,
          variantIds,
          enabled
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: "Server error" }));
        throw new Error(errorData.error || "Failed to update offerings");
      }
      const updatedOfferings = await res.json();

      // Update local state: if enabled, we should have offerings; if disabled, they should be removed (or marked inactive)
      setLocalCatalog(prev => prev.map(p => ({
        ...p,
        products: p.products.map(l => {
          if (l.id === levelId) {
            return {
              ...l,
              product_variants: l.product_variants.map(v => {
                const updated = updatedOfferings.find((uo: any) => uo.product_variant_id === v.id);
                return { ...v, offering: updated || (enabled ? v.offering : undefined) };
              })
            };
          }
          return l;
        })
      })));
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Error updating offerings");
    } finally {
      setSaving(null);
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <PageHeader
        title={`Manage Offerings — ${locationName}`}
        subtitle="Select which courses are available at this location. Prices are set globally."
        backHref={backHref}
      />

      {/* Planet Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24, overflowX: "auto", paddingBottom: 4 }}>
      {localCatalog.map(p => {
          const colors = getPlanetColors(p.name);
          const isActive = activePlanetId === p.id;
          return (
            <button
              key={p.id}
              onClick={() => setActivePlanetId(p.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                padding: "8px 18px",
                borderRadius: 99,
                border: `2px solid ${isActive ? colors.color : TLP.gray200}`,
                background: isActive ? colors.color : TLP.white,
                color: isActive ? "#fff" : TLP.gray500,
                fontWeight: 700,
                fontSize: 13,
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.2s",
              }}
            >
              <span style={{ display: "flex", alignItems: "center" }}>
                {PLANET_ICONS[p.name] ?? <Globe size={15} strokeWidth={1.75} />}
              </span>
              {p.name}
            </button>
          );
        })}
      </div>

      {activePlanet && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
          {activePlanet.products.map(level => {
            const isEnabled = level.product_variants.some(v => !!v.offering);
            const isLoading = saving === level.id;

            return (
              <Card 
                key={level.id} 
                style={{ 
                  padding: 20, 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "space-between",
                  opacity: isLoading ? 0.6 : 1,
                  transition: "opacity 0.2s"
                }}
              >
                <div>
                  <div style={{ fontWeight: 800, color: TLP.navy, fontSize: 16 }}>{level.name}</div>
                  <div style={{ fontSize: 12, color: TLP.gray500, marginTop: 2 }}>
                    {level.product_variants.length} variants available
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  {isLoading && (
                    <div style={{
                      width: 16,
                      height: 16,
                      border: `2px solid ${TLP.gray100}`,
                      borderTop: `2px solid ${TLP.teal}`,
                      borderRadius: "50%",
                      animation: "spin 0.8s linear infinite"
                    }} />
                  )}
                  <label style={{ 
                    position: 'relative', 
                    display: 'inline-block', 
                    width: 44, 
                    height: 24,
                    cursor: isLoading ? 'wait' : 'pointer'
                  }}>
                    <input 
                      type="checkbox" 
                      checked={isEnabled}
                      disabled={isLoading}
                      onChange={(e) => handleToggleLevel(level.id, e.target.checked)}
                      style={{ opacity: 0, width: 0, height: 0 }}
                    />
                    <span style={{
                      position: 'absolute',
                      cursor: 'pointer',
                      top: 0, left: 0, right: 0, bottom: 0,
                      backgroundColor: isEnabled ? TLP.teal : TLP.gray200,
                      transition: '.3s',
                      borderRadius: 24,
                    }}>
                      <span style={{
                        position: 'absolute',
                        content: '""',
                        height: 18, width: 18,
                        left: isEnabled ? 22 : 3,
                        bottom: 3,
                        backgroundColor: 'white',
                        transition: '.3s',
                        borderRadius: '50%',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                      }} />
                    </span>
                  </label>
                </div>
              </Card>
            );
          })}
        </div>
      )}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin { 
          from { transform: rotate(0deg); } 
          to { transform: rotate(360deg); } 
        }
      `}} />
    </div>
  );
}
