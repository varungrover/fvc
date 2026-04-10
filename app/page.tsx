import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="bg-[#000] text-white font-sans overflow-x-hidden">

      {/* ── Nav ─────────────────────────────────────────────────────────── */}
      <header className="fixed top-0 inset-x-0 z-50 bg-[#000]/80 backdrop-blur-xl">
        <div className="max-w-[980px] mx-auto h-12 px-4 flex items-center justify-between">
          {/* Logo mark */}
          <Link href="/" className="text-white opacity-80 hover:opacity-100 transition-opacity">
            <span className="text-2xl leading-none">♟</span>
          </Link>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-7">
            {["Programs", "Why Chess", "Events", "About"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(" ", "-")}`}
                className="text-[13px] text-white/70 hover:text-white transition-colors"
              >
                {item}
              </a>
            ))}
          </nav>

          {/* Sign in */}
          <Link
            href="/login"
            className="text-[13px] text-white/70 hover:text-white transition-colors"
          >
            Sign In
          </Link>
        </div>
      </header>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-12">
        {/* Subtle radial glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(43,108,238,0.18),transparent)] pointer-events-none" />

        <div className="relative max-w-[700px] mx-auto">
          <p className="text-[17px] font-semibold text-[#2b6cee] mb-4 tracking-tight">
            Fraser Valley Chess Academy
          </p>
          <h1 className="text-[56px] md:text-[80px] font-bold leading-[1.05] tracking-tight text-white mb-6">
            The game that<br />changes everything.
          </h1>
          <p className="text-[19px] md:text-[21px] text-white/60 leading-relaxed mb-10 font-light">
            Strategic thinking. Unshakeable focus.<br className="hidden md:block" />
            Lifelong skills. Starting here.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
            <Link
              href="/login"
              className="bg-[#2b6cee] hover:bg-[#1a5ce0] text-white text-[17px] font-medium px-7 py-3 rounded-full transition-all"
            >
              Sign In
            </Link>
            <a
              href="#programs"
              className="text-[#2b6cee] hover:text-[#6ba0ff] text-[17px] font-medium transition-colors flex items-center gap-1"
            >
              Explore programs
              <span className="text-lg leading-none">›</span>
            </a>
          </div>
        </div>

        {/* Giant chess board visual */}
        <div className="relative mt-20 w-full max-w-[480px] mx-auto select-none pointer-events-none">
          <div className="grid grid-cols-8 rounded-2xl overflow-hidden opacity-30 shadow-[0_0_120px_rgba(43,108,238,0.2)]">
            {Array.from({ length: 64 }).map((_, i) => {
              const row = Math.floor(i / 8);
              const col = i % 8;
              const isLight = (row + col) % 2 === 0;
              const pieces: Record<string, string> = {
                "0-0": "♜", "0-1": "♞", "0-2": "♝", "0-3": "♛",
                "0-4": "♚", "0-5": "♝", "0-6": "♞", "0-7": "♜",
                "1-0": "♟", "1-1": "♟", "1-2": "♟", "1-3": "♟",
                "1-4": "♟", "1-5": "♟", "1-6": "♟", "1-7": "♟",
                "6-0": "♙", "6-1": "♙", "6-2": "♙", "6-3": "♙",
                "6-4": "♙", "6-5": "♙", "6-6": "♙", "6-7": "♙",
                "7-0": "♖", "7-1": "♘", "7-2": "♗", "7-3": "♕",
                "7-4": "♔", "7-5": "♗", "7-6": "♘", "7-7": "♖",
              };
              const piece = pieces[`${row}-${col}`];
              return (
                <div
                  key={i}
                  className={`aspect-square flex items-center justify-center text-lg ${
                    isLight ? "bg-[#2a3449]" : "bg-[#1a2233]"
                  }`}
                >
                  {piece && <span className="text-white/80">{piece}</span>}
                </div>
              );
            })}
          </div>
          {/* Fade bottom */}
          <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-[#000] to-transparent" />
        </div>
      </section>

      {/* ── Tagline strip ─────────────────────────────────────────────────── */}
      <section className="py-8 border-t border-b border-white/[0.06] bg-[#111]">
        <p className="text-center text-[15px] text-white/40 tracking-wide font-light">
          Inspire &nbsp;·&nbsp; Empower &nbsp;·&nbsp; Educate &nbsp;·&nbsp; Fraser Valley, BC
        </p>
      </section>

      {/* ── Programs ──────────────────────────────────────────────────────── */}
      <section id="programs" className="py-32 px-6">
        <div className="max-w-[980px] mx-auto">
          <div className="text-center mb-20">
            <p className="text-[13px] font-semibold uppercase tracking-widest text-[#2b6cee] mb-4">Programs</p>
            <h2 className="text-[48px] md:text-[64px] font-bold leading-tight tracking-tight">
              Your path to mastery.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-px bg-white/[0.06] rounded-3xl overflow-hidden">
            {[
              {
                eyebrow: "K–12",
                title: "School Programs",
                desc: "In-class chess instruction woven into school curricula across the Fraser Valley — making great thinking a daily habit.",
                cta: "Learn more",
              },
              {
                eyebrow: "Competitive",
                title: "Tournament Training",
                desc: "Intensive coaching for serious players. Openings, tactics, endgames, and the mental game — built for the board.",
                cta: "Learn more",
              },
              {
                eyebrow: "Flexible",
                title: "Private & Group Lessons",
                desc: "One-on-one or small groups, in-person or online. Certified coaches who meet your student where they are.",
                cta: "Learn more",
              },
            ].map(({ eyebrow, title, desc, cta }) => (
              <div
                key={title}
                className="bg-[#111] p-10 flex flex-col gap-4 hover:bg-[#161616] transition-colors"
              >
                <p className="text-[13px] font-semibold uppercase tracking-widest text-[#2b6cee]">{eyebrow}</p>
                <h3 className="text-[28px] font-semibold leading-tight tracking-tight">{title}</h3>
                <p className="text-[15px] text-white/50 leading-relaxed flex-1">{desc}</p>
                <a href="#" className="text-[#2b6cee] hover:text-[#6ba0ff] text-[15px] font-medium transition-colors flex items-center gap-1 mt-2">
                  {cta} <span>›</span>
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Chess ─────────────────────────────────────────────────────── */}
      <section id="why-chess" className="py-32 px-6 bg-[#111]">
        <div className="max-w-[980px] mx-auto">
          <div className="text-center mb-20">
            <p className="text-[13px] font-semibold uppercase tracking-widest text-[#2b6cee] mb-4">Why Chess</p>
            <h2 className="text-[48px] md:text-[64px] font-bold leading-tight tracking-tight max-w-2xl mx-auto">
              Skills that outlast every game.
            </h2>
            <p className="text-[19px] text-white/50 mt-6 max-w-xl mx-auto font-light leading-relaxed">
              Chess is a sport of the mind. Every move trains the brain in ways no classroom subject can replicate.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/[0.06] rounded-3xl overflow-hidden">
            {[
              { icon: "🧠", title: "Critical Thinking", desc: "Evaluate positions, weigh options, commit." },
              { icon: "🎯", title: "Deep Focus", desc: "Hours of concentration built one move at a time." },
              { icon: "💡", title: "Creativity", desc: "Unexpected ideas win games and solve problems." },
              { icon: "📈", title: "Academic Lift", desc: "Chess players consistently outperform peers." },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="bg-[#111] p-10 text-center hover:bg-[#161616] transition-colors">
                <p className="text-4xl mb-5">{icon}</p>
                <p className="text-[19px] font-semibold mb-2">{title}</p>
                <p className="text-[15px] text-white/40 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ─────────────────────────────────────────────────────────── */}
      <section className="py-32 px-6">
        <div className="max-w-[980px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-px bg-white/[0.06] rounded-3xl overflow-hidden">
          {[
            { value: "500+", label: "Active Students" },
            { value: "3", label: "BC Locations" },
            { value: "12+", label: "Tournaments / Year" },
            { value: "95%", label: "Student Retention" },
          ].map(({ value, label }) => (
            <div key={label} className="bg-[#000] py-14 px-8 text-center">
              <p className="text-[52px] font-bold leading-none tracking-tight">{value}</p>
              <p className="text-[15px] text-white/40 mt-3">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Events ────────────────────────────────────────────────────────── */}
      <section id="events" className="py-32 px-6 bg-[#111]">
        <div className="max-w-[980px] mx-auto">
          <div className="text-center mb-20">
            <p className="text-[13px] font-semibold uppercase tracking-widest text-[#2b6cee] mb-4">Events</p>
            <h2 className="text-[48px] md:text-[64px] font-bold leading-tight tracking-tight">
              Play. Compete. Win.
            </h2>
          </div>

          <div className="space-y-px bg-white/[0.06] rounded-3xl overflow-hidden">
            {[
              { date: "Apr 19, 2026", title: "Spring Open Tournament", location: "Langley, BC", type: "Open" },
              { date: "May 3, 2026", title: "Youth Championship Series", location: "Maple Ridge, BC", type: "U18" },
              { date: "May 17, 2026", title: "School Intramural Finals", location: "Port Coquitlam, BC", type: "Schools" },
            ].map(({ date, title, location, type }) => (
              <div
                key={title}
                className="bg-[#111] hover:bg-[#161616] transition-colors px-10 py-8 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-8">
                  <p className="text-[13px] font-semibold uppercase tracking-widest text-[#2b6cee] w-24 shrink-0">{type}</p>
                  <div>
                    <p className="text-[19px] font-semibold">{title}</p>
                    <p className="text-[15px] text-white/40 mt-1">{location}</p>
                  </div>
                </div>
                <p className="text-[15px] text-white/30 shrink-0">{date}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── About ─────────────────────────────────────────────────────────── */}
      <section id="about" className="py-32 px-6">
        <div className="max-w-[680px] mx-auto text-center">
          <p className="text-[13px] font-semibold uppercase tracking-widest text-[#2b6cee] mb-6">About</p>
          <h2 className="text-[40px] md:text-[52px] font-bold leading-tight tracking-tight mb-8">
            We believe every student deserves to think at their best.
          </h2>
          <p className="text-[17px] text-white/50 leading-relaxed mb-6">
            Fraser Valley Chess Academy is a non-profit dedicated to bringing world-class
            chess education to young learners across British Columbia — in schools, community
            centres, and online.
          </p>
          <p className="text-[17px] text-white/50 leading-relaxed">
            Our certified coaches are tournament veterans and passionate educators who
            nurture the whole player: capable, curious, and compassionate.
          </p>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────────────────────── */}
      <section className="py-32 px-6 bg-[#111] border-t border-white/[0.06]">
        <div className="max-w-[680px] mx-auto text-center">
          <h2 className="text-[48px] md:text-[64px] font-bold leading-tight tracking-tight mb-6">
            Your next move<br />starts here.
          </h2>
          <p className="text-[19px] text-white/50 font-light mb-10">
            Sign in to manage classes, track progress,<br className="hidden md:block" />
            and prepare for your next tournament.
          </p>
          <Link
            href="/login"
            className="inline-block bg-[#2b6cee] hover:bg-[#1a5ce0] text-white text-[17px] font-medium px-8 py-3.5 rounded-full transition-all"
          >
            Sign In to Dashboard
          </Link>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/[0.06] py-10 px-6 bg-[#000]">
        <div className="max-w-[980px] mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-3">
              <span className="text-2xl">♟</span>
              <span className="text-[15px] font-semibold text-white/80">Fraser Valley Chess Academy</span>
            </div>
            <nav className="flex flex-wrap gap-x-8 gap-y-2 text-[13px] text-white/40">
              <a href="#programs" className="hover:text-white/70 transition-colors">Programs</a>
              <a href="#events" className="hover:text-white/70 transition-colors">Events</a>
              <a href="#about" className="hover:text-white/70 transition-colors">About</a>
              <Link href="/login" className="hover:text-white/70 transition-colors">Sign In</Link>
              <a href="mailto:info@fvchess.ca" className="hover:text-white/70 transition-colors">Contact</a>
              <a href="#" className="hover:text-white/70 transition-colors">Privacy</a>
            </nav>
          </div>
          <p className="text-[13px] text-white/20">
            © {new Date().getFullYear()} Fraser Valley Chess Academy. All rights reserved.
          </p>
        </div>
      </footer>

    </div>
  );
}
