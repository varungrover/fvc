"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { TLP, planetStyle } from "@/lib/theme/tokens";

interface ProductDetailsPageProps {
  location: any;
  tenant: any;
  product: any;
  planet: any;
  variants: any[];
  batches: any[];
}

export default function ProductDetailsPage({
  location, tenant, product, planet, variants, batches,
}: ProductDetailsPageProps) {
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    variants.length > 0 ? variants[0].id : null
  );
  const [selectedBatchIds, setSelectedBatchIds] = useState<string[]>([]);
  
  const primary = tenant.brand_primary;
  const accent = tenant.brand_accent;
  const ps = planetStyle(planet?.name ?? "");

  const selectedVariant = variants.find(v => v.id === selectedVariantId);
  const currentPrice = selectedVariant ? parseFloat(selectedVariant.price) : null;
  const requiredSlots = selectedVariant ? (selectedVariant.frequency_per_week || 1) : 1;

  // Reset selected batches when variant changes
  useEffect(() => {
    setSelectedBatchIds([]);
  }, [selectedVariantId]);

  const toggleBatch = (id: string) => {
    setSelectedBatchIds(prev => {
      if (prev.includes(id)) return prev.filter(b => b !== id);
      if (prev.length >= requiredSlots) {
        return [...prev.slice(1), id];
      }
      return [...prev, id];
    });
  };

  // Group batches by day
  const batchesByDay = useMemo(() => {
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const grouped: Record<string, any[]> = {};
    days.forEach(d => {
      const dayBatches = batches.filter(b => b.day_of_week === d);
      if (dayBatches.length > 0) grouped[d] = dayBatches;
    });
    return grouped;
  }, [batches]);

  const isComplete = selectedBatchIds.length === requiredSlots;

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb", fontFamily: "inherit" }}>
      
      {/* ── Sticky Header ───────────────────────────────────── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "#fff", borderBottom: `1px solid ${TLP.gray100}`,
        boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
      }}>
        <div style={{
          maxWidth: 1100, margin: "0 auto", padding: "0 24px",
          height: 64, display: "flex", alignItems: "center",
          justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Link href={`/${location.slug}/courses`} style={{ 
              textDecoration: "none", color: TLP.gray400, fontWeight: 700, fontSize: 13,
              display: "flex", alignItems: "center", gap: 6
            }}>
              ← Programs
            </Link>
            <span style={{ color: TLP.gray200 }}>|</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: TLP.navy }}>{product.name}</span>
          </div>
          <Link href="/login" style={{
            background: primary, color: "#fff", padding: "8px 20px",
            borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: "none",
          }}>Sign in →</Link>
        </div>
      </header>

      {/* ── Hero Banner ────────────────────────────────── */}
      <div style={{
        background: `linear-gradient(135deg, ${ps.color} 0%, ${ps.color}dd 100%)`,
        padding: "64px 24px 120px",
        color: "#fff",
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ 
            fontSize: 12, fontWeight: 800, textTransform: "uppercase", 
            letterSpacing: "1.5px", opacity: 0.8, marginBottom: 16 
          }}>
            PROGRAMS DETAILS
          </div>
          <h1 style={{ margin: 0, fontSize: 48, fontWeight: 900, letterSpacing: "-1px", marginBottom: 20 }}>
            {product.name}
          </h1>
          <p style={{ margin: 0, fontSize: 18, opacity: 0.9, maxWidth: 600, lineHeight: 1.6 }}>
            View details, browse the schedule, and select a time slot to enroll.
          </p>
        </div>
      </div>

      {/* ── Main Content Card ───────────────────────────────── */}
      <div style={{ maxWidth: 1100, margin: "-80px auto 60px", padding: "0 24px" }}>
        <div style={{
          background: "#fff", borderRadius: 24, padding: 40,
          boxShadow: "0 20px 50px rgba(0,0,0,0.1)",
        }}>
          {/* Top Section: Media + Info */}
          <div style={{ display: "flex", gap: 48, marginBottom: 32 }}>
            {/* Left: Product Media */}
            <div style={{ width: 400, flexShrink: 0 }}>
              <div style={{ 
                width: "100%", aspectRatio: "1/1", borderRadius: 20, 
                background: `linear-gradient(135deg, ${ps.bg}, #fff)`,
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                fontSize: 120, position: "relative", overflow: "hidden",
                padding: "20px",
              }}>
                {/* Icon */}
                <div style={{ marginBottom: 16 }}>{ps.icon}</div>
                
                <div style={{ 
                  position: "absolute", top: 20, right: 20,
                  background: ps.color, color: "#fff", fontSize: 12, fontWeight: 800,
                  padding: "6px 14px", borderRadius: 99,
                }}>
                  {planet?.name}
                </div>

                {/* Short Description Overlay */}
                {product.short_description && (
                  <div style={{
                    textAlign: "center", color: TLP.navy, lineHeight: 1.4,
                    maxWidth: "80%",
                  }}>
                    {(() => {
                      const parts = product.short_description.split('\n');
                      const firstLine = parts[0] || "";
                      const secondLine = parts.slice(1).join(" ") || "";
                      return (
                        <>
                          <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 2 }}>{firstLine}</div>
                          {secondLine && <div style={{ fontSize: 14, fontWeight: 600, opacity: 0.7 }}>{secondLine}</div>}
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Product Info */}
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                <h2 style={{ margin: 0, fontSize: 32, fontWeight: 900, color: TLP.navy }}>
                  {product.name}
                </h2>
              </div>

              {currentPrice !== null && (
                <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 32 }}>
                  <span style={{ fontSize: 36, fontWeight: 900, color: "#f85359" }}>
                    ${currentPrice.toFixed(0)}
                  </span>
                  <span style={{ fontSize: 18, color: TLP.gray400 }}>/month</span>
                </div>
              )}

              {/* Description */}
              <div style={{ marginBottom: 32 }}>
                <p style={{ margin: 0, fontSize: 16, color: TLP.gray600, lineHeight: 1.7 }}>
                  {product.description}
                </p>
              </div>

              {/* Variant Selection */}
              <div style={{ marginBottom: 0 }}>
                <h3 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 800, color: TLP.gray400, textTransform: "uppercase", letterSpacing: "1px" }}>
                  Select Program Frequency
                </h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "flex-start" }}>
                  {variants.map(v => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariantId(v.id)}
                      style={{
                        width: 160, padding: "16px", borderRadius: 16,
                        border: `2px solid ${selectedVariantId === v.id ? ps.color : TLP.gray100}`,
                        background: selectedVariantId === v.id ? `${ps.color}08` : "#fff",
                        cursor: "pointer", transition: "all 0.2s", textAlign: "left",
                        outline: "none",
                      }}
                    >
                      <div style={{ fontSize: 14, fontWeight: 800, color: TLP.navy, marginBottom: 4 }}>
                        {v.name}
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: selectedVariantId === v.id ? ps.color : TLP.gray400 }}>
                        ${parseFloat(v.price).toFixed(0)} /mo
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section: Schedule (Full Width / Centered) */}
          <div style={{ borderTop: `1px solid ${TLP.gray100}`, paddingTop: 32 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, marginBottom: 32 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <h3 style={{ margin: 0, fontSize: 24, fontWeight: 900, color: TLP.navy }}>
                  Available Schedule
                </h3>
                {selectedVariant && (
                  <span style={{ fontSize: 12, fontWeight: 800, color: ps.color, background: `${ps.color}12`, padding: "6px 14px", borderRadius: 10, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    {selectedBatchIds.length} / {requiredSlots} Slots Selected
                  </span>
                )}
              </div>
              <p style={{ margin: 0, fontSize: 15, color: TLP.gray400, textAlign: "center" }}>
                Select <strong>{requiredSlots} slot{requiredSlots > 1 ? "s" : ""}</strong> for your weekly sessions
              </p>
            </div>
            
            {Object.keys(batchesByDay).length === 0 ? (
              <div style={{ padding: 40, background: "#f9fafb", borderRadius: 20, textAlign: "center", color: TLP.gray400, fontSize: 14 }}>
                No batches currently scheduled for this location.
              </div>
            ) : (
              <div style={{ 
                border: `1.5px solid ${TLP.gray100}`, 
                borderRadius: 16, 
                overflow: "hidden",
                background: "#fff"
              }}>
                {Object.entries(batchesByDay).map(([day, dayBatches], idx, arr) => (
                  <div key={day} style={{ 
                    display: "flex", 
                    borderBottom: idx === arr.length - 1 ? "none" : `1.5px solid ${TLP.gray100}`,
                  }}>
                    {/* Day Column */}
                    <div style={{ 
                      width: 140, flexShrink: 0, 
                      background: "#f8fafc",
                      padding: "20px",
                      borderRight: `1.5px solid ${TLP.gray100}`,
                      display: "flex",
                      alignItems: "center",
                      fontSize: 12, fontWeight: 900, color: TLP.gray400, 
                      textTransform: "uppercase", letterSpacing: "1px",
                    }}>
                      {day}s
                    </div>

                    {/* Slots Column */}
                    <div style={{ 
                      flex: 1, 
                      padding: "16px 24px",
                      display: "flex", 
                      flexWrap: "wrap", 
                      gap: 10,
                      alignItems: "center"
                    }}>
                      {dayBatches.map(batch => {
                        const isSelected = selectedBatchIds.includes(batch.id);
                        return (
                          <button
                            key={batch.id}
                            onClick={() => toggleBatch(batch.id)}
                            style={{
                              padding: "8px 18px", borderRadius: 10,
                              border: `1.5px solid ${isSelected ? ps.color : TLP.gray100}`,
                              background: isSelected ? `${ps.color}08` : "#fff",
                              cursor: "pointer", transition: "all 0.1s",
                              textAlign: "center", outline: "none",
                              boxShadow: isSelected ? `0 4px 10px ${ps.color}10` : "none",
                            }}
                          >
                            <div style={{ fontSize: 14, fontWeight: 800, color: TLP.navy }}>
                              {batch.start_time.slice(0, 5)} - {batch.end_time.slice(0, 5)}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Big Enroll Button */}
            <div style={{ marginTop: 48, padding: "40px 0 0", borderTop: `1px dashed ${TLP.gray100}`, display: "flex", justifyContent: "center" }}>
              {(() => {
                const enrollPath = `/customer/enroll?productId=${product.id}&variantId=${selectedVariantId}&batchIds=${selectedBatchIds.join(",")}`;
                const loginPath = `/login?next=${encodeURIComponent(enrollPath)}`;
                
                return (
                  <Link 
                    href={isComplete ? loginPath : "#"}
                    onClick={e => { if (!isComplete) e.preventDefault(); }}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
                      background: isComplete ? ps.color : TLP.gray100,
                      color: isComplete ? "#fff" : TLP.gray400,
                      padding: "18px 64px", borderRadius: 16,
                      fontSize: 18, fontWeight: 900, textDecoration: "none",
                      transition: "all 0.25s",
                      cursor: isComplete ? "pointer" : "not-allowed",
                      boxShadow: isComplete ? `0 8px 24px ${ps.color}44` : "none",
                      transform: isComplete ? "translateY(0)" : "none",
                    }}
                    onMouseEnter={e => {
                      if (isComplete) {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow = `0 12px 30px ${ps.color}55`;
                      }
                    }}
                    onMouseLeave={e => {
                      if (isComplete) {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = `0 8px 24px ${ps.color}44`;
                      }
                    }}
                  >
                    {isComplete ? (
                      <>Enroll Now <span style={{ fontSize: 20 }}>→</span></>
                    ) : (
                      `Select ${requiredSlots - selectedBatchIds.length} more slot${(requiredSlots - selectedBatchIds.length) > 1 ? "s" : ""}`
                    )}
                  </Link>
                );
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
