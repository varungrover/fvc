import Link from "next/link";
import { notFound } from "next/navigation";
import { LOCATIONS_BY_TENANT } from "@/lib/mock/locations";
import { PLANETS } from "@/lib/mock/planets";
import { LEVELS_BY_PLANET } from "@/lib/mock/levels";
import { VARIANTS_BY_LEVEL } from "@/lib/mock/courseVariants";
import { TLP, planetStyle } from "@/lib/theme/tokens";

const DAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default async function TenantStorefront({
  params,
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant: slug } = await params;
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/api/public/ownerships?slug=${slug}`,
    { next: { revalidate: 60 } },
  )
  if (!res.ok) notFound()
  const tenantData = await res.json()

  const locations = LOCATIONS_BY_TENANT[tenantData.id] ?? [];
  const primary = tenantData.brand_primary;
  const accent = tenantData.brand_accent;

  // Tint helpers derived from brand colors
  const primaryLight = primary + "1a"; // 10% opacity overlay
  const accentLight = accent + "26";   // 15% opacity overlay

  const activePlanets = PLANETS.filter((p) => p.isActive);

  return (
    <div style={{ minHeight: "100vh", background: TLP.bg, fontFamily: "inherit" }}>

      {/* ── Sticky nav ─────────────────────────────────── */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "#fff",
          borderBottom: `1px solid ${TLP.gray100}`,
          boxShadow: "0 1px 8px rgba(0,0,0,0.07)",
        }}
      >
        <div
          style={{
            maxWidth: 1120,
            margin: "0 auto",
            padding: "0 28px",
            height: 60,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 20,
          }}
        >
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                background: `linear-gradient(135deg, ${primary}, ${accent})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
                flexShrink: 0,
              }}
            >
              🪐
            </div>
            <span
              style={{
                fontWeight: 800,
                fontSize: 15,
                color: TLP.navy,
                letterSpacing: "-0.3px",
              }}
            >
              {tenantData.full_name}
            </span>
          </div>

          {/* Nav links + CTA */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <a
              href="#programs"
              style={{
                color: TLP.gray600,
                fontSize: 13,
                fontWeight: 600,
                textDecoration: "none",
                padding: "6px 12px",
                borderRadius: 7,
              }}
            >
              Programs
            </a>
            <a
              href="#locations"
              style={{
                color: TLP.gray600,
                fontSize: 13,
                fontWeight: 600,
                textDecoration: "none",
                padding: "6px 12px",
                borderRadius: 7,
              }}
            >
              Locations
            </a>
            <Link
              href="/login"
              style={{
                marginLeft: 8,
                background: primary,
                color: "#fff",
                padding: "8px 18px",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 700,
                textDecoration: "none",
                whiteSpace: "nowrap",
              }}
            >
              Sign in →
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────── */}
      <section
        style={{
          background: `linear-gradient(150deg, ${primary} 0%, ${accent} 100%)`,
          padding: "80px 28px 90px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative circles */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: -60,
            right: -60,
            width: 300,
            height: 300,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.07)",
          }}
        />
        <div
          aria-hidden
          style={{
            position: "absolute",
            bottom: -80,
            left: -40,
            width: 250,
            height: 250,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.06)",
          }}
        />

        <div style={{ maxWidth: 720, margin: "0 auto", position: "relative" }}>
          <span
            style={{
              display: "inline-block",
              background: "rgba(255,255,255,0.18)",
              color: "#fff",
              padding: "5px 14px",
              borderRadius: 999,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.6px",
              textTransform: "uppercase",
              marginBottom: 18,
            }}
          >
            {tenantData.ownership_type === "corporate" ? "Learning Academy" : "Franchisee Academy"}
          </span>

          <h1
            style={{
              margin: 0,
              fontSize: 48,
              lineHeight: 1.08,
              fontWeight: 900,
              color: "#fff",
              letterSpacing: "-1.5px",
            }}
          >
            {tenantData.full_name}
          </h1>

          {tenantData.tagline && (
            <p
              style={{
                margin: "16px auto 0",
                maxWidth: 560,
                fontSize: 18,
                lineHeight: 1.55,
                color: "rgba(255,255,255,0.88)",
                fontWeight: 400,
              }}
            >
              {tenantData.tagline}
            </p>
          )}

          <div
            style={{
              marginTop: 32,
              display: "flex",
              gap: 12,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <a
              href="#programs"
              style={{
                background: "#fff",
                color: primary,
                padding: "13px 28px",
                borderRadius: 10,
                fontSize: 15,
                fontWeight: 800,
                textDecoration: "none",
                boxShadow: "0 4px 14px rgba(0,0,0,0.14)",
              }}
            >
              Explore programs
            </a>
            <Link
              href="/login"
              style={{
                background: "rgba(255,255,255,0.16)",
                border: "1.5px solid rgba(255,255,255,0.55)",
                color: "#fff",
                padding: "13px 28px",
                borderRadius: 10,
                fontSize: 15,
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              Sign in to enroll
            </Link>
          </div>
        </div>
      </section>

      {/* ── Quick-stats bar ─────────────────────────────── */}
      <div
        style={{
          background: TLP.navy,
          padding: "0 28px",
        }}
      >
        <div
          style={{
            maxWidth: 1120,
            margin: "0 auto",
            display: "flex",
            gap: 0,
            flexWrap: "wrap",
          }}
        >
          {[
            { value: activePlanets.length, label: "Subjects" },
            { value: locations.length, label: "Locations" },
            { value: "1-on-1", label: "Class style" },
            { value: "Free", label: "Trial class" },
          ].map((stat, i) => (
            <div
              key={i}
              style={{
                flex: "1 1 160px",
                padding: "18px 24px",
                borderRight: i < 3 ? `1px solid rgba(255,255,255,0.1)` : "none",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 900,
                  color: accent,
                  letterSpacing: "-0.5px",
                }}
              >
                {stat.value}
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 2, fontWeight: 600 }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Programs ────────────────────────────────────── */}
      <section id="programs" style={{ padding: "64px 28px", maxWidth: 1120, margin: "0 auto" }}>
        <div style={{ marginBottom: 36 }}>
          <span
            style={{
              display: "inline-block",
              background: primaryLight,
              color: primary,
              padding: "4px 12px",
              borderRadius: 999,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.5px",
              textTransform: "uppercase",
              marginBottom: 10,
            }}
          >
            Our Programs
          </span>
          <h2
            style={{
              margin: 0,
              fontSize: 30,
              fontWeight: 900,
              color: TLP.navy,
              letterSpacing: "-0.6px",
            }}
          >
            Choose a subject, pick your level
          </h2>
          <p style={{ margin: "8px 0 0", color: TLP.gray500, fontSize: 15 }}>
            Every program offers weekly, twice-weekly, or three-times-weekly sessions.
            Pricing shown is the base monthly rate.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: 20,
          }}
        >
          {activePlanets.map((planet) => {
            const ps = planetStyle(planet.name);
            const levels = LEVELS_BY_PLANET[planet.id] ?? [];
            const basePrice = levels.length > 0
              ? (VARIANTS_BY_LEVEL[levels[0].id]?.[0]?.price ?? null)
              : null;

            return (
              <article
                key={planet.id}
                style={{
                  background: "#fff",
                  borderRadius: 16,
                  border: `1px solid ${TLP.gray100}`,
                  boxShadow: "0 1px 4px rgba(13,27,62,0.07)",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {/* Planet header */}
                <div
                  style={{
                    padding: "20px 22px 16px",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 14,
                  }}
                >
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      background: ps.bg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 22,
                      flexShrink: 0,
                      color: ps.color,
                      fontWeight: 800,
                    }}
                  >
                    {ps.icon}
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 17,
                        fontWeight: 800,
                        color: TLP.navy,
                        letterSpacing: "-0.3px",
                      }}
                    >
                      {planet.name}
                    </div>
                    {planet.description && (
                      <div
                        style={{
                          marginTop: 3,
                          fontSize: 13,
                          color: TLP.gray500,
                          lineHeight: 1.45,
                        }}
                      >
                        {planet.description}
                      </div>
                    )}
                  </div>
                </div>

                {/* Levels */}
                {levels.length > 0 && (
                  <div
                    style={{
                      borderTop: `1px solid ${TLP.gray100}`,
                      padding: "12px 22px 16px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: TLP.gray400,
                        letterSpacing: "0.4px",
                        textTransform: "uppercase",
                        marginBottom: 8,
                      }}
                    >
                      Levels & monthly pricing
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {levels.map((level) => {
                        const variants = VARIANTS_BY_LEVEL[level.id] ?? [];
                        const price1x = variants.find((v) => v.frequencyPerWeek === 1)?.price;
                        const price2x = variants.find((v) => v.frequencyPerWeek === 2)?.price;
                        return (
                          <div
                            key={level.id}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              padding: "7px 10px",
                              borderRadius: 8,
                              background: TLP.gray50,
                            }}
                          >
                            <span
                              style={{
                                fontSize: 13,
                                fontWeight: 700,
                                color: TLP.navy,
                              }}
                            >
                              {level.name}
                            </span>
                            <div
                              style={{
                                display: "flex",
                                gap: 8,
                                alignItems: "center",
                              }}
                            >
                              {price1x != null && (
                                <span
                                  style={{
                                    fontSize: 12,
                                    color: TLP.gray600,
                                    fontWeight: 600,
                                  }}
                                >
                                  from{" "}
                                  <span
                                    style={{
                                      color: ps.color,
                                      fontWeight: 800,
                                      fontSize: 13,
                                    }}
                                  >
                                    ${price1x}
                                  </span>
                                  /mo
                                </span>
                              )}
                              {price2x != null && (
                                <span
                                  style={{
                                    fontSize: 11,
                                    color: TLP.gray400,
                                    fontWeight: 600,
                                  }}
                                >
                                  · 2×/wk ${price2x}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Footer CTA */}
                <div
                  style={{
                    marginTop: "auto",
                    padding: "12px 22px 18px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 10,
                  }}
                >
                  {basePrice != null && (
                    <span style={{ fontSize: 12, color: TLP.gray400 }}>
                      Setup fee: $25 (one-time per member)
                    </span>
                  )}
                  <Link
                    href="/login"
                    style={{
                      marginLeft: "auto",
                      background: ps.bg,
                      color: ps.color,
                      padding: "8px 16px",
                      borderRadius: 8,
                      fontSize: 12,
                      fontWeight: 800,
                      textDecoration: "none",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Enroll now →
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* ── Multi-planet discount callout ───────────────── */}
      <section
        style={{
          background: `linear-gradient(135deg, ${primary}14, ${accent}1a)`,
          borderTop: `1px solid ${primary}20`,
          borderBottom: `1px solid ${primary}20`,
          padding: "44px 28px",
        }}
      >
        <div
          style={{
            maxWidth: 880,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            gap: 32,
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: `linear-gradient(135deg, ${primary}, ${accent})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              flexShrink: 0,
            }}
          >
            🏷️
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: 20,
                fontWeight: 900,
                color: TLP.navy,
                letterSpacing: "-0.4px",
              }}
            >
              Multi-Planet Discount
            </div>
            <p
              style={{
                margin: "6px 0 0",
                color: TLP.gray600,
                fontSize: 14,
                lineHeight: 1.5,
                maxWidth: 560,
              }}
            >
              Enroll the same member in more than one subject and save automatically.
              Discounts are applied per member and recalculated monthly.
            </p>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {[
              { planets: 2, pct: 5 },
              { planets: 3, pct: 10 },
              { planets: 4, pct: 15 },
            ].map((d) => (
              <div
                key={d.planets}
                style={{
                  background: "#fff",
                  border: `1.5px solid ${primary}30`,
                  borderRadius: 12,
                  padding: "12px 16px",
                  textAlign: "center",
                  minWidth: 80,
                }}
              >
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 900,
                    color: primary,
                    letterSpacing: "-0.5px",
                  }}
                >
                  {d.pct}%
                </div>
                <div style={{ fontSize: 11, color: TLP.gray500, fontWeight: 600, marginTop: 2 }}>
                  {d.planets} planets
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Locations ───────────────────────────────────── */}
      <section id="locations" style={{ padding: "64px 28px", maxWidth: 1120, margin: "0 auto" }}>
        <div style={{ marginBottom: 36 }}>
          <span
            style={{
              display: "inline-block",
              background: accentLight,
              color: TLP.gray700,
              padding: "4px 12px",
              borderRadius: 999,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.5px",
              textTransform: "uppercase",
              marginBottom: 10,
            }}
          >
            Our Locations
          </span>
          <h2
            style={{
              margin: 0,
              fontSize: 30,
              fontWeight: 900,
              color: TLP.navy,
              letterSpacing: "-0.6px",
            }}
          >
            Find a centre near you
          </h2>
          <p style={{ margin: "8px 0 0", color: TLP.gray500, fontSize: 15 }}>
            All locations run the full program suite. Walk-in trials welcome.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 18,
          }}
        >
          {locations.map((loc, i) => (
            <div
              key={loc.id}
              style={{
                background: "#fff",
                borderRadius: 14,
                border: `1px solid ${TLP.gray100}`,
                boxShadow: "0 1px 4px rgba(13,27,62,0.07)",
                padding: "22px 22px 20px",
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              {/* Location icon + name */}
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: i % 2 === 0 ? primaryLight : accentLight,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 18,
                    flexShrink: 0,
                  }}
                >
                  📍
                </div>
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 800,
                    color: TLP.navy,
                    letterSpacing: "-0.2px",
                  }}
                >
                  {loc.name}
                </div>
              </div>

              {/* Address */}
              <div style={{ fontSize: 13, color: TLP.gray600, lineHeight: 1.5 }}>
                <div>{loc.addressLine1}</div>
                {loc.addressLine2 && <div>{loc.addressLine2}</div>}
                <div>
                  {loc.city}, {loc.stateProvince}
                  {loc.postalCode ? ` ${loc.postalCode}` : ""}
                </div>
                <div style={{ color: TLP.gray400 }}>{loc.country}</div>
              </div>

              {/* Status */}
              <div style={{ marginTop: "auto" }}>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    background: TLP.greenLight,
                    color: TLP.green,
                    padding: "4px 10px",
                    borderRadius: 999,
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: TLP.green,
                      display: "inline-block",
                    }}
                  />
                  Now enrolling
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Trial / CTA banner ──────────────────────────── */}
      <section
        style={{
          background: TLP.navy,
          padding: "64px 28px",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: 620, margin: "0 auto" }}>
          <div style={{ fontSize: 40, marginBottom: 14 }}>🌟</div>
          <h2
            style={{
              margin: 0,
              fontSize: 32,
              fontWeight: 900,
              color: "#fff",
              letterSpacing: "-0.8px",
            }}
          >
            Start with a free trial class
          </h2>
          <p
            style={{
              margin: "12px auto 0",
              color: "rgba(255,255,255,0.65)",
              fontSize: 15,
              lineHeight: 1.6,
              maxWidth: 480,
            }}
          >
            One free trial per member per subject. Sign in to book a time slot at
            your nearest {tenantData.full_name} location.
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
                background: primary,
                color: "#fff",
                padding: "14px 30px",
                borderRadius: 10,
                fontSize: 15,
                fontWeight: 800,
                textDecoration: "none",
                boxShadow: `0 4px 18px ${primary}55`,
              }}
            >
              Sign in to get started →
            </Link>
            <Link
              href="/"
              style={{
                background: "rgba(255,255,255,0.1)",
                border: "1.5px solid rgba(255,255,255,0.25)",
                color: "rgba(255,255,255,0.85)",
                padding: "14px 30px",
                borderRadius: 10,
                fontSize: 15,
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              ← Back to Mentora
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────── */}
      <footer
        style={{
          background: TLP.gray800,
          padding: "36px 28px",
          color: TLP.gray400,
          fontSize: 13,
        }}
      >
        <div
          style={{
            maxWidth: 1120,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 6,
                background: `linear-gradient(135deg, ${primary}, ${accent})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 13,
              }}
            >
              🪐
            </div>
            <span style={{ fontWeight: 700, color: TLP.gray300 }}>{tenantData.full_name}</span>
          </div>
          <div style={{ color: TLP.gray500, fontSize: 12 }}>
            Powered by{" "}
            <Link
              href="/"
              style={{ color: TLP.gray400, textDecoration: "underline", fontWeight: 600 }}
            >
              Mentora
            </Link>{" "}
            · Prototype · {new Date().getFullYear()}
          </div>
          <Link
            href="/login"
            style={{
              color: TLP.gray400,
              fontSize: 12,
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            Staff login →
          </Link>
        </div>
      </footer>
    </div>
  );
}
