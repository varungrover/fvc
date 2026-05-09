"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { TLP } from "@/lib/theme/tokens";
import { signupAction } from "@/app/actions/signup";

function SignupForm() {
  const params = useSearchParams();
  const next = params.get("next");

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await signupAction(formData, next || undefined);
    
    if (result?.error) {
      setError(result.error);
    }
    setLoading(false);
  }

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 800,
        background: TLP.white,
        borderRadius: 18,
        boxShadow: "0 30px 80px rgba(0,0,0,0.35)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ padding: "40px 48px", borderBottom: `1px solid ${TLP.gray100}` }}>
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            textDecoration: "none",
            marginBottom: 20,
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              background: TLP.teal,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
            }}
          >
            🌍
          </div>
          <span style={{ fontWeight: 800, fontSize: 16, color: TLP.navy }}>Mentora</span>
        </Link>

        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: TLP.navy }}>Create your account</h1>
        <p style={{ margin: "4px 0 0", color: TLP.gray500, fontSize: 14 }}>
          Join Mentora to start your enrollment.
        </p>
      </div>

      <form onSubmit={onSubmit} style={{ padding: "40px 48px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
          {/* Parent Section */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: TLP.navy, textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Parent Details
            </h2>
            <Input label="Full Name" name="parentName" placeholder="John Doe" required />
            <Input label="Email Address" name="email" type="email" placeholder="john@example.com" required />
            <Input label="Password" name="password" type="password" placeholder="••••••••" required />
            <Input label="Phone Number" name="phone" placeholder="(555) 000-0000" />
          </div>

          {/* Student Section */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: TLP.navy, textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Student Details
            </h2>
            <Input label="Student Full Name" name="childName" placeholder="Jane Doe" required />
            <Input label="Date of Birth" name="childDob" type="date" required />
            <Input label="Gender" name="childGender" placeholder="Optional" />
          </div>
        </div>

        {error && (
          <div style={{ marginTop: 24, background: TLP.redLight, color: TLP.red, padding: "10px 14px", borderRadius: 8, fontSize: 13, fontWeight: 600 }}>
            {error}
          </div>
        )}

        <div style={{ marginTop: 40, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <p style={{ fontSize: 14, color: TLP.gray500 }}>
            Already have an account?{" "}
            <Link href={`/login${next ? `?next=${encodeURIComponent(next)}` : ""}`} style={{ color: TLP.teal, fontWeight: 700, textDecoration: "none" }}>
              Sign in
            </Link>
          </p>
          <Button type="submit" size="lg" disabled={loading} style={{ padding: "12px 40px" }}>
            {loading ? "Creating account..." : "Complete Sign Up"}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function SignupPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: `linear-gradient(135deg, ${TLP.navy} 0%, ${TLP.navyLight} 100%)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
      }}
    >
      <Suspense fallback={null}>
        <SignupForm />
      </Suspense>
    </div>
  );
}
