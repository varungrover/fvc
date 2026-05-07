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
        backHref={backHref}
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
            <Card key={level.id} style={{ padding: 24 }}>
              <div style={{ marginBottom: 20, borderBottom: `1px solid ${TLP.gray100}`, paddingBottom: 12 }}>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: TLP.navy }}>{level.name}</h3>
                <p style={{ margin: "4px 0 0", fontSize: 12, color: TLP.gray500 }}>Level ID: {level.id.substring(0, 8)}</p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 150px 150px 100px", gap: 24, alignItems: "center", marginBottom: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: TLP.gray400, letterSpacing: "0.5px" }}>VARIANT</div>
                <div style={{ fontSize: 11, fontWeight: 800, color: TLP.gray400, letterSpacing: "0.5px" }}>BASE PRICE</div>
                <div style={{ fontSize: 11, fontWeight: 800, color: TLP.gray400, letterSpacing: "0.5px" }}>YOUR PRICE</div>
                <div></div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
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
                        gap: 24, 
                        alignItems: "center",
                        padding: "16px 0",
                        borderTop: `1px solid ${TLP.gray50}`
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ fontWeight: 700, color: TLP.navy, fontSize: 15 }}>
                          {v.frequencyPerWeek}x / week
                        </div>
                        {isOverridden && (
                          <Badge label="Overridden" color={TLP.amber} bg={TLP.amberLight} />
                        )}
                      </div>
                      <div style={{ color: TLP.gray600, fontSize: 14, fontWeight: 500 }}>${v.price} <span style={{ fontSize: 11, opacity: 0.7 }}>/ mo</span></div>
                      <div>
                        <Input
                          type="number"
                          value={currentPrice}
                          onChange={(e) => {
                            const val = Number(e.target.value);
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
                          style={{ height: 40, fontWeight: 600 }}
                        />
                      </div>
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleUpdatePrice(v.id, currentPrice, currentSetup)}
                        disabled={saving === v.id}
                        style={{ height: 40, width: "100%" }}
                      >
                        {saving === v.id ? "..." : "Save"}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
