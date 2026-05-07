"use client";

import { useState, useMemo } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { TLP } from "@/lib/theme/tokens";
import { useRouter } from "next/navigation";
import { computeFirstMonthAmount, computeMultiPlanetDiscount } from "@/lib/billing/invoice";

const STEPS = ["Student", "Level", "Schedule", "Billing", "Payment"];

const PLANET_THEMES: Record<string, { bg: string, text: string, gradient: string }> = {
  Mercury: { bg: "#E5E7EB", text: "#374151", gradient: "linear-gradient(135deg, #9CA3AF, #4B5563)" },
  Venus: { bg: "#FEF3C7", text: "#92400E", gradient: "linear-gradient(135deg, #FBBF24, #D97706)" },
  Earth: { bg: "#DBEAFE", text: "#1E40AF", gradient: "linear-gradient(135deg, #3B82F6, #1D4ED8)" },
  Mars: { bg: "#FEE2E2", text: "#991B1B", gradient: "linear-gradient(135deg, #EF4444, #B91C1C)" },
  Jupiter: { bg: "#F3E8FF", text: "#6B21A8", gradient: "linear-gradient(135deg, #A855F7, #7E22CE)" },
  Saturn: { bg: "#FFEDD5", text: "#9A3412", gradient: "linear-gradient(135deg, #F97316, #C2410C)" },
};

