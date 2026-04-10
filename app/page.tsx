import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="bg-white text-[#1d1d1f] font-sans overflow-x-hidden">

      {/* ── Nav ─────────────────────────────────────────────────────────── */}
      <header className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-xl border-b border-black/[0.06]">
        <div className="max-w-[980px] mx-auto h-12 px-4 flex items-center justify-between">
          <Link href="/" className="text-[#1d1d1f] opacity-80 hover:opacity-100 transition-opacity">
            <span className="text-2xl leading-none">♟</span>
          </Link>

          <nav className="hidden md:flex items-center gap-7">
            {["Programs", "Why Chess", "Events", "About"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(" ", "-")}`}
                className="text-[13px] text-[#1d1d1f]/60 hover:text-[#1d1d1f] transition-colors"
              >
                {item}
              </a>
            ))}
          </nav>

          <Link
            href="/login"
            className="text-[13px] text-[#0071e3] hover:underline transition-colors"
          >
            Sign In
          </Link>
        </div>
      </header>

      {/* ── Hero (dark — Apple keeps product heroes dark) ─────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-12 bg-[#000] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(43,108,238,0.15),transparent)] pointer-events-none" />

        <div className="relative max-w-[700px] mx-auto">
          <p className="text-[17px] font-semibold text-[#6ba0ff] mb-4">
            Fraser Valley Chess Academy
          </p>
          <h1 className="text-[56px] md:text-[80px] font-bold leading-[1.05] tracking-tight mb-6">
            The game that<br />changes everything.
          </h1>
          <p className="text-[19px] md:text-[21px] text-white/60 leading-relaxed mb-10 font-light">
            Strategic thinking. Unshakeable focus.<br className="hidden md:block" />
            Lifelong skills. Starting here.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
            <Link
              href="/login"
              className="bg-[#0071e3] hover:bg-[#0077ed] text-white text-[17px] font-medium px-7 py-3 rounded-full transition-all"
            >
              Sign In
            </Link>
            <a
              href="#programs"
              className="text-[#6ba0ff] hover:text-[#9dc0ff] text-[17px] font-medium transition-colors flex items-center gap-1"
            >
              Explore programs <span>›</span>
            </a>
          </div>
        </div>

        {/* Chess board */}
        <div className="relative mt-20 w-full max-w-[440px] mx-auto select-none pointer-events-none">
          <div className="grid grid-cols-8 rounded-2xl overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.6)]">
            {Array.from({ length: 64 }).map((_, i) => {
              const row = Math.floor(i / 8);
              const col = i % 8;
              const isLight = (row + col) % 2 === 0;
              const pieces: Record<string, string> = {
                "0-0": "♜","0-1": "♞","0-2": "♝","0-3": "♛",
                "0-4": "♚","0-5": "♝","0-6": "♞","0-7": "♜",
                "1-0": "♟","1-1": "♟","1-2": "♟","1-3": "♟",
                "1-4": "♟","1-5": "♟","1-6": "♟","1-7": "♟",
                "6-0": "♙","6-1": "♙","6-2": "♙","6-3": "♙",
                "6-4": "♙","6-5": "♙","6-6": "♙","6-7": "♙",
                "7-0": "♖","7-1": "♘","7-2": "♗","7-3": "♕",
                "7-4": "♔","7-5": "♗","7-6": "♘","7-7": "♖",
              };
              const piece = pieces[`${row}-${col}`];
              return (
                <div
                  key={i}
                  className={`aspect-square flex items-center justify-center text-base md:text-xl ${
                    isLight ? "bg-[#e8d5b0]" : "bg-[#b58863]"
                  }`}
                >
                  {piece && (
                    <span className={isLight ? "text-[#1a1a1a]" : "text-[#f0d9b5]"}>
                      {piece}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
          <div className="absolute bottom-0 inset-x-0 h-28 bg-gradient-to-t from-[#000] to-transparent" />
        </div>
      </section>

      {/* ── Tagline strip ─────────────────────────────────────────────────── */}
      <section className="py-5 bg-[#f5f5f7] border-b border-black/[0.06]">
        <p className="text-center text-[14px] text-[#6e6e73] tracking-wide">
          Inspire &nbsp;·&nbsp; Empower &nbsp;·&nbsp; Educate &nbsp;·&nbsp; Fraser Valley, BC
        </p>
      </section>

      {/* ── Programs ──────────────────────────────────────────────────────── */}
      <section id="programs" className="py-28 px-6 bg-[#f5f5f7]">
        <div className="max-w-[980px] mx-auto">
          <div className="text-center mb-16">
            <p className="text-[13px] font-semibold uppercase tracking-widest text-[#0071e3] mb-3">Programs</p>
            <h2 className="text-[48px] md:text-[60px] font-bold leading-tight tracking-tight text-[#1d1d1f]">
              Your path to mastery.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                eyebrow: "K–12",
                title: "School Programs",
                desc: "In-class chess instruction woven into school curricula across the Fraser Valley — making great thinking a daily habit.",
              },
              {
                eyebrow: "Competitive",
                title: "Tournament Training",
                desc: "Intensive coaching for serious players. Openings, tactics, endgames, and the mental game — built for the board.",
              },
              {
                eyebrow: "Flexible",
                title: "Private & Group Lessons",
                desc: "One-on-one or small groups, in-person or online. Certified coaches who meet your student where they are.",
              },
            ].map(({ eyebrow, title, desc }) => (
              <div
                key={title}
                className="bg-white rounded-3xl p-10 flex flex-col gap-3 shadow-[0_2px_12px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_24px_rgba(0,0,0,0.1)] transition-shadow"
              >
                <p className="text-[13px] font-semibold uppercase tracking-widest text-[#0071e3]">{eyebrow}</p>
                <h3 className="text-[24px] font-semibold leading-tight text-[#1d1d1f]">{title}</h3>
                <p className="text-[15px] text-[#6e6e73] leading-relaxed flex-1">{desc}</p>
                <a href="#" className="text-[#0071e3] hover:underline text-[15px] font-medium flex items-center gap-0.5 mt-2">
                  Learn more <span>›</span>
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Chess ─────────────────────────────────────────────────────── */}
      <section id="why-chess" className="py-28 px-6 bg-white">
        <div className="max-w-[980px] mx-auto">
          <div className="text-center mb-16">
            <p className="text-[13px] font-semibold uppercase tracking-widest text-[#0071e3] mb-3">Why Chess</p>
            <h2 className="text-[48px] md:text-[60px] font-bold leading-tight tracking-tight text-[#1d1d1f] max-w-2xl mx-auto">
              Skills that outlast every game.
            </h2>
            <p className="text-[19px] text-[#6e6e73] mt-5 max-w-xl mx-auto font-light leading-relaxed">
              Chess is a sport of the mind. Every move trains the brain in ways no classroom subject can replicate.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: "🧠", title: "Critical Thinking", desc: "Evaluate positions, weigh options, commit." },
              { icon: "🎯", title: "Deep Focus", desc: "Hours of concentration built one move at a time." },
              { icon: "💡", title: "Creativity", desc: "Unexpected ideas win games and solve problems." },
              { icon: "📈", title: "Academic Lift", desc: "Chess players consistently outperform peers." },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="bg-[#f5f5f7] rounded-3xl p-8 text-center">
                <p className="text-4xl mb-4">{icon}</p>
                <p className="text-[17px] font-semibold text-[#1d1d1f] mb-2">{title}</p>
                <p className="text-[14px] text-[#6e6e73] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ─────────────────────────────────────────────────────────── */}
      <section className="py-28 px-6 bg-[#f5f5f7]">
        <div className="max-w-[980px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { value: "500+", label: "Active Students" },
            { value: "3", label: "BC Locations" },
            { value: "12+", label: "Tournaments / Year" },
            { value: "95%", label: "Student Retention" },
          ].map(({ value, label }) => (
            <div key={label} className="bg-white rounded-3xl py-12 px-8 text-center shadow-[0_2px_12px_rgba(0,0,0,0.05)]">
              <p className="text-[48px] font-bold leading-none tracking-tight text-[#1d1d1f]">{value}</p>
              <p className="text-[14px] text-[#6e6e73] mt-3">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Events ────────────────────────────────────────────────────────── */}
      <section id="events" className="py-28 px-6 bg-white">
        <div className="max-w-[980px] mx-auto">
          <div className="text-center mb-16">
            <p className="text-[13px] font-semibold uppercase tracking-widest text-[#0071e3] mb-3">Events</p>
            <h2 className="text-[48px] md:text-[60px] font-bold leading-tight tracking-tight text-[#1d1d1f]">
              Play. Compete. Win.
            </h2>
          </div>

          <div className="rounded-3xl overflow-hidden border border-black/[0.08] divide-y divide-black/[0.06]">
            {[
              { date: "Apr 19, 2026", title: "Spring Open Tournament", location: "Langley, BC", type: "Open" },
              { date: "May 3, 2026", title: "Youth Championship Series", location: "Maple Ridge, BC", type: "U18" },
              { date: "May 17, 2026", title: "School Intramural Finals", location: "Port Coquitlam, BC", type: "Schools" },
            ].map(({ date, title, location, type }) => (
              <div
                key={title}
                className="bg-white hover:bg-[#f5f5f7] transition-colors px-10 py-7 flex flex-col md:flex-row md:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-8">
                  <span className="text-[12px] font-semibold uppercase tracking-widest text-[#0071e3] w-20 shrink-0">{type}</span>
                  <div>
                    <p className="text-[17px] font-semibold text-[#1d1d1f]">{title}</p>
                    <p className="text-[14px] text-[#6e6e73] mt-0.5">{location}</p>
                  </div>
                </div>
                <p className="text-[14px] text-[#6e6e73] shrink-0">{date}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── About ─────────────────────────────────────────────────────────── */}
      <section id="about" className="py-28 px-6 bg-[#f5f5f7]">
        <div className="max-w-[680px] mx-auto text-center">
          <p className="text-[13px] font-semibold uppercase tracking-widest text-[#0071e3] mb-5">About</p>
          <h2 className="text-[36px] md:text-[48px] font-bold leading-tight tracking-tight text-[#1d1d1f] mb-7">
            We believe every student deserves to think at their best.
          </h2>
          <p className="text-[17px] text-[#6e6e73] leading-relaxed mb-5">
            Fraser Valley Chess Academy is a non-profit dedicated to bringing world-class
            chess education to young learners across British Columbia — in schools, community
            centres, and online.
          </p>
          <p className="text-[17px] text-[#6e6e73] leading-relaxed">
            Our certified coaches are tournament veterans and passionate educators who
            nurture the whole player: capable, curious, and compassionate.
          </p>
        </div>
      </section>

      {/* ── Final CTA (dark for contrast) ─────────────────────────────────── */}
      <section className="py-28 px-6 bg-[#1d1d1f] text-white">
        <div className="max-w-[680px] mx-auto text-center">
          <h2 className="text-[48px] md:text-[60px] font-bold leading-tight tracking-tight mb-5">
            Your next move<br />starts here.
          </h2>
          <p className="text-[19px] text-white/60 font-light mb-10 leading-relaxed">
            Sign in to manage classes, track progress,<br className="hidden md:block" />
            and prepare for your next tournament.
          </p>
          <Link
            href="/login"
            className="inline-block bg-white hover:bg-white/90 text-[#1d1d1f] text-[17px] font-medium px-8 py-3.5 rounded-full transition-all"
          >
            Sign In to Dashboard
          </Link>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="bg-[#f5f5f7] border-t border-black/[0.08] py-10 px-6">
        <div className="max-w-[980px] mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 mb-6">
            <div className="flex items-center gap-2">
              <span className="text-xl text-[#1d1d1f]">♟</span>
              <span className="text-[14px] font-semibold text-[#1d1d1f]">Fraser Valley Chess Academy</span>
            </div>
            <nav className="flex flex-wrap gap-x-7 gap-y-2 text-[13px] text-[#6e6e73]">
              <a href="#programs" className="hover:text-[#1d1d1f] transition-colors">Programs</a>
              <a href="#events" className="hover:text-[#1d1d1f] transition-colors">Events</a>
              <a href="#about" className="hover:text-[#1d1d1f] transition-colors">About</a>
              <Link href="/login" className="hover:text-[#1d1d1f] transition-colors">Sign In</Link>
              <a href="mailto:info@fvchess.ca" className="hover:text-[#1d1d1f] transition-colors">Contact</a>
              <a href="#" className="hover:text-[#1d1d1f] transition-colors">Privacy</a>
            </nav>
          </div>
          <p className="text-[13px] text-[#6e6e73]">
            © {new Date().getFullYear()} Fraser Valley Chess Academy. All rights reserved.
          </p>
        </div>
      </footer>

    </div>
  );
}
