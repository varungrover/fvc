"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { TLP } from "@/lib/theme/tokens";
import { DEMO_ACCOUNTS, DEMO_PASSWORD, resolveDemoLogin } from "@/lib/mock/auth";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const account = resolveDemoLogin(email);
    if (!account) {
      setError("That email isn't a demo account. Pick one from the list →");
      return;
    }
    if (!password.trim()) {
      setError("Password is required (any value works for the prototype).");
      return;
    }
    router.push(next || account.landing);
  }

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 920,
        display: "grid",
        gridTemplateColumns: "1fr 1.1fr",
        gap: 0,
        background: TLP.white,
        borderRadius: 18,
        boxShadow: "0 30px 80px rgba(0,0,0,0.35)",
        overflow: "hidden",
      }}
    >
      {/* Left — login form */}
      <div style={{ padding: "44px 40px" }}>
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            textDecoration: "none",
            marginBottom: 28,
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 7,
              background: TLP.teal,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
            }}
          >
            🌍
          </div>
          <span
            style={{
              fontWeight: 800,
              fontSize: 17,
              color: TLP.navy,
              letterSpacing: "-0.3px",
            }}
          >
            Mentora
          </span>
        </Link>

        <h1
          style={{
            margin: 0,
            fontSize: 24,
            fontWeight: 800,
            color: TLP.navy,
            letterSpacing: "-0.4px",
          }}
        >
          Welcome back
        </h1>
        <p style={{ margin: "6px 0 24px", color: TLP.gray500, fontSize: 14 }}>
          Sign in to your Mentora account.
        </p>

        <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <Input
            label="Password"
            type="password"
            placeholder="Any password works"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            hint={`Prototype hint: try "${DEMO_PASSWORD}"`}
          />
          {error ? (
            <div
              style={{
                background: TLP.redLight,
                color: TLP.red,
                padding: "8px 12px",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              {error}
            </div>
          ) : null}
          <Button type="submit" size="lg" style={{ marginTop: 6, justifyContent: "center" }}>
            Sign in
          </Button>
        </form>

        <p style={{ marginTop: 20, fontSize: 12, color: TLP.gray500, lineHeight: 1.6 }}>
          This is a read-only prototype. No data is persisted; refresh returns
          you here. Pick any demo account on the right →
        </p>
      </div>

      {/* Right — demo accounts */}
      <div
        style={{
          background: TLP.gray50,
          borderLeft: `1px solid ${TLP.gray100}`,
          padding: "40px 36px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            marginBottom: 4,
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: 13,
              fontWeight: 700,
              color: TLP.navy,
              letterSpacing: "0.5px",
              textTransform: "uppercase",
            }}
          >
            Demo accounts
          </h2>
          <span style={{ fontSize: 11, fontWeight: 600, color: TLP.gray500 }}>
            click to fill
          </span>
        </div>
        <p style={{ margin: "0 0 14px", fontSize: 12, color: TLP.gray500 }}>
          Password is{" "}
          <code
            style={{
              background: TLP.gray100,
              padding: "1px 5px",
              borderRadius: 4,
              color: TLP.navy,
            }}
          >
            {DEMO_PASSWORD}
          </code>{" "}
          for all accounts.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {DEMO_ACCOUNTS.map((acc) => {
            const isPicked = email.toLowerCase() === acc.email.toLowerCase();
            return (
              <button
                key={acc.email}
                type="button"
                onClick={() => {
                  setEmail(acc.email);
                  setPassword(DEMO_PASSWORD);
                  setError(null);
                }}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  background: isPicked ? TLP.tealLight : TLP.white,
                  border: `1.5px solid ${isPicked ? TLP.teal : TLP.gray200}`,
                  borderRadius: 10,
                  padding: "10px 12px",
                  textAlign: "left",
                  cursor: "pointer",
                  transition: "all 0.15s",
                  fontFamily: "inherit",
                }}
              >
                <div
                  style={{
                    flexShrink: 0,
                    width: 6,
                    borderRadius: 3,
                    alignSelf: "stretch",
                    background: isPicked ? TLP.teal : TLP.gray300,
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 8,
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: TLP.navy,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {acc.label}
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                        color: TLP.gray600,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {acc.email}
                    </span>
                  </div>
                  <p
                    style={{
                      margin: "3px 0 0",
                      fontSize: 12,
                      color: TLP.gray600,
                      lineHeight: 1.45,
                    }}
                  >
                    {acc.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: `linear-gradient(135deg, ${TLP.navy} 0%, ${TLP.navyLight} 100%)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
