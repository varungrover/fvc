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
}

export default function OfferingsClient({ locationName, locationId, catalog }: OfferingsClientProps) {
  const [activePlanetId, setActivePlanetId] = useState(catalog[0]?.id);
  const [localCatalog, setLocalCatalog] = useState(catalog);
  const [saving, setSaving] = useState<string | null>(null);

  const activePlanet = localCatalog.find(p => p.id === activePlanetId);

  async function handleUpdatePrice(variantId: string, price: number, setupFee: number) {
    setSaving(variantId);
    try {
      const res = await fetch(`/api/locations/${locationId}/offerings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productVariantId: variantId,
          price,
          setupFee
        }),
      });
      if (!res.ok) throw new Error("Failed to save price");
      const savedOffering = await res.json();

      // Update local state
      setLocalCatalog(prev => prev.map(p => ({
        ...p,
        products: p.products.map(l => ({
          ...l,
          product_variants: l.product_variants.map(v => 
            v.id === variantId ? { ...v, offering: savedOffering } : v
          )
        }))
      })));
    } catch (err) {
      console.error(err);
      alert("Error saving price override");
    } finally {
      setSaving(null);
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <PageHeader
        title={`Manage Offerings — ${locationName}`}
        subtitle="Configure per-location pricing overrides for course levels"
        backHref="/franchisee-admin/locations"
      />

      {/* Planet Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, overflowX: "auto", paddingBottom: 4 }}>
        {localCatalog.map(p => (
          <Button
            key={p.id}
            variant={activePlanetId === p.id ? "primary" : "secondary"}
            onClick={() => setActivePlanetId(p.id)}
            size="sm"
          >
            {planetStyle(p.name).icon} {p.name}
          </Button>
        ))}
      </div>

      {activePlanet && (
        <div style={{ display: "grid", gap: 16 }}>
          {activePlanet.products.map(level => (
            <Card key={level.id} title={level.name}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 150px 150px 100px", gap: 16, alignItems: "end" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: TLP.gray500 }}>VARIANT</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: TLP.gray500 }}>BASE PRICE</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: TLP.gray500 }}>YOUR PRICE</div>
                <div></div>
              </div>

              {level.product_variants.map(v => {
                const currentPrice = v.offering?.price ?? v.price;
                const currentSetup = v.offering?.setupFee ?? v.setupFee;
                const isOverridden = !!v.offering;

                return (
                  <div 
                    key={v.id} 
                    style={{ 
                      display: "grid", 
                      gridTemplateColumns: "1fr 150px 150px 100px", 
                      gap: 16, 
                      alignItems: "center",
                      padding: "12px 0",
                      borderBottom: `1px solid ${TLP.gray100}`
                    }}
                  >
                    <div style={{ fontWeight: 600, color: TLP.navy }}>
                      {v.frequencyPerWeek}x / week
                      {isOverridden && (
                        <Badge label="Overridden" color={TLP.amber} bg={TLP.amberLight} style={{ marginLeft: 8 }} />
                      )}
                    </div>
                    <div style={{ color: TLP.gray500 }}>${v.price} / mo</div>
                    <div>
                      <Input
                        type="number"
                        value={currentPrice}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          // Local update only for UI snappiness
                          setLocalCatalog(prev => prev.map(p => ({
                            ...p,
                            products: p.products.map(l => ({
                              ...l,
                              product_variants: l.product_variants.map(variant => 
                                variant.id === v.id ? { ...variant, offering: { ...(variant.offering || v), price: val } as any } : variant
                              )
                            }))
                          })));
                        }}
                        style={{ height: 36 }}
                      />
                    </div>
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleUpdatePrice(v.id, currentPrice, currentSetup)}
                      disabled={saving === v.id}
                    >
                      {saving === v.id ? "..." : "Save"}
                    </Button>
                  </div>
                );
              })}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
