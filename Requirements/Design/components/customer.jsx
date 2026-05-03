
// ─── CUSTOMER PORTAL ───────────────────────────────────────────────

const MEMBERS_DATA = [
  { id: 1, name: 'Aiden Sharma', dob: '2014-03-12', grade: '5', tshirt: 'M', cfcId: 'CFC-1042', color: TLP.teal, planets: ['Chess', 'Math'], avatar: TLP.teal },
  { id: 2, name: 'Priya Sharma', dob: '2016-07-22', grade: '3', tshirt: 'S', cfcId: '', color: TLP.purple, planets: ['Math', 'Arts'], avatar: TLP.purple },
];

const ENROLLMENTS_DATA = [
  { id: 1, memberId: 1, planet: 'Chess', level: 'Intermediate', freq: 'Weekly 2x', location: 'Langley', schedule: ['Mon 6pm', 'Wed 6pm'], monthlyFee: 199, status: 'Active', nextClass: 'Mon, May 5' },
  { id: 2, memberId: 1, planet: 'Math', level: 'Grade 5', freq: 'Weekly 1x', location: 'South Surrey', schedule: ['Sat 11am'], monthlyFee: 159, status: 'Active', nextClass: 'Sat, May 10' },
  { id: 3, memberId: 2, planet: 'Math', level: 'Grade 3', freq: 'Weekly 1x', location: 'South Surrey', schedule: ['Sat 12pm'], monthlyFee: 159, status: 'Active', nextClass: 'Sat, May 10' },
  { id: 4, memberId: 2, planet: 'Arts', level: 'Beginner', freq: 'Weekly 1x', location: 'Langley', schedule: ['Sat 3pm'], monthlyFee: 159, status: 'Paused', nextClass: '—' },
];

const INVOICES_DATA = [
  { id: 'INV-2604', date: 'Apr 1, 2026', amount: 358.00, tax: 17.90, status: 'Paid', members: ['Aiden Sharma', 'Priya Sharma'] },
  { id: 'INV-2503', date: 'Mar 1, 2026', amount: 358.00, tax: 17.90, status: 'Paid', members: ['Aiden Sharma', 'Priya Sharma'] },
  { id: 'INV-2402', date: 'Feb 1, 2026', amount: 199.00, tax: 9.95, status: 'Paid', members: ['Aiden Sharma'] },
  { id: 'INV-2401', date: 'Jan 1, 2026', amount: 199.00, tax: 9.95, status: 'Failed', members: ['Aiden Sharma'] },
];

const UPCOMING_EVENTS = [
  { id: 1, title: 'Langley Chess Tournament', date: 'May 17, 2026', location: 'Langley', type: 'Tournament', fee: 20 },
  { id: 2, title: 'Monthly Trivia Night — Maple Ridge', date: 'May 24, 2026', location: 'Maple Ridge', type: 'Trivia', fee: 0 },
  { id: 3, title: 'Math Summer Camp', date: 'Jul 7–11, 2026', location: 'South Surrey', type: 'Camp', fee: 299 },
];