export default function EnrollClient({ initialData }: { initialData: any }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    memberId: "",
    variantId: "",
    batchIds: [] as string[],
    paymentMethodId: ""
  });

  const { levels, members, batches, discountTiers } = initialData;

  // Real-time Billing Logic
  const billingSummary = useMemo(() => {
    const selectedLevel = levels.find((l: any) => l.id === formData.variantId);
    if (!selectedLevel) return null;

    const basePrice = selectedLevel.price;
    const proratedAmount = computeFirstMonthAmount(basePrice, new Date());
    const setupFee = selectedLevel.setup_fee || 0;
    
    // Total enrollment count (simulated: current + 1)
    const activeEnrollments = 1; // In real app, fetch from parent profile
    const discount = computeMultiPlanetDiscount(proratedAmount, activeEnrollments, discountTiers || []);
    
    return {
      basePrice,
      proratedAmount,
      setupFee,
      discount,
      total: Math.max(0, proratedAmount + setupFee - discount)
    };
  }, [formData.variantId, levels, discountTiers]);

  const next = () => setStep(s => Math.min(s + 1, STEPS.length));
  const prev = () => setStep(s => Math.max(s - 1, 1));

  const handleFinish = async () => {
    setLoading(true);
    try {
      const selectedLevel = levels.find((l: any) => l.id === formData.variantId);
      const res = await fetch("/api/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId: formData.memberId,
          customerId: initialData.customerId,
          productVariantId: formData.variantId,
          locationId: selectedLevel.location_id,
          ownershipId: selectedLevel.ownership_id,
          offeringPrice: selectedLevel.price,
          batchIds: formData.batchIds,
          description: `${selectedLevel.name} Enrollment`,
          setupFee: selectedLevel.setup_fee,
        })
      });
      if (res.ok) {
        router.push("/customer/billing?success=true");
      }
    } finally {
      setLoading(false);
    }
  };

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
          
          {/* STEP 1: MEMBER SELECTION */}
          {step === 1 && (
            <div>
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
                      <div style={{ fontSize: 12, color: TLP.gray500 }}>{m.date_of_birth}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: LEVEL SELECTION */}
          {step === 2 && (
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 800, color: TLP.navy, marginBottom: 24 }}>Choose Level</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                {levels.map((l: any) => {
                  const theme = PLANET_THEMES[l.name] || PLANET_THEMES.Earth;
                  return (
                    <div 
                      key={l.id}
                      onClick={() => setFormData({ ...formData, variantId: l.id })}
                      style={{ 
                        padding: 30, 
                        borderRadius: 20, 
                        background: theme.gradient,
                        color: "white",
                        cursor: "pointer",
                        transform: formData.variantId === l.id ? "scale(1.02)" : "scale(1)",
                        boxShadow: formData.variantId === l.id ? `0 10px 30px ${theme.bg}` : "none",
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        position: "relative",
                        overflow: "hidden"
                      }}
                    >
                      <div style={{ position: "absolute", right: -20, top: -20, width: 120, height: 120, background: "rgba(255,255,255,0.1)", borderRadius: 60 }} />
                      <div style={{ fontSize: 24, fontWeight: 900, marginBottom: 8 }}>{l.name}</div>
                      <div style={{ fontSize: 14, opacity: 0.9, marginBottom: 24 }}>{l.description || 'Master the fundamentals of the opening.'}</div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                        <div style={{ fontSize: 32, fontWeight: 900 }}>${l.price}<span style={{ fontSize: 14, fontWeight: 500, opacity: 0.8 }}>/mo</span></div>
                        {formData.variantId === l.id && <div style={{ background: "white", color: TLP.navy, padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 800 }}>SELECTED</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: SCHEDULE */}
          {step === 3 && (
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 800, color: TLP.navy, marginBottom: 24 }}>Pick Schedule</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {batches.filter((b: any) => b.variant_id === formData.variantId).map((b: any) => (
                  <div 
                    key={b.id}
                    onClick={() => {
                      const ids = formData.batchIds.includes(b.id) 
                        ? formData.batchIds.filter(id => id !== b.id)
                        : [...formData.batchIds, b.id];
                      setFormData({ ...formData, batchIds: ids });
                    }}
                    style={{ 
                      padding: 20, 
                      borderRadius: 12, 
                      border: `1px solid ${formData.batchIds.includes(b.id) ? TLP.teal : TLP.gray100}`,
                      background: formData.batchIds.includes(b.id) ? TLP.teal + "05" : "white",
                      cursor: "pointer",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center"
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, color: TLP.navy }}>{b.day_of_week}s</div>
                      <div style={{ fontSize: 14, color: TLP.gray500 }}>{b.start_time} - {b.end_time}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: TLP.teal }}>{b.capacity - (b.enrolled_count || 0)} SPOTS LEFT</div>
                      <div style={{ width: 100, height: 4, background: TLP.gray100, borderRadius: 2, marginTop: 8 }}>
                        <div style={{ width: `${(b.enrolled_count || 0) / b.capacity * 100}%`, height: "100%", background: TLP.teal, borderRadius: 2 }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: BILLING PREVIEW */}
          {step === 4 && billingSummary && (
            <div>
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
             <div>
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
            <Button variant="secondary" onClick={prev} disabled={step === 1 || loading} style={{ borderRadius: 12, padding: "12px 24px" }}>
              Back
            </Button>
            {step < STEPS.length && (
              <Button 
                variant="primary" 
                onClick={next} 
                disabled={ (step === 1 && !formData.memberId) || (step === 2 && !formData.variantId) || (step === 3 && formData.batchIds.length === 0) }
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
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, color: TLP.gray500 }}>Student</div>
              <div style={{ fontWeight: 700, color: TLP.navy }}>{members.find((m: any) => m.id === formData.memberId)?.full_name}</div>
            </div>
          )}
          {formData.variantId && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, color: TLP.gray500 }}>Level</div>
              <div style={{ fontWeight: 700, color: TLP.navy }}>{levels.find((l: any) => l.id === formData.variantId)?.name}</div>
            </div>
          )}
          {formData.batchIds.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, color: TLP.gray500 }}>Schedule</div>
              {formData.batchIds.map(bid => {
                const b = batches.find((x: any) => x.id === bid);
                return <div key={bid} style={{ fontWeight: 700, color: TLP.navy }}>{b?.day_of_week} {b?.start_time}</div>
              })}
            </div>
          )}
          
          {billingSummary && (
             <div style={{ marginTop: 40, padding: 24, background: TLP.navy, color: "white", borderRadius: 20 }}>
                <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 4 }}>DUE TODAY</div>
                <div style={{ fontSize: 32, fontWeight: 900 }}>${billingSummary.total}</div>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
