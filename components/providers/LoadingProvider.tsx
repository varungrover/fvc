"use client";

import { useEffect, useState, createContext, useContext, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { TLP } from "@/lib/theme/tokens";

const CHESS_WORDS = [
  "Analyzing Openings...",
  "Calculating Checkmate...",
  "Castling Kingside...",
  "Strategizing...",
  "Setting the Trap...",
  "Evaluating the Board...",
  "Sicilian Defense...",
  "Preparing Endgame...",
  "Checking for Forks...",
  "Polishing Tactics...",
];

const LoadingContext = createContext({ setLoading: (val: boolean) => {} });

export const useLoading = () => useContext(LoadingContext);

export default function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState(CHESS_WORDS[0]);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const textInterval = useRef<NodeJS.Timeout | null>(null);

  // Reset loading state when the route change completes
  useEffect(() => {
    setIsLoading(false);
    if (textInterval.current) clearInterval(textInterval.current);
  }, [pathname, searchParams]);

  // Cycle through chess words when loading
  useEffect(() => {
    if (isLoading) {
      let i = 0;
      textInterval.current = setInterval(() => {
        i = (i + 1) % CHESS_WORDS.length;
        setLoadingText(CHESS_WORDS[i]);
      }, 700);
    } else {
      if (textInterval.current) clearInterval(textInterval.current);
    }
    return () => {
      if (textInterval.current) clearInterval(textInterval.current);
    };
  }, [isLoading]);

  // Handle global link clicks to trigger loading instantly
  useEffect(() => {
    const handleAnchorClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const anchor = target.closest("a");

      if (
        anchor && 
        anchor.href && 
        anchor.href.startsWith(window.location.origin) &&
        !anchor.target &&
        anchor.getAttribute("download") === null &&
        anchor.href !== window.location.href // Don't trigger for same-page hash links
      ) {
        setIsLoading(true);
      }
    };

    window.addEventListener("click", handleAnchorClick);
    return () => window.removeEventListener("click", handleAnchorClick);
  }, []);

  return (
    <LoadingContext.Provider value={{ setLoading: setIsLoading }}>
      {isLoading && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(255, 255, 255, 0.7)", // Semi-transparent
          backdropFilter: "blur(12px)", // Premium blur
          WebkitBackdropFilter: "blur(12px)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 99999,
          animation: "fadeIn 0.3s ease-out"
        }}>
           <div style={{
            position: "relative",
            width: 90,
            height: 90,
          }}>
            <div style={{ position: "absolute", width: "100%", height: "100%", border: `6px solid ${TLP.gray100}`, borderRadius: "50%" }} />
            <div style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              border: `6px solid transparent`,
              borderTop: `6px solid ${TLP.teal}`,
              borderRadius: "50%",
              animation: "spin 0.8s cubic-bezier(0.4, 0, 0.2, 1) infinite"
            }} />
          </div>
          <div style={{ 
            marginTop: 32, 
            fontSize: 18, 
            fontWeight: 800, 
            color: TLP.navy, 
            letterSpacing: "0.05em",
            textAlign: "center",
            minWidth: 300,
            animation: "pulseText 1s ease-in-out infinite"
          }}>
            {loadingText}
          </div>
        </div>
      )}
      {children}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes pulseText { 0%, 100% { opacity: 1; transform: translateY(0); } 50% { opacity: 0.7; transform: translateY(-2px); } }
      `}} />
    </LoadingContext.Provider>
  );
}
