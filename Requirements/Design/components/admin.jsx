
// ─── ADMIN PORTAL ──────────────────────────────────────────────────

const ADMIN_STATS = {
  totalStudents: 142,
  activeEnrollments: 218,
  monthlyRevenue: 34812,
  pendingPayments: 5,
  locations: 3,
  coaches: 8,
};

const LOCATIONS_DATA = [
  { id: 1, name: 'Langley', address: '20486 64 Ave, Unit #108, Langley, BC', ownership: 'Corporate', students: 67, coaches: 3, planets: ['Chess', 'Math', 'English', 'Finance', 'Arts', 'Business'] },
  { id: 2, name: 'South Surrey', address: '15210 32nd Ave, Unit #105, Surrey, BC', ownership: 'Corporate', students: 48, coaches: 3, planets: ['Chess', 'Math', 'English', 'Finance', 'Arts'] },
  { id: 3, name: 'Maple Ridge', address: '20145 Stewart Crescent, Unit #106, Maple Ridge, BC', ownership: 'Franchisee', students: 27, coaches: 2, planets: ['Chess', 'Finance', 'Arts', 'Business'] },
];

const COACHES_DATA = [
  { id: 1, name: 'David Chen', email: 'dchen@tlp.ca', location: 'Langley', planets: ['Chess', 'Math'], status: 'Active' },
  { id: 2, name: 'Sarah Kim', email: 'skim@tlp.ca', location: 'Langley', planets: ['English', 'Arts'], status: 'Active' },
  { id: 3, name: 'Mike Patel', email: 'mpatel@tlp.ca', location: 'South Surrey', planets: ['Chess'], status: 'Active' },
  { id: 4, name: 'Emma Wilson', email: 'ewilson@tlp.ca', location: 'South Surrey', planets: ['Math', 'Finance'], status: 'Active' },
  { id: 5, name: 'James Park', email: 'jpark@tlp.ca', location: 'Maple Ridge', planets: ['Chess', 'Business'], status: 'On Leave' },
];

const MISSED_PAYMENTS = [
  { id: 1, customer: 'Raj Sharma', members: ['Aiden Sharma'], amount: 199, month: 'Jan 2026', card: '•••• 4521', reason: 'Card declined' },
  { id: 2, customer: 'Linda Ho', members: ['Oliver Ho'], amount: 159, month: 'Apr 2026', card: '•••• 7722', reason: 'Expired card' },
  { id: 3, customer: 'Ben Taylor', members: ['Zara Taylor', 'Alex Taylor'], amount: 358, month: 'Apr 2026', card: '•••• 8801', reason: 'Insufficient funds' },
];

const ROSTER_DATA = [
  { date: 'Mon May 5', session: 'Chess Intermediate · 5pm', location: 'Langley', coach: 'David Chen', students: 5 },
  { date: 'Mon May 5', session: 'Chess Beginner · 6pm', location: 'Langley', coach: 'David Chen', students: 4 },
  { date: 'Tue May 6', session: 'Math Grade 5 · 6pm', location: 'South Surrey', coach: 'Emma Wilson', students: 6 },
  { date: 'Wed May 7', session: 'Chess Advanced · 5pm', location: 'Langley', coach: 'Mike Patel', students: 3 },
  { date: 'Wed May 7', session: 'English Grade 4 · 6pm', location: 'South Surrey', coach: 'Sarah Kim', students: 5 },
  { date: 'Fri May 9', session: 'Finance Junior · 4pm', location: 'Maple Ridge', coach: 'TBD', students: 4 },
  { date: 'Sat May 10', session: 'Chess Beginner · 3pm', location: 'Langley', coach: 'David Chen', students: 8 },
];

