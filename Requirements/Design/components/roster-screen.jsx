
// ─── STAFF ROSTER SCREEN ───────────────────────────────────────────

const ROSTER_SESSIONS = [
  // Week 1
  { id: 1,  date: '2026-05-04', day: 'Mon May 4',  time: '5:00 PM', course: 'Chess · Intermediate', location: 'Langley',      coach: 'David Chen',  students: 5, planet: 'Chess' },
  { id: 2,  date: '2026-05-04', day: 'Mon May 4',  time: '6:00 PM', course: 'Chess · Beginner',     location: 'Langley',      coach: 'David Chen',  students: 4, planet: 'Chess' },
  { id: 3,  date: '2026-05-05', day: 'Tue May 5',  time: '6:00 PM', course: 'Chess · Advanced',     location: 'South Surrey', coach: 'Mike Patel',  students: 3, planet: 'Chess' },
  { id: 4,  date: '2026-05-06', day: 'Wed May 6',  time: '5:00 PM', course: 'Math · Grade 6',       location: 'South Surrey', coach: 'Emma Wilson', students: 6, planet: 'Math' },
  { id: 5,  date: '2026-05-06', day: 'Wed May 6',  time: '6:00 PM', course: 'English · Grade 4',    location: 'Langley',      coach: 'Sarah Kim',   students: 5, planet: 'English' },
  { id: 6,  date: '2026-05-07', day: 'Thu May 7',  time: '5:00 PM', course: 'Arts · Beginner',      location: 'Langley',      coach: 'Sarah Kim',   students: 7, planet: 'Arts' },
  { id: 7,  date: '2026-05-08', day: 'Fri May 8',  time: '4:00 PM', course: 'Finance · Junior',     location: 'Maple Ridge',  coach: null,          students: 4, planet: 'Finance' },
  { id: 8,  date: '2026-05-09', day: 'Sat May 9',  time: '3:00 PM', course: 'Chess · Beginner',     location: 'Langley',      coach: 'David Chen',  students: 8, planet: 'Chess' },
  { id: 9,  date: '2026-05-09', day: 'Sat May 9',  time: '4:00 PM', course: 'English · Grade 5',    location: 'Langley',      coach: 'Sarah Kim',   students: 6, planet: 'English' },
  { id: 10, date: '2026-05-09', day: 'Sat May 9',  time: '11:00 AM', course: 'Math · Grade 5',      location: 'South Surrey', coach: 'Emma Wilson', students: 5, planet: 'Math' },
  { id: 11, date: '2026-05-09', day: 'Sat May 9',  time: '2:00 PM', course: 'Arts · Intermediate',  location: 'Maple Ridge',  coach: 'Priya Nair',  students: 5, planet: 'Arts' },
  // Week 2
  { id: 12, date: '2026-05-11', day: 'Mon May 11', time: '5:00 PM', course: 'Chess · Intermediate', location: 'Langley',      coach: 'David Chen',  students: 5, planet: 'Chess' },
  { id: 13, date: '2026-05-11', day: 'Mon May 11', time: '6:00 PM', course: 'Chess · Beginner',     location: 'Langley',      coach: 'David Chen',  students: 4, planet: 'Chess' },
  { id: 14, date: '2026-05-12', day: 'Tue May 12', time: '6:00 PM', course: 'Chess · Advanced',     location: 'South Surrey', coach: 'Mike Patel',  students: 3, planet: 'Chess' },
  { id: 15, date: '2026-05-13', day: 'Wed May 13', time: '5:00 PM', course: 'Math · Grade 6',       location: 'South Surrey', coach: null,          students: 6, planet: 'Math' },
  { id: 16, date: '2026-05-13', day: 'Wed May 13', time: '6:00 PM', course: 'English · Grade 4',    location: 'Langley',      coach: 'Sarah Kim',   students: 5, planet: 'English' },
  { id: 17, date: '2026-05-14', day: 'Thu May 14', time: '5:00 PM', course: 'Arts · Beginner',      location: 'Langley',      coach: null,          students: 7, planet: 'Arts' },
  { id: 18, date: '2026-05-15', day: 'Fri May 15', time: '4:00 PM', course: 'Finance · Junior',     location: 'Maple Ridge',  coach: 'Priya Nair',  students: 4, planet: 'Finance' },
  { id: 19, date: '2026-05-16', day: 'Sat May 16', time: '3:00 PM', course: 'Chess · Beginner',     location: 'Langley',      coach: 'David Chen',  students: 8, planet: 'Chess' },
  { id: 20, date: '2026-05-16', day: 'Sat May 16', time: '4:00 PM', course: 'English · Grade 5',    location: 'Langley',      coach: 'Sarah Kim',   students: 6, planet: 'English' },
  { id: 21, date: '2026-05-16', day: 'Sat May 16', time: '11:00 AM', course: 'Math · Grade 5',      location: 'South Surrey', coach: null,          students: 5, planet: 'Math' },
];

