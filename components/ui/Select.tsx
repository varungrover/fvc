"use client";

import type { SelectHTMLAttributes } from "react";
import { useState } from "react";
import { TLP } from "@/lib/theme/tokens";

export type SelectOption = { value: string; label: string };

interface Props extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  label?: string;
  hint?: string;
  error?: string;
  options: SelectOption[];
}

export function Select({ label, hint, error, options, required, ...rest }: Props) {
  const [focused, setFocused] = useState(false);
  const borderColor = error ? TLP.red : focused ? TLP.teal : TLP.gray200;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {label ? (
        <label style={{ fontSize: 13, fontWeight: 600, color: TLP.gray700 }}>
          {label}
          {required ? <span style={{ color: TLP.red }}> *</span> : null}
        </label>
      ) : null}
      <select
        {...rest}
        required={required}
        onFocus={(e) => {
          setFocused(true);
          rest.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          rest.onBlur?.(e);
        }}
        style={{
          border: `1.5px solid ${borderColor}`,
          borderRadius: 8,
          padding: "8px 12px",
          fontSize: 14,
          color: TLP.gray800,
          background: TLP.white,
          outline: "none",
          transition: "border-color 0.15s",
          width: "100%",
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {hint && !error ? (
        <span style={{ fontSize: 11, color: TLP.gray500 }}>{hint}</span>
      ) : null}
      {error ? <span style={{ fontSize: 11, color: TLP.red }}>{error}</span> : null}
    </div>
  );
}
