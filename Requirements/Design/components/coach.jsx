
// ─── COACH PORTAL ──────────────────────────────────────────────────

const TODAY_SESSIONS = [
  { id: 1, time: '5:00 PM', planet: 'Chess', level: 'Intermediate (RR)', location: 'Langley', students: ['Aiden Sharma', 'Marcus Lee', 'Sofia Patel', 'James Wong', 'Emma Davis'], attended: [], notes: '', topic: '' },
  { id: 2, time: '6:00 PM', planet: 'Chess', level: 'Beginner (PP)', location: 'Langley', students: ['Lily Chen', 'Noah Kim', 'Ava Brown', 'Ethan Martin'], attended: [], notes: '', topic: '' },
];

const COACH_MEMBERS = [
  { id: 1, name: 'Aiden Sharma', planet: 'Chess', level: 'Intermediate', lastTopic: 'Sicilian Defence', hwDone: true, progress: 72 },
  { id: 2, name: 'Marcus Lee', planet: 'Chess', level: 'Intermediate', lastTopic: 'Pawn Structure', hwDone: false, progress: 58 },
  { id: 3, name: 'Sofia Patel', planet: 'Chess', level: 'Intermediate', lastTopic: 'Rook Endgames', hwDone: true, progress: 81 },
  { id: 4, name: 'James Wong', planet: 'Chess', level: 'Intermediate', lastTopic: 'King Safety', hwDone: true, progress: 65 },
  { id: 5, name: 'Emma Davis', planet: 'Chess', level: 'Intermediate', lastTopic: 'Pin & Fork', hwDone: false, progress: 44 },
  { id: 6, name: 'Lily Chen', planet: 'Chess', level: 'Beginner', lastTopic: 'Piece Movement', hwDone: true, progress: 30 },
  { id: 7, name: 'Noah Kim', planet: 'Chess', level: 'Beginner', lastTopic: 'Check & Checkmate', hwDone: false, progress: 22 },
];

const TRIALS = [
  { id: 1, name: 'Zara Ahmed', date: 'May 5, 2026', planet: 'Chess', status: 'Pending', time: '4:00 PM' },
  { id: 2, name: 'Ben Taylor', date: 'May 7, 2026', planet: 'Chess', status: 'Pending', time: '5:00 PM' },
];

