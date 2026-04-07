export default function MarketingLeadsPage() {
  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Lead Database</h1>
        <p className="text-slate-400 text-sm mt-1">Manage prospects and track their journey to enrollment.</p>
      </div>

      <div className="bg-card-dark border border-border-dark rounded-xl p-10 text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <span className="material-icons-round text-primary text-[32px]">person_add</span>
        </div>
        <h2 className="text-lg font-bold text-white mb-2">Coming in Phase 3</h2>
        <p className="text-slate-400 text-sm max-w-sm mx-auto mb-6">
          The lead database will let you capture and track prospects from inquiry to enrollment.
        </p>
        <div className="text-left space-y-2.5 max-w-xs mx-auto">
          {[
            "Capture leads from web form or manual entry",
            "Track lead status: new, contacted, trial booked, enrolled",
            "Source tracking (social, referral, walk-in, etc.)",
            "Notes and follow-up reminders",
            "Export to marketing lists",
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
