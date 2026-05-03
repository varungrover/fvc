
// ─── LOCATIONS + BATCH MANAGEMENT ─────────────────────────────────

const LOCATIONS_FULL = [
  {
    id: 1, name: 'Langley', ownership: 'Corporate',
    address: '20486 64 Ave, Unit #108, Langley, BC V2Y 1N4',
    phone: '604-555-0100', email: 'langley@tlp.ca',
    students: 67, coaches: 3,
    batches: [
      { id: 'L1',  planet: 'Chess',   level: 'Beginner (PP)',      day: 'Mon', time: '5:00 PM', endTime: '6:00 PM', capacity: 10, enrolled: 8,  coachId: 'David Chen',  active: true },
      { id: 'L2',  planet: 'Chess',   level: 'Beginner (PP)',      day: 'Mon', time: '6:00 PM', endTime: '7:00 PM', capacity: 10, enrolled: 4,  coachId: 'David Chen',  active: true },
      { id: 'L3',  planet: 'Chess',   level: 'Intermediate (RR)',  day: 'Wed', time: '5:00 PM', endTime: '6:00 PM', capacity: 8,  enrolled: 5,  coachId: 'David Chen',  active: true },
      { id: 'L4',  planet: 'Chess',   level: 'Advanced (PR)',      day: 'Sat', time: '3:00 PM', endTime: '4:30 PM', capacity: 8,  enrolled: 8,  coachId: 'David Chen',  active: true },
      { id: 'L5',  planet: 'Math',    level: 'Grade 5',            day: 'Sat', time: '4:00 PM', endTime: '5:00 PM', capacity: 12, enrolled: 6,  coachId: 'Emma Wilson', active: true },
      { id: 'L6',  planet: 'English', level: 'Grade 4',            day: 'Mon', time: '6:00 PM', endTime: '7:00 PM', capacity: 10, enrolled: 5,  coachId: 'Sarah Kim',   active: true },
      { id: 'L7',  planet: 'English', level: 'Grade 5',            day: 'Sat', time: '4:00 PM', endTime: '5:00 PM', capacity: 10, enrolled: 6,  coachId: 'Sarah Kim',   active: true },
      { id: 'L8',  planet: 'Arts',    level: 'Beginner',           day: 'Thu', time: '5:00 PM', endTime: '6:00 PM', capacity: 12, enrolled: 7,  coachId: 'Sarah Kim',   active: true },
      { id: 'L9',  planet: 'Finance', level: 'Junior (7-10)',      day: 'Sat', time: '5:00 PM', endTime: '6:00 PM', capacity: 12, enrolled: 4,  coachId: '',            active: false },
    ],
  },
  {
    id: 2, name: 'South Surrey', ownership: 'Corporate',
    address: '15210 32nd Ave, Unit #105, Surrey, BC V3S 0R5',
    phone: '604-555-0200', email: 'southsurrey@tlp.ca',
    students: 48, coaches: 3,
    batches: [
      { id: 'S1',  planet: 'Chess',   level: 'Intermediate (RR)',  day: 'Tue', time: '6:00 PM', endTime: '7:00 PM', capacity: 8,  enrolled: 3,  coachId: 'Mike Patel',  active: true },
      { id: 'S2',  planet: 'Chess',   level: 'Advanced (PR)',      day: 'Wed', time: '5:00 PM', endTime: '6:30 PM', capacity: 6,  enrolled: 6,  coachId: 'Mike Patel',  active: true },
      { id: 'S3',  planet: 'Math',    level: 'Grade 6',            day: 'Mon', time: '5:00 PM', endTime: '6:00 PM', capacity: 12, enrolled: 5,  coachId: 'Emma Wilson', active: true },
      { id: 'S4',  planet: 'Math',    level: 'Grade 7',            day: 'Fri', time: '4:00 PM', endTime: '5:00 PM', capacity: 12, enrolled: 5,  coachId: 'Emma Wilson', active: true },
      { id: 'S5',  planet: 'English', level: 'Grade 4',            day: 'Wed', time: '6:00 PM', endTime: '7:00 PM', capacity: 10, enrolled: 5,  coachId: 'Sarah Kim',   active: true },
      { id: 'S6',  planet: 'Finance', level: 'Intermediate',       day: 'Tue', time: '7:00 PM', endTime: '8:00 PM', capacity: 10, enrolled: 5,  coachId: 'Emma Wilson', active: true },
    ],
  },
  {
    id: 3, name: 'Maple Ridge', ownership: 'Franchisee',
    address: '20145 Stewart Crescent, Unit #106, Maple Ridge, BC V2X 0T4',
    phone: '604-555-0300', email: 'mapleridge@tlp.ca',
    students: 27, coaches: 2,
    batches: [
      { id: 'M1',  planet: 'Chess',   level: 'Beginner (PP)',      day: 'Thu', time: '6:00 PM', endTime: '7:00 PM',  capacity: 10, enrolled: 7,  coachId: 'James Park',  active: true },
      { id: 'M2',  planet: 'Arts',    level: 'Intermediate',       day: 'Thu', time: '6:00 PM', endTime: '7:00 PM',  capacity: 10, enrolled: 5,  coachId: 'Priya Nair',  active: true },
      { id: 'M3',  planet: 'Finance', level: 'Junior (7-10)',      day: 'Fri', time: '4:00 PM', endTime: '5:00 PM',  capacity: 10, enrolled: 4,  coachId: 'Priya Nair',  active: true },
      { id: 'M4',  planet: 'Business',level: 'Beginner',           day: 'Sat', time: '11:00 AM',endTime: '12:00 PM', capacity: 12, enrolled: 3,  coachId: 'James Park',  active: true },
    ],
  },
];

