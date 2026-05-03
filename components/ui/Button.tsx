"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { TLP } from "@/lib/theme/tokens";

export type ButtonVariant = "primary" | "secondary" | "danger" | "ghost" | "navy" | "amber";
export type ButtonSize = "sm" | "md" | "lg";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  children: ReactNode;
}

const VARIANT_STYLES: Record<ButtonVariant, React.CSSProperties> = {
  primary: { background: TLP.teal, color: "#fff", border: "none" },
  secondary: { background: TLP.white, color: TLP.navy, border: `1.5px solid ${TLP.gray200}` },
  danger: { background: TLP.red, color: "#fff", border: "none" },
  ghost: { background: "transparent", color: TLP.teal, border: "none" },
  navy: { background: TLP.navy, color: "#fff", border: "none" },
  amber: { background: TLP.amber, color: TLP.navy, border: "none" },
};

const SIZE_STYLES: Record<ButtonSize, React.CSSProperties> = {
  sm: { padding: "5px 12px", fontSize: 12, borderRadius: 7 },
  md: { padding: "8px 18px", fontSize: 14, borderRadius: 8 },
  lg: { padding: "11px 24px", fontSize: 15, borderRadius: 9 },
};

export function Button({
  variant = "primary",
  size = "md",
  icon,
  disabled,
  style,
  children,
  ...rest
}: Props) {
  return (
    <button
      disabled={disabled}
      style={{
        ...VARIANT_STYLES[variant],
        ...SIZE_STYLES[size],
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.55 : 1,
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        transition: "opacity 0.15s, transform 0.1s",
        ...style,
      }}
      onMouseEnter={(e) => {
        if (!disabled) (e.currentTarget as HTMLButtonElement).style.opacity = "0.88";
      }}
      onMouseLeave={(e) => {
        if (!disabled) (e.currentTarget as HTMLButtonElement).style.opacity = "1";
      }}
      {...rest}
    >
      {icon ? <span>{icon}</span> : null}
      {children}
    </button>
  );
}
