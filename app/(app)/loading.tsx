import { TLP } from "@/lib/theme/tokens";

export default function Loading() {
  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "#ffffff", // Solid white for a "blocking" feel
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
        {/* Main outer ring */}
        <div style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          border: `6px solid ${TLP.gray100}`,
          borderRadius: "50%",
        }} />
        {/* Animated spinner ring */}
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
        fontSize: 16,
        fontWeight: 800,
        color: TLP.navy,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        animation: "pulse 1.5s ease-in-out infinite"
      }}>
        Launching...
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.98); }
        }
      `}} />
    </div>
  );
}
