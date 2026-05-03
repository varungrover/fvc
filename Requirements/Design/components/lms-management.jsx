
// ─── LMS PORTAL ────────────────────────────────────────────────────

const LMS_COURSES = {
  Chess: {
    icon: '♟', color: TLP.teal,
    levels: {
      'Intermediate (RR)': {
        modules: [
          {
            id: 'M1', title: 'Tactical Patterns', unlocked: true, quizPassed: true,
            topics: [
              { id: 'T1', title: 'Pins & Skewers', done: true, type: 'video', url: 'https://youtube.com/embed/demo' },
              { id: 'T2', title: 'Forks & Discovered Attacks', done: true, type: 'pdf' },
              { id: 'T3', title: 'Module 1 Quiz', done: true, type: 'quiz', score: 90 },
            ]
          },
          {
            id: 'M2', title: 'Pawn Structure', unlocked: true, quizPassed: false,
            topics: [
              { id: 'T4', title: 'Isolated Pawns', done: true, type: 'text' },
              { id: 'T5', title: 'Passed Pawns', done: false, type: 'video' },
              { id: 'T6', title: 'Pawn Chains', done: false, type: 'text' },
              { id: 'T7', title: 'Module 2 Quiz', done: false, type: 'quiz' },
            ]
          },
          {
            id: 'M3', title: 'Endgame Fundamentals', unlocked: false, quizPassed: false,
            topics: [
              { id: 'T8', title: 'King & Pawn Endgames', done: false, type: 'text' },
              { id: 'T9', title: 'Rook Endgames', done: false, type: 'video' },
              { id: 'T10', title: 'Module 3 Quiz', done: false, type: 'quiz' },
            ]
          },
        ]
      }
    }
  },
  Math: {
    icon: '∑', color: TLP.blue,
    levels: {
      'Grade 5': {
        modules: [
          {
            id: 'MM1', title: 'Fractions & Decimals', unlocked: true, quizPassed: true,
            topics: [
              { id: 'MT1', title: 'Adding Fractions', done: true, type: 'video' },
              { id: 'MT2', title: 'Subtracting Fractions', done: true, type: 'text' },
              { id: 'MT3', title: 'Module 1 Quiz', done: true, type: 'quiz', score: 85 },
            ]
          },
          {
            id: 'MM2', title: 'Geometry Basics', unlocked: true, quizPassed: false,
            topics: [
              { id: 'MT4', title: 'Area & Perimeter', done: false, type: 'text' },
              { id: 'MT5', title: 'Volume & Surface Area', done: false, type: 'video' },
              { id: 'MT6', title: 'Module 2 Quiz', done: false, type: 'quiz' },
            ]
          },
        ]
      }
    }
  }
};

const QUIZ_QUESTIONS = [
  { q: 'In a pin, the attacking piece is targeting a piece that is shielding a more valuable piece behind it. Which tactic exploits a similar idea but in reverse?', options: ['Fork', 'Skewer', 'Discovered Attack', 'Zwischenzug'], answer: 1 },
  { q: 'A knight on f5 attacks which of the following squares?', options: ['e3, d4, g3, h4', 'e7, g7, d6, d4', 'e3, e7, g3, g7', 'd4, d6, h4, h6'], answer: 3 },
  { q: 'What is the key principle of exploiting an isolated d-pawn?', options: ['Attack it with rooks from the flanks', 'Blockade it on d5 with a knight', 'Exchange it immediately', 'Push pawns to open lines'], answer: 1 },
];