// ── Customer Dashboard ──────────────────────────────────────────────
function CustomerDashboard({ onNavigate }) {
  const totalMonthly = ENROLLMENTS_DATA.filter(e => e.status === 'Active').reduce((s, e) => s + e.monthlyFee, 0);
  const activeEnroll = ENROLLMENTS_DATA.filter(e => e.status === 'Active').length;
  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Welcome */}
      <div style={{ background: `linear-gradient(135deg, ${TLP.navy} 0%, ${TLP.navyLight} 100%)`, borderRadius: 14, padding: '22px 28px', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 13, opacity: 0.7, marginBottom: 4 }}>Good morning 👋</div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>Welcome back, Raj!</h1>
          <p style={{ margin: '6px 0 0', fontSize: 13, opacity: 0.75 }}>2 members · {activeEnroll} active enrollments · CAD ${totalMonthly.toFixed(2)}/mo</p>
        </div>
        <Btn variant="amber" onClick={() => onNavigate('enroll')} icon="➕">Enroll in Course</Btn>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14 }}>
        <StatCard label="Active Enrollments" value={activeEnroll} icon="📚" color={TLP.tealLight} onClick={() => onNavigate('enrollments')} />
        <StatCard label="Monthly Total" value={`$${totalMonthly}`} delta="+GST applied" icon="💳" color={TLP.amberLight} onClick={() => onNavigate('payments')} />
        <StatCard label="Loyalty Points" value="847 pts" delta="Earn 1 pt per $1" icon="⭐" color="#fff8e1" />
        <StatCard label="Members" value={MEMBERS_DATA.length} icon="👨‍👩‍👧" color={TLP.blueLight} onClick={() => onNavigate('members')} />
      </div>

      {/* Main grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>
        {/* Members & schedules */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <SectionHeader title="My Members" action={<Btn variant="secondary" size="sm" onClick={() => onNavigate('members')}>Manage Members</Btn>} />
          {MEMBERS_DATA.map(m => {
            const memberEnroll = ENROLLMENTS_DATA.filter(e => e.memberId === m.id && e.status === 'Active');
            return (
              <Card key={m.id} style={{ padding: '16px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
                  <Avatar name={m.name} size={42} color={m.color} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, color: TLP.navy }}>{m.name}</div>
                    <div style={{ fontSize: 12, color: TLP.gray500 }}>Grade {m.grade} · DOB: ••/••/••••</div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {m.planets.map(p => <PlanetBadge key={p} planet={p} />)}
                  </div>
                </div>
                {memberEnroll.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {memberEnroll.map(e => (
                      <div key={e.id} style={{ background: TLP.bg, borderRadius: 8, padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: TLP.navy }}>{e.planet} · {e.level}</div>
                          <div style={{ fontSize: 11, color: TLP.gray500 }}>{e.location} · {e.schedule.join(', ')}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: TLP.teal }}>${e.monthlyFee}/mo</div>
                          <div style={{ fontSize: 11, color: TLP.gray500 }}>Next: {e.nextClass}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Upcoming Events */}
          <Card style={{ padding: '18px 20px' }}>
            <SectionHeader title="Upcoming Events" action={<Btn variant="ghost" size="sm">See all</Btn>} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {UPCOMING_EVENTS.map(ev => (
                <div key={ev.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: 10, borderBottom: `1px solid ${TLP.gray100}` }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: TLP.navy }}>{ev.title}</div>
                    <div style={{ fontSize: 11, color: TLP.gray500, marginTop: 2 }}>{ev.date} · {ev.location}</div>
                    <Badge label={ev.type} color={ev.type === 'Tournament' ? TLP.teal : ev.type === 'Camp' ? TLP.blue : TLP.purple} bg={ev.type === 'Tournament' ? TLP.tealLight : ev.type === 'Camp' ? TLP.blueLight : TLP.purpleLight} />
                  </div>
                  <Btn variant="secondary" size="sm" onClick={() => onNavigate('enroll-event')}>
                    {ev.fee === 0 ? 'Free' : `$${ev.fee}`}
                  </Btn>
                </div>
              ))}
            </div>
          </Card>

          {/* Recent Invoices */}
          <Card style={{ padding: '18px 20px' }}>
            <SectionHeader title="Recent Payments" action={<Btn variant="ghost" size="sm" onClick={() => onNavigate('payments')}>View all</Btn>} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {INVOICES_DATA.slice(0, 3).map(inv => (
                <div key={inv.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: TLP.navy }}>{inv.id}</div>
                    <div style={{ fontSize: 11, color: TLP.gray500 }}>{inv.date}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: TLP.navy }}>${(inv.amount + inv.tax).toFixed(2)}</span>
                    <Badge label={inv.status} color={inv.status === 'Paid' ? TLP.green : TLP.red} bg={inv.status === 'Paid' ? TLP.greenLight : TLP.redLight} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ── Member Management ──────────────────────────────────────────────
function MemberManagement() {
  const [showAdd, setShowAdd] = React.useState(false);
  const [members, setMembers] = React.useState(MEMBERS_DATA);
  const [form, setForm] = React.useState({ name: '', dob: '', grade: '', tshirt: 'M', cfcId: '', color: '' });
  const [selected, setSelected] = React.useState(null);

  const addMember = () => {
    if (!form.name) return;
    setMembers(prev => [...prev, { ...form, id: Date.now(), planets: [], color: TLP.blue, avatar: TLP.blue }]);
    setShowAdd(false);
    setForm({ name: '', dob: '', grade: '', tshirt: 'M', cfcId: '', color: '' });
  };

  return (
    <div style={{ padding: 24 }}>
      <SectionHeader
        title="Member Profiles"
        subtitle="Manage family members under your account"
        action={<Btn variant="primary" onClick={() => setShowAdd(true)} icon="➕">Add Member</Btn>}
      />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
        {members.map(m => (
          <Card key={m.id} hover style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
              <Avatar name={m.name} size={48} color={m.color} />
              <div>
                <div style={{ fontWeight: 700, fontSize: 16, color: TLP.navy }}>{m.name}</div>
                <div style={{ fontSize: 12, color: TLP.gray500 }}>Grade {m.grade}</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: TLP.gray500 }}>Date of Birth</span>
                <span style={{ color: TLP.gray700, fontWeight: 500 }}>••/••/••••</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: TLP.gray500 }}>T-Shirt Size</span>
                <span style={{ color: TLP.gray700, fontWeight: 500 }}>{m.tshirt}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: TLP.gray500 }}>CFC ID</span>
                <span style={{ color: TLP.gray700, fontWeight: 500 }}>{m.cfcId || '—'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: TLP.gray500 }}>Planets</span>
                <div style={{ display: 'flex', gap: 4 }}>{m.planets.map(p => <PlanetBadge key={p} planet={p} />)}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <Btn variant="secondary" size="sm" style={{ flex: 1 }}>Edit Profile</Btn>
              <Btn variant="primary" size="sm" style={{ flex: 1 }}>View Progress</Btn>
            </div>
          </Card>
        ))}
        {/* Add member card */}
        <div onClick={() => setShowAdd(true)} style={{
          border: `2px dashed ${TLP.gray200}`, borderRadius: 12,
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', gap: 8, padding: 40, cursor: 'pointer',
          color: TLP.gray400, transition: 'border-color 0.15s, color 0.15s',
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = TLP.teal; e.currentTarget.style.color = TLP.teal; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = TLP.gray200; e.currentTarget.style.color = TLP.gray400; }}
        >
          <span style={{ fontSize: 32 }}>➕</span>
          <span style={{ fontSize: 13, fontWeight: 600 }}>Add Member</span>
        </div>
      </div>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Member Profile">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Input label="Full Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required placeholder="e.g. Aiden Sharma" />
          <Input label="Date of Birth" type="date" value={form.dob} onChange={e => setForm(f => ({ ...f, dob: e.target.value }))} required />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Input label="Grade" value={form.grade} onChange={e => setForm(f => ({ ...f, grade: e.target.value }))} placeholder="e.g. 5" />
            <Select label="T-Shirt Size" value={form.tshirt} onChange={e => setForm(f => ({ ...f, tshirt: e.target.value }))} options={['XS', 'S', 'M', 'L', 'XL']} />
          </div>
          <Input label="CFC ID (optional)" value={form.cfcId} onChange={e => setForm(f => ({ ...f, cfcId: e.target.value }))} hint="Only required for Chess tournaments" placeholder="e.g. CFC-1234" />
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
            <Btn variant="secondary" onClick={() => setShowAdd(false)}>Cancel</Btn>
            <Btn variant="primary" onClick={addMember} disabled={!form.name}>Add Member</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ── Enrollment Flow ────────────────────────────────────────────────
