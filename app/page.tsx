import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background-dark text-slate-100 font-sans">
      {/* ── Nav ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-background-dark/80 backdrop-blur-md border-b border-border-dark">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-[0_0_16px_rgba(43,108,238,0.35)]">
              <span className="text-white text-lg">♟</span>
            </div>
            <div className="leading-tight">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Fraser Valley</p>
              <p className="text-white font-bold text-base">Chess Academy</p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm text-slate-400 font-medium">
            <a href="#programs" className="hover:text-white transition-colors">Programs</a>
            <a href="#why-chess" className="hover:text-white transition-colors">Why Chess</a>
            <a href="#events" className="hover:text-white transition-colors">Events</a>
            <a href="#about" className="hover:text-white transition-colors">About</a>
          </nav>

          <Link
            href="/login"
            className="bg-primary hover:bg-blue-500 text-white text-sm font-semibold px-5 py-2 rounded-lg shadow-[0_0_12px_rgba(43,108,238,0.25)] transition-all"
          >
            Sign In
          </Link>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-28 pb-32 px-6">
        {/* Background glow blobs */}
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center">
          <span className="inline-block bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6">
            Fraser Valley · BC
          </span>
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight tracking-tight text-white mb-6">
            Think Deeper.<br className="hidden md:block" />
            Play Smarter.<br className="hidden md:block" />
            <span className="text-primary">Win Bigger.</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            A dynamic chess learning ecosystem that sparks strategic thinking, builds
            confidence, and empowers young players from their very first move to
            competitive tournaments.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="bg-primary hover:bg-blue-500 text-white font-semibold px-8 py-3.5 rounded-xl shadow-[0_0_20px_rgba(43,108,238,0.3)] transition-all text-base"
            >
              Sign In to Dashboard
            </Link>
            <a
              href="#programs"
              className="border border-border-dark hover:border-slate-500 text-slate-300 hover:text-white font-semibold px-8 py-3.5 rounded-xl transition-all text-base"
            >
              Explore Programs
            </a>
          </div>
        </div>
      </section>

      {/* ── Stats strip ─────────────────────────────────────────────── */}
      <section className="border-y border-border-dark bg-card-dark/50">
        <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: "500+", label: "Active Students" },
            { value: "3", label: "BC Locations" },
            { value: "12+", label: "Tournaments / Year" },
            { value: "95%", label: "Student Retention" },
          ].map(({ value, label }) => (
            <div key={label}>
              <p className="text-3xl font-extrabold text-white">{value}</p>
              <p className="text-sm text-slate-400 mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Programs ────────────────────────────────────────────────── */}
      <section id="programs" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Our Programs</h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              Structured pathways for every level — from beginner to competitive champion.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: "school",
                title: "School Programs",
                desc: "In-class chess instruction integrated into school curricula across the Fraser Valley.",
                badge: "K–12",
              },
              {
                icon: "emoji_events",
                title: "Competitive Training",
                desc: "Intensive coaching for tournament players, covering openings, tactics, and endgames.",
                badge: "All levels",
              },
              {
                icon: "family_restroom",
                title: "Private & Group Lessons",
                desc: "Flexible lesson formats with certified coaches, available in-person and online.",
                badge: "Flexible",
              },
            ].map(({ icon, title, desc, badge }) => (
              <div
                key={title}
                className="bg-card-dark border border-border-dark rounded-2xl p-7 hover:border-primary/40 hover:shadow-[0_0_24px_rgba(43,108,238,0.08)] transition-all"
              >
                <div className="w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center mb-5">
                  <span className="material-icons-round text-primary">{icon}</span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-semibold text-white">{title}</h3>
                  <span className="text-[10px] font-bold uppercase tracking-wide bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                    {badge}
                  </span>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Chess ───────────────────────────────────────────────── */}
      <section id="why-chess" className="py-24 px-6 bg-card-dark/30 border-y border-border-dark">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-5">
              Chess builds skills<br />that last a lifetime
            </h2>
            <p className="text-slate-400 leading-relaxed mb-8">
              At Fraser Valley Chess Academy, we believe growth happens through challenge.
              Every game is a lesson in patience, creativity, and resilience — skills that
              translate far beyond the board into academics and everyday life.
            </p>
            <ul className="space-y-4">
              {[
                { icon: "psychology", label: "Critical thinking & problem-solving" },
                { icon: "trending_up", label: "Improved academic performance" },
                { icon: "groups", label: "Sportsmanship & community" },
                { icon: "bolt", label: "Focus, patience, and discipline" },
              ].map(({ icon, label }) => (
                <li key={label} className="flex items-center gap-3 text-slate-300 text-sm">
                  <span className="material-icons-round text-primary text-base">{icon}</span>
                  {label}
                </li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { stat: "Logic", sub: "Pattern recognition", icon: "grid_view" },
              { stat: "Memory", sub: "Recall & retention", icon: "memory" },
              { stat: "Focus", sub: "Deep concentration", icon: "center_focus_strong" },
              { stat: "Creativity", sub: "Out-of-the-box play", icon: "palette" },
            ].map(({ stat, sub, icon }) => (
              <div
                key={stat}
                className="bg-card-dark border border-border-dark rounded-2xl p-6 text-center"
              >
                <span className="material-icons-round text-primary text-2xl mb-2 block">{icon}</span>
                <p className="font-bold text-white text-base">{stat}</p>
                <p className="text-slate-500 text-xs mt-1">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Events ──────────────────────────────────────────────────── */}
      <section id="events" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Upcoming Events</h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              Monthly tournaments, open competitions, and school championships across BC.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                date: "Apr 19",
                title: "Spring Open Tournament",
                location: "Langley, BC",
                type: "Open",
              },
              {
                date: "May 3",
                title: "Youth Championship Series",
                location: "Maple Ridge, BC",
                type: "U18",
              },
              {
                date: "May 17",
                title: "School Intramural Finals",
                location: "Port Coquitlam, BC",
                type: "Schools",
              },
            ].map(({ date, title, location, type }) => (
              <div
                key={title}
                className="bg-card-dark border border-border-dark rounded-2xl p-6 flex gap-5 hover:border-primary/40 transition-all"
              >
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex flex-col items-center justify-center shrink-0 border border-primary/20">
                  <p className="text-primary font-extrabold text-sm leading-none">{date.split(" ")[0]}</p>
                  <p className="text-primary/70 text-xs mt-0.5">{date.split(" ")[1]}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{type}</span>
                  <h3 className="text-white font-semibold text-base mt-0.5">{title}</h3>
                  <p className="text-slate-400 text-sm mt-1 flex items-center gap-1">
                    <span className="material-icons-round text-xs">location_on</span>
                    {location}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── About ───────────────────────────────────────────────────── */}
      <section id="about" className="py-24 px-6 bg-card-dark/30 border-y border-border-dark">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-5">About the Academy</h2>
          <p className="text-slate-400 leading-relaxed mb-6">
            Fraser Valley Chess Academy is a non-profit organization dedicated to making
            high-quality chess education accessible to young learners across British Columbia.
            We partner with schools, community centres, and families to deliver world-class
            instruction in a supportive, inclusive environment.
          </p>
          <p className="text-slate-400 leading-relaxed">
            Our certified coaches bring tournament experience and a passion for teaching
            to every session — nurturing capable, confident, and compassionate players.
          </p>
        </div>
      </section>

      {/* ── CTA banner ──────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-primary/20 via-indigo/10 to-transparent border border-primary/20 rounded-3xl p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to make your move?
          </h2>
          <p className="text-slate-400 mb-8 max-w-lg mx-auto">
            Sign in to your dashboard to manage classes, track progress, and stay on top of
            upcoming tournaments.
          </p>
          <Link
            href="/login"
            className="inline-block bg-primary hover:bg-blue-500 text-white font-semibold px-10 py-4 rounded-xl shadow-[0_0_24px_rgba(43,108,238,0.3)] transition-all text-base"
          >
            Sign In to Your Account
          </Link>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <footer className="border-t border-border-dark py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white text-sm">♟</span>
            </div>
            <span className="font-semibold text-slate-300">Fraser Valley Chess Academy</span>
          </div>
          <p>© {new Date().getFullYear()} Fraser Valley Chess Academy. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-slate-300 transition-colors">Privacy</a>
            <a href="#" className="hover:text-slate-300 transition-colors">Terms</a>
            <a href="mailto:info@fvchess.ca" className="hover:text-slate-300 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