function AdminDashboard({ onNavigate }) {
  const [tab, setTab] = React.useState('overview');
  const [showCreateCoach, setShowCreateCoach] = React.useState(false);
  const [coachForm, setCoachForm] = React.useState({ name: '', email: '', location: '', planets: [] });
  const [chargeModal, setChargeModal] = React.useState(null);

  const RevenueChart = () => {
    const months = ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'];
    const values = [28400, 29100, 31200, 32800, 33500, 34812];
    const max = Math.max(...values);
    return (
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 100, padding: '0 4px' }}>
        {months.map((m, i) => (
          <div key={m} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{ fontSize: 10, color: TLP.gray500, fontWeight: 600 }}>${(values[i] / 1000).toFixed(0)}k</div>
            <div style={{ width: '100%', background: i === months.length - 1 ? TLP.teal : TLP.tealLight, borderRadius: '4px 4px 0 0', height: `${(values[i] / max) * 72}px`, transition: 'height 0.4s' }} />
            <div style={{ fontSize: 10, color: TLP.gray400 }}>{m}</div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 800, color: TLP.navy }}>Admin Dashboard</h1>
          <p style={{ margin: 0, fontSize: 13, color: TLP.gray500 }}>Corporate · All Locations</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Btn variant="secondary" size="sm" icon="📅">Staff Roster</Btn>
          <Btn variant="primary" size="sm" onClick={() => setShowCreateCoach(true)} icon="➕">Add Coach</Btn>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 14, marginBottom: 24 }}>
        <StatCard label="Total Students" value={ADMIN_STATS.totalStudents} icon="👥" color={TLP.tealLight} />
        <StatCard label="Enrollments" value={ADMIN_STATS.activeEnrollments} icon="📚" color={TLP.blueLight} />
        <StatCard label="Monthly Revenue" value={`$${(ADMIN_STATS.monthlyRevenue / 1000).toFixed(1)}k`} delta="+4.2% vs last month" icon="💰" color={TLP.greenLight} />
        <StatCard label="Missed Payments" value={ADMIN_STATS.pendingPayments} icon="⚠️" color={TLP.redLight} onClick={() => setTab('payments')} />
        <StatCard label="Active Coaches" value={ADMIN_STATS.coaches} icon="👨‍🏫" color={TLP.amberLight} />
      </div>

      <Tabs tabs={[
        { id: 'overview', label: 'Overview' },
        { id: 'locations', label: 'Locations' },
        { id: 'roster', label: 'Staff Roster' },
        { id: 'coaches', label: 'Coaches' },
        { id: 'payments', label: 'Missed Payments' },
        { id: 'discounts', label: 'Multi-Planet Discounts' },
      ]} active={tab} onChange={setTab} />

      {tab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Revenue by Planet */}
            <Card style={{ padding: '18px 20px' }}>
              <SectionHeader title="Revenue by Planet" subtitle="April 2026" />
              {Object.entries({ Chess: 14200, Math: 9800, English: 4600, Finance: 3800, Arts: 2412 }).map(([planet, rev]) => (
                <div key={planet} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                  <PlanetBadge planet={planet} />
                  <div style={{ flex: 1 }}><ProgressBar value={rev} max={15000} color={PLANETS[planet]?.color || TLP.teal} /></div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: TLP.navy, minWidth: 60, textAlign: 'right' }}>${(rev / 1000).toFixed(1)}k</span>
                </div>
              ))}
            </Card>
            {/* Recent Roster */}
            <Card style={{ overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: `1px solid ${TLP.gray100}`, display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 700, color: TLP.navy, fontSize: 14 }}>This Week's Sessions</span>
                <Btn variant="ghost" size="sm" onClick={() => setTab('roster')}>See roster</Btn>
              </div>
              {ROSTER_DATA.slice(0, 4).map((r, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '100px 1fr 100px 80px', padding: '11px 20px', fontSize: 13, borderBottom: i < 3 ? `1px solid ${TLP.gray100}` : 'none', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 12, color: TLP.gray500, fontWeight: 600 }}>{r.date}</span>
                  <span style={{ color: TLP.navy, fontWeight: 600 }}>{r.session}</span>
                  <span style={{ color: TLP.gray500, fontSize: 12 }}>{r.coach}</span>
                  <Badge label={`${r.students} students`} color={TLP.gray600} bg={TLP.gray100} />
                </div>
              ))}
            </Card>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Card style={{ padding: '18px 20px' }}>
              <SectionHeader title="Monthly Revenue" subtitle="6-month trend" />
              <RevenueChart />
            </Card>
            <Card style={{ padding: '18px 20px' }}>
              <SectionHeader title="Enrollment by Location" />
              {LOCATIONS_DATA.map(loc => (
                <div key={loc.id} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: TLP.navy }}>{loc.name}</span>
                    <span style={{ fontSize: 12, color: TLP.gray500 }}>{loc.students} students</span>
                  </div>
                  <ProgressBar value={loc.students} max={ADMIN_STATS.totalStudents} color={loc.ownership === 'Corporate' ? TLP.teal : TLP.blue} />
                </div>
              ))}
            </Card>
          </div>
        </div>
      )}

      {tab === 'locations' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {LOCATIONS_DATA.map(loc => (
            <Card key={loc.id} style={{ padding: '18px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: TLP.navy }}>{loc.name}</h3>
                    <Badge label={loc.ownership} color={loc.ownership === 'Corporate' ? TLP.teal : TLP.blue} bg={loc.ownership === 'Corporate' ? TLP.tealLight : TLP.blueLight} />
                  </div>
                  <div style={{ fontSize: 13, color: TLP.gray500 }}>📍 {loc.address}</div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Btn variant="secondary" size="sm">Edit</Btn>
                  <Btn variant="primary" size="sm">Manage Schedule</Btn>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 16, marginBottom: 12, fontSize: 13 }}>
                <span style={{ color: TLP.gray500 }}>👥 {loc.students} students</span>
                <span style={{ color: TLP.gray500 }}>👨‍🏫 {loc.coaches} coaches</span>
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {loc.planets.map(p => <PlanetBadge key={p} planet={p} />)}
              </div>
            </Card>
          ))}
        </div>
      )}

      {tab === 'roster' && (
        <Card style={{ overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', background: TLP.gray50, borderBottom: `1px solid ${TLP.gray100}` }}>
            <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr 120px 80px 100px', gap: 8, fontSize: 11, fontWeight: 700, color: TLP.gray500, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              <span>Date</span><span>Session</span><span>Location</span><span>Coach</span><span>Students</span>
            </div>
          </div>
          {ROSTER_DATA.map((r, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '100px 1fr 120px 80px 100px', padding: '12px 20px', fontSize: 13, borderBottom: i < ROSTER_DATA.length - 1 ? `1px solid ${TLP.gray100}` : 'none', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: TLP.gray500 }}>{r.date}</span>
              <span style={{ color: TLP.navy, fontWeight: 600 }}>{r.session}</span>
              <span style={{ color: TLP.gray500, fontSize: 12 }}>{r.location}</span>
              <span style={{ color: r.coach === 'TBD' ? TLP.red : TLP.gray700, fontWeight: r.coach === 'TBD' ? 700 : 500, fontSize: 12 }}>{r.coach}</span>
              <Badge label={`${r.students} students`} color={TLP.gray600} bg={TLP.gray100} />
            </div>
          ))}
        </Card>
      )}

      {tab === 'coaches' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {COACHES_DATA.map(c => (
            <Card key={c.id} style={{ padding: '14px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <Avatar name={c.name} size={40} color={TLP.navy} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, color: TLP.navy }}>{c.name}</div>
                  <div style={{ fontSize: 12, color: TLP.gray500 }}>{c.email} · {c.location}</div>
                </div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  {c.planets.map(p => <PlanetBadge key={p} planet={p} />)}
                  <Badge label={c.status} color={c.status === 'Active' ? TLP.green : TLP.amber} bg={c.status === 'Active' ? TLP.greenLight : TLP.amberLight} />
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Btn variant="secondary" size="sm">Edit</Btn>
                  <Btn variant="ghost" size="sm">View Schedule</Btn>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {tab === 'payments' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ background: TLP.redLight, border: `1px solid #fed7d7`, borderRadius: 10, padding: '12px 16px', fontSize: 13, color: TLP.red, display: 'flex', gap: 8 }}>
            <span>⚠️</span>
            <span><strong>{MISSED_PAYMENTS.length} customers</strong> have missed payments totalling <strong>${MISSED_PAYMENTS.reduce((s, p) => s + p.amount, 0).toFixed(2)}</strong>. Charge or follow up below.</span>
          </div>
          {MISSED_PAYMENTS.map(p => (
            <Card key={p.id} style={{ padding: '16px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Avatar name={p.customer} size={38} color={TLP.red} />
                  <div>
                    <div style={{ fontWeight: 700, color: TLP.navy }}>{p.customer}</div>
                    <div style={{ fontSize: 12, color: TLP.gray500 }}>{p.members.join(', ')} · {p.month}</div>
                    <div style={{ fontSize: 12, color: TLP.red }}>{p.reason} · {p.card}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontWeight: 800, fontSize: 16, color: TLP.navy }}>${p.amount.toFixed(2)}</span>
                  <Btn variant="secondary" size="sm">Update Card</Btn>
                  <Btn variant="danger" size="sm" onClick={() => setChargeModal(p)}>Charge Now</Btn>
                </div>
              </div>
            </Card>
          ))}
          <Modal open={!!chargeModal} onClose={() => setChargeModal(null)} title="Confirm Charge">
            {chargeModal && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <p style={{ margin: 0, fontSize: 14, color: TLP.gray700 }}>You are about to charge <strong>{chargeModal.customer}</strong> <strong>${chargeModal.amount.toFixed(2)} CAD</strong> on card {chargeModal.card}.</p>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  <Btn variant="secondary" onClick={() => setChargeModal(null)}>Cancel</Btn>
                  <Btn variant="danger" onClick={() => setChargeModal(null)}>Confirm Charge</Btn>
                </div>
              </div>
            )}
          </Modal>
        </div>
      )}

      {tab === 'discounts' && (
        <Card style={{ padding: 24, maxWidth: 560 }}>
          <SectionHeader title="Multi-Planet Discount Rules" subtitle="Applied per member, recomputed monthly" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { planets: 1, label: '1 Planet', price: 159, discount: 0 },
              { planets: 2, label: '2 Planets', price: 199, discount: 38 },
              { planets: 3, label: '3 Planets', price: 239, discount: 49 },
              { planets: 4, label: '4 Planets', price: 279, discount: 56 },
              { planets: 5, label: '5 Planets', price: 329, discount: 58 },
            ].map(row => (
              <div key={row.planets} style={{ display: 'grid', gridTemplateColumns: '120px 100px 100px 1fr', gap: 12, alignItems: 'center', padding: '10px 14px', borderRadius: 8, background: TLP.bg }}>
                <span style={{ fontWeight: 700, color: TLP.navy }}>{row.label}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: 11, color: TLP.gray400 }}>$</span>
                  <input defaultValue={row.price} style={{ width: 70, border: `1px solid ${TLP.gray200}`, borderRadius: 6, padding: '5px 8px', fontSize: 13, fontFamily: 'inherit' }} />
                  <span style={{ fontSize: 11, color: TLP.gray400 }}>/mo</span>
                </div>
                <Badge label={row.discount > 0 ? `Save ${row.discount}%` : 'Base price'} color={row.discount > 0 ? TLP.green : TLP.gray500} bg={row.discount > 0 ? TLP.greenLight : TLP.gray100} />
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
            <Btn variant="primary">Save Discount Rules</Btn>
          </div>
        </Card>
      )}

      <Modal open={showCreateCoach} onClose={() => setShowCreateCoach(false)} title="Create Coach Account">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Input label="Full Name" value={coachForm.name} onChange={e => setCoachForm(f => ({ ...f, name: e.target.value }))} required placeholder="e.g. David Chen" />
          <Input label="Email Address" type="email" value={coachForm.email} onChange={e => setCoachForm(f => ({ ...f, email: e.target.value }))} required placeholder="e.g. dchen@tlp.ca" hint="A temporary password will be sent to this email" />
          <Select label="Primary Location" value={coachForm.location} onChange={e => setCoachForm(f => ({ ...f, location: e.target.value }))} required options={[{ value: '', label: '— Select location —' }, 'Langley', 'South Surrey', 'Maple Ridge']} />
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
            <Btn variant="secondary" onClick={() => setShowCreateCoach(false)}>Cancel</Btn>
            <Btn variant="primary" disabled={!coachForm.name || !coachForm.email} onClick={() => setShowCreateCoach(false)}>Create & Send Email</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}

Object.assign(window, { AdminDashboard });
