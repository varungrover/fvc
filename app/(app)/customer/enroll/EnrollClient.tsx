"use client";

import { useState, useMemo, useEffect } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { TLP, PLANETS, PlanetName } from "@/lib/theme/tokens";
import { useRouter, useSearchParams } from "next/navigation";
import { computeFirstMonthAmount, computeMultiPlanetDiscount } from "@/lib/billing/invoice";

const STEPS = ["Level", "Schedule", "Student", "Billing", "Payment"];

export default function EnrollClient({ initialData }: { initialData: any }) {
  const searchParams = useSearchParams();
  const [step, setStep] = useState(1);
  const [subStep, setSubStep] = useState(0); // 0: Planet, 1: Product, 2: Level
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    memberId: "",
    planetId: "",
    productId: "",
    variantId: "",
    batchIds: [] as string[],
    paymentMethodId: ""
  });

  const { planets, products, levels, members, batches, discountTiers } = initialData;

  // Ensure hydration stability and handle initial state from URL
  useEffect(() => {
    setMounted(true);

    const pId = searchParams.get("productId");
    const vId = searchParams.get("variantId");
    const bIds = searchParams.get("batchIds");
    const mId = searchParams.get("memberId");
    const autoStep = searchParams.get("autoStep");

    if (pId && vId && bIds) {
      const product = products.find((p: any) => p.id === pId);
      setFormData(prev => ({
        ...prev,
        productId: pId,
        variantId: vId,
        batchIds: bIds.split(","),
        planetId: product?.planet_id || "",
        memberId: mId || prev.memberId
      }));
      
      if (autoStep) {
        setStep(parseInt(autoStep));
      } else {
        setStep(3); // Default for storefront redirect
      }
    }
  }, [searchParams, products]);

  // Real-time Billing Logic
  const billingSummary = useMemo(() => {
    if (!mounted) return null;
    const selectedLevel = levels.find((l: any) => l.id === formData.variantId);
    if (!selectedLevel) return null;

    const basePrice = selectedLevel.price;
    const proratedAmount = computeFirstMonthAmount(basePrice, new Date());
    const setupFee = selectedLevel.setup_fee || 0;
    
    // Total enrollment count (simulated: current + 1)
    const activeEnrollments = 1; 
    const discount = computeMultiPlanetDiscount(proratedAmount, activeEnrollments, discountTiers || []);
    
    return {
      basePrice,
      proratedAmount,
      setupFee,
      discount,
      total: Math.max(0, proratedAmount + setupFee - discount)
    };
  }, [formData.variantId, levels, discountTiers, mounted]);

  const handleNext = () => {
    if (step === 1) {
      if (subStep < 2) {
        setSubStep(s => s + 1);
        return;
      }
    }
    setStep(s => Math.min(s + 1, STEPS.length));
    setSubStep(0);
  };

  const handlePrev = () => {
    if (step === 1) {
      if (subStep > 0) {
        setSubStep(s => s - 1);
        return;
      }
    }
    setStep(s => {
      const nextStep = Math.max(s - 1, 1);
      if (nextStep === 1) setSubStep(2); // Go to level selection if returning to step 1
      return nextStep;
    });
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/enrollments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId: formData.memberId,
          productVariantId: formData.variantId,
          batchIds: formData.batchIds,
        })
      });
      
      if (!res.ok) {
        throw new Error("Failed to create checkout session");
      }

      const { url } = await res.json();
      if (url) {
        window.location.href = url; // Redirect to Stripe
      }
    } catch (err) {
      console.error(err);
      alert("Error initiating checkout. Please try again.");
    } finally {
      loading && setLoading(false);
    }
  };

  if (!mounted) return null; // Avoid hydration mismatch for the entire form

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 40 }}>
        <PageHeader 
          title="Academy Enrollment" 
          subtitle="Complete the steps to launch your child's chess journey"
        />
        <div style={{ display: "flex", gap: 12 }}>
          {STEPS.map((s, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ 
                width: 32, 
                height: 32, 
                borderRadius: 16, 
                background: i + 1 < step ? TLP.teal : i + 1 === step ? TLP.navy : TLP.gray100,
                color: i + 1 <= step ? "white" : TLP.gray400,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 14,
                fontWeight: 700,
                margin: "0 auto 8px"
              }}>
                {i + 1 < step ? "✓" : i + 1}
              </div>
              <div style={{ fontSize: 10, fontWeight: 700, color: i + 1 === step ? TLP.navy : TLP.gray400, textTransform: "uppercase", letterSpacing: "0.05em" }}>{s}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 40, alignItems: "start" }}>
        <Card style={{ padding: 40, borderRadius: 24, boxShadow: "0 20px 50px rgba(0,0,0,0.05)" }}>
          
          {/* STEP 1: TIERED LEVEL SELECTION */}
          {step === 1 && (
            <div key={`step-1-sub-${subStep}`}>
              {subStep === 0 && (
                <>
                  <h2 style={{ fontSize: 24, fontWeight: 800, color: TLP.navy, marginBottom: 24 }}>Choose Planet</h2>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                    {planets.map((p: any) => {
                      const theme = PLANETS[p.name as PlanetName] || PLANETS.Chess;
                      const isSelected = formData.planetId === p.id;
                      return (
                        <div 
                          key={p.id}
                          onClick={() => setFormData({ ...formData, planetId: p.id, productId: "", variantId: "", batchIds: [] })}
                          style={{ 
                            padding: 30, 
                            borderRadius: 20, 
                            background: theme.bg,
                            border: `3px solid ${isSelected ? theme.color : theme.color + "20"}`,
                            color: TLP.navy,
                            cursor: "pointer",
                            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                            position: "relative",
                            overflow: "hidden",
                            transform: isSelected ? "scale(1.02)" : "scale(1)",
                            boxShadow: isSelected ? `0 10px 30px ${theme.color}30` : "none"
                          }}
                        >
                          <div style={{ fontSize: 32, marginBottom: 12 }}>{theme.icon}</div>
                          <div style={{ fontSize: 24, fontWeight: 900, marginBottom: 8, color: theme.color }}>{p.name}</div>
                          <div style={{ fontSize: 14, opacity: 0.8, color: TLP.gray600 }}>{p.description || "Master new skills."}</div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

              {subStep === 1 && (
                <>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
                    <button onClick={() => setSubStep(0)} style={{ background: "none", border: "none", color: TLP.teal, fontWeight: 700, cursor: "pointer" }}>← Change Planet</button>
                    <h2 style={{ fontSize: 24, fontWeight: 800, color: TLP.navy }}>Choose Program</h2>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                    {products.filter((p: any) => p.planet_id === formData.planetId).map((p: any) => (
                      <div 
                        key={p.id}
                        onClick={() => setFormData({ ...formData, productId: p.id, variantId: "", batchIds: [] })}
                        style={{ 
                          padding: 24, 
                          borderRadius: 16, 
                          border: `2px solid ${formData.productId === p.id ? TLP.teal : TLP.gray100}`,
                          background: formData.productId === p.id ? TLP.teal + "05" : "white",
                          cursor: "pointer",
                          transition: "all 0.2s ease"
                        }}
                      >
                        <div style={{ fontWeight: 800, color: TLP.navy, fontSize: 18 }}>{p.name}</div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {subStep === 2 && (
                <>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
                    <button onClick={() => setSubStep(1)} style={{ background: "none", border: "none", color: TLP.teal, fontWeight: 700, cursor: "pointer" }}>← Change Program</button>
                    <h2 style={{ fontSize: 24, fontWeight: 800, color: TLP.navy }}>Select Frequency</h2>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                    {levels.filter((v: any) => v.product_id === formData.productId).map((v: any) => (
                      <div 
                        key={v.id}
                        onClick={() => setFormData({ ...formData, variantId: v.id, batchIds: [] })}
                        style={{ 
                          padding: 24, 
                          borderRadius: 16, 
                          border: `2px solid ${formData.variantId === v.id ? TLP.teal : TLP.gray100}`,
                          background: formData.variantId === v.id ? TLP.teal + "05" : "white",
                          cursor: "pointer",
                          transition: "all 0.2s ease"
                        }}
                      >
                        <div style={{ fontWeight: 800, color: TLP.navy }}>{v.name}</div>
                        <div style={{ fontSize: 24, fontWeight: 900, color: TLP.teal, marginTop: 12 }}>${v.price}<span style={{ fontSize: 12, fontWeight: 500, color: TLP.gray500 }}>/mo</span></div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* STEP 2: SCHEDULE */}
          {step === 2 && (
            <div key="step-2">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                <h2 style={{ fontSize: 24, fontWeight: 800, color: TLP.navy, margin: 0 }}>Pick Schedule</h2>
                <div style={{ 
                  padding: "6px 16px", 
                  borderRadius: 20, 
                  background: formData.batchIds.length === (levels.find((v: any) => v.id === formData.variantId)?.frequency_per_week || 1) ? TLP.teal : TLP.gray100,
                  color: formData.batchIds.length === (levels.find((v: any) => v.id === formData.variantId)?.frequency_per_week || 1) ? "white" : TLP.gray500,
                  fontSize: 12,
                  fontWeight: 700
                }}>
                  {formData.batchIds.length} / {levels.find((v: any) => v.id === formData.variantId)?.frequency_per_week || 1} SLOTS SELECTED
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {batches.filter((b: any) => b.product_id === formData.productId).map((b: any) => {
                  const maxSlots = levels.find((v: any) => v.id === formData.variantId)?.frequency_per_week || 1;
                  const isSelected = formData.batchIds.includes(b.id);
                  const isFull = formData.batchIds.length >= maxSlots && !isSelected;

                  return (
                    <div 
                      key={b.id}
                      onClick={() => {
                        if (isFull) return;
                        const ids = isSelected 
                          ? formData.batchIds.filter(id => id !== b.id)
                          : [...formData.batchIds, b.id];
                        setFormData({ ...formData, batchIds: ids });
                      }}
                      style={{ 
                        padding: 20, 
                        borderRadius: 12, 
                        border: `1px solid ${isSelected ? TLP.teal : TLP.gray100}`,
                        background: isSelected ? TLP.teal + "05" : "white",
                        cursor: isFull ? "not-allowed" : "pointer",
                        opacity: isFull ? 0.6 : 1,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        transition: "all 0.2s ease"
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, color: TLP.navy }}>{b.day_of_week}s</div>
                        <div style={{ fontSize: 14, color: TLP.gray500 }}>{b.start_time} - {b.end_time}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: TLP.teal }}>{b.max_capacity - (b.enrolled_count || 0)} SPOTS LEFT</div>
                        <div style={{ width: 100, height: 4, background: TLP.gray100, borderRadius: 2, marginTop: 8 }}>
                          <div style={{ width: `${(b.enrolled_count || 0) / b.max_capacity * 100}%`, height: "100%", background: TLP.teal, borderRadius: 2 }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
                {batches.filter((b: any) => b.product_id === formData.productId).length === 0 && (
                   <div style={{ textAlign: "center", padding: 40, color: TLP.gray400 }}>
                      No available schedules found for this program.
                   </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: MEMBER SELECTION */}
          {step === 3 && (
            <div key="step-3">
              <h2 style={{ fontSize: 24, fontWeight: 800, color: TLP.navy, marginBottom: 24 }}>Select Student</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                {members.map((m: any) => (
                  <div 
                    key={m.id}
                    onClick={() => setFormData({ ...formData, memberId: m.id })}
                    style={{ 
                      padding: 24, 
                      borderRadius: 16, 
                      border: `2px solid ${formData.memberId === m.id ? TLP.teal : TLP.gray100}`,
                      background: formData.memberId === m.id ? TLP.teal + "05" : "white",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      display: "flex",
                      alignItems: "center",
                      gap: 16
                    }}
                  >
                    <div style={{ width: 48, height: 48, borderRadius: 24, background: TLP.gray100, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>
                      {m.full_name.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: TLP.navy }}>{m.full_name}</div>
                      <div style={{ fontSize: 12, color: TLP.gray500 }}>{m.dob}</div>
                    </div>
                  </div>
                ))}
                {members.length === 0 && (
                  <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "40px 0", border: `2px dashed ${TLP.gray100}`, borderRadius: 16 }}>
                    <div style={{ fontSize: 40, marginBottom: 16 }}>🐣</div>
                    <div style={{ fontWeight: 700, color: TLP.navy, marginBottom: 8 }}>No Students Found</div>
                    <p style={{ color: TLP.gray500, fontSize: 14, marginBottom: 24 }}>You need to add a student to your profile before enrolling.</p>
                    <Button variant="primary" onClick={() => router.push("/customer/members/new")}>
                      + Add New Student
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 4: BILLING PREVIEW */}
          {step === 4 && billingSummary && (
            <div key="step-4">
              <h2 style={{ fontSize: 24, fontWeight: 800, color: TLP.navy, marginBottom: 24 }}>Review Billing</h2>
              <div style={{ padding: 30, background: TLP.gray50, borderRadius: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                  <span style={{ color: TLP.gray500 }}>Monthly Subscription</span>
                  <span style={{ fontWeight: 700 }}>${billingSummary.basePrice}.00</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                  <span style={{ color: TLP.gray500 }}>Prorated (Remainder of {new Date().toLocaleString('default', { month: 'long' })})</span>
                  <span style={{ fontWeight: 700 }}>${billingSummary.proratedAmount}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                  <span style={{ color: TLP.gray500 }}>Setup Fee</span>
                  <span style={{ fontWeight: 700 }}>+${billingSummary.setupFee}.00</span>
                </div>
                {billingSummary.discount > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16, color: TLP.teal }}>
                    <span style={{ fontWeight: 600 }}>Multi-Planet Discount</span>
                    <span style={{ fontWeight: 700 }}>-${billingSummary.discount}</span>
                  </div>
                )}
                <div style={{ borderTop: `2px dashed ${TLP.gray200}`, marginTop: 20, paddingTop: 20, display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 20, fontWeight: 800, color: TLP.navy }}>Amount Due Today</span>
                  <span style={{ fontSize: 24, fontWeight: 900, color: TLP.teal }}>${billingSummary.total}</span>
                </div>
              </div>
              <p style={{ fontSize: 12, color: TLP.gray400, marginTop: 20, textAlign: "center" }}>
                By continuing, you agree to our 15-day cancellation policy. 
                Next billing on the 1st of next month for the full amount.
              </p>
            </div>
          )}

          {/* STEP 5: PAYMENT */}
          {step === 5 && (
             <div key="step-5">
              <h2 style={{ fontSize: 24, fontWeight: 800, color: TLP.navy, marginBottom: 24 }}>Secure Checkout</h2>
              <div style={{ padding: 40, border: `2px solid ${TLP.teal}`, borderRadius: 20, textAlign: "center", background: TLP.teal + "05" }}>
                <div style={{ fontSize: 40, marginBottom: 20 }}>💳</div>
                <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>Ready for Payment</div>
                <div style={{ color: TLP.gray500, fontSize: 14, marginBottom: 30 }}>Your transaction will be processed via Stripe.</div>
                <Button variant="primary" style={{ width: "100%", padding: "16px" }} onClick={handleFinish} disabled={loading}>
                  {loading ? "Processing..." : `Pay $${billingSummary?.total}`}
                </Button>
              </div>
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 60 }}>
            <Button variant="secondary" onClick={handlePrev} disabled={(step === 1 && subStep === 0) || loading} style={{ borderRadius: 12, padding: "12px 24px" }}>
              Back
            </Button>
            {step < STEPS.length && (
              <Button 
                variant="primary" 
                onClick={handleNext} 
                disabled={ 
                  (step === 1 && subStep === 0 && !formData.planetId) || 
                  (step === 1 && subStep === 1 && !formData.productId) || 
                  (step === 1 && subStep === 2 && !formData.variantId) || 
                  (step === 2 && formData.batchIds.length < (levels.find((v: any) => v.id === formData.variantId)?.frequency_per_week || 1)) || 
                  (step === 3 && !formData.memberId)
                }
                style={{ borderRadius: 12, padding: "12px 32px" }}
              >
                Continue
              </Button>
            )}
          </div>
        </Card>

        {/* SIDEBAR SUMMARY */}
        <div style={{ position: "sticky", top: 24 }}>
          <h3 style={{ fontSize: 14, fontWeight: 800, color: TLP.gray400, textTransform: "uppercase", marginBottom: 20, letterSpacing: "0.1em" }}>Selection Summary</h3>
          {formData.memberId && (
            <div key="summary-member" style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, color: TLP.gray500 }}>Student</div>
              <div style={{ fontWeight: 700, color: TLP.navy }}>{members.find((m: any) => m.id === formData.memberId)?.full_name}</div>
            </div>
          )}
          {formData.planetId && (
            <div key="summary-planet" style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, color: TLP.gray500 }}>Planet</div>
              <div style={{ fontWeight: 700, color: TLP.navy }}>{planets.find((p: any) => p.id === formData.planetId)?.name}</div>
            </div>
          )}
          {formData.productId && (
            <div key="summary-product" style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, color: TLP.gray500 }}>Program</div>
              <div style={{ fontWeight: 700, color: TLP.navy }}>{products.find((p: any) => p.id === formData.productId)?.name}</div>
            </div>
          )}
          {formData.variantId && (
            <div key="summary-variant" style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, color: TLP.gray500 }}>Frequency</div>
              <div style={{ fontWeight: 700, color: TLP.navy }}>{levels.find((v: any) => v.id === formData.variantId)?.name}</div>
            </div>
          )}
          {formData.batchIds.length > 0 && (
            <div key="summary-schedule" style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, color: TLP.gray500 }}>Schedule</div>
              {formData.batchIds.map(bid => {
                const b = batches.find((x: any) => x.id === bid);
                return <div key={bid} style={{ fontWeight: 700, color: TLP.navy }}>{b?.day_of_week} {b?.start_time}</div>
              })}
            </div>
          )}
          
          {billingSummary && (
             <div key="summary-billing" style={{ marginTop: 40, padding: 24, background: TLP.navy, color: "white", borderRadius: 20 }}>
                <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 4 }}>DUE TODAY</div>
                <div style={{ fontSize: 32, fontWeight: 900 }}>${billingSummary.total}</div>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
