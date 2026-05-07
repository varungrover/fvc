"use client";

import { useEffect, useState, createContext, useContext } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { TLP } from "@/lib/theme/tokens";

const LoadingContext = createContext({ setLoading: (val: boolean) => {} });

export const useLoading = () => useContext(LoadingContext);

export default function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Reset loading state when the route change completes
  useEffect(() => {
    setIsLoading(false);
  }, [pathname, searchParams]);

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
        anchor.getAttribute("download") === null
      ) {
        // Only trigger if it's an internal link and not a special link
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
          background: "#ffffff",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 99999,
        }}>
           <div style={{
            position: "relative",
            width: 80,
            height: 80,
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
          <div style={{ marginTop: 32, fontSize: 16, fontWeight: 800, color: TLP.navy, letterSpacing: "0.1em", textTransform: "uppercase", animation: "pulse 1.5s ease-in-out infinite" }}>
            Launching...
          </div>
        </div>
      )}
      {children}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      `}} />
    </LoadingContext.Provider>
  );
}