const COURSE_CATALOG = {
  Chess: {
    levels: ['Beginner (PP)', 'Intermediate (RR)', 'Advanced (PR)', 'Tournament Prep'],
    locations: {
      Langley: { schedule: ['Mon 5pm', 'Mon 6pm', 'Wed 5pm', 'Wed 6pm', 'Sat 3pm', 'Sat 4pm', 'Sat 5pm'], capacity: [3, 8, 2, 6, 5, 4, 7] },
      'South Surrey': { schedule: ['Tue 6pm', 'Wed 6pm', 'Sat 11am', 'Sat 1pm'], capacity: [4, 3, 7, 5] },
    },
    pricing: { '1x': 159, '2x': 199, '3x': 229 },
  },
  Math: {
    levels: ['Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8'],
    locations: {
      Langley: { schedule: ['Mon 5pm', 'Sat 3pm', 'Sat 5pm'], capacity: [6, 4, 5] },
      'South Surrey': { schedule: ['Sat 11am', 'Sat 12pm', 'Tue 6pm'], capacity: [3, 5, 7] },
    },
    pricing: { '1x': 159, '2x': 199, '3x': 229 },
  },
  English: {
    levels: ['Grade 3', 'Grade 4', 'Grade 5', 'Grade 6'],
    locations: {
      Langley: { schedule: ['Mon 6pm', 'Sat 4pm'], capacity: [5, 6] },
      'South Surrey': { schedule: ['Wed 6pm', 'Sat 1pm'], capacity: [4, 7] },
    },
    pricing: { '1x': 159, '2x': 199 },
  },
  Finance: {
    levels: ['Junior (7-10)', 'Intermediate (11-13)', 'Senior (14-16)'],
    locations: {
      Langley: { schedule: ['Sat 3pm', 'Sat 5pm'], capacity: [8, 6] },
      'South Surrey': { schedule: ['Tue 7pm'], capacity: [5] },
    },
    pricing: { '1x': 159 },
  },
};

