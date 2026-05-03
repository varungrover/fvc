
// ─── COACHES SCREEN ────────────────────────────────────────────────

const COACHES_FULL = [
  {
    id: 1, name: 'David Chen', email: 'dchen@tlp.ca', phone: '604-555-0121',
    location: 'Langley', planets: ['Chess', 'Math'], status: 'Active',
    joined: 'Sep 2022', students: 18, sessionsThisWeek: 4,
    availability: [true, false, true, false, false, true, false],
    upcomingSessions: [
      { day: 'Mon May 5', time: '5:00 PM', course: 'Chess · Intermediate', students: 5 },
      { day: 'Mon May 5', time: '6:00 PM', course: 'Chess · Beginner', students: 4 },
      { day: 'Sat May 10', time: '3:00 PM', course: 'Chess · Beginner', students: 8 },
      { day: 'Sat May 10', time: '5:00 PM', course: 'Math · Grade 5', students: 6 },
    ],
    color: TLP.teal,
  },
  {
    id: 2, name: 'Sarah Kim', email: 'skim@tlp.ca', phone: '604-555-0184',
    location: 'Langley', planets: ['English', 'Arts'], status: 'Active',
    joined: 'Jan 2023', students: 14, sessionsThisWeek: 3,
    availability: [true, false, false, true, false, true, false],
    upcomingSessions: [
      { day: 'Mon May 5', time: '6:00 PM', course: 'English · Grade 4', students: 5 },
      { day: 'Thu May 8', time: '5:00 PM', course: 'Arts · Beginner', students: 7 },
      { day: 'Sat May 10', time: '4:00 PM', course: 'English · Grade 5', students: 6 },
    ],
    color: TLP.purple,
  },
  {
    id: 3, name: 'Mike Patel', email: 'mpatel@tlp.ca', phone: '604-555-0237',
    location: 'South Surrey', planets: ['Chess'], status: 'Active',
    joined: 'Mar 2023', students: 12, sessionsThisWeek: 2,
    availability: [false, true, true, false, false, true, false],
    upcomingSessions: [
      { day: 'Tue May 6', time: '6:00 PM', course: 'Chess · Advanced', students: 3 },
      { day: 'Wed May 7', time: '5:00 PM', course: 'Chess · Intermediate', students: 6 },
    ],
    color: TLP.blue,
  },
  {
    id: 4, name: 'Emma Wilson', email: 'ewilson@tlp.ca', phone: '604-555-0198',
    location: 'South Surrey', planets: ['Math', 'Finance'], status: 'Active',
    joined: 'Jun 2023', students: 16, sessionsThisWeek: 3,
    availability: [true, false, true, false, true, false, false],
    upcomingSessions: [
      { day: 'Mon May 5', time: '5:00 PM', course: 'Math · Grade 6', students: 5 },
      { day: 'Wed May 7', time: '6:00 PM', course: 'Finance · Junior', students: 6 },
      { day: 'Fri May 9', time: '4:00 PM', course: 'Math · Grade 7', students: 5 },
    ],
    color: TLP.amber,
  },
  {
    id: 5, name: 'James Park', email: 'jpark@tlp.ca', phone: '604-555-0312',
    location: 'Maple Ridge', planets: ['Chess', 'Business'], status: 'On Leave',
    joined: 'Nov 2021', students: 0, sessionsThisWeek: 0,
    availability: [false, false, false, false, false, false, false],
    upcomingSessions: [],
    color: TLP.gray400,
  },
  {
    id: 6, name: 'Priya Nair', email: 'pnair@tlp.ca', phone: '604-555-0456',
    location: 'Maple Ridge', planets: ['Arts', 'English'], status: 'Active',
    joined: 'Feb 2024', students: 9, sessionsThisWeek: 2,
    availability: [false, false, false, true, false, true, false],
    upcomingSessions: [
      { day: 'Thu May 8', time: '6:00 PM', course: 'Arts · Intermediate', students: 5 },
      { day: 'Sat May 10', time: '2:00 PM', course: 'English · Grade 3', students: 4 },
    ],
    color: TLP.green,
  },
];

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const AVATAR_COLORS = [TLP.teal, TLP.purple, TLP.blue, '#e67e22', TLP.gray400, TLP.green];

