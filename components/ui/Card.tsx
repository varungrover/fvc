"use client";

import type { CSSProperties, MouseEvent, ReactNode } from "react";
import { TLP, SHADOW } from "@/lib/theme/tokens";

interface Props {
  children: ReactNode;
  style?: CSSProperties;
  onClick?: (e: MouseEvent<HTMLDivElement>) => void;
  hover?: boolean;
}

export function Card({ children, style, onClick, hover = false }: Props) {
  const isInteractive = !!onClick;
  return (
    <div
      onClick={onClick}
      style={{
        background: TLP.white,
        borderRadius: 12,
        boxShadow: SHADOW.card,
        border: `1px solid ${TLP.gray100}`,
        transition: hover ? "box-shadow 0.2s, transform 0.15s" : undefined,
        cursor: isInteractive ? "pointer" : "default",
        ...style,
      }}
      onMouseEnter={
        hover && isInteractive
          ? (e) => {
              e.currentTarget.style.boxShadow = SHADOW.cardHover;
              e.currentTarget.style.transform = "translateY(-1px)";
            }
          : undefined
      }
      onMouseLeave={
        hover && isInteractive
          ? (e) => {
              e.currentTarget.style.boxShadow = SHADOW.card;
              e.currentTarget.style.transform = "translateY(0)";
            }
          : undefined
      }
    >
      {children}
    </div>
  );
}