function EnrollmentFlow({ onDone }) {
  const [step, setStep] = React.useState(1);
  const [sel, setSel] = React.useState({ member: null, planet: '', level: '', location: '', freq: '', slots: [], card: '•••• 4521' });
  const totalSteps = 5;

  const price = sel.planet && sel.freq ? (COURSE_CATALOG[sel.planet]?.pricing?.[sel.freq] || 0) : 0;
  const gst = price * 0.05;
  const isFirstPurchase = sel.member?.id === 99; // simulate
  const setupFee = 25;

  const StepIndicator = () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 28 }}>
      {['Member', 'Planet & Level', 'Location', 'Schedule', 'Payment'].map((s, i) => (
        <React.Fragment key={s}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{
              width: 30, height: 30, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: i + 1 < step ? TLP.teal : i + 1 === step ? TLP.navy : TLP.gray200,
              color: i + 1 <= step ? '#fff' : TLP.gray500, fontSize: 13, fontWeight: 700,
            }}>{i + 1 < step ? '✓' : i + 1}</div>
            <span style={{ fontSize: 10, color: i + 1 === step ? TLP.navy : TLP.gray400, fontWeight: i + 1 === step ? 700 : 400, whiteSpace: 'nowrap' }}>{s}</span>
          </div>
          {i < 4 && <div style={{ flex: 1, height: 2, background: i + 1 < step ? TLP.teal : TLP.gray200, marginBottom: 14, minWidth: 20 }} />}
        </React.Fragment>
      ))}
    </div>
  );

  const step1 = (
    <div>
      <h3 style={{ margin: '0 0 16px', color: TLP.navy }}>Select Member</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {MEMBERS_DATA.map(m => (
          <div key={m.id} onClick={() => setSel(s => ({ ...s, member: m }))}
            style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderRadius: 10, border: `2px solid ${sel.member?.id === m.id ? TLP.teal : TLP.gray200}`, cursor: 'pointer', background: sel.member?.id === m.id ? TLP.tealLight : TLP.white, transition: 'all 0.15s' }}>
            <Avatar name={m.name} size={38} color={m.color} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: TLP.navy }}>{m.name}</div>
              <div style={{ fontSize: 12, color: TLP.gray500 }}>Grade {m.grade}</div>
            </div>
            {sel.member?.id === m.id && <span style={{ color: TLP.teal, fontSize: 18 }}>✓</span>}
          </div>
        ))}
      </div>
    </div>
  );

  const step2 = (
    <div>
      <h3 style={{ margin: '0 0 16px', color: TLP.navy }}>Choose Planet & Level</h3>
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 13, fontWeight: 600, color: TLP.gray700, display: 'block', marginBottom: 8 }}>Planet <span style={{ color: TLP.red }}>*</span></label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {Object.entries(PLANETS).map(([name, p]) => (
            <div key={name} onClick={() => setSel(s => ({ ...s, planet: name, level: '', freq: '' }))}
              style={{ padding: '12px', borderRadius: 10, border: `2px solid ${sel.planet === name ? p.color : TLP.gray200}`, cursor: 'pointer', textAlign: 'center', background: sel.planet === name ? p.bg : TLP.white, transition: 'all 0.15s' }}>
              <div style={{ fontSize: 22, marginBottom: 4 }}>{p.icon}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: sel.planet === name ? p.color : TLP.gray700 }}>{name}</div>
            </div>
          ))}
        </div>
      </div>
      {sel.planet && COURSE_CATALOG[sel.planet] && (
        <>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: TLP.gray700, display: 'block', marginBottom: 8 }}>Level <span style={{ color: TLP.red }}>*</span></label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
              {COURSE_CATALOG[sel.planet].levels.map(l => {
                const p = PLANETS[sel.planet] || { color: TLP.teal, bg: TLP.tealLight };
                const isSelected = sel.level === l;
                return (
                  <div key={l} onClick={() => setSel(s => ({ ...s, level: l }))}
                    style={{ padding: '10px 14px', borderRadius: 10, border: `2px solid ${isSelected ? p.color : TLP.gray200}`, cursor: 'pointer', background: isSelected ? p.bg : TLP.white, transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: isSelected ? p.color : TLP.gray300, flexShrink: 0, transition: 'background 0.15s' }} />
                    <span style={{ fontSize: 13, fontWeight: isSelected ? 700 : 500, color: isSelected ? p.color : TLP.gray700 }}>{l}</span>
                    {isSelected && <span style={{ marginLeft: 'auto', color: p.color, fontSize: 13 }}>✓</span>}
                  </div>
                );
              })}
            </div>
          </div>
          <div style={{ marginTop: 14 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: TLP.gray700, display: 'block', marginBottom: 8 }}>Frequency</label>
            <div style={{ display: 'flex', gap: 10 }}>
              {Object.entries(COURSE_CATALOG[sel.planet].pricing).map(([freq, pr]) => (
                <div key={freq} onClick={() => setSel(s => ({ ...s, freq }))}
                  style={{ flex: 1, padding: '12px', borderRadius: 10, border: `2px solid ${sel.freq === freq ? TLP.navy : TLP.gray200}`, cursor: 'pointer', textAlign: 'center', background: sel.freq === freq ? TLP.navy : TLP.white, transition: 'all 0.15s' }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: sel.freq === freq ? '#fff' : TLP.navy }}>${pr}</div>
                  <div style={{ fontSize: 11, color: sel.freq === freq ? 'rgba(255,255,255,0.7)' : TLP.gray500, marginTop: 2 }}>Weekly {freq}/mo</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );

  const step3 = (
    <div>
      <h3 style={{ margin: '0 0 16px', color: TLP.navy }}>Choose Location</h3>
      {sel.planet && COURSE_CATALOG[sel.planet] ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {Object.keys(COURSE_CATALOG[sel.planet].locations).map(loc => (
            <div key={loc} onClick={() => setSel(s => ({ ...s, location: loc, slots: [] }))}
              style={{ padding: '16px', borderRadius: 10, border: `2px solid ${sel.location === loc ? TLP.teal : TLP.gray200}`, cursor: 'pointer', background: sel.location === loc ? TLP.tealLight : TLP.white, transition: 'all 0.15s' }}>
              <div style={{ fontWeight: 700, color: TLP.navy, marginBottom: 4 }}>{loc}</div>
              <div style={{ fontSize: 12, color: TLP.gray500 }}>FV Chess Academy · {COURSE_CATALOG[sel.planet].locations[loc].schedule.length} time slots available</div>
            </div>
          ))}
        </div>
      ) : <p style={{ color: TLP.gray500 }}>Please select a planet first.</p>}
    </div>
  );

  const step4 = () => {
    if (!sel.planet || !sel.location) return <p style={{ color: TLP.gray500 }}>Please complete previous steps.</p>;
    const locData = COURSE_CATALOG[sel.planet]?.locations?.[sel.location];
    if (!locData) return null;
    const freqNum = parseInt(sel.freq);
    return (
      <div>
        <h3 style={{ margin: '0 0 6px', color: TLP.navy }}>Pick Weekly Slots</h3>
        <p style={{ margin: '0 0 16px', fontSize: 13, color: TLP.gray500 }}>Select {freqNum || 1} time slot{(freqNum || 1) > 1 ? 's' : ''} per week</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
          {locData.schedule.map((slot, i) => {
            const isSelected = sel.slots.includes(slot);
            const spots = locData.capacity[i];
            return (
              <div key={slot} onClick={() => {
                if (isSelected) setSel(s => ({ ...s, slots: s.slots.filter(x => x !== slot) }));
                else if (sel.slots.length < (freqNum || 1)) setSel(s => ({ ...s, slots: [...s.slots, slot] }));
              }}
                style={{ padding: '12px 14px', borderRadius: 10, border: `2px solid ${isSelected ? TLP.teal : TLP.gray200}`, cursor: spots > 0 ? 'pointer' : 'not-allowed', background: isSelected ? TLP.tealLight : spots === 0 ? TLP.gray50 : TLP.white, opacity: spots === 0 ? 0.5 : 1, transition: 'all 0.15s' }}>
                <div style={{ fontWeight: 600, color: TLP.navy, fontSize: 14 }}>{slot}</div>
                <div style={{ fontSize: 11, color: spots <= 2 ? TLP.red : TLP.gray500, marginTop: 2 }}>{spots} spots left</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const step5 = (
    <div>
      <h3 style={{ margin: '0 0 16px', color: TLP.navy }}>Review & Pay</h3>
      <Card style={{ padding: '18px', marginBottom: 16, background: TLP.bg }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: TLP.gray500 }}>Member</span>
            <span style={{ fontWeight: 600 }}>{sel.member?.name}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: TLP.gray500 }}>Course</span>
            <span style={{ fontWeight: 600 }}>{sel.planet} · {sel.level}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: TLP.gray500 }}>Location</span>
            <span style={{ fontWeight: 600 }}>{sel.location}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: TLP.gray500 }}>Schedule</span>
            <span style={{ fontWeight: 600 }}>{sel.slots.join(', ')}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: TLP.gray500 }}>Frequency</span>
            <span style={{ fontWeight: 600 }}>Weekly {sel.freq}</span>
          </div>
          <div style={{ height: 1, background: TLP.gray200, margin: '4px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: TLP.gray500 }}>Monthly fee</span>
            <span style={{ fontWeight: 600 }}>${price.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: TLP.gray500 }}>GST (5%)</span>
            <span style={{ fontWeight: 600 }}>${gst.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 6, borderTop: `1px solid ${TLP.gray200}` }}>
            <span style={{ fontWeight: 700, color: TLP.navy }}>Total / month</span>
            <span style={{ fontWeight: 800, color: TLP.navy, fontSize: 16 }}>${(price + gst).toFixed(2)} CAD</span>
          </div>
        </div>
      </Card>
      <div style={{ marginBottom: 14 }}>
        <label style={{ fontSize: 13, fontWeight: 600, color: TLP.gray700, display: 'block', marginBottom: 8 }}>Payment Method</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderRadius: 10, border: `2px solid ${TLP.teal}`, background: TLP.tealLight }}>
          <span style={{ fontSize: 20 }}>💳</span>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14, color: TLP.navy }}>Visa ending in 4521</div>
            <div style={{ fontSize: 11, color: TLP.gray500 }}>Charged on 1st of each month</div>
          </div>
          <Btn variant="ghost" size="sm" style={{ marginLeft: 'auto' }}>Change</Btn>
        </div>
      </div>
      <div style={{ background: TLP.amberLight, borderRadius: 8, padding: '10px 14px', fontSize: 12, color: TLP.gray700, display: 'flex', gap: 8 }}>
        <span>ℹ️</span>
        <span>By enrolling, you agree to the 15-day cancellation notice policy. You can cancel at any time from your account.</span>
      </div>
    </div>
  );

  const steps = [step1, step2, step3, step4(), step5];
  const canNext = [
    !!sel.member,
    !!(sel.planet && sel.level && sel.freq),
    !!sel.location,
    sel.slots.length > 0,
    true,
  ];

  return (
    <div style={{ padding: 24, maxWidth: 680, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <Btn variant="secondary" size="sm" onClick={onDone}>← Back</Btn>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: TLP.navy }}>Enroll in a Course</h2>
      </div>
      <Card style={{ padding: '28px 32px' }}>
        <StepIndicator />
        {steps[step - 1]}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
          <Btn variant="secondary" onClick={() => step > 1 ? setStep(s => s - 1) : onDone()} disabled={false}>
            {step === 1 ? 'Cancel' : '← Back'}
          </Btn>
          {step < totalSteps ? (
            <Btn variant="primary" onClick={() => setStep(s => s + 1)} disabled={!canNext[step - 1]}>
              Continue →
            </Btn>
          ) : (
            <Btn variant="amber" onClick={onDone} disabled={!canNext[step - 1]} icon="✓">
              Confirm Enrollment
            </Btn>
          )}
        </div>
      </Card>
    </div>
  );
}

