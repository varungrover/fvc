"use client";

import { TLP } from "@/lib/theme/tokens";
import { Avatar } from "@/components/ui/Avatar";
import { logoutAction } from "@/app/actions/auth";

interface Props {
  productName: string;
  productIcon?: string;
  tenantName?: string;
  roleLabel: string;
  userName: string;
}

export function TopBar({
  productName,
  productIcon = "🌍",
  tenantName,
  roleLabel,
  userName,
}: Props) {
  return (
    <div
      style={{
        height: 56,
        background: TLP.navy,
        display: "flex",
        alignItems: "center",
        padding: "0 20px",
        gap: 12,
        borderBottom: "1px solid rgba(255,255,255,0.1)",
        flexShrink: 0,
        justifyContent: "space-between",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
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
            {productIcon}
          </div>
          <span
            style={{
              color: "#fff",
              fontWeight: 800,
              fontSize: 15,
              letterSpacing: "-0.3px",
            }}
          >
            {productName}
          </span>
        </div>
        {tenantName ? (
          <>
            <span style={{ color: "rgba(255,255,255,0.3)" }}>/</span>
            <span style={{ color: "rgba(255,255,255,0.85)", fontSize: 13, fontWeight: 600 }}>
              {tenantName}
            </span>
          </>
        ) : null}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "rgba(255,255,255,0.1)",
            borderRadius: 8,
            padding: "4px 10px",
          }}
        >
          <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 11, fontWeight: 600 }}>
            ROLE
          </span>
          <span style={{ color: TLP.amber, fontSize: 12, fontWeight: 700 }}>{roleLabel}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Avatar name={userName} size={30} />
          <span style={{ color: "rgba(255,255,255,0.85)", fontSize: 13, fontWeight: 600 }}>
            {userName}
          </span>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            style={{
              color: "rgba(255,255,255,0.6)",
              fontSize: 12,
              fontWeight: 600,
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: "6px 10px",
              borderRadius: 6,
              fontFamily: "inherit",
              transition: "background 0.15s, color 0.15s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.08)";
              (e.currentTarget as HTMLButtonElement).style.color = "#fff";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "transparent";
              (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.6)";
            }}
          >
            Log out
          </button>
        </form>
      </div>
    </div>
  );
}
