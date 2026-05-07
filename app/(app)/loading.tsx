import { TLP } from "@/lib/theme/tokens";

export default function Loading() {
  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(255, 255, 255, 0.8)",
      backdropFilter: "blur(4px)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 9999,
      transition: "all 0.3s ease"
    }}>
      <div style={{
        width: 48,
        height: 48,
        border: `4px solid ${TLP.gray100}`,
        borderTop: `4px solid ${TLP.teal}`,
        borderRadius: "50%",
        animation: "spin 1s linear infinite"
      }} />
      <div style={{
        marginTop: 16,
        fontSize: 14,
        fontWeight: 600,
        color: TLP.navy,
        letterSpacing: "0.05em",
        textTransform: "uppercase"
      }}>
        Loading Academy...
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}} />
    </div>
  );
}
