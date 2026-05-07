"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { PageHeader } from "@/components/layout/PageHeader";
import { TLP, planetStyle } from "@/lib/theme/tokens";
import type { Planet, Level, CourseVariant, LocationCourseOffering } from "@/lib/types";

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
        {localCatalog.map(p => (
          <Button
            key={p.id}
            variant={activePlanetId === p.id ? "primary" : "secondary"}
            onClick={() => setActivePlanetId(p.id)}
            size="sm"
            style={{ borderRadius: 99, padding: "8px 20px" }}
          >
            {planetStyle(p.name).icon} {p.name}
          </Button>
        ))}
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