function LMSPortal() {
  const [activePlanet, setActivePlanet] = React.useState('Chess');
  const [activeLevel, setActiveLevel] = React.useState('Intermediate (RR)');
  const [activeModule, setActiveModule] = React.useState('M2');
  const [activeTopic, setActiveTopic] = React.useState(null);
  const [quizState, setQuizState] = React.useState({ active: false, q: 0, answers: [], done: false });
  const [memberPick, setMemberPick] = React.useState('Aiden Sharma');

  const planet = LMS_COURSES[activePlanet];
  const level = planet?.levels?.[activeLevel];
  const module = level?.modules?.find(m => m.id === activeModule);

  const totalDone = level?.modules?.reduce((s, m) => s + m.topics.filter(t => t.done).length, 0) || 0;
  const totalTopics = level?.modules?.reduce((s, m) => s + m.topics.length, 0) || 0;

  const startQuiz = () => setQuizState({ active: true, q: 0, answers: [], done: false });
  const answerQ = (i) => {
    const newAns = [...quizState.answers, i];
    if (quizState.q < QUIZ_QUESTIONS.length - 1) {
      setQuizState(s => ({ ...s, q: s.q + 1, answers: newAns }));
    } else {
      setQuizState(s => ({ ...s, answers: newAns, done: true }));
    }
  };
  const score = quizState.done ? Math.round((quizState.answers.filter((a, i) => a === QUIZ_QUESTIONS[i].answer).length / QUIZ_QUESTIONS.length) * 100) : 0;

  const typeIcon = (type) => ({ video: '▶', pdf: '📄', text: '📝', quiz: '✏️' }[type] || '•');
  const typeColor = (type) => ({ video: TLP.red, pdf: TLP.blue, text: TLP.teal, quiz: TLP.amber }[type] || TLP.gray400);

  const ContentView = ({ topic }) => {
    if (!topic) return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 300, color: TLP.gray400, gap: 12 }}>
        <span style={{ fontSize: 40 }}>📖</span>
        <span style={{ fontSize: 14 }}>Select a topic to begin</span>
      </div>
    );

    if (topic.type === 'quiz' && quizState.active) {
      if (quizState.done) {
        const passed = score >= 70;
        return (
          <div style={{ padding: 32, textAlign: 'center' }}>
            <div style={{ fontSize: 64, marginBottom: 12 }}>{passed ? '🏆' : '📚'}</div>
            <h2 style={{ color: TLP.navy, margin: '0 0 8px' }}>{passed ? 'Quiz Passed!' : 'Keep Practising!'}</h2>
            <div style={{ fontSize: 36, fontWeight: 800, color: passed ? TLP.teal : TLP.amber, marginBottom: 8 }}>{score}%</div>
            <p style={{ color: TLP.gray500, fontSize: 14 }}>{passed ? 'Great work! The next module has been unlocked.' : 'Score 70% or above to unlock the next module. Try again!'}</p>
            <div style={{ margin: '20px 0' }}>
              {QUIZ_QUESTIONS.map((q, i) => (
                <div key={i} style={{ textAlign: 'left', padding: '10px 14px', borderRadius: 8, marginBottom: 8, background: quizState.answers[i] === q.answer ? TLP.greenLight : TLP.redLight, border: `1px solid ${quizState.answers[i] === q.answer ? '#c6f6d5' : '#fed7d7'}` }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: TLP.gray700, marginBottom: 4 }}>{q.q.substring(0, 60)}…</div>
                  <div style={{ fontSize: 12, color: quizState.answers[i] === q.answer ? TLP.green : TLP.red }}>
                    {quizState.answers[i] === q.answer ? '✓ Correct' : `✗ Your answer: ${q.options[quizState.answers[i]]} · Correct: ${q.options[q.answer]}`}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <Btn variant="secondary" onClick={() => setQuizState({ active: false, q: 0, answers: [], done: false })}>Close</Btn>
              {!passed && <Btn variant="primary" onClick={startQuiz}>Retry Quiz</Btn>}
            </div>
          </div>
        );
      }
      const q = QUIZ_QUESTIONS[quizState.q];
      return (
        <div style={{ padding: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: TLP.gray500 }}>Question {quizState.q + 1} of {QUIZ_QUESTIONS.length}</span>
            <span style={{ fontSize: 13, color: TLP.gray400 }}>Pass mark: 70%</span>
          </div>
          <ProgressBar value={quizState.q + 1} max={QUIZ_QUESTIONS.length} color={TLP.amber} />
          <div style={{ margin: '24px 0 20px', fontSize: 16, fontWeight: 600, color: TLP.navy, lineHeight: 1.5 }}>{q.q}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {q.options.map((opt, i) => (
              <button key={i} onClick={() => answerQ(i)} style={{ padding: '12px 16px', borderRadius: 9, border: `2px solid ${TLP.gray200}`, background: TLP.white, cursor: 'pointer', fontSize: 14, fontFamily: 'inherit', textAlign: 'left', color: TLP.gray800, transition: 'all 0.15s', fontWeight: 500 }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = TLP.teal; e.currentTarget.style.background = TLP.tealLight; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = TLP.gray200; e.currentTarget.style.background = TLP.white; }}
              >
                <span style={{ fontWeight: 700, color: TLP.teal, marginRight: 10 }}>{String.fromCharCode(65 + i)}.</span>{opt}
              </button>
            ))}
          </div>
        </div>
      );
    }

    if (topic.type === 'quiz') {
      return (
        <div style={{ padding: 32, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>✏️</div>
          <h3 style={{ color: TLP.navy, margin: '0 0 8px' }}>{topic.title}</h3>
          <p style={{ color: TLP.gray500, fontSize: 14, marginBottom: 8 }}>{QUIZ_QUESTIONS.length} questions · Pass mark: 70%</p>
          <p style={{ color: TLP.gray500, fontSize: 13, marginBottom: 20 }}>Attempting as: <strong>{memberPick}</strong></p>
          <div style={{ marginBottom: 16 }}>
            <Select label="Attempt as" value={memberPick} onChange={e => setMemberPick(e.target.value)} options={['Aiden Sharma', 'Priya Sharma']} />
          </div>
          <Btn variant="primary" size="lg" onClick={startQuiz}>Start Quiz</Btn>
          {topic.score && <div style={{ marginTop: 14, color: TLP.green, fontWeight: 600 }}>Previous best: {topic.score}%</div>}
        </div>
      );
    }

    if (topic.type === 'video') {
      return (
        <div style={{ padding: 0 }}>
          <div style={{ background: TLP.navy, borderRadius: '8px 8px 0 0', aspectRatio: '16/9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.4)', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontSize: 48 }}>▶</div>
            <div style={{ fontSize: 13 }}>Video content — opens in new tab</div>
          </div>
          <div style={{ padding: '20px 24px' }}>
            <h3 style={{ margin: '0 0 8px', color: TLP.navy }}>{topic.title}</h3>
            <p style={{ margin: 0, color: TLP.gray500, fontSize: 14 }}>Watch the lesson video to understand this concept. After watching, mark it as complete.</p>
            <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
              <Btn variant="navy" onClick={() => window.open('https://youtube.com', '_blank')} icon="▶">Watch Video</Btn>
              <Btn variant="secondary">Mark Complete</Btn>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div style={{ padding: '24px 28px' }}>
        <h3 style={{ margin: '0 0 16px', color: TLP.navy, fontSize: 18 }}>{topic.title}</h3>
        <div style={{ lineHeight: 1.7, color: TLP.gray700, fontSize: 14 }}>
          <p>This lesson covers the key principles of <strong>{topic.title}</strong> in the context of {activePlanet}.</p>
          <p>Understanding these concepts is essential for progressing through the {activeLevel} curriculum. Work through each example carefully and try to apply the ideas in your practice games.</p>
          <div style={{ background: TLP.tealLight, borderRadius: 8, padding: '14px 16px', margin: '16px 0', borderLeft: `4px solid ${TLP.teal}` }}>
            <strong style={{ color: TLP.teal }}>Key Concept:</strong>
            <p style={{ margin: '6px 0 0', color: TLP.navy }}>The fundamental idea behind {topic.title} is to create imbalances that favour your position while limiting your opponent's responses.</p>
          </div>
          <p>Practice exercises are provided at the end of this lesson. Complete them before attempting the module quiz.</p>
        </div>
        <div style={{ marginTop: 20 }}>
          <Btn variant="primary">Mark as Complete</Btn>
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 800, color: TLP.navy }}>Learning Portal</h1>
          <p style={{ margin: 0, fontSize: 13, color: TLP.gray500 }}>Viewing as: {memberPick}</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {Object.keys(LMS_COURSES).map(p => (
            <button key={p} onClick={() => { setActivePlanet(p); setActiveLevel(Object.keys(LMS_COURSES[p].levels)[0]); setActiveModule(LMS_COURSES[p].levels[Object.keys(LMS_COURSES[p].levels)[0]].modules[0].id); setActiveTopic(null); }}
              style={{ padding: '7px 14px', borderRadius: 20, border: `2px solid ${activePlanet === p ? PLANETS[p].color : TLP.gray200}`, background: activePlanet === p ? PLANETS[p].bg : TLP.white, color: activePlanet === p ? PLANETS[p].color : TLP.gray500, fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>{PLANETS[p]?.icon}</span>{p}
            </button>
          ))}
        </div>
      </div>

      {/* Progress bar */}
      <Card style={{ padding: '14px 20px', marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: TLP.navy }}>{activePlanet} · {activeLevel}</span>
          <span style={{ fontSize: 12, color: TLP.gray500 }}>{totalDone}/{totalTopics} topics completed</span>
        </div>
        <ProgressBar value={totalDone} max={totalTopics} color={planet?.color || TLP.teal} />
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 16 }}>
        {/* Module/Topic tree */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {level?.modules?.map(mod => (
            <Card key={mod.id} style={{ overflow: 'hidden', opacity: mod.unlocked ? 1 : 0.6 }}>
              <button onClick={() => mod.unlocked && setActiveModule(mod.id)} style={{ width: '100%', padding: '12px 14px', background: activeModule === mod.id ? TLP.tealLight : 'transparent', border: 'none', cursor: mod.unlocked ? 'pointer' : 'not-allowed', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 15 }}>{mod.quizPassed ? '✅' : mod.unlocked ? '📂' : '🔒'}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: TLP.navy }}>{mod.title}</div>
                  <div style={{ fontSize: 11, color: TLP.gray500 }}>{mod.topics.filter(t => t.done).length}/{mod.topics.length} done</div>
                </div>
              </button>
              {activeModule === mod.id && mod.unlocked && (
                <div style={{ borderTop: `1px solid ${TLP.gray100}` }}>
                  {mod.topics.map(t => (
                    <button key={t.id} onClick={() => { setActiveTopic(t); if (t.type !== 'quiz') setQuizState({ active: false, q: 0, answers: [], done: false }); }}
                      style={{ width: '100%', padding: '9px 14px 9px 28px', background: activeTopic?.id === t.id ? TLP.navy + '12' : 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8, borderTop: `1px solid ${TLP.gray50}` }}>
                      <span style={{ fontSize: 13, color: typeColor(t.type) }}>{typeIcon(t.type)}</span>
                      <span style={{ fontSize: 13, color: activeTopic?.id === t.id ? TLP.navy : TLP.gray700, fontWeight: activeTopic?.id === t.id ? 600 : 400, flex: 1 }}>{t.title}</span>
                      {t.done && <span style={{ fontSize: 11, color: TLP.green }}>✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* Content area */}
        <Card style={{ overflow: 'hidden', minHeight: 400 }}>
          <ContentView topic={activeTopic} />
        </Card>
      </div>
    </div>
  );
}

// ─── MANAGEMENT DASHBOARD ──────────────────────────────────────────
function ManagementDashboard() {
  const [tab, setTab] = React.useState('revenue');
  const [filterOwnership, setFilterOwnership] = React.useState('All');
  const [filterPlanet, setFilterPlanet] = React.useState('All');

  const REV_DATA = [
    { ownership: 'Corporate', location: 'Langley', planet: 'Chess', level: 'Intermediate', month: 'Apr 2026', revenue: 6800 },
    { ownership: 'Corporate', location: 'Langley', planet: 'Math', level: 'Grade 5', month: 'Apr 2026', revenue: 3180 },
    { ownership: 'Corporate', location: 'South Surrey', planet: 'Chess', level: 'Beginner', month: 'Apr 2026', revenue: 5040 },
    { ownership: 'Corporate', location: 'South Surrey', planet: 'English', level: 'Grade 4', month: 'Apr 2026', revenue: 2860 },
    { ownership: 'Franchisee', location: 'Maple Ridge', planet: 'Chess', level: 'Beginner', month: 'Apr 2026', revenue: 3200 },
    { ownership: 'Franchisee', location: 'Maple Ridge', planet: 'Finance', level: 'Junior', month: 'Apr 2026', revenue: 1590 },
  ];

  const PRICE_REQUESTS = [
    { id: 1, ownership: 'Maple Ridge Franchise', planet: 'Chess', current: 199, requested: 219, reason: 'Increased operational costs', status: 'Submitted', date: 'Apr 28, 2026' },
    { id: 2, ownership: 'Maple Ridge Franchise', planet: 'Math', current: 159, requested: 179, reason: 'Instructor rate adjustment', status: 'Under Review', date: 'Mar 15, 2026' },
  ];

  const filtered = REV_DATA.filter(r =>
    (filterOwnership === 'All' || r.ownership === filterOwnership) &&
    (filterPlanet === 'All' || r.planet === filterPlanet)
  );
  const totalRev = filtered.reduce((s, r) => s + r.revenue, 0);

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 800, color: TLP.navy }}>Management</h1>
        <p style={{ margin: 0, fontSize: 13, color: TLP.gray500 }}>Franchisor View · All Ownerships</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        <StatCard label="Total Revenue (Apr)" value="$34.8k" delta="+4.2% MoM" icon="💰" color={TLP.greenLight} />
        <StatCard label="Ownerships" value="2" icon="🏢" color={TLP.blueLight} />
        <StatCard label="Total Locations" value="3" icon="📍" color={TLP.tealLight} />
        <StatCard label="Price Requests" value={PRICE_REQUESTS.length} icon="📋" color={TLP.amberLight} onClick={() => setTab('pricing')} />
      </div>

      <Tabs tabs={[
        { id: 'revenue', label: 'Revenue Report' },
        { id: 'pricing', label: 'Price Change Requests' },
        { id: 'waitlist', label: 'Missed Registrations' },
      ]} active={tab} onChange={setTab} />

      {tab === 'revenue' && (
        <div>
          <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: TLP.gray500 }}>Filter:</span>
            <select value={filterOwnership} onChange={e => setFilterOwnership(e.target.value)} style={{ border: `1px solid ${TLP.gray200}`, borderRadius: 7, padding: '6px 10px', fontSize: 13, fontFamily: 'inherit', outline: 'none' }}>
              {['All', 'Corporate', 'Franchisee'].map(o => <option key={o}>{o}</option>)}
            </select>
            <select value={filterPlanet} onChange={e => setFilterPlanet(e.target.value)} style={{ border: `1px solid ${TLP.gray200}`, borderRadius: 7, padding: '6px 10px', fontSize: 13, fontFamily: 'inherit', outline: 'none' }}>
              {['All', ...Object.keys(PLANETS)].map(p => <option key={p}>{p}</option>)}
            </select>
            <Btn variant="secondary" size="sm" icon="📥">Export CSV</Btn>
          </div>
          <Card style={{ overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', background: TLP.gray50, borderBottom: `1px solid ${TLP.gray100}` }}>
              <div style={{ display: 'grid', gridTemplateColumns: '130px 130px 100px 1fr 90px', gap: 8, fontSize: 11, fontWeight: 700, color: TLP.gray500, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                <span>Ownership</span><span>Location</span><span>Planet</span><span>Level</span><span>Revenue</span>
              </div>
            </div>
            {filtered.map((r, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '130px 130px 100px 1fr 90px', padding: '12px 20px', fontSize: 13, borderBottom: i < filtered.length - 1 ? `1px solid ${TLP.gray100}` : 'none', alignItems: 'center', gap: 8 }}>
                <Badge label={r.ownership} color={r.ownership === 'Corporate' ? TLP.teal : TLP.blue} bg={r.ownership === 'Corporate' ? TLP.tealLight : TLP.blueLight} />
                <span style={{ color: TLP.gray700 }}>{r.location}</span>
                <PlanetBadge planet={r.planet} />
                <span style={{ color: TLP.gray600 }}>{r.level}</span>
                <span style={{ fontWeight: 700, color: TLP.navy }}>${r.revenue.toLocaleString()}</span>
              </div>
            ))}
            <div style={{ display: 'grid', gridTemplateColumns: '130px 130px 100px 1fr 90px', padding: '12px 20px', background: TLP.navy, gap: 8, alignItems: 'center' }}>
              <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, gridColumn: '1/5', fontWeight: 600 }}>TOTAL ({filtered.length} rows)</span>
              <span style={{ fontWeight: 800, color: TLP.amber, fontSize: 15 }}>${totalRev.toLocaleString()}</span>
            </div>
          </Card>
        </div>
      )}

      {tab === 'pricing' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {PRICE_REQUESTS.map(req => (
            <Card key={req.id} style={{ padding: '18px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontWeight: 700, color: TLP.navy, fontSize: 15 }}>{req.ownership}</span>
                    <PlanetBadge planet={req.planet} />
                    <Badge label={req.status} color={req.status === 'Under Review' ? TLP.amber : req.status === 'Approved' ? TLP.green : TLP.blue} bg={req.status === 'Under Review' ? TLP.amberLight : req.status === 'Approved' ? TLP.greenLight : TLP.blueLight} />
                  </div>
                  <div style={{ fontSize: 12, color: TLP.gray500 }}>Submitted: {req.date}</div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Btn variant="danger" size="sm">Reject</Btn>
                  <Btn variant="primary" size="sm">Approve</Btn>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 16, fontSize: 13 }}>
                <div style={{ background: TLP.gray50, borderRadius: 8, padding: '10px 14px', flex: 1 }}>
                  <div style={{ color: TLP.gray500, marginBottom: 4 }}>Current Rate</div>
                  <div style={{ fontWeight: 800, fontSize: 18, color: TLP.navy }}>${req.current}/mo</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', fontSize: 18, color: TLP.gray400 }}>→</div>
                <div style={{ background: TLP.tealLight, borderRadius: 8, padding: '10px 14px', flex: 1 }}>
                  <div style={{ color: TLP.teal, marginBottom: 4 }}>Requested Rate</div>
                  <div style={{ fontWeight: 800, fontSize: 18, color: TLP.teal }}>${req.requested}/mo</div>
                </div>
              </div>
              <div style={{ marginTop: 12, fontSize: 13, color: TLP.gray600 }}>
                <strong>Reason:</strong> {req.reason}
              </div>
            </Card>
          ))}
        </div>
      )}

      {tab === 'waitlist' && (
        <Card style={{ padding: 24 }}>
          <p style={{ color: TLP.gray500, fontSize: 14 }}>Courses where customer registration attempts failed due to no available slots in the last 30 days.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { course: 'Chess · Intermediate', location: 'Langley', attempts: 8, lastAttempt: 'May 1, 2026' },
              { course: 'Math · Grade 7', location: 'South Surrey', attempts: 5, lastAttempt: 'Apr 28, 2026' },
              { course: 'Chess · Beginner', location: 'Maple Ridge', attempts: 3, lastAttempt: 'Apr 25, 2026' },
            ].map((w, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderRadius: 9, background: TLP.bg }}>
                <div>
                  <div style={{ fontWeight: 700, color: TLP.navy }}>{w.course}</div>
                  <div style={{ fontSize: 12, color: TLP.gray500 }}>📍 {w.location} · Last attempt: {w.lastAttempt}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 800, fontSize: 18, color: TLP.red }}>{w.attempts}</div>
                  <div style={{ fontSize: 11, color: TLP.gray400 }}>failed attempts</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

Object.assign(window, { LMSPortal, ManagementDashboard });
