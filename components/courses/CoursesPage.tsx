"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TLP, planetStyle } from "@/lib/theme/tokens";

interface CoursesPageProps {
  location: any;
  tenant: any;
  planets: any[];
  products: any[];
  variants: any[];
  offerings: any[];
  initialPlanetId: string | null;
  initialSearch: string;
}

const SORT_OPTIONS = [
  { value: "default", label: "Default Sorting" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "name_asc", label: "Name: A → Z" },
];

// Colorful illustrated placeholders using planet colors
function CourseImagePlaceholder({ planet, size = 200 }: { planet: any; size?: number }) {
  const ps = planetStyle(planet?.name ?? "");
  return (
    <div style={{
      width: "100%", aspectRatio: "4/3",
      background: `linear-gradient(135deg, ${ps.bg} 0%, ${ps.color}22 100%)`,
      borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center",
      position: "relative", overflow: "hidden", flexShrink: 0,
    }}>
      {/* decorative circles */}
      <div style={{ position: "absolute", top: -20, right: -20, width: 100, height: 100, borderRadius: "50%", background: `${ps.color}15` }} />
      <div style={{ position: "absolute", bottom: -10, left: -10, width: 70, height: 70, borderRadius: "50%", background: `${ps.color}20` }} />
      <div style={{ fontSize: 64, position: "relative", zIndex: 1, filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.1))" }}>
        {ps.icon}
      </div>
      {/* Subject badge */}
      <div style={{
        position: "absolute", top: 12, right: 12,
        background: ps.color, color: "#fff",
        fontSize: 10, fontWeight: 800, padding: "4px 10px",
        borderRadius: 999, letterSpacing: "0.3px",
      }}>
        {planet?.name}
      </div>
    </div>
  );
}

