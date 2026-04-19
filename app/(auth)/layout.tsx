export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
        fontFamily: "var(--font-poppins), ui-sans-serif, system-ui, sans-serif",
      }}
    >
      {/* Subtle radial glow */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(168,85,247,0.18), transparent)",
        }}
      />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
            style={{ background: "linear-gradient(135deg, #a855f7, #ec4899)" }}
          >
            <span className="text-white text-2xl">♟</span>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-purple-300">
              Fraser Valley
            </p>
            <p className="text-white font-bold text-xl leading-tight">Chess Academy</p>
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}
