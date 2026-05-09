"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { TLP, planetStyle } from "@/lib/theme/tokens";

interface LandingPageProps {
  initialTenant: any;
  initialLocations: any[];
  initialPlanets: any[];
  initialLevels: any[];
  initialVariants: any[];
  initialOfferings: any[];
  forcedLocationId?: string; // When set, locks the page to one location
}

export default function LandingPage({
  initialTenant,
  initialLocations,
  initialPlanets,
  initialLevels,
  initialVariants,
  initialOfferings,
  forcedLocationId,
}: LandingPageProps) {
  const [mounted, setMounted] = useState(false);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(forcedLocationId ?? null);
  const [isAutoSelected, setIsAutoSelected] = useState(false);
  const isLocationLocked = !!forcedLocationId;
  const [selectedPlanetId, setSelectedPlanetId] = useState<string | null>(null);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [locationSearch, setLocationSearch] = useState("");
  const router = useRouter();

  useEffect(() => { setMounted(true); }, []);

  // ── Map DB snake_case → camelCase ──────────────────────
  const tenantData = useMemo(() => ({
    ...initialTenant,
    brandPrimary: initialTenant.brand_primary,
    brandAccent: initialTenant.brand_accent,
    fullName: initialTenant.full_name,
  }), [initialTenant]);

  const locations = useMemo(() =>
    initialLocations.map(l => ({ ...l, ownershipId: l.ownership_id })),
    [initialLocations]
  );

  const primary = tenantData.brandPrimary;
  const accent  = tenantData.brandAccent;

  // ── Geolocation auto-selection ─────────────────────────
  useEffect(() => {
    if (!mounted || selectedLocationId || locations.length === 0) return;
    if (!("geolocation" in navigator)) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        let closestId: string | null = null;
        let minDist = Infinity;
        locations.forEach(loc => {
          if (loc.latitude && loc.longitude) {
            const d = Math.sqrt(
              Math.pow(loc.latitude - latitude, 2) +
              Math.pow(loc.longitude - longitude, 2)
            );
            if (d < minDist) { minDist = d; closestId = loc.id; }
          }
        });
        if (closestId) { setSelectedLocationId(closestId); setIsAutoSelected(true); }
      },
      undefined,
      { enableHighAccuracy: false, timeout: 5000 }
    );
  }, [mounted, locations, selectedLocationId]);

  // ── Offering-based filtering ───────────────────────────
  const offeredVariantIds = useMemo(() => {
    if (!selectedLocationId) return new Set<string>();
    return new Set(
      initialOfferings
        .filter(o => o.location_id === selectedLocationId && o.is_active)
        .map((o: any) => o.product_variant_id as string)
    );
  }, [selectedLocationId, initialOfferings]);

  // Which planets are offered at the selected location?
  const availablePlanets = useMemo(() => {
    if (!selectedLocationId) return initialPlanets;
    return initialPlanets.filter(planet => {
      const planetProducts = initialLevels.filter(p => p.planet_id === planet.id);
      return planetProducts.some(prod => {
        const prodVariants = initialVariants.filter(v => v.product_id === prod.id);
        return prodVariants.some(v => offeredVariantIds.has(v.id));
      });
    });
  }, [selectedLocationId, initialPlanets, initialLevels, initialVariants, offeredVariantIds]);

  // Products for the selected planet, filtered by offerings
  const productsForPlanet = useMemo(() => {
    if (!selectedPlanetId) return [];
    return initialLevels.filter(prod => {
      if (prod.planet_id !== selectedPlanetId) return false;
      if (!selectedLocationId) return true;
      const prodVariants = initialVariants.filter(v => v.product_id === prod.id);
      return prodVariants.some(v => offeredVariantIds.has(v.id));
    });
  }, [selectedPlanetId, selectedLocationId, initialLevels, initialVariants, offeredVariantIds]);

  // Featured products for the selected location
  const featuredProducts = useMemo(() => {
    return initialLevels.filter(prod => {
      if (!prod.is_featured) return false;
      if (!selectedLocationId) return true;
      const prodVariants = initialVariants.filter(v => v.product_id === prod.id);
      return prodVariants.some(v => offeredVariantIds.has(v.id));
    });
  }, [selectedLocationId, initialLevels, initialVariants, offeredVariantIds]);

  const selectedLocation = locations.find(l => l.id === selectedLocationId);

  const getLowestPrice = (productId: string) => {
    const vs = initialVariants.filter(v => v.product_id === productId && (!selectedLocationId || offeredVariantIds.has(v.id)));
    if (!vs.length) return null;
    return Math.min(...vs.map((v: any) => parseFloat(v.price)));
  };

  const getPlanetForProduct = (prod: any) =>
    initialPlanets.find(p => p.id === prod.planet_id);

  if (!mounted) return <div style={{ minHeight: "100vh", background: TLP.bg }} />;

  return (
    <div style={{ minHeight: "100vh", background: TLP.bg, fontFamily: "inherit" }}>

      {/* ── Sticky Nav ─────────────────────────────────────── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(255,255,255,0.96)",
        backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
        borderBottom: `1px solid ${TLP.gray100}`,
        boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
      }}>
        <div style={{
          maxWidth: 1160, margin: "0 auto", padding: "0 28px",
          height: 64, display: "flex", alignItems: "center",
          justifyContent: "space-between", gap: 20,
        }}>
          {/* Logo */}
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", flexShrink: 0 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 8,
              background: `linear-gradient(135deg, ${primary}, ${accent})`,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
            }}>🌍</div>
            <span style={{ fontWeight: 800, fontSize: 15, color: TLP.navy, letterSpacing: "-0.3px" }}>
              {tenantData.fullName}
            </span>
          </Link>

          {/* Location Picker */}
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 10 }}>
            {!isLocationLocked && (
              <span style={{
                fontSize: 12, fontWeight: 700, color: TLP.gray400,
                whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 6,
              }}>
                📍 Location:
                {isAutoSelected && (
                  <span style={{
                    fontSize: 9, background: `${primary}18`, color: primary,
                    padding: "2px 6px", borderRadius: 4, textTransform: "uppercase", fontWeight: 800,
                  }}>Auto</span>
                )}
              </span>
            )}
            {isLocationLocked && (
              <span style={{ fontSize: 12, fontWeight: 700, color: TLP.gray400 }}>📍</span>
            )}
            
            <button
              onClick={() => setShowLocationModal(true)}
              style={{
                background: isLocationLocked ? `${primary}12` : "#fff",
                color: isLocationLocked ? primary : TLP.navy,
                border: `1.5px solid ${isLocationLocked ? "transparent" : TLP.gray200}`,
                padding: "8px 16px", borderRadius: 10,
                fontSize: 13, fontWeight: 800, cursor: "pointer",
                display: "flex", alignItems: "center", gap: 8,
                transition: "all 0.2s ease",
                minWidth: 180,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = primary;
                e.currentTarget.style.boxShadow = `0 4px 12px ${primary}15`;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = isLocationLocked ? "transparent" : TLP.gray200;
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              {selectedLocation ? (
                <>
                  <span>{selectedLocation.name}</span>
                  <span style={{ color: TLP.gray300, fontWeight: 400 }}>|</span>
                  <span style={{ fontSize: 11, color: TLP.gray500 }}>{selectedLocation.city}</span>
                </>
              ) : (
                <span style={{ color: TLP.gray400 }}>Select a center...</span>
              )}
              <span style={{ marginLeft: "auto", fontSize: 10, opacity: 0.5 }}>▼</span>
            </button>
          </div>

          {/* Sign in */}
          <Link href="/login" style={{
            background: primary, color: "#fff", padding: "8px 20px",
            borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: "none",
            whiteSpace: "nowrap", boxShadow: `0 4px 10px ${primary}33`, flexShrink: 0,
          }}>Sign in →</Link>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────────── */}
      <section style={{
        background: `linear-gradient(150deg, ${primary} 0%, ${accent} 100%)`,
        padding: "80px 28px 100px", textAlign: "center", position: "relative", overflow: "hidden",
      }}>
        {/* Decorative circles */}
        <div style={{ position: "absolute", top: -60, right: -60, width: 300, height: 300, borderRadius: "50%", background: "rgba(255,255,255,0.06)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -80, left: -40, width: 220, height: 220, borderRadius: "50%", background: "rgba(255,255,255,0.08)", pointerEvents: "none" }} />

        <div style={{ maxWidth: 700, margin: "0 auto", position: "relative" }}>
          <span style={{
            display: "inline-block", background: "rgba(255,255,255,0.2)", color: "#fff",
            padding: "5px 16px", borderRadius: 999, fontSize: 11, fontWeight: 800,
            letterSpacing: "1px", textTransform: "uppercase", marginBottom: 20,
          }}>
            {selectedLocation ? `📍 ${selectedLocation.name}` : "Welcome"}
          </span>

          <h1 style={{ margin: 0, fontSize: 52, lineHeight: 1.08, fontWeight: 900, color: "#fff", letterSpacing: "-2px" }}>
            Where curiosity<br />meets discovery.
          </h1>

          <p style={{ margin: "20px auto 0", maxWidth: 520, fontSize: 18, lineHeight: 1.55, color: "rgba(255,255,255,0.9)", fontWeight: 400 }}>
            {selectedLocation
              ? `Explore programs available at our ${selectedLocation.name} center. Select a subject below to get started.`
              : "Select your nearest center above, then choose a subject to explore available programs."}
          </p>
        </div>
      </section>

      {/* ── Planet Tiles ───────────────────────────────────── */}
      <section style={{ maxWidth: 1160, margin: "0 auto", padding: "60px 28px 0" }}>
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ margin: 0, fontSize: 28, fontWeight: 900, color: TLP.navy, letterSpacing: "-0.5px" }}>
            Choose a Subject
          </h2>
          <p style={{ margin: "8px 0 0", color: TLP.gray500, fontSize: 15 }}>
            {selectedLocation
              ? `Programs available at ${selectedLocation.name}`
              : "Select a center above to see location-specific availability"}
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 20 }}>
          {(selectedLocationId ? availablePlanets : initialPlanets).map(planet => {
            const ps = planetStyle(planet.name);
            const isSelected = selectedPlanetId === planet.id;

            return (
              <button
                key={planet.id}
                onClick={() => {
                  if (selectedLocation?.slug) {
                    router.push(`/${selectedLocation.slug}/courses?planet=${planet.id}`);
                  } else {
                    setSelectedPlanetId(isSelected ? null : planet.id);
                  }
                }}
                style={{
                  position: "relative", border: "none", cursor: "pointer", padding: 0,
                  borderRadius: 20, overflow: "hidden", textAlign: "left",
                  boxShadow: isSelected
                    ? `0 0 0 3px ${ps.color}, 0 12px 30px ${ps.color}33`
                    : "0 4px 16px rgba(0,0,0,0.08)",
                  transform: isSelected ? "translateY(-4px)" : "translateY(0)",
                  transition: "all 0.25s ease",
                  outline: "none",
                  background: ps.bg,
                  minHeight: 180,
                }}
              >
                {/* Background icon watermark */}
                <div style={{
                  position: "absolute", right: -10, bottom: -10,
                  fontSize: 100, opacity: 0.12, lineHeight: 1, pointerEvents: "none",
                  userSelect: "none",
                }}>
                  {ps.icon}
                </div>

                <div style={{ padding: "28px 24px 24px", position: "relative" }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: 14, background: ps.color,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 24, color: "#fff", marginBottom: 16,
                    boxShadow: `0 6px 14px ${ps.color}44`,
                  }}>
                    {ps.icon}
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: TLP.navy, letterSpacing: "-0.3px" }}>
                    {planet.name}
                  </div>
                  {planet.description && (
                    <div style={{ marginTop: 6, fontSize: 13, color: TLP.gray500, lineHeight: 1.5 }}>
                      {planet.description}
                    </div>
                  )}
                  <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{
                      display: "inline-block", background: ps.color, color: "#fff",
                      fontSize: 11, fontWeight: 800, padding: "4px 12px", borderRadius: 999,
                    }}>
                      {isSelected ? "Selected ✓" : "Explore →"}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* ── Products for Selected Planet ────────────────────── */}
      {selectedPlanetId && (
        <section style={{ maxWidth: 1160, margin: "0 auto", padding: "60px 28px 0" }}>
          {(() => {
            const planet = initialPlanets.find(p => p.id === selectedPlanetId);
            const ps = planet ? planetStyle(planet.name) : null;
            return (
              <>
                <div style={{ marginBottom: 28, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                  <div>
                    <h2 style={{ margin: 0, fontSize: 26, fontWeight: 900, color: TLP.navy, letterSpacing: "-0.5px" }}>
                      {planet?.name} Programs
                    </h2>
                    <p style={{ margin: "6px 0 0", color: TLP.gray500, fontSize: 14 }}>
                      {productsForPlanet.length} course{productsForPlanet.length !== 1 ? "s" : ""} available
                      {selectedLocation ? ` at ${selectedLocation.name}` : ""}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedPlanetId(null)}
                    style={{
                      background: "transparent", border: `1.5px solid ${TLP.gray200}`,
                      padding: "8px 16px", borderRadius: 8, fontSize: 13,
                      fontWeight: 700, color: TLP.gray500, cursor: "pointer",
                    }}
                  >
                    ← All Subjects
                  </button>
                </div>

                {productsForPlanet.length === 0 ? (
                  <div style={{
                    textAlign: "center", padding: "48px", background: "#fff",
                    borderRadius: 20, border: `2px dashed ${TLP.gray200}`,
                  }}>
                    <div style={{ fontSize: 36, marginBottom: 12 }}>😔</div>
                    <p style={{ color: TLP.gray500, margin: 0 }}>No programs currently available at this location for this subject.</p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {productsForPlanet.map(prod => {
                      const lowestPrice = getLowestPrice(prod.id);
                      const prodVariants = initialVariants.filter(v =>
                        v.product_id === prod.id && (!selectedLocationId || offeredVariantIds.has(v.id))
                      );
                      return (
                        <div
                          key={prod.id}
                          style={{
                            background: "#fff", borderRadius: 16,
                            border: `1px solid ${TLP.gray100}`,
                            boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
                            padding: "24px 28px",
                            display: "flex", gap: 24, alignItems: "flex-start",
                            transition: "box-shadow 0.2s ease",
                          }}
                          onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.10)")}
                          onMouseLeave={e => (e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.05)")}
                        >
                          {/* Planet badge */}
                          <div style={{
                            width: 56, height: 56, borderRadius: 14, flexShrink: 0,
                            background: ps?.bg ?? TLP.gray100,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 26, color: ps?.color ?? TLP.gray500,
                            boxShadow: `0 4px 10px ${ps?.bg ?? TLP.gray100}`,
                          }}>
                            {ps?.icon}
                          </div>

                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                              <div>
                                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: TLP.navy }}>
                                  {prod.name}
                                  {prod.is_featured && (
                                    <span style={{
                                      marginLeft: 10, fontSize: 10, background: accent,
                                      color: "#fff", padding: "3px 8px", borderRadius: 999,
                                      fontWeight: 800, verticalAlign: "middle",
                                    }}>★ Featured</span>
                                  )}
                                </h3>
                                {lowestPrice !== null && (
                                  <div style={{ marginTop: 4, fontSize: 20, fontWeight: 900, color: ps?.color ?? primary }}>
                                    From ${lowestPrice.toFixed(0)}
                                    <span style={{ fontSize: 13, fontWeight: 500, color: TLP.gray400 }}>/mo</span>
                                  </div>
                                )}
                              </div>
                              <Link
                                href={`/login?locationId=${selectedLocationId}&planetId=${selectedPlanetId}&productId=${prod.id}`}
                                style={{
                                  background: ps?.color ?? primary, color: "#fff",
                                  padding: "10px 22px", borderRadius: 10,
                                  fontSize: 13, fontWeight: 800, textDecoration: "none",
                                  whiteSpace: "nowrap", flexShrink: 0,
                                  boxShadow: `0 4px 12px ${ps?.color ?? primary}44`,
                                }}
                              >
                                Enroll →
                              </Link>
                            </div>

                            {prod.description && (
                              <p style={{ margin: "12px 0 0", fontSize: 14, color: TLP.gray500, lineHeight: 1.6 }}>
                                {prod.description}
                              </p>
                            )}

                            {/* Variants */}
                            {prodVariants.length > 0 && (
                              <div style={{ marginTop: 14, display: "flex", gap: 8, flexWrap: "wrap" }}>
                                {prodVariants
                                  .sort((a: any, b: any) => a.frequency_per_week - b.frequency_per_week)
                                  .map((v: any) => (
                                    <span key={v.id} style={{
                                      fontSize: 12, fontWeight: 700,
                                      background: `${ps?.color ?? primary}12`,
                                      color: ps?.color ?? primary,
                                      padding: "4px 12px", borderRadius: 999,
                                      border: `1px solid ${ps?.color ?? primary}30`,
                                    }}>
                                      {v.frequency_per_week}x/week · ${parseFloat(v.price).toFixed(0)}/mo
                                    </span>
                                  ))}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            );
          })()}
        </section>
      )}

      {/* ── Featured Courses ──────────────────────────────── */}
      {featuredProducts.length > 0 && (
        <section style={{ maxWidth: 1160, margin: "0 auto", padding: "60px 28px" }}>
          <div style={{ marginBottom: 28 }}>
            <span style={{
              display: "inline-block", background: `${accent}18`, color: accent,
              fontSize: 11, fontWeight: 900, padding: "4px 12px", borderRadius: 999,
              letterSpacing: "0.8px", textTransform: "uppercase", marginBottom: 10,
            }}>⭐ Featured</span>
            <h2 style={{ margin: 0, fontSize: 28, fontWeight: 900, color: TLP.navy, letterSpacing: "-0.5px" }}>
              Featured Courses
            </h2>
            <p style={{ margin: "8px 0 0", color: TLP.gray500, fontSize: 15 }}>
              Our most popular programs{selectedLocation ? ` at ${selectedLocation.name}` : ""}
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
            {featuredProducts.map(prod => {
              const planet = getPlanetForProduct(prod);
              const ps = planet ? planetStyle(planet.name) : null;
              const lowestPrice = getLowestPrice(prod.id);

              return (
                <div
                  key={prod.id}
                  style={{
                    background: "#fff", borderRadius: 20,
                    border: `1px solid ${TLP.gray100}`,
                    boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
                    overflow: "hidden",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.12)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.06)"; }}
                >
                  {/* Card header with gradient */}
                  <div style={{
                    background: ps ? `linear-gradient(135deg, ${ps.bg}, ${ps.color}22)` : TLP.gray100,
                    padding: "28px 24px 20px",
                    position: "relative", overflow: "hidden",
                  }}>
                    <div style={{
                      position: "absolute", right: -8, top: -8, fontSize: 80,
                      opacity: 0.15, pointerEvents: "none", lineHeight: 1,
                    }}>{ps?.icon}</div>
                    <div style={{
                      display: "inline-flex", alignItems: "center", gap: 6,
                      background: ps?.color ?? primary, color: "#fff",
                      fontSize: 11, fontWeight: 800, padding: "3px 10px", borderRadius: 999,
                      marginBottom: 12,
                    }}>
                      {ps?.icon} {planet?.name}
                    </div>
                    <h3 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: TLP.navy }}>
                      {prod.name}
                    </h3>
                    {lowestPrice !== null && (
                      <div style={{ marginTop: 6, fontSize: 22, fontWeight: 900, color: ps?.color ?? primary }}>
                        From ${lowestPrice.toFixed(0)}<span style={{ fontSize: 13, fontWeight: 500, color: TLP.gray500 }}>/mo</span>
                      </div>
                    )}
                  </div>

                  <div style={{ padding: "16px 24px 24px" }}>
                    {prod.description && (
                      <p style={{ margin: "0 0 16px", fontSize: 13, color: TLP.gray500, lineHeight: 1.6 }}>
                        {prod.description}
                      </p>
                    )}
                    <Link
                      href={`/login?locationId=${selectedLocationId}&planetId=${prod.planet_id}&productId=${prod.id}`}
                      style={{
                        display: "block", background: ps?.color ?? primary, color: "#fff",
                        padding: "12px", borderRadius: 12, fontSize: 14, fontWeight: 800,
                        textDecoration: "none", textAlign: "center",
                        boxShadow: `0 4px 12px ${ps?.color ?? primary}44`,
                      }}
                    >
                      Enroll Now →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Footer CTA ─────────────────────────────────────── */}
      <section style={{ background: TLP.navy, padding: "80px 28px", textAlign: "center", marginTop: 80 }}>
        <div style={{ maxWidth: 580, margin: "0 auto" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🌟</div>
          <h2 style={{ margin: 0, fontSize: 30, fontWeight: 900, color: "#fff", letterSpacing: "-0.8px" }}>
            Start with a free trial class
          </h2>
          <p style={{ margin: "12px 0 0", color: "rgba(255,255,255,0.65)", fontSize: 16, lineHeight: 1.55 }}>
            See how our programs spark curiosity. One free trial per member per subject.
          </p>
          <Link
            href="/login"
            style={{
              display: "inline-block", marginTop: 28, background: primary, color: "#fff",
              padding: "14px 32px", borderRadius: 12, fontSize: 15, fontWeight: 800,
              textDecoration: "none", boxShadow: "0 4px 14px rgba(0,0,0,0.3)",
            }}
          >
            Sign up today
          </Link>
        </div>
      </section>

      {/* ── Location Picker Modal ────────────────────────── */}
      {showLocationModal && (
        <div
          onClick={() => { setShowLocationModal(false); setLocationSearch(""); }}
          style={{
            position: "fixed", inset: 0, zIndex: 999,
            background: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 24,
            animation: "fadeIn 0.2s ease-out",
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: "#fff", borderRadius: 24, width: "100%", maxWidth: 680,
              maxHeight: "85vh", display: "flex", flexDirection: "column",
              boxShadow: "0 40px 100px rgba(0,0,0,0.3)",
              animation: "slideUp 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
            }}
          >
            {/* Modal Header */}
            <div style={{
              padding: "28px 28px 20px",
              borderBottom: `1px solid ${TLP.gray100}`,
              display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16,
            }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: TLP.navy, letterSpacing: "-0.5px" }}>
                  Choose Your Center
                </h2>
                <p style={{ margin: "4px 0 0", fontSize: 13, color: TLP.gray400 }}>
                  Select a location to view available programs
                </p>
              </div>
              <button
                onClick={() => { setShowLocationModal(false); setLocationSearch(""); }}
                style={{
                  background: TLP.gray100, border: "none", borderRadius: 8,
                  width: 34, height: 34, cursor: "pointer", fontSize: 16,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0, transition: "background 0.15s",
                }}
                onMouseEnter={e => e.currentTarget.style.background = TLP.gray200}
                onMouseLeave={e => e.currentTarget.style.background = TLP.gray100}
              >
                ✕
              </button>
            </div>

            {/* Search */}
            <div style={{ padding: "16px 28px" }}>
              <div style={{ position: "relative" }}>
                <span style={{
                  position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
                  fontSize: 15, pointerEvents: "none", color: TLP.gray400,
                }}>🔍</span>
                <input
                  autoFocus
                  placeholder="Search by city or center name…"
                  value={locationSearch}
                  onChange={e => setLocationSearch(e.target.value)}
                  onKeyDown={e => { if (e.key === "Escape") { setShowLocationModal(false); setLocationSearch(""); }}}
                  style={{
                    width: "100%", padding: "11px 14px 11px 42px",
                    borderRadius: 10, border: `1.5px solid ${TLP.gray200}`,
                    fontSize: 14, color: TLP.navy, outline: "none",
                    boxSizing: "border-box", background: TLP.gray50,
                    transition: "border-color 0.2s ease",
                  }}
                  onFocus={e => e.target.style.borderColor = primary}
                  onBlur={e => e.target.style.borderColor = TLP.gray200}
                />
              </div>
            </div>

            {/* Location Cards — scrollable */}
            <div style={{ overflowY: "auto", padding: "0 28px 28px", flex: 1 }}>
              {(() => {
                const filtered = locations.filter(loc =>
                  !locationSearch ||
                  loc.name.toLowerCase().includes(locationSearch.toLowerCase()) ||
                  loc.city.toLowerCase().includes(locationSearch.toLowerCase()) ||
                  (loc.state_province ?? "").toLowerCase().includes(locationSearch.toLowerCase())
                );

                if (filtered.length === 0) return (
                  <div style={{ textAlign: "center", padding: "40px 0", color: TLP.gray400 }}>
                    <div style={{ fontSize: 32, marginBottom: 10 }}>🗺️</div>
                    <p style={{ margin: 0, fontWeight: 700 }}>No centers found for "{locationSearch}"</p>
                  </div>
                );

                // Group by province
                const byProvince: Record<string, typeof filtered> = {};
                filtered.forEach(loc => {
                  const prov = loc.state_province || "Other";
                  if (!byProvince[prov]) byProvince[prov] = [];
                  byProvince[prov].push(loc);
                });

                const provinceLabel = (p: string) => {
                  if (p === "BC") return "🍁 British Columbia";
                  if (p === "ON") return "🏙️ Ontario";
                  return `📍 ${p}`;
                };

                return Object.entries(byProvince).map(([province, locs]) => (
                  <div key={province} style={{ marginBottom: 20 }}>
                    <div style={{
                      fontSize: 11, fontWeight: 800, color: TLP.gray400,
                      letterSpacing: "0.8px", textTransform: "uppercase",
                      marginBottom: 10, paddingBottom: 6,
                      borderBottom: `1px solid ${TLP.gray100}`,
                    }}>
                      {provinceLabel(province)}
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      {locs.map(loc => {
                        const isCurrent = loc.id === selectedLocationId;
                        return (
                          <button
                            key={loc.id}
                            onClick={() => {
                              if (loc.slug) {
                                router.push(`/${loc.slug}`);
                              } else {
                                setSelectedLocationId(loc.id);
                                setSelectedPlanetId(null);
                              }
                              setShowLocationModal(false);
                              setLocationSearch("");
                            }}
                            style={{
                              background: isCurrent ? `${primary}0f` : "#fff",
                              border: `1.5px solid ${isCurrent ? primary : TLP.gray200}`,
                              borderRadius: 14, padding: "14px 16px",
                              cursor: "pointer", textAlign: "left",
                              transition: "all 0.18s ease",
                              outline: "none",
                            }}
                            onMouseEnter={e => {
                              if (!isCurrent) {
                                e.currentTarget.style.borderColor = primary;
                                e.currentTarget.style.background = `${primary}07`;
                                e.currentTarget.style.transform = "translateY(-1px)";
                                e.currentTarget.style.boxShadow = `0 4px 12px ${primary}20`;
                              }
                            }}
                            onMouseLeave={e => {
                              if (!isCurrent) {
                                e.currentTarget.style.borderColor = TLP.gray200;
                                e.currentTarget.style.background = "#fff";
                                e.currentTarget.style.transform = "translateY(0)";
                                e.currentTarget.style.boxShadow = "none";
                              }
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                              <div style={{ minWidth: 0 }}>
                                <div style={{
                                  fontSize: 14, fontWeight: 800,
                                  color: isCurrent ? primary : TLP.navy,
                                  marginBottom: 3,
                                }}>
                                  {loc.name}
                                </div>
                                <div style={{ fontSize: 12, color: TLP.gray500, fontWeight: 600 }}>
                                  {loc.city}, {loc.state_province}
                                </div>
                                {loc.address_line1 && (
                                  <div style={{ fontSize: 11, color: TLP.gray400, marginTop: 4, lineHeight: 1.4 }}>
                                    {loc.address_line1}
                                  </div>
                                )}
                              </div>
                              {isCurrent && (
                                <span style={{
                                  background: primary, color: "#fff",
                                  fontSize: 9, fontWeight: 800,
                                  padding: "3px 7px", borderRadius: 999,
                                  flexShrink: 0, marginTop: 2,
                                  textTransform: "uppercase", letterSpacing: "0.5px",
                                }}>Current</span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(24px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
      `}} />
    </div>
  );
}