// ── Payment History ────────────────────────────────────────────────
function PaymentHistory() {
  const [showCard, setShowCard] = React.useState(false);

  return (
    <div style={{ padding: 24 }}>
      <SectionHeader
        title="Billing & Payments"
        subtitle="CAD · GST included"
        action={<Btn variant="primary" size="sm" onClick={() => setShowCard(true)} icon="➕">Add Payment Method</Btn>}
      />

      {/* Cards on file */}
      <Card style={{ padding: '18px 20px', marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: TLP.gray500, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>Payment Methods</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { type: 'Visa', last4: '4521', expiry: '09/28', isDefault: true },
            { type: 'Mastercard', last4: '8832', expiry: '02/27', isDefault: false },
          ].map(card => (
            <div key={card.last4} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 9, border: `1.5px solid ${card.isDefault ? TLP.teal : TLP.gray200}`, background: card.isDefault ? TLP.tealLight : TLP.white }}>
              <span style={{ fontSize: 22 }}>💳</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14, color: TLP.navy }}>{card.type} •••• {card.last4}</div>
                <div style={{ fontSize: 12, color: TLP.gray500 }}>Expires {card.expiry}</div>
              </div>
              {card.isDefault && <Badge label="Default" color={TLP.teal} bg={TLP.tealLight} />}
              {!card.isDefault && <Btn variant="ghost" size="sm">Set default</Btn>}
            </div>
          ))}
        </div>
      </Card>

      {/* Invoice table */}
      <Card style={{ overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${TLP.gray100}` }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: TLP.navy }}>Invoice History</div>
        </div>
        <div>
          {/* Header */}
          <div style={{ display: 'grid', gridTemplateColumns: '120px 120px 1fr 120px 80px 80px', padding: '10px 20px', background: TLP.gray50, fontSize: 11, fontWeight: 700, color: TLP.gray500, textTransform: 'uppercase', letterSpacing: '0.4px', gap: 8 }}>
            <span>Invoice #</span><span>Date</span><span>Members</span><span>Amount</span><span>Tax</span><span>Status</span>
          </div>
          {INVOICES_DATA.map((inv, i) => (
            <div key={inv.id} style={{ display: 'grid', gridTemplateColumns: '120px 120px 1fr 120px 80px 80px', padding: '13px 20px', fontSize: 13, color: TLP.gray700, gap: 8, borderBottom: i < INVOICES_DATA.length - 1 ? `1px solid ${TLP.gray100}` : 'none', alignItems: 'center', cursor: 'pointer', transition: 'background 0.1s' }}
              onMouseEnter={e => e.currentTarget.style.background = TLP.gray50}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <span style={{ fontWeight: 600, color: TLP.teal }}>{inv.id}</span>
              <span>{inv.date}</span>
              <span style={{ color: TLP.gray600 }}>{inv.members.join(', ')}</span>
              <span style={{ fontWeight: 700, color: TLP.navy }}>${inv.amount.toFixed(2)}</span>
              <span>${inv.tax.toFixed(2)}</span>
              <Badge label={inv.status} color={inv.status === 'Paid' ? TLP.green : TLP.red} bg={inv.status === 'Paid' ? TLP.greenLight : TLP.redLight} />
            </div>
          ))}
        </div>
      </Card>

      <Modal open={showCard} onClose={() => setShowCard(false)} title="Add Payment Method">
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>🔒</div>
          <p style={{ color: TLP.gray600, fontSize: 14 }}>You'll be redirected to Stripe's secure payment page to add your card details.</p>
          <Btn variant="primary" onClick={() => setShowCard(false)}>Continue to Stripe →</Btn>
        </div>
      </Modal>
    </div>
  );
}

Object.assign(window, { CustomerDashboard, MemberManagement, EnrollmentFlow, PaymentHistory });
