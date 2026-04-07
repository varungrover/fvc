export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(43,108,238,0.3)]">
            <span className="text-white text-xl">♟</span>
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Fraser Valley</p>
            <p className="text-white font-bold text-lg leading-tight">Chess Academy</p>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