const ALL_LEVELS = {
  Chess:    ['Beginner (PP)', 'Intermediate (RR)', 'Advanced (PR)', 'Tournament Prep'],
  Math:     ['Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8'],
  English:  ['Grade 3', 'Grade 4', 'Grade 5', 'Grade 6'],
  Finance:  ['Junior (7-10)', 'Intermediate (11-13)', 'Senior (14-16)'],
  Arts:     ['Beginner', 'Intermediate', 'Advanced'],
  Business: ['Beginner', 'Intermediate'],
};

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const TIMES = ['9:00 AM','9:30 AM','10:00 AM','10:30 AM','11:00 AM','11:30 AM','12:00 PM','12:30 PM','1:00 PM','1:30 PM','2:00 PM','2:30 PM','3:00 PM','3:30 PM','4:00 PM','4:30 PM','5:00 PM','5:30 PM','6:00 PM','6:30 PM','7:00 PM','7:30 PM','8:00 PM'];
const FREQS = ['Weekly 1x', 'Weekly 2x', 'Weekly 3x'];
const COACH_NAMES = ['', 'David Chen', 'Sarah Kim', 'Mike Patel', 'Emma Wilson', 'James Park', 'Priya Nair'];

function LocationsScreen() {
  const [locations, setLocations] = React.useState(LOCATIONS_FULL);
  const [selectedLoc, setSelectedLoc] = React.useState(null);
  const [batchTab, setBatchTab] = React.useState('all');  // 'all' | planet name
  const [showAddBatch, setShowAddBatch] = React.useState(false);
  const [editBatch, setEditBatch] = React.useState(null);
  const [batchForm, setBatchForm] = React.useState({ planet: '', level: '', day: '', capacity: 10, coachId: '', slots: [{ time: '5:00 PM', endTime: '6:00 PM' }] });
  const [confirmDelete, setConfirmDelete] = React.useState(null);

  const loc = selectedLoc ? locations.find(l => l.id === selectedLoc) : null;

  const openAddBatch = () => {
    setBatchForm({ planet: '', level: '', day: 'Mon', capacity: 10, coachId: '', slots: [{ time: '5:00 PM', endTime: '6:00 PM' }] });
    setEditBatch(null);
    setShowAddBatch(true);
  };

  const openEditBatch = (batch) => {
    // Single-batch edit: pre-fill as one slot
    setBatchForm({ planet: batch.planet, level: batch.level, day: batch.day, capacity: batch.capacity, coachId: batch.coachId, slots: [{ time: batch.time, endTime: batch.endTime }] });
    setEditBatch(batch.id);
    setShowAddBatch(true);
  };

  const addSlot = () => setBatchForm(f => ({ ...f, slots: [...f.slots, { time: '5:00 PM', endTime: '6:00 PM' }] }));
  const removeSlot = (i) => setBatchForm(f => ({ ...f, slots: f.slots.filter((_, idx) => idx !== i) }));
  const updateSlot = (i, key, val) => setBatchForm(f => ({ ...f, slots: f.slots.map((s, idx) => idx === i ? { ...s, [key]: val } : s) }));

  const saveBatch = () => {
    setLocations(prev => prev.map(l => {
      if (l.id !== selectedLoc) return l;
      if (editBatch) {
        // Update the single edited batch with first slot
        const slot = batchForm.slots[0];
        return { ...l, batches: l.batches.map(b => b.id === editBatch ? { ...b, planet: batchForm.planet, level: batchForm.level, day: batchForm.day, capacity: batchForm.capacity, coachId: batchForm.coachId, time: slot.time, endTime: slot.endTime } : b) };
      } else {
        // Create one batch per slot
        const newBatches = batchForm.slots.map((slot, i) => ({
          id: `${l.name[0]}${Date.now()}${i}`,
          planet: batchForm.planet, level: batchForm.level,
          day: batchForm.day, time: slot.time, endTime: slot.endTime,
          capacity: batchForm.capacity, coachId: batchForm.coachId,
          enrolled: 0, active: true,
        }));
        return { ...l, batches: [...l.batches, ...newBatches] };
      }
    }));
    setShowAddBatch(false);
  };

  const deleteBatch = (batchId) => {
    setLocations(prev => prev.map(l =>
      l.id !== selectedLoc ? l : { ...l, batches: l.batches.filter(b => b.id !== batchId) }
    ));
    setConfirmDelete(null);
  };

  const toggleActive = (batchId) => {
    setLocations(prev => prev.map(l =>
      l.id !== selectedLoc ? l : { ...l, batches: l.batches.map(b => b.id === batchId ? { ...b, active: !b.active } : b) }
    ));
  };

  // ── Location list ────────────────────────────────────────────────
  if (!loc) return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: '0 0 3px', fontSize: 22, fontWeight: 800, color: TLP.navy }}>Locations</h1>
          <p style={{ margin: 0, fontSize: 13, color: TLP.gray500 }}>{locations.length} locations · {locations.reduce((s, l) => s + l.batches.filter(b => b.active).length, 0)} active batches</p>
        </div>
        <Btn variant="primary" icon="➕">Add Location</Btn>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
        {locations.map(l => {
          const activeBatches = l.batches.filter(b => b.active);
          const planets = [...new Set(l.batches.map(b => b.planet))];
          const fill = activeBatches.reduce((s, b) => s + b.enrolled, 0);
          const cap  = activeBatches.reduce((s, b) => s + b.capacity, 0);
          return (
            <Card key={l.id} hover style={{ overflow: 'hidden' }}>
              {/* Location header strip */}
              <div style={{ background: `linear-gradient(135deg, ${TLP.navy}, ${TLP.navyLight})`, padding: '18px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', marginBottom: 3 }}>{l.name}</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>📍 {l.address}</div>
                  </div>
                  <Badge label={l.ownership} color={l.ownership === 'Corporate' ? TLP.teal : TLP.amber} bg="rgba(255,255,255,0.15)" />
                </div>
              </div>
              <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                  {[
                    { label: 'Students', value: l.students },
                    { label: 'Batches', value: activeBatches.length },
                    { label: 'Coaches', value: l.coaches },
                  ].map(s => (
                    <div key={s.label} style={{ textAlign: 'center', background: TLP.bg, borderRadius: 8, padding: '10px 6px' }}>
                      <div style={{ fontSize: 20, fontWeight: 800, color: TLP.navy }}>{s.value}</div>
                      <div style={{ fontSize: 11, color: TLP.gray400 }}>{s.label}</div>
                    </div>
                  ))}
                </div>
                {/* Capacity bar */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: 12, color: TLP.gray500 }}>Overall capacity</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: TLP.navy }}>{fill}/{cap} seats</span>
                  </div>
                  <ProgressBar value={fill} max={cap} color={fill / cap > 0.85 ? TLP.red : fill / cap > 0.6 ? TLP.amber : TLP.teal} />
                </div>
                {/* Planet chips */}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {planets.map(p => <PlanetBadge key={p} planet={p} />)}
                </div>
                {/* Actions */}
                <div style={{ display: 'flex', gap: 8 }}>
                  <Btn variant="secondary" size="sm" style={{ flex: 1 }}>Edit Info</Btn>
                  <Btn variant="primary" size="sm" style={{ flex: 1 }} onClick={() => { setSelectedLoc(l.id); setBatchTab('all'); }}>
                    Manage Batches →
                  </Btn>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );

  // ── Batch management drill-down ──────────────────────────────────
  const allPlanets = [...new Set(loc.batches.map(b => b.planet))];
  const batchesForTab = loc.batches.filter(b => batchTab === 'all' || b.planet === batchTab);

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Breadcrumb header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <button onClick={() => setSelectedLoc(null)} style={{ background: 'none', border: 'none', color: TLP.teal, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', padding: 0, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
            ← All Locations
          </button>
          <h1 style={{ margin: '0 0 3px', fontSize: 22, fontWeight: 800, color: TLP.navy }}>{loc.name} — Batches</h1>
          <p style={{ margin: 0, fontSize: 13, color: TLP.gray500 }}>{loc.address} · <Badge label={loc.ownership} color={loc.ownership === 'Corporate' ? TLP.teal : TLP.amber} bg={loc.ownership === 'Corporate' ? TLP.tealLight : TLP.amberLight} /></p>
        </div>
        <Btn variant="primary" icon="➕" onClick={openAddBatch}>Add Batch</Btn>
      </div>

      {/* Summary stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        <StatCard label="Total Batches"   value={loc.batches.length} icon="📋" color={TLP.tealLight} />
        <StatCard label="Active"          value={loc.batches.filter(b => b.active).length} icon="✅" color={TLP.greenLight} />
        <StatCard label="Total Capacity"  value={loc.batches.filter(b=>b.active).reduce((s,b)=>s+b.capacity,0)} icon="🪑" color={TLP.blueLight} />
        <StatCard label="Enrolled"        value={loc.batches.filter(b=>b.active).reduce((s,b)=>s+b.enrolled,0)} icon="👥" color={TLP.amberLight} />
      </div>

      {/* Planet filter tabs */}
      <div style={{ display: 'flex', gap: 2, borderBottom: `2px solid ${TLP.gray100}` }}>
        {['all', ...allPlanets].map(tab => (
          <button key={tab} onClick={() => setBatchTab(tab)} style={{ padding: '9px 14px', fontSize: 13, fontWeight: batchTab === tab ? 700 : 500, color: batchTab === tab ? TLP.teal : TLP.gray500, background: 'none', border: 'none', cursor: 'pointer', borderBottom: `2px solid ${batchTab === tab ? TLP.teal : 'transparent'}`, marginBottom: -2, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6 }}>
            {tab === 'all' ? 'All Batches' : <><span>{PLANETS[tab]?.icon}</span>{tab}</>}
            <span style={{ fontSize: 11, background: batchTab === tab ? TLP.tealLight : TLP.gray100, color: batchTab === tab ? TLP.teal : TLP.gray400, borderRadius: 10, padding: '1px 6px', fontWeight: 600 }}>
              {tab === 'all' ? loc.batches.length : loc.batches.filter(b => b.planet === tab).length}
            </span>
          </button>
        ))}
      </div>

      {/* Batch cards grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
        {batchesForTab.map(batch => {
          const pInfo = PLANETS[batch.planet] || { color: TLP.teal, bg: TLP.tealLight, icon: '•' };
          const fillPct = batch.capacity > 0 ? (batch.enrolled / batch.capacity) * 100 : 0;
          const fillColor = fillPct >= 100 ? TLP.red : fillPct >= 80 ? TLP.amber : TLP.teal;
          const spotsLeft = batch.capacity - batch.enrolled;

          return (
            <Card key={batch.id} style={{ overflow: 'hidden', opacity: batch.active ? 1 : 0.6 }}>
              {/* Batch header */}
              <div style={{ background: batch.active ? pInfo.bg : TLP.gray50, borderBottom: `1px solid ${TLP.gray100}`, padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
                    <span style={{ fontSize: 18 }}>{pInfo.icon}</span>
                    <span style={{ fontWeight: 800, fontSize: 15, color: TLP.navy }}>{batch.planet}</span>
                    {!batch.active && <Badge label="Inactive" color={TLP.gray400} bg={TLP.gray100} />}
                  </div>
                  <div style={{ fontSize: 13, color: pInfo.color, fontWeight: 600 }}>{batch.level}</div>
                </div>
                <div style={{ display: 'flex', gap: 5 }}>
                  <button onClick={() => openEditBatch(batch)} style={{ width: 28, height: 28, borderRadius: 6, border: `1px solid ${TLP.gray200}`, background: TLP.white, cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✎</button>
                  <button onClick={() => setConfirmDelete(batch)} style={{ width: 28, height: 28, borderRadius: 6, border: `1px solid ${TLP.gray200}`, background: TLP.white, cursor: 'pointer', fontSize: 13, color: TLP.red, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🗑</button>
                </div>
              </div>

              {/* Batch details */}
              <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {/* Schedule & freq */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div style={{ background: TLP.bg, borderRadius: 7, padding: '8px 10px' }}>
                    <div style={{ fontSize: 10, color: TLP.gray400, fontWeight: 700, textTransform: 'uppercase', marginBottom: 3 }}>Schedule</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: TLP.navy }}>{batch.day} · {batch.time} – {batch.endTime}</div>
                  </div>
                </div>

                {/* Coach */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {batch.coachId ? (
                    <>
                      <Avatar name={batch.coachId} size={24} color={TLP.teal} />
                      <span style={{ fontSize: 13, fontWeight: 600, color: TLP.navy }}>{batch.coachId}</span>
                    </>
                  ) : (
                    <span style={{ fontSize: 13, color: TLP.red, fontWeight: 600 }}>⚠️ No coach assigned</span>
                  )}
                </div>

                {/* Capacity bar */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: 12, color: TLP.gray500 }}>Enrollment</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: fillColor }}>
                      {batch.enrolled}/{batch.capacity} {fillPct >= 100 ? '· Full' : `· ${spotsLeft} spot${spotsLeft !== 1 ? 's' : ''} left`}
                    </span>
                  </div>
                  <ProgressBar value={batch.enrolled} max={batch.capacity} color={fillColor} />
                </div>

                {/* Toggle active */}
                <button onClick={() => toggleActive(batch.id)} style={{ width: '100%', padding: '7px', borderRadius: 7, border: `1px solid ${TLP.gray200}`, background: TLP.white, cursor: 'pointer', fontSize: 12, fontWeight: 600, color: batch.active ? TLP.red : TLP.teal, fontFamily: 'inherit' }}>
                  {batch.active ? 'Deactivate Batch' : 'Reactivate Batch'}
                </button>
              </div>
            </Card>
          );
        })}

        {/* Add batch shortcut card */}
        <div onClick={openAddBatch} style={{ border: `2px dashed ${TLP.gray200}`, borderRadius: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 32, cursor: 'pointer', color: TLP.gray400, minHeight: 200, transition: 'all 0.15s' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = TLP.teal; e.currentTarget.style.color = TLP.teal; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = TLP.gray200; e.currentTarget.style.color = TLP.gray400; }}>
          <span style={{ fontSize: 28 }}>➕</span>
          <span style={{ fontSize: 13, fontWeight: 600 }}>Add Batch</span>
        </div>
      </div>

      {/* Add/Edit Batch Modal */}
      <Modal open={showAddBatch} onClose={() => setShowAddBatch(false)} title={editBatch ? 'Edit Batch' : 'Add Batches'} width={540}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Step 1: Planet */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: TLP.gray400, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: 8 }}>Planet <span style={{ color: TLP.red }}>*</span></label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {Object.entries(PLANETS).map(([name, p]) => (
                <div key={name} onClick={() => setBatchForm(f => ({ ...f, planet: name, level: '' }))}
                  style={{ padding: '10px', borderRadius: 9, border: `2px solid ${batchForm.planet === name ? p.color : TLP.gray200}`, cursor: 'pointer', textAlign: 'center', background: batchForm.planet === name ? p.bg : TLP.white, transition: 'all 0.15s' }}>
                  <div style={{ fontSize: 18, marginBottom: 3 }}>{p.icon}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: batchForm.planet === name ? p.color : TLP.gray600 }}>{name}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Step 2: Level + Day side by side */}
          {batchForm.planet && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Select label="Level" required value={batchForm.level} onChange={e => setBatchForm(f => ({ ...f, level: e.target.value }))}
                options={[{ value: '', label: '— Select level —' }, ...(ALL_LEVELS[batchForm.planet] || []).map(l => ({ value: l, label: l }))]} />
              <Select label="Day of Week" required value={batchForm.day} onChange={e => setBatchForm(f => ({ ...f, day: e.target.value }))}
                options={DAYS_OF_WEEK.map(d => ({ value: d, label: d }))} />
            </div>
          )}

          {/* Step 3: Time slots */}
          {batchForm.planet && batchForm.level && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: TLP.gray400, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Time Slots <span style={{ color: TLP.red }}>*</span>
                </label>
                {!editBatch && (
                  <button onClick={addSlot} style={{ display: 'flex', alignItems: 'center', gap: 5, background: TLP.tealLight, border: 'none', color: TLP.teal, borderRadius: 6, padding: '4px 10px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                    ➕ Add slot
                  </button>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {batchForm.slots.map((slot, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 8, alignItems: 'flex-end', background: TLP.bg, borderRadius: 9, padding: '10px 12px' }}>
                    <Select label={i === 0 ? 'Start Time' : ''} value={slot.time} onChange={e => updateSlot(i, 'time', e.target.value)}
                      options={TIMES.map(t => ({ value: t, label: t }))} />
                    <Select label={i === 0 ? 'End Time' : ''} value={slot.endTime} onChange={e => updateSlot(i, 'endTime', e.target.value)}
                      options={TIMES.map(t => ({ value: t, label: t }))} />
                    {batchForm.slots.length > 1 && (
                      <button onClick={() => removeSlot(i)} style={{ width: 30, height: 36, marginTop: i === 0 ? 20 : 0, borderRadius: 7, border: `1px solid ${TLP.gray200}`, background: TLP.white, cursor: 'pointer', color: TLP.red, fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>×</button>
                    )}
                  </div>
                ))}
              </div>
              {!editBatch && batchForm.slots.length > 1 && (
                <div style={{ fontSize: 12, color: TLP.teal, marginTop: 6, fontWeight: 600 }}>
                  ✓ Will create {batchForm.slots.length} batches for {batchForm.day}
                </div>
              )}
            </div>
          )}

          {/* Step 4: Capacity + Coach */}
          {batchForm.planet && batchForm.level && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, alignItems: 'flex-end' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: TLP.gray700 }}>Max Capacity per Batch</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: TLP.bg, borderRadius: 8, padding: '6px 10px' }}>
                  <button onClick={() => setBatchForm(f => ({ ...f, capacity: Math.max(1, f.capacity - 1) }))} style={{ width: 28, height: 28, borderRadius: 6, border: `1.5px solid ${TLP.gray200}`, background: TLP.white, cursor: 'pointer', fontSize: 16, fontFamily: 'inherit', flexShrink: 0 }}>−</button>
                  <span style={{ flex: 1, textAlign: 'center', fontSize: 18, fontWeight: 800, color: TLP.navy }}>{batchForm.capacity}</span>
                  <button onClick={() => setBatchForm(f => ({ ...f, capacity: Math.min(30, f.capacity + 1) }))} style={{ width: 28, height: 28, borderRadius: 6, border: `1.5px solid ${TLP.gray200}`, background: TLP.white, cursor: 'pointer', fontSize: 16, fontFamily: 'inherit', flexShrink: 0 }}>+</button>
                </div>
              </div>
              <Select label="Assign Coach" value={batchForm.coachId} onChange={e => setBatchForm(f => ({ ...f, coachId: e.target.value }))}
                options={[{ value: '', label: '— Assign later —' }, ...COACH_NAMES.filter(Boolean).map(n => ({ value: n, label: n }))]} />
            </div>
          )}

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', paddingTop: 8, borderTop: `1px solid ${TLP.gray100}` }}>
            <Btn variant="secondary" onClick={() => setShowAddBatch(false)}>Cancel</Btn>
            <Btn variant="primary"
              disabled={!batchForm.planet || !batchForm.level || !batchForm.day || batchForm.slots.some(s => !s.time || !s.endTime)}
              onClick={saveBatch}>
              {editBatch ? 'Save Changes' : `Create ${batchForm.slots.length > 1 ? `${batchForm.slots.length} Batches` : 'Batch'}`}
            </Btn>
          </div>
        </div>
      </Modal>

      {/* Confirm delete modal */}
      <Modal open={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Delete Batch?" width={400}>
        {confirmDelete && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <p style={{ margin: 0, fontSize: 14, color: TLP.gray700 }}>
              Are you sure you want to delete the <strong>{confirmDelete.planet} · {confirmDelete.level}</strong> batch on <strong>{confirmDelete.day} {confirmDelete.time}</strong>? This cannot be undone.
            </p>
            {confirmDelete.enrolled > 0 && (
              <div style={{ background: TLP.redLight, borderRadius: 8, padding: '10px 14px', fontSize: 13, color: TLP.red }}>
                ⚠️ <strong>{confirmDelete.enrolled} students</strong> are currently enrolled in this batch.
              </div>
            )}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <Btn variant="secondary" onClick={() => setConfirmDelete(null)}>Cancel</Btn>
              <Btn variant="danger" onClick={() => deleteBatch(confirmDelete.id)}>Delete Batch</Btn>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

Object.assign(window, { LocationsScreen });
