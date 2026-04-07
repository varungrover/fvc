export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background-dark">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
            <span className="text-white text-xl">♟</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Fraser Valley Chess Academy</h1>
        </div>
        <p className="text-slate-400 text-sm">LMS — coming soon</p>
      </div>
    </div>
  );
}