function CoachDashboard({ onNavigate }) {
  const [sessions, setSessions] = React.useState(TODAY_SESSIONS);
  const [activeSession, setActiveSession] = React.useState(null);
  const [tab, setTab] = React.useState('today');

  const SessionAttendance = ({ session }) => {
    const [attended, setAttended] = React.useState([]);
    const [topic, setTopic] = React.useState('');
    const [hw, setHw] = React.useState('');
    const [notes, setNotes] = React.useState('');
    const [saved, setSaved] = React.useState(false);

    const toggle = (name) => setAttended(prev => prev.includes(name) ? prev.filter(x => x !== name) : [...prev, name]);

    const save = () => {
      setSessions(prev => prev.map(s => s.id === session.id ? { ...s, attended, topic, notes, saved: true } : s));
      setSaved(true);
      setTimeout(() => setActiveSession(null), 800);
    };

    return (
      <Modal open={true} onClose={() => setActiveSession(null)} title={`${session.planet} · ${session.level} — ${session.time}`} width={580}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Attendance */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: TLP.gray700, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Mark Attendance</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {session.students.map(name => (
                <div key={name} onClick={() => toggle(name)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 9, border: `1.5px solid ${attended.includes(name) ? TLP.teal : TLP.gray200}`, cursor: 'pointer', background: attended.includes(name) ? TLP.tealLight : TLP.white, transition: 'all 0.15s' }}>
                  <div style={{ width: 20, height: 20, borderRadius: 4, border: `2px solid ${attended.includes(name) ? TLP.teal : TLP.gray300}`, background: attended.includes(name) ? TLP.teal : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {attended.includes(name) && <span style={{ color: '#fff', fontSize: 12 }}>✓</span>}
                  </div>
                  <Avatar name={name} size={30} color={TLP.teal} />
                  <span style={{ fontWeight: 600, fontSize: 14, color: TLP.navy, flex: 1 }}>{name}</span>
                  <Badge label={attended.includes(name) ? 'Present' : 'Absent'} color={attended.includes(name) ? TLP.green : TLP.gray400} bg={attended.includes(name) ? TLP.greenLight : TLP.gray100} />
                </div>
              ))}
            </div>
          </div>
          {/* Session notes */}
          <Input label="Topic Covered" value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g. Sicilian Defence — Dragon Variation" required />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: TLP.gray700 }}>Homework Assigned</label>
            <textarea value={hw} onChange={e => setHw(e.target.value)} placeholder="Describe the homework task..." style={{ border: `1.5px solid ${TLP.gray200}`, borderRadius: 8, padding: '8px 12px', fontSize: 14, fontFamily: 'inherit', minHeight: 70, resize: 'vertical', outline: 'none' }}
              onFocus={e => e.target.style.borderColor = TLP.teal}
              onBlur={e => e.target.style.borderColor = TLP.gray200}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: TLP.gray700 }}>Session Notes <span style={{ fontWeight: 400, color: TLP.gray400 }}>(private)</span></label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any notes for this session..." style={{ border: `1.5px solid ${TLP.gray200}`, borderRadius: 8, padding: '8px 12px', fontSize: 14, fontFamily: 'inherit', minHeight: 60, resize: 'vertical', outline: 'none' }}
              onFocus={e => e.target.style.borderColor = TLP.teal}
              onBlur={e => e.target.style.borderColor = TLP.gray200}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: TLP.gray500 }}>{attended.length}/{session.students.length} present</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <Btn variant="secondary" onClick={() => setActiveSession(null)}>Cancel</Btn>
              <Btn variant="primary" onClick={save} icon={saved ? '✓' : undefined} disabled={saved}>
                {saved ? 'Saved!' : 'Save Session'}
              </Btn>
            </div>
          </div>
        </div>
      </Modal>
    );
  };

  const TrialFeedback = () => {
    const [sel, setSel] = React.useState(null);
    const [form, setForm] = React.useState({ assessment: '', level: '', batch: '', attachment: '' });
    const [submitted, setSubmitted] = React.useState(false);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {TRIALS.map(t => (
          <Card key={t.id} style={{ padding: '16px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: sel?.id === t.id ? 16 : 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Avatar name={t.name} size={38} />
                <div>
                  <div style={{ fontWeight: 700, color: TLP.navy }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: TLP.gray500 }}>{t.date} · {t.time} · {t.planet}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <Badge label={t.status} color={TLP.amber} bg={TLP.amberLight} />
                <Btn variant="primary" size="sm" onClick={() => setSel(sel?.id === t.id ? null : t)}>
                  {sel?.id === t.id ? 'Close' : 'Write Report'}
                </Btn>
              </div>
            </div>
            {sel?.id === t.id && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 16, borderTop: `1px solid ${TLP.gray100}` }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: TLP.gray700 }}>Assessment <span style={{ color: TLP.red }}>*</span></label>
                  <textarea value={form.assessment} onChange={e => setForm(f => ({ ...f, assessment: e.target.value }))} placeholder="Describe the student's performance, strengths and areas of improvement..." style={{ border: `1.5px solid ${TLP.gray200}`, borderRadius: 8, padding: '8px 12px', fontSize: 14, fontFamily: 'inherit', minHeight: 80, resize: 'vertical', outline: 'none' }}
                    onFocus={e => e.target.style.borderColor = TLP.teal}
                    onBlur={e => e.target.style.borderColor = TLP.gray200}
                  />
                </div>
                <Select label="Recommended Level" value={form.level} onChange={e => setForm(f => ({ ...f, level: e.target.value }))}
                  options={[{ value: '', label: '— Select level —' }, 'Beginner (PP)', 'Intermediate (RR)', 'Advanced (PR)']} required />
                <Select label="Recommended Batch" value={form.batch} onChange={e => setForm(f => ({ ...f, batch: e.target.value }))}
                  options={[{ value: '', label: '— Select batch —' }, 'Mon 5pm · Langley', 'Mon 6pm · Langley', 'Sat 3pm · Langley']} required />
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  <Btn variant="secondary" size="sm" onClick={() => setSel(null)}>Cancel</Btn>
                  <Btn variant="primary" size="sm" onClick={() => { setSubmitted(true); setSel(null); }} disabled={!form.assessment || !form.level || !form.batch}>Submit Report</Btn>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div style={{ padding: 24 }}>
      {activeSession && <SessionAttendance session={activeSession} />}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 800, color: TLP.navy }}>Coach Dashboard</h1>
        <p style={{ margin: 0, fontSize: 13, color: TLP.gray500 }}>Friday, May 2, 2026 · Langley</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        <StatCard label="Today's Sessions" value={sessions.length} icon="📋" color={TLP.tealLight} />
        <StatCard label="My Students" value={COACH_MEMBERS.length} icon="👥" color={TLP.blueLight} />
        <StatCard label="Pending Trials" value={TRIALS.length} icon="🎯" color={TLP.amberLight} />
        <StatCard label="Make-ups Pending" value="2" icon="🔄" color={TLP.purpleLight} />
      </div>

      <Tabs tabs={[{ id: 'today', label: "Today's Sessions" }, { id: 'students', label: 'My Students' }, { id: 'trials', label: 'Trial Sessions' }, { id: 'availability', label: 'Availability' }]} active={tab} onChange={setTab} />

      {tab === 'today' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {sessions.map(s => (
            <Card key={s.id} style={{ padding: '18px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 18, fontWeight: 800, color: TLP.navy }}>{s.time}</span>
                    <PlanetBadge planet={s.planet} />
                    <Badge label={s.level} color={TLP.gray600} bg={TLP.gray100} />
                  </div>
                  <div style={{ fontSize: 13, color: TLP.gray500 }}>📍 {s.location} · {s.students.length} students enrolled</div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {s.saved ? (
                    <Badge label="✓ Session Logged" color={TLP.green} bg={TLP.greenLight} size="md" />
                  ) : (
                    <Btn variant="primary" size="sm" onClick={() => setActiveSession(s)}>Mark Attendance</Btn>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {s.students.map(name => <Avatar key={name} name={name} size={30} color={s.attended?.includes(name) ? TLP.teal : TLP.gray300} />)}
              </div>
            </Card>
          ))}
        </div>
      )}

      {tab === 'students' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
            {COACH_MEMBERS.map(m => (
              <Card key={m.id} style={{ padding: '16px 18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <Avatar name={m.name} size={38} color={TLP.teal} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: TLP.navy, fontSize: 14 }}>{m.name}</div>
                    <div style={{ fontSize: 11, color: TLP.gray500 }}>{m.planet} · {m.level}</div>
                  </div>
                  <Badge label={m.hwDone ? 'HW Done' : 'HW Missing'} color={m.hwDone ? TLP.green : TLP.red} bg={m.hwDone ? TLP.greenLight : TLP.redLight} />
                </div>
                <div style={{ fontSize: 12, color: TLP.gray500, marginBottom: 8 }}>Last topic: <span style={{ color: TLP.gray700, fontWeight: 600 }}>{m.lastTopic}</span></div>
                <ProgressBar value={m.progress} color={m.progress > 70 ? TLP.green : m.progress > 40 ? TLP.amber : TLP.red} />
                <div style={{ fontSize: 11, color: TLP.gray500, marginTop: 4 }}>{m.progress}% course progress</div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {tab === 'trials' && <TrialFeedback />}

      {tab === 'availability' && (
        <Card style={{ padding: 24 }}>
          <div style={{ fontSize: 14, color: TLP.gray600, marginBottom: 16 }}>Set your weekly availability for the next 6 months. Changes carry over automatically.</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 10 }}>
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
              const [avail, setAvail] = React.useState(i < 6 && i !== 3 && i !== 4);
              return (
                <div key={day} onClick={() => setAvail(a => !a)} style={{ borderRadius: 10, border: `2px solid ${avail ? TLP.teal : TLP.gray200}`, background: avail ? TLP.tealLight : TLP.gray50, padding: '14px 10px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.15s' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: avail ? TLP.teal : TLP.gray400, marginBottom: 4 }}>{day}</div>
                  <div style={{ fontSize: 20 }}>{avail ? '✓' : '—'}</div>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
            <Btn variant="primary">Save Availability</Btn>
          </div>
        </Card>
      )}
    </div>
  );
}

Object.assign(window, { CoachDashboard });
