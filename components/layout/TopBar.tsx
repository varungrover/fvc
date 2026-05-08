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
  roleLabel,
  userName,
}: Props) {
  return (
    <div
      style={{
        height: 60,
        background: TLP.white,
        display: "flex",
        alignItems: "center",
        padding: "0 24px",
        gap: 12,
        borderBottom: `1px solid ${TLP.gray100}`,
        boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
        flexShrink: 0,
        justifyContent: "flex-end",
        zIndex: 20,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: TLP.gray50,
            border: `1px solid ${TLP.gray100}`,
            borderRadius: 8,
            padding: "4px 10px",
          }}
        >
          <span style={{ color: TLP.gray500, fontSize: 10, fontWeight: 800, letterSpacing: '0.05em' }}>
            ROLE
          </span>
          <span style={{ color: TLP.amber, fontSize: 12, fontWeight: 700 }}>{roleLabel}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: '0 4px' }}>
          <Avatar name={userName} size={32} />
          <span style={{ color: TLP.navy, fontSize: 13, fontWeight: 700 }}>
            {userName}
          </span>
        </div>
        <div style={{ width: 1, height: 24, background: TLP.gray100, margin: '0 4px' }} />
        <form action={logoutAction}>
          <button
            type="submit"
            style={{
              color: TLP.gray500,
              fontSize: 12,
              fontWeight: 600,
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: "8px 12px",
              borderRadius: 8,
              fontFamily: "inherit",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = TLP.gray50;
              (e.currentTarget as HTMLButtonElement).style.color = TLP.navy;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "transparent";
              (e.currentTarget as HTMLButtonElement).style.color = TLP.gray500;
            }}
          >
            Log out
          </button>
        </form>
      </div>
    </div>
  );
}