function CoachesScreen() {
  const [selected, setSelected] = React.useState(null);
  const [showCreate, setShowCreate] = React.useState(false);
  const [filterLoc, setFilterLoc] = React.useState('All');
  const [filterStatus, setFilterStatus] = React.useState('All');
  const [form, setForm] = React.useState({ name: '', email: '', phone: '', location: '', planets: [] });
  const [sent, setSent] = React.useState(false);

  const filtered = COACHES_FULL.filter(c =>
    (filterLoc === 'All' || c.location === filterLoc) &&
    (filterStatus === 'All' || c.status === filterStatus)
  );

  const coach = selected ? COACHES_FULL.find(c => c.id === selected) : null;

  const togglePlanet = (p) => {
    setForm(f => ({
      ...f,
      planets: f.planets.includes(p) ? f.planets.filter(x => x !== p) : [...f.planets, p]
    }));
  };

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: '0 0 3px', fontSize: 22, fontWeight: 800, color: TLP.navy }}>Coaches</h1>
          <p style={{ margin: 0, fontSize: 13, color: TLP.gray500 }}>{COACHES_FULL.filter(c => c.status === 'Active').length} active · {COACHES_FULL.length} total</p>
        </div>
        <Btn variant="primary" icon="➕" onClick={() => { setShowCreate(true); setSent(false); }}>Add Coach</Btn>
      </div>

      {/* Stats strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        <StatCard label="Total Coaches" value={COACHES_FULL.length} icon="👨‍🏫" color={TLP.blueLight} />
        <StatCard label="Active" value={COACHES_FULL.filter(c => c.status === 'Active').length} icon="✅" color={TLP.greenLight} />
        <StatCard label="On Leave" value={COACHES_FULL.filter(c => c.status === 'On Leave').length} icon="🏖️" color={TLP.amberLight} />
        <StatCard label="Sessions This Week" value={COACHES_FULL.reduce((s, c) => s + c.sessionsThisWeek, 0)} icon="📋" color={TLP.tealLight} />
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <span style={{ fontSize: 13, color: TLP.gray500 }}>Filter:</span>
        <select value={filterLoc} onChange={e => setFilterLoc(e.target.value)} style={{ border: `1px solid ${TLP.gray200}`, borderRadius: 7, padding: '6px 10px', fontSize: 13, fontFamily: 'inherit', outline: 'none', background: TLP.white }}>
          {['All', 'Langley', 'South Surrey', 'Maple Ridge'].map(o => <option key={o}>{o}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ border: `1px solid ${TLP.gray200}`, borderRadius: 7, padding: '6px 10px', fontSize: 13, fontFamily: 'inherit', outline: 'none', background: TLP.white }}>
          {['All', 'Active', 'On Leave'].map(o => <option key={o}>{o}</option>)}
        </select>
      </div>

      {/* Main grid: list + detail */}
      <div style={{ display: 'grid', gridTemplateColumns: coach ? '320px 1fr' : '1fr', gap: 16 }}>

        {/* Coach list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(c => {
            const isSelected = selected === c.id;
            return (
              <Card key={c.id} hover onClick={() => setSelected(isSelected ? null : c.id)}
                style={{ padding: '14px 16px', border: `2px solid ${isSelected ? TLP.teal : TLP.gray100}`, transition: 'all 0.15s' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Avatar name={c.name} size={44} color={c.color} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, color: TLP.navy, fontSize: 14, marginBottom: 2 }}>{c.name}</div>
                    <div style={{ fontSize: 12, color: TLP.gray500, marginBottom: 5 }}>📍 {c.location}</div>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {c.planets.map(p => <PlanetBadge key={p} planet={p} />)}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5 }}>
                    <Badge
                      label={c.status}
                      color={c.status === 'Active' ? TLP.green : TLP.amber}
                      bg={c.status === 'Active' ? TLP.greenLight : TLP.amberLight}
                    />
                    {c.status === 'Active' && (
                      <span style={{ fontSize: 11, color: TLP.gray400 }}>{c.students} students</span>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Coach detail panel */}
        {coach && (
          <Card style={{ overflow: 'hidden', alignSelf: 'start' }}>
            {/* Detail header */}
            <div style={{ background: `linear-gradient(135deg, ${TLP.navy} 0%, ${TLP.navyLight} 100%)`, padding: '24px 28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <Avatar name={coach.name} size={56} color={coach.color} />
                  <div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginBottom: 3 }}>{coach.name}</div>
                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', marginBottom: 6 }}>Coach · {coach.location} · Since {coach.joined}</div>
                    <Badge
                      label={coach.status}
                      color={coach.status === 'Active' ? TLP.teal : TLP.amber}
                      bg="rgba(255,255,255,0.15)"
                      size="md"
                    />
                  </div>
                </div>
                <button onClick={() => setSelected(null)} style={{ background: 'rgba(255,255,255,0.12)', border: 'none', color: '#fff', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
              </div>
            </div>

            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* Contact info */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: TLP.gray400, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>Contact</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {[
                    { icon: '✉️', label: 'Email', value: coach.email },
                    { icon: '📱', label: 'Phone', value: coach.phone },
                    { icon: '📍', label: 'Location', value: coach.location },
                    { icon: '👥', label: 'Students', value: `${coach.students} enrolled` },
                  ].map(item => (
                    <div key={item.label} style={{ background: TLP.bg, borderRadius: 8, padding: '10px 12px' }}>
                      <div style={{ fontSize: 11, color: TLP.gray400, marginBottom: 3 }}>{item.icon} {item.label}</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: TLP.navy }}>{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Planets */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: TLP.gray400, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>Teaching Planets</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {coach.planets.map(p => <PlanetBadge key={p} planet={p} size="md" />)}
                </div>
              </div>

              {/* Weekly availability */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: TLP.gray400, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>Weekly Availability</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
                  {DAYS.map((day, i) => (
                    <div key={day} style={{ borderRadius: 8, border: `1.5px solid ${coach.availability[i] ? TLP.teal : TLP.gray200}`, background: coach.availability[i] ? TLP.tealLight : TLP.gray50, padding: '8px 4px', textAlign: 'center' }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: coach.availability[i] ? TLP.teal : TLP.gray400 }}>{day}</div>
                      <div style={{ fontSize: 14, marginTop: 2 }}>{coach.availability[i] ? '✓' : '—'}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Upcoming sessions */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: TLP.gray400, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>Upcoming Sessions</div>
                {coach.upcomingSessions.length === 0 ? (
                  <div style={{ background: TLP.bg, borderRadius: 8, padding: '16px', textAlign: 'center', color: TLP.gray400, fontSize: 13 }}>
                    No sessions scheduled
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {coach.upcomingSessions.map((s, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: TLP.bg, borderRadius: 8 }}>
                        <div style={{ background: TLP.navy, color: '#fff', borderRadius: 7, padding: '5px 9px', fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' }}>{s.time}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: TLP.navy }}>{s.course}</div>
                          <div style={{ fontSize: 11, color: TLP.gray500 }}>{s.day}</div>
                        </div>
                        <Badge label={`${s.students} students`} color={TLP.gray600} bg={TLP.gray100} />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 8, paddingTop: 4, borderTop: `1px solid ${TLP.gray100}` }}>
                <Btn variant="secondary" style={{ flex: 1 }}>Edit Profile</Btn>
                <Btn variant="primary" style={{ flex: 1 }}>Assign Session</Btn>
                {coach.status === 'Active'
                  ? <Btn variant="ghost" style={{ color: TLP.red }}>Mark On Leave</Btn>
                  : <Btn variant="ghost" style={{ color: TLP.green }}>Reinstate</Btn>
                }
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Create Coach Modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create Coach Account" width={520}>
        {sent ? (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
            <h3 style={{ color: TLP.navy, margin: '0 0 8px' }}>Account Created!</h3>
            <p style={{ color: TLP.gray500, fontSize: 14 }}>A temporary password has been sent to <strong>{form.email}</strong>. They'll be prompted to set a new password on first login.</p>
            <div style={{ marginTop: 20 }}>
              <Btn variant="primary" onClick={() => setShowCreate(false)}>Done</Btn>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Input label="Full Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required placeholder="e.g. David Chen" />
              <Input label="Phone" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="e.g. 604-555-0121" />
            </div>
            <Input label="Email Address" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required placeholder="e.g. dchen@tlp.ca" hint="A temporary password will be sent to this address" />
            <Select label="Primary Location" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} required
              options={[{ value: '', label: '— Select location —' }, 'Langley', 'South Surrey', 'Maple Ridge']} />
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: TLP.gray700, display: 'block', marginBottom: 8 }}>Teaching Planets</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {Object.entries(PLANETS).map(([name, p]) => {
                  const sel = form.planets.includes(name);
                  return (
                    <button key={name} onClick={() => togglePlanet(name)} style={{ padding: '6px 12px', borderRadius: 20, border: `2px solid ${sel ? p.color : TLP.gray200}`, background: sel ? p.bg : TLP.white, color: sel ? p.color : TLP.gray500, fontWeight: 600, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 5 }}>
                      <span>{p.icon}</span>{name}
                    </button>
                  );
                })}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
              <Btn variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Btn>
              <Btn variant="primary" disabled={!form.name || !form.email || !form.location}
                onClick={() => setSent(true)}>
                Create & Send Email
              </Btn>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

Object.assign(window, { CoachesScreen });
