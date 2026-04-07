export default function MarketingCampaignsPage() {
  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Email Campaigns</h1>
        <p className="text-slate-400 text-sm mt-1">Create and send targeted campaigns to your marketing lists.</p>
      </div>

      <div className="bg-card-dark border border-border-dark rounded-xl p-10 text-center">
        <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
          <span className="material-icons-round text-success text-[32px]">campaign</span>
        </div>
        <h2 className="text-lg font-bold text-white mb-2">Coming in Phase 3</h2>
        <p className="text-slate-400 text-sm max-w-sm mx-auto mb-6">
          The campaign builder will let you create, schedule, and track email campaigns to segmented lists.
        </p>
        <div className="text-left space-y-2.5 max-w-xs mx-auto">
          {[
            "Compose campaigns with rich text editor",
            "Target segmented lists (active students, trial leads, lapsed)",
            "Schedule sends or send immediately",
            "Open rate and click tracking",
            "Do-not-contact list enforcement",
          ].map((f) => (
            <div key={f} className="flex items-start gap-2.5 text-sm text-slate-400">
              <span className="material-icons-round text-[16px] text-slate-600 mt-0.5 flex-shrink-0">radio_button_unchecked</span>
              {f}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
