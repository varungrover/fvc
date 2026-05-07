"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { TLP } from "@/lib/theme/tokens";
import { useRouter } from "next/navigation";

// Placeholder steps - will be extracted into separate components in follow-up
const STEPS = [
  "Select Level",
  "Select Member",
  "Choose Schedule",
  "Payment Details",
  "Confirmation"
];

export default function EnrollClient({ initialData }: { initialData: any }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    memberId: "",
    levelId: "",
    batchIds: [] as string[],
  });
  const router = useRouter();

  const next = () => setStep(s => Math.min(s + 1, STEPS.length));
  const prev = () => setStep(s => Math.max(s - 1, 1));

  const handleFinish = async () => {
    // Call POST /api/enrollments
    alert("Enrollment successful (Simulated)");
    router.push("/customer/members");
  };

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: 24 }}>
      <PageHeader 
        title="Enroll Student" 
        subtitle="Step-by-step enrollment for your members"
      />

      <div style={{ display: "flex", gap: 10, marginBottom: 30 }}>
        {STEPS.map((s, i) => (
          <div 
            key={i} 
            style={{ 
              flex: 1, 
              height: 4, 
              borderRadius: 2,
              background: i + 1 <= step ? TLP.teal : TLP.gray100
            }} 
          />
        ))}
      </div>

      <Card style={{ padding: 32, minHeight: 400 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: TLP.navy, marginBottom: 20 }}>
          {STEPS[step - 1]}
        </h2>
        
        <div style={{ marginBottom: 40 }}>
           {/* Step content will go here */}
           <p style={{ color: TLP.gray500 }}>
             Configure your {STEPS[step-1].toLowerCase()} here.
           </p>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", borderTop: `1px solid ${TLP.gray100}`, paddingTop: 20 }}>
          <Button variant="secondary" onClick={prev} disabled={step === 1}>
            Back
          </Button>
          {step === STEPS.length ? (
            <Button variant="primary" onClick={handleFinish}>
              Finish Enrollment
            </Button>
          ) : (
            <Button variant="primary" onClick={next}>
              Continue
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