export default function CoursesPage({
  location, tenant, planets, products, variants, offerings, initialPlanetId, initialSearch,
}: CoursesPageProps) {
  const router = useRouter();
  const [search, setSearch] = useState(initialSearch);
  const [selectedPlanetId, setSelectedPlanetId] = useState<string | null>(initialPlanetId);
  const [sortBy, setSortBy] = useState("default");

  const primary = tenant.brand_primary;
  const accent = tenant.brand_accent;

  const GRADE_LEVELS = ["Elementary", "Middle School", "High School"];

  // Helper to guess grade level from name (for UI demo purposes)
  const getProductGrade = (name: string) => {
    if (name.toLowerCase().includes("jr") || name.toLowerCase().includes("enthusiast")) return "Elementary";
    if (name.toLowerCase().includes("ii") || name.toLowerCase().includes("pro")) return "Middle School";
    return "High School";
  };

  // Build variant map: productId → variants[]
  const variantsByProduct = useMemo(() => {
    const map: Record<string, any[]> = {};
    variants.forEach(v => {
      if (!map[v.product_id]) map[v.product_id] = [];
      map[v.product_id].push(v);
    });
    return map;
  }, [variants]);

  // Get lowest price for a product
  const getLowestPrice = (productId: string) => {
    const vs = variantsByProduct[productId] ?? [];
    if (!vs.length) return null;
    return Math.min(...vs.map(v => parseFloat(v.price)));
  };

  // Get planet for a product
  const getPlanet = (product: any) => planets.find(p => p.id === product.planet_id);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = products.filter(prod => {
      if (selectedPlanetId && prod.planet_id !== selectedPlanetId) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!prod.name.toLowerCase().includes(q) &&
            !(prod.description ?? "").toLowerCase().includes(q)) return false;
      }
      return true;
    });

    if (sortBy === "price_asc") {
      result = [...result].sort((a, b) => (getLowestPrice(a.id) ?? 999) - (getLowestPrice(b.id) ?? 999));
    } else if (sortBy === "price_desc") {
      result = [...result].sort((a, b) => (getLowestPrice(b.id) ?? 0) - (getLowestPrice(a.id) ?? 0));
    } else if (sortBy === "name_asc") {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [products, selectedPlanetId, search, sortBy]);

  const selectedPlanet = planets.find(p => p.id === selectedPlanetId);

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
          maxWidth: 1200, margin: "0 auto", padding: "0 28px",
          height: 64, display: "flex", alignItems: "center",
          justifyContent: "space-between", gap: 20,
        }}>
          {/* Logo / Breadcrumb */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
            <Link href={`/${location.slug}`} style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", flexShrink: 0 }}>
              <div style={{
                width: 34, height: 34, borderRadius: 8,
                background: `linear-gradient(135deg, ${primary}, ${accent})`,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
              }}>🌍</div>
              <span style={{ fontWeight: 800, fontSize: 15, color: TLP.navy, letterSpacing: "-0.3px" }}>
                {tenant.full_name}
              </span>
            </Link>
            <span style={{ color: TLP.gray300, fontSize: 16 }}>/</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: primary, background: `${primary}12`, padding: "4px 10px", borderRadius: 6 }}>
              📍 {location.name}
            </span>
            <span style={{ color: TLP.gray300, fontSize: 16 }}>/</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: TLP.gray500 }}>Courses</span>
          </div>

          <Link href="/login" style={{
            background: primary, color: "#fff", padding: "8px 20px",
            borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: "none",
            whiteSpace: "nowrap", boxShadow: `0 4px 10px ${primary}33`, flexShrink: 0,
          }}>Sign in →</Link>
        </div>
      </header>

      {/* ── Page Hero Banner ────────────────────────────────── */}
      <div style={{
        background: `linear-gradient(120deg, ${primary} 0%, ${accent} 100%)`,
        padding: "32px 28px",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 900, color: "#fff", letterSpacing: "-0.5px" }}>
            {selectedPlanet ? `${planetStyle(selectedPlanet.name).icon} ${selectedPlanet.name} Programs` : "All Programs"}
          </h1>
          <p style={{ margin: "6px 0 0", color: "rgba(255,255,255,0.8)", fontSize: 14 }}>
            {filteredProducts.length} course{filteredProducts.length !== 1 ? "s" : ""} available at <strong>{location.name}</strong>, {location.city}
          </p>
        </div>
      </div>

      {/* ── Main Layout ─────────────────────────────────────── */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 28px", display: "flex", gap: 28, alignItems: "flex-start" }}>

        {/* ── Sidebar ─────────────────────────────────────── */}
        <aside style={{ width: 230, flexShrink: 0, position: "sticky", top: 80 }}>

          {/* Search */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: TLP.gray400, letterSpacing: "0.8px", textTransform: "uppercase", marginBottom: 10 }}>
              Search
            </div>
            <input
              placeholder="Search programs…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: "100%", padding: "9px 12px", borderRadius: 8,
                border: `1.5px solid ${search ? primary : TLP.gray200}`,
                fontSize: 13, color: TLP.navy, outline: "none",
                boxSizing: "border-box", background: "#fff",
                transition: "border-color 0.2s",
              }}
              onFocus={e => e.target.style.borderColor = primary}
              onBlur={e => e.target.style.borderColor = search ? primary : TLP.gray200}
            />
          </div>

          {/* Planet Filter */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: TLP.navy, letterSpacing: "1px", textTransform: "uppercase", marginBottom: 12 }}>
              Planet
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <button
                onClick={() => setSelectedPlanetId(null)}
                style={{
                  padding: "10px 16px", borderRadius: 10, border: "none",
                  background: !selectedPlanetId ? "#56b0e4" : "transparent",
                  color: !selectedPlanetId ? "#fff" : TLP.gray600,
                  fontSize: 14, fontWeight: 600, cursor: "pointer",
                  textAlign: "left", transition: "all 0.2s",
                }}
              >
                All Planets
              </button>
              {planets.map(planet => {
                const isActive = selectedPlanetId === planet.id;
                return (
                  <button
                    key={planet.id}
                    onClick={() => setSelectedPlanetId(isActive ? null : planet.id)}
                    style={{
                      padding: "10px 16px", borderRadius: 10, border: "none",
                      background: isActive ? "#56b0e4" : "transparent",
                      color: isActive ? "#fff" : TLP.gray600,
                      fontSize: 14, fontWeight: 600, cursor: "pointer",
                      textAlign: "left", transition: "all 0.2s",
                    }}
                    onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = TLP.gray50; }}
                    onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
                  >
                    {planet.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Back to center */}
          <div style={{ paddingTop: 16, borderTop: `1px solid ${TLP.gray100}` }}>
            <Link
              href={`/${location.slug}`}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                fontSize: 12, fontWeight: 700, color: TLP.gray400,
                textDecoration: "none", padding: "8px 0",
                transition: "color 0.15s",
              }}
              onMouseEnter={(e: any) => e.currentTarget.style.color = primary}
              onMouseLeave={(e: any) => e.currentTarget.style.color = TLP.gray400}
            >
              ← Back to {location.name}
            </Link>
          </div>
        </aside>

        {/* ── Course List ─────────────────────────────────── */}
        <main style={{ flex: 1, minWidth: 0 }}>

          {/* Sort bar */}
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 20 }}>
            <div style={{ position: "relative" }}>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                style={{
                  padding: "8px 32px 8px 14px", borderRadius: 8,
                  border: `1.5px solid ${TLP.gray200}`, background: "#fff",
                  fontSize: 13, fontWeight: 600, color: TLP.navy,
                  appearance: "none", cursor: "pointer", outline: "none",
                }}
              >
                {SORT_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", fontSize: 9, color: TLP.gray400 }}>▼</span>
            </div>
          </div>

          {/* Empty state */}
          {filteredProducts.length === 0 && (
            <div style={{
              textAlign: "center", padding: "64px 24px",
              background: "#fff", borderRadius: 20,
              border: `2px dashed ${TLP.gray200}`,
            }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: TLP.navy }}>No courses found</h3>
              <p style={{ margin: "8px 0 0", color: TLP.gray400, fontSize: 14 }}>
                Try adjusting your search or selecting a different category.
              </p>
              <button
                onClick={() => { setSearch(""); setSelectedPlanetId(null); }}
                style={{
                  marginTop: 16, background: primary, color: "#fff",
                  border: "none", padding: "10px 24px", borderRadius: 8,
                  fontSize: 13, fontWeight: 700, cursor: "pointer",
                }}
              >
                Clear filters
              </button>
            </div>
          )}

          {/* Course cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {filteredProducts.map((product, idx) => {
              const planet = getPlanet(product);
              const ps = planet ? planetStyle(planet.name) : null;
              const lowestPrice = getLowestPrice(product.id);
              const productVariants = variantsByProduct[product.id] ?? [];

              return (
                <Link
                  key={product.id}
                  href={`/${location.slug}/courses/${product.id}`}
                  style={{
                    background: "#fff", borderRadius: 24,
                    overflow: "hidden", display: "flex", gap: 32,
                    padding: 0, textDecoration: "none",
                    animation: `fadeSlideIn 0.3s ease-out ${idx * 0.05}s both`,
                    transition: "transform 0.2s, box-shadow 0.2s",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.08)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  {/* Left: image */}
                  <div style={{ width: 440, flexShrink: 0 }}>
                    <CourseImagePlaceholder planet={planet} />
                  </div>

                  {/* Right: details */}
                  <div style={{ flex: 1, padding: "12px 0", minWidth: 0 }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      <h2 style={{ margin: 0, fontSize: 32, fontWeight: 800, color: TLP.navy }}>
                        {product.name}
                      </h2>

                      {lowestPrice !== null && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: TLP.gray400, textTransform: "uppercase" }}>
                            Starting from
                          </span>
                          <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                            <span style={{ fontSize: 28, fontWeight: 800, color: "#f85359" }}>
                              ${lowestPrice.toFixed(0)}
                            </span>
                            <span style={{ fontSize: 18, color: TLP.gray400 }}>/month</span>
                          </div>
                        </div>
                      )}

                      {product.description && (
                        <p style={{
                          margin: 0, fontSize: 16, color: TLP.navy,
                          lineHeight: 1.6, opacity: 0.8
                        }}>
                          {product.description}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </main>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
}
