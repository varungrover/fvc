"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { TLP } from "@/lib/theme/tokens";

export default function EnrollmentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    if (!sessionId) {
      router.push("/customer/enroll");
    }
  }, [sessionId, router]);

  return (
    <div style={{ maxWidth: 600, margin: "100px auto", textAlign: "center", padding: "0 24px" }}>
      <Card style={{ padding: 60, borderRadius: 32, boxShadow: "0 20px 50px rgba(0,0,0,0.1)" }}>
        <div style={{ 
          width: 80, 
          height: 80, 
          borderRadius: 40, 
          background: TLP.teal, 
          color: "white", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center", 
          fontSize: 40, 
          margin: "0 auto 32px" 
        }}>
          ✓
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 900, color: TLP.navy, marginBottom: 16 }}>
          Welcome Aboard!
        </h1>
        <p style={{ color: TLP.gray500, fontSize: 18, lineHeight: 1.6, marginBottom: 40 }}>
          Your enrollment is being processed. You will receive a confirmation email with your schedule shortly.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Button variant="primary" onClick={() => router.push("/customer/dashboard")}>
            Go to My Dashboard
          </Button>
          <Button variant="secondary" onClick={() => router.push("/customer/billing")}>
            View Billing History
          </Button>
        </div>
      </Card>
    </div>
  );
}
