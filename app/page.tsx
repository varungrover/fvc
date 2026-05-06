import Link from "next/link";
import { TLP } from "@/lib/theme/tokens";
import { TENANTS } from "@/lib/mock/tenants";
import { LOCATIONS_BY_TENANT } from "@/lib/mock/locations";

export default function Home() {
  return (
    <div style={{ minHeight: "100vh", background: TLP.bg }}>
      {/* Top nav */}
      <header
        style={{
          background: TLP.navy,
          padding: "14px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            textDecoration: "none",
          }}
        >
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 6,
              background: TLP.teal,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 15,
            }}
          >
            🌍
          </div>
          <span
            style={{
              color: "#fff",
              fontWeight: 800,
              fontSize: 16,
              letterSpacing: "-0.3px",
            }}
          >
            Mentora
          </span>
        </Link>
        <Link
          href="/login"
          style={{
            background: TLP.teal,
            color: "#fff",
            padding: "8px 18px",
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 700,
            textDecoration: "none",
          }}
        >
          Sign in →
        </Link>
      </header>

      {/* Hero */}
      <section
        style={{
          padding: "72px 32px 48px",
          maxWidth: 980,
          margin: "0 auto",
          textAlign: "center",
        }}
      >
        <span
          style={{
            display: "inline-block",
            background: TLP.tealLight,
            color: TLP.teal,
            padding: "6px 14px",
            borderRadius: 999,
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.5px",
            textTransform: "uppercase",
            marginBottom: 18,
          }}
        >
          Prototype · Read-only
        </span>
        <h1
          style={{
            margin: 0,
            fontSize: 44,
            lineHeight: 1.1,
            fontWeight: 900,
            color: TLP.navy,
            letterSpacing: "-1.2px",
          }}
        >
          The LMS platform for learning academies.
        </h1>
        <p
          style={{
            margin: "16px auto 0",
            maxWidth: 640,
            fontSize: 17,
            color: TLP.gray600,
            lineHeight: 1.55,
          }}
        >
          Mentora powers multi-planet academies — Chess, Math, English, Finance,
          Arts — across corporate and franchisee ownerships. Tour a tenant, or
          jump into the app as any role.
        </p>
        <div
          style={{
            marginTop: 28,
            display: "flex",
            gap: 12,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <Link
            href="/login"
            style={{
              background: TLP.teal,
              color: "#fff",
              padding: "12px 24px",
              borderRadius: 9,
              fontSize: 15,
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            Try a demo account
          </Link>
          <a
            href="#tenants"
            style={{
              background: TLP.white,
              color: TLP.navy,
              padding: "12px 24px",
              borderRadius: 9,
              fontSize: 15,
              fontWeight: 700,
              textDecoration: "none",
              border: `1.5px solid ${TLP.gray200}`,
            }}
          >
            Browse tenant storefronts
          </a>
        </div>
      </section>

      {/* Tenants */}
      <section
        id="tenants"
        style={{
          padding: "32px 32px 80px",
          maxWidth: 1080,
          margin: "0 auto",
        }}
      >
        <div style={{ marginBottom: 22 }}>
          <h2
            style={{
              margin: 0,
              fontSize: 22,
              fontWeight: 800,
              color: TLP.navy,
              letterSpacing: "-0.4px",
            }}
          >
            Demo tenants
          </h2>
          <p style={{ margin: "4px 0 0", color: TLP.gray500, fontSize: 14 }}>
            Two academies are seeded for review — one corporate franchisor, one
            franchisee. Each has its own brand on its public storefront.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 18,
          }}
        >
          {TENANTS.map((t) => {
            const locations = LOCATIONS_BY_TENANT[t.id] ?? [];
            return (
              <article
                key={t.id}
                style={{
                  background: TLP.white,
                  borderRadius: 14,
                  border: `1px solid ${TLP.gray100}`,
                  boxShadow: "0 1px 4px rgba(13,27,62,0.08)",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {/* Brand band */}
                <div
                  style={{
                    background: `linear-gradient(135deg, ${t.brandPrimary}, ${t.brandAccent})`,
                    padding: "20px 22px",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: "0.5px",
                        textTransform: "uppercase",
                        opacity: 0.85,
                      }}
                    >
                      {t.ownershipType === "corporate" ? "Franchisor · Corporate" : "Franchisee"}
                    </div>
                    <div
                      style={{
                        fontSize: 20,
                        fontWeight: 800,
                        letterSpacing: "-0.4px",
                        marginTop: 2,
                      }}
                    >
                      {t.fullName}
                    </div>
                  </div>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 10,
                      background: "rgba(255,255,255,0.18)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 22,
                      flexShrink: 0,
                    }}
                  >
                    {t.ownershipType === "corporate" ? "🪐" : "🍁"}
                  </div>
                </div>

                <div
                  style={{
                    padding: "16px 22px 18px",
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  {t.tagline ? (
                    <p
                      style={{
                        margin: 0,
                        color: TLP.gray700,
                        fontSize: 14,
                        lineHeight: 1.5,
                      }}
                    >
                      {t.tagline}
                    </p>
                  ) : null}

                  <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 4 }}>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: TLP.gray500,
                        letterSpacing: "0.4px",
                        textTransform: "uppercase",
                      }}
                    >
                      Locations
                    </span>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {locations.map((loc) => (
                        <span
                          key={loc.id}
                          style={{
                            background: TLP.gray100,
                            color: TLP.gray700,
                            padding: "3px 10px",
                            borderRadius: 999,
                            fontSize: 12,
                            fontWeight: 600,
                          }}
                        >
                          {loc.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div
                    style={{
                      marginTop: 18,
                      display: "flex",
                      gap: 8,
                      justifyContent: "flex-end",
                    }}
                  >
                    <Link
                      href={`/t/${t.slug}`}
                      style={{
                        background: TLP.white,
                        color: TLP.navy,
                        padding: "8px 14px",
                        borderRadius: 8,
                        fontSize: 13,
                        fontWeight: 700,
                        textDecoration: "none",
                        border: `1.5px solid ${TLP.gray200}`,
                      }}
                    >
                      Visit storefront
                    </Link>
                    <Link
                      href="/login"
                      style={{
                        background: t.brandPrimary,
                        color: "#fff",
                        padding: "8px 14px",
                        borderRadius: 8,
                        fontSize: 13,
                        fontWeight: 700,
                        textDecoration: "none",
                      }}
                    >
                      Sign in →
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <footer
        style={{
          textAlign: "center",
          padding: "24px",
          color: TLP.gray500,
          fontSize: 12,
          borderTop: `1px solid ${TLP.gray100}`,
        }}
      >
        Mentora prototype · {new Date().getFullYear()}
      </footer>
    </div>
  );
}