const COACH_LIST = ['David Chen', 'Sarah Kim', 'Mike Patel', 'Emma Wilson', 'James Park', 'Priya Nair'];
const COACH_COLORS = {
  'David Chen': TLP.teal, 'Sarah Kim': TLP.purple, 'Mike Patel': TLP.blue,
  'Emma Wilson': '#e67e22', 'James Park': TLP.gray400, 'Priya Nair': TLP.green,
};

// Group dates into two weeks
const WEEK1_DATES = ['2026-05-04','2026-05-05','2026-05-06','2026-05-07','2026-05-08','2026-05-09'];
const WEEK2_DATES = ['2026-05-11','2026-05-12','2026-05-13','2026-05-14','2026-05-15','2026-05-16'];

function RosterScreen() {
  const [sessions, setSessions] = React.useState(ROSTER_SESSIONS);
  const [view, setView] = React.useState('list');       // 'list' | 'calendar' | 'coach'
  const [assignModal, setAssignModal] = React.useState(null); // session being assigned
  const [assignCoach, setAssignCoach] = React.useState('');
  const [filterLoc, setFilterLoc] = React.useState('All');
  const [week, setWeek] = React.useState(1);

  const weekDates = week === 1 ? WEEK1_DATES : WEEK2_DATES;
  const weekLabel = week === 1 ? 'Week of May 4–9, 2026' : 'Week of May 11–16, 2026';

  const unassigned = sessions.filter(s => !s.coach);

  const filtered = sessions.filter(s =>
    (filterLoc === 'All' || s.location === filterLoc) &&
    weekDates.includes(s.date)
  );

  const doAssign = () => {
    if (!assignCoach) return;
    setSessions(prev => prev.map(s => s.id === assignModal.id ? { ...s, coach: assignCoach } : s));
    setAssignModal(null);
    setAssignCoach('');
  };

  // ── List view ──────────────────────────────────────────────────────
  const ListView = () => {
    const byDate = weekDates.reduce((acc, d) => {
      const items = filtered.filter(s => s.date === d);
      if (items.length) acc[d] = items;
      return acc;
    }, {});

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {Object.entries(byDate).map(([date, items]) => (
          <div key={date}>
            <div style={{ fontSize: 12, fontWeight: 700, color: TLP.gray400, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>
              {items[0].day}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {items.sort((a, b) => a.time.localeCompare(b.time)).map(s => (
                <SessionRow key={s.id} session={s} onAssign={() => { setAssignModal(s); setAssignCoach(s.coach || ''); }} />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // ── Calendar grid view ─────────────────────────────────────────────
  const CalendarView = () => {
    const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return (
      <div style={{ overflowX: 'auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: `80px repeat(6, 1fr)`, gap: 1, background: TLP.gray200, borderRadius: 10, overflow: 'hidden', minWidth: 700 }}>
          {/* Header */}
          <div style={{ background: TLP.gray50, padding: '10px 12px' }} />
          {weekDates.map((d, i) => (
            <div key={d} style={{ background: TLP.gray50, padding: '10px 12px', textAlign: 'center' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: TLP.gray500 }}>{dayLabels[i]}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: TLP.navy }}>{d.slice(-2)}</div>
            </div>
          ))}
          {/* Location rows */}
          {['Langley', 'South Surrey', 'Maple Ridge'].map(loc => (
            <React.Fragment key={loc}>
              <div style={{ background: TLP.white, padding: '12px 10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: TLP.gray500, textAlign: 'center', lineHeight: 1.3 }}>
                {loc}
              </div>
              {weekDates.map(d => {
                const daySessions = sessions.filter(s => s.date === d && s.location === loc);
                return (
                  <div key={d} style={{ background: TLP.white, padding: 6, minHeight: 80, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {daySessions.map(s => (
                      <CalendarChip key={s.id} session={s} onAssign={() => { setAssignModal(s); setAssignCoach(s.coach || ''); }} />
                    ))}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };

  // ── By-coach view ──────────────────────────────────────────────────
  const CoachView = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {COACH_LIST.map(coachName => {
        const coachSessions = sessions.filter(s => s.coach === coachName && weekDates.includes(s.date));
        if (coachSessions.length === 0 && filterLoc !== 'All') return null;
        return (
          <Card key={coachName} style={{ overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: `1px solid ${TLP.gray100}`, background: TLP.gray50 }}>
              <Avatar name={coachName} size={34} color={COACH_COLORS[coachName] || TLP.teal} />
              <span style={{ fontWeight: 700, color: TLP.navy, fontSize: 14 }}>{coachName}</span>
              <Badge label={`${coachSessions.length} sessions`} color={TLP.gray600} bg={TLP.gray100} />
              {coachName === 'James Park' && <Badge label="On Leave" color={TLP.amber} bg={TLP.amberLight} />}
            </div>
            {coachSessions.length === 0 ? (
              <div style={{ padding: '14px 16px', fontSize: 13, color: TLP.gray400 }}>No sessions this week</div>
            ) : (
              <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                {coachSessions.sort((a,b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time)).map(s => (
                  <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 7, background: TLP.bg }}>
                    <div style={{ background: TLP.navy, color: '#fff', borderRadius: 6, padding: '3px 7px', fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' }}>{s.time}</div>
                    <span style={{ fontSize: 12, color: TLP.gray500, minWidth: 80 }}>{s.day.slice(0, 10)}</span>
                    <PlanetBadge planet={s.planet} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: TLP.navy, flex: 1 }}>{s.course}</span>
                    <span style={{ fontSize: 11, color: TLP.gray400 }}>📍 {s.location}</span>
                    <Badge label={`${s.students} students`} color={TLP.gray600} bg={TLP.gray100} />
                  </div>
                ))}
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ margin: '0 0 3px', fontSize: 22, fontWeight: 800, color: TLP.navy }}>Staff Roster</h1>
          <p style={{ margin: 0, fontSize: 13, color: TLP.gray500 }}>{weekLabel} · {sessions.filter(s => weekDates.includes(s.date)).length} sessions scheduled</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Btn variant="secondary" size="sm" icon="📥">Export CSV</Btn>
          <Btn variant="primary" size="sm" icon="➕">Add Session</Btn>
        </div>
      </div>

      {/* Alert: unassigned sessions */}
      {unassigned.filter(s => weekDates.includes(s.date)).length > 0 && (
        <div style={{ background: TLP.redLight, border: `1px solid #fed7d7`, borderRadius: 10, padding: '12px 16px', fontSize: 13, color: TLP.red, display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 16 }}>⚠️</span>
          <span><strong>{unassigned.filter(s => weekDates.includes(s.date)).length} sessions</strong> have no coach assigned this week. Assign coaches before the roster deadline.</span>
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        <StatCard label="Sessions This Week" value={sessions.filter(s => weekDates.includes(s.date)).length} icon="📋" color={TLP.tealLight} />
        <StatCard label="Assigned" value={sessions.filter(s => weekDates.includes(s.date) && s.coach).length} icon="✅" color={TLP.greenLight} />
        <StatCard label="Unassigned" value={unassigned.filter(s => weekDates.includes(s.date)).length} icon="⚠️" color={TLP.redLight} />
        <StatCard label="Total Students" value={sessions.filter(s => weekDates.includes(s.date)).reduce((s, r) => s + r.students, 0)} icon="👥" color={TLP.blueLight} />
      </div>

      {/* Controls row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        {/* Week nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={() => setWeek(1)} disabled={week === 1} style={{ width: 30, height: 30, borderRadius: 7, border: `1px solid ${TLP.gray200}`, background: TLP.white, cursor: week === 1 ? 'not-allowed' : 'pointer', fontSize: 14, opacity: week === 1 ? 0.4 : 1 }}>‹</button>
          <span style={{ fontSize: 13, fontWeight: 700, color: TLP.navy, minWidth: 180, textAlign: 'center' }}>{weekLabel}</span>
          <button onClick={() => setWeek(2)} disabled={week === 2} style={{ width: 30, height: 30, borderRadius: 7, border: `1px solid ${TLP.gray200}`, background: TLP.white, cursor: week === 2 ? 'not-allowed' : 'pointer', fontSize: 14, opacity: week === 2 ? 0.4 : 1 }}>›</button>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {/* Location filter */}
          <select value={filterLoc} onChange={e => setFilterLoc(e.target.value)} style={{ border: `1px solid ${TLP.gray200}`, borderRadius: 7, padding: '6px 10px', fontSize: 13, fontFamily: 'inherit', outline: 'none', background: TLP.white }}>
            {['All', 'Langley', 'South Surrey', 'Maple Ridge'].map(o => <option key={o}>{o}</option>)}
          </select>
          {/* View toggle */}
          <div style={{ display: 'flex', background: TLP.gray100, borderRadius: 8, padding: 3, gap: 2 }}>
            {[['list','☰ List'], ['calendar','⊞ Calendar'], ['coach','👤 By Coach']].map(([id, label]) => (
              <button key={id} onClick={() => setView(id)} style={{ padding: '5px 12px', borderRadius: 6, border: 'none', background: view === id ? TLP.white : 'transparent', color: view === id ? TLP.navy : TLP.gray500, fontWeight: view === id ? 700 : 500, cursor: 'pointer', fontSize: 12, fontFamily: 'inherit', boxShadow: view === id ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', transition: 'all 0.15s' }}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Views */}
      {view === 'list' && <ListView />}
      {view === 'calendar' && <CalendarView />}
      {view === 'coach' && <CoachView />}

      {/* Assign Coach Modal */}
      <Modal open={!!assignModal} onClose={() => setAssignModal(null)} title="Assign Coach" width={440}>
        {assignModal && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: TLP.bg, borderRadius: 9, padding: '12px 14px' }}>
              <div style={{ fontWeight: 700, color: TLP.navy, fontSize: 14, marginBottom: 4 }}>{assignModal.course}</div>
              <div style={{ fontSize: 13, color: TLP.gray500 }}>{assignModal.day} · {assignModal.time} · {assignModal.location}</div>
              <div style={{ fontSize: 12, color: TLP.gray500, marginTop: 2 }}>{assignModal.students} students enrolled</div>
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: TLP.gray700, display: 'block', marginBottom: 10 }}>Select Coach</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {COACH_LIST.map(name => {
                  const isOnLeave = name === 'James Park';
                  const isSelected = assignCoach === name;
                  return (
                    <div key={name} onClick={() => !isOnLeave && setAssignCoach(name)}
                      style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 9, border: `2px solid ${isSelected ? TLP.teal : TLP.gray200}`, background: isSelected ? TLP.tealLight : isOnLeave ? TLP.gray50 : TLP.white, cursor: isOnLeave ? 'not-allowed' : 'pointer', opacity: isOnLeave ? 0.5 : 1, transition: 'all 0.15s' }}>
                      <Avatar name={name} size={32} color={COACH_COLORS[name] || TLP.teal} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 13, color: TLP.navy }}>{name}</div>
                        {isOnLeave && <div style={{ fontSize: 11, color: TLP.amber }}>On Leave</div>}
                      </div>
                      {isSelected && <span style={{ color: TLP.teal, fontSize: 16 }}>✓</span>}
                    </div>
                  );
                })}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <Btn variant="secondary" onClick={() => setAssignModal(null)}>Cancel</Btn>
              <Btn variant="primary" disabled={!assignCoach} onClick={doAssign}>Assign Coach</Btn>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

// ── Session row (list view) ────────────────────────────────────────
function SessionRow({ session: s, onAssign }) {
  const hasCoach = !!s.coach;
  return (
    <Card style={{ padding: '12px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        {/* Time badge */}
        <div style={{ background: TLP.navy, color: '#fff', borderRadius: 7, padding: '4px 10px', fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap', flexShrink: 0 }}>{s.time}</div>
        {/* Course */}
        <PlanetBadge planet={s.planet} />
        <span style={{ fontSize: 14, fontWeight: 600, color: TLP.navy, flex: 1, minWidth: 160 }}>{s.course}</span>
        {/* Location */}
        <span style={{ fontSize: 12, color: TLP.gray500, whiteSpace: 'nowrap' }}>📍 {s.location}</span>
        {/* Students */}
        <Badge label={`${s.students} students`} color={TLP.gray600} bg={TLP.gray100} />
        {/* Coach chip */}
        {hasCoach ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: TLP.tealLight, borderRadius: 20, padding: '4px 10px', cursor: 'pointer' }} onClick={onAssign}>
            <Avatar name={s.coach} size={20} color={COACH_COLORS[s.coach] || TLP.teal} />
            <span style={{ fontSize: 12, fontWeight: 600, color: TLP.teal }}>{s.coach}</span>
            <span style={{ fontSize: 10, color: TLP.teal, opacity: 0.6 }}>✎</span>
          </div>
        ) : (
          <button onClick={onAssign} style={{ display: 'flex', alignItems: 'center', gap: 5, background: TLP.redLight, border: `1.5px dashed ${TLP.red}`, borderRadius: 20, padding: '4px 10px', cursor: 'pointer', color: TLP.red, fontSize: 12, fontWeight: 700, fontFamily: 'inherit' }}>
            ⚠️ Assign Coach
          </button>
        )}
      </div>
    </Card>
  );
}

// ── Calendar chip ──────────────────────────────────────────────────
function CalendarChip({ session: s, onAssign }) {
  const p = PLANETS[s.planet] || { color: TLP.teal, bg: TLP.tealLight };
  return (
    <div onClick={onAssign} style={{ borderRadius: 6, padding: '4px 7px', background: s.coach ? p.bg : TLP.redLight, border: `1.5px solid ${s.coach ? p.color + '60' : TLP.red + '60'}`, cursor: 'pointer', transition: 'all 0.12s' }}
      onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
      onMouseLeave={e => e.currentTarget.style.opacity = '1'}
    >
      <div style={{ fontSize: 10, fontWeight: 700, color: s.coach ? p.color : TLP.red }}>{s.time}</div>
      <div style={{ fontSize: 11, fontWeight: 600, color: TLP.navy, lineHeight: 1.3 }}>{s.course.split(' · ')[0]}</div>
      {s.coach ? (
        <div style={{ fontSize: 10, color: TLP.gray500, marginTop: 2 }}>{s.coach.split(' ')[0]}</div>
      ) : (
        <div style={{ fontSize: 10, color: TLP.red, fontWeight: 700 }}>Unassigned</div>
      )}
    </div>
  );
}

Object.assign(window, { RosterScreen });
