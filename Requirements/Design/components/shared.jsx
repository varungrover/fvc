
// Shared design tokens and utilities
const TLP = {
  navy: '#0d1b3e',
  navyLight: '#1a2d5a',
  teal: '#0a9b8a',
  tealLight: '#e6f7f5',
  amber: '#f5a623',
  amberLight: '#fef3dc',
  red: '#e53e3e',
  redLight: '#fff5f5',
  green: '#38a169',
  greenLight: '#f0fff4',
  purple: '#805ad5',
  purpleLight: '#faf5ff',
  blue: '#3182ce',
  blueLight: '#ebf8ff',
  bg: '#f4f6fa',
  white: '#ffffff',
  gray50: '#f9fafb',
  gray100: '#f3f4f6',
  gray200: '#e5e7eb',
  gray300: '#d1d5db',
  gray400: '#9ca3af',
  gray500: '#6b7280',
  gray600: '#4b5563',
  gray700: '#374151',
  gray800: '#1f2937',
};

const PLANETS = {
  Chess: { color: TLP.teal, bg: TLP.tealLight, icon: '♟' },
  Math: { color: TLP.blue, bg: TLP.blueLight, icon: '∑' },
  English: { color: TLP.green, bg: TLP.greenLight, icon: 'Aa' },
  Finance: { color: TLP.amber, bg: TLP.amberLight, icon: '$' },
  Arts: { color: TLP.purple, bg: TLP.purpleLight, icon: '🎨' },
  Business: { color: '#e67e22', bg: '#fef9f0', icon: '💼' },
};

// Shared components
const Avatar = ({ name, size = 36, color = TLP.teal }) => {
  const initials = name ? name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase() : '?';
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: color, color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.36, fontWeight: 700, flexShrink: 0,
      letterSpacing: '-0.5px'
    }}>{initials}</div>
  );
};

const Badge = ({ label, color, bg, size = 'sm' }) => (
  <span style={{
    background: bg || TLP.tealLight,
    color: color || TLP.teal,
    padding: size === 'sm' ? '2px 8px' : '4px 12px',
    borderRadius: 20, fontSize: size === 'sm' ? 11 : 12,
    fontWeight: 600, whiteSpace: 'nowrap', letterSpacing: '0.2px'
  }}>{label}</span>
);

const PlanetBadge = ({ planet, size = 'sm' }) => {
  const p = PLANETS[planet] || { color: TLP.gray500, bg: TLP.gray100, icon: '•' };
  return <Badge label={`${p.icon} ${planet}`} color={p.color} bg={p.bg} size={size} />;
};

const Card = ({ children, style = {}, onClick, hover = false }) => (
  <div onClick={onClick} style={{
    background: TLP.white, borderRadius: 12,
    boxShadow: '0 1px 4px rgba(13,27,62,0.08)',
    border: `1px solid ${TLP.gray100}`,
    transition: hover ? 'box-shadow 0.2s, transform 0.15s' : 'none',
    cursor: onClick ? 'pointer' : 'default',
    ...style
  }}
    onMouseEnter={hover && onClick ? e => {
      e.currentTarget.style.boxShadow = '0 4px 16px rgba(13,27,62,0.14)';
      e.currentTarget.style.transform = 'translateY(-1px)';
    } : undefined}
    onMouseLeave={hover && onClick ? e => {
      e.currentTarget.style.boxShadow = '0 1px 4px rgba(13,27,62,0.08)';
      e.currentTarget.style.transform = 'translateY(0)';
    } : undefined}
  >{children}</div>
);

const Btn = ({ children, variant = 'primary', size = 'md', onClick, disabled, style = {}, icon }) => {
  const variants = {
    primary: { background: TLP.teal, color: '#fff', border: 'none' },
    secondary: { background: TLP.white, color: TLP.navy, border: `1.5px solid ${TLP.gray200}` },
    danger: { background: TLP.red, color: '#fff', border: 'none' },
    ghost: { background: 'transparent', color: TLP.teal, border: 'none' },
    navy: { background: TLP.navy, color: '#fff', border: 'none' },
    amber: { background: TLP.amber, color: TLP.navy, border: 'none' },
  };
  const sizes = {
    sm: { padding: '5px 12px', fontSize: 12, borderRadius: 7 },
    md: { padding: '8px 18px', fontSize: 14, borderRadius: 8 },
    lg: { padding: '11px 24px', fontSize: 15, borderRadius: 9 },
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{
      ...variants[variant], ...sizes[size],
      fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.55 : 1, fontFamily: 'inherit',
      display: 'inline-flex', alignItems: 'center', gap: 6,
      transition: 'opacity 0.15s, transform 0.1s',
      ...style
    }}
      onMouseEnter={e => !disabled && (e.currentTarget.style.opacity = '0.88')}
      onMouseLeave={e => !disabled && (e.currentTarget.style.opacity = '1')}
    >{icon && <span>{icon}</span>}{children}</button>
  );
};

const Input = ({ label, type = 'text', value, onChange, placeholder, required, hint, error }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
    {label && <label style={{ fontSize: 13, fontWeight: 600, color: TLP.gray700 }}>
      {label}{required && <span style={{ color: TLP.red }}> *</span>}
    </label>}
    <input type={type} value={value} onChange={onChange} placeholder={placeholder} style={{
      border: `1.5px solid ${error ? TLP.red : TLP.gray200}`,
      borderRadius: 8, padding: '8px 12px', fontSize: 14,
      fontFamily: 'inherit', color: TLP.gray800,
      outline: 'none', transition: 'border-color 0.15s',
      background: TLP.white,
    }}
      onFocus={e => e.target.style.borderColor = TLP.teal}
      onBlur={e => e.target.style.borderColor = error ? TLP.red : TLP.gray200}
    />
    {hint && <span style={{ fontSize: 11, color: TLP.gray500 }}>{hint}</span>}
    {error && <span style={{ fontSize: 11, color: TLP.red }}>{error}</span>}
  </div>
);

const Select = ({ label, value, onChange, options, required }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
    {label && <label style={{ fontSize: 13, fontWeight: 600, color: TLP.gray700 }}>
      {label}{required && <span style={{ color: TLP.red }}> *</span>}
    </label>}
    <select value={value} onChange={onChange} style={{
      border: `1.5px solid ${TLP.gray200}`, borderRadius: 8,
      padding: '8px 12px', fontSize: 14, fontFamily: 'inherit',
      color: TLP.gray800, background: TLP.white, outline: 'none',
    }}
      onFocus={e => e.target.style.borderColor = TLP.teal}
      onBlur={e => e.target.style.borderColor = TLP.gray200}
    >
      {options.map(o => <option key={o.value || o} value={o.value || o}>{o.label || o}</option>)}
    </select>
  </div>
);

const StatCard = ({ label, value, delta, color, icon, onClick }) => (
  <Card hover={!!onClick} onClick={onClick} style={{ padding: '18px 20px', cursor: onClick ? 'pointer' : 'default' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <div style={{ fontSize: 12, color: TLP.gray500, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>{label}</div>
        <div style={{ fontSize: 28, fontWeight: 800, color: TLP.navy }}>{value}</div>
        {delta && <div style={{ fontSize: 12, color: TLP.green, fontWeight: 600, marginTop: 4 }}>{delta}</div>}
      </div>
      {icon && <div style={{ fontSize: 24, background: color || TLP.tealLight, color: TLP.teal, width: 44, height: 44, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</div>}
    </div>
  </Card>
);

const SectionHeader = ({ title, action, subtitle }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 14 }}>
    <div>
      <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: TLP.navy }}>{title}</h2>
      {subtitle && <p style={{ margin: '2px 0 0', fontSize: 13, color: TLP.gray500 }}>{subtitle}</p>}
    </div>
    {action}
  </div>
);

const ProgressBar = ({ value, max = 100, color = TLP.teal }) => (
  <div style={{ background: TLP.gray100, borderRadius: 99, height: 6, overflow: 'hidden' }}>
    <div style={{ width: `${(value / max) * 100}%`, height: '100%', background: color, borderRadius: 99, transition: 'width 0.4s' }} />
  </div>
);

const Tabs = ({ tabs, active, onChange }) => (
  <div style={{ display: 'flex', gap: 2, borderBottom: `2px solid ${TLP.gray100}`, marginBottom: 20 }}>
    {tabs.map(t => (
      <button key={t.id} onClick={() => onChange(t.id)} style={{
        padding: '9px 16px', fontSize: 13, fontWeight: active === t.id ? 700 : 500,
        color: active === t.id ? TLP.teal : TLP.gray500,
        background: 'none', border: 'none', cursor: 'pointer',
        borderBottom: `2px solid ${active === t.id ? TLP.teal : 'transparent'}`,
        marginBottom: -2, fontFamily: 'inherit', transition: 'color 0.15s',
        whiteSpace: 'nowrap',
      }}>{t.label}</button>
    ))}
  </div>
);

const Modal = ({ open, onClose, title, children, width = 520 }) => {
  if (!open) return null;
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(13,27,62,0.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: 16,
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: TLP.white, borderRadius: 14, width: '100%', maxWidth: width, maxHeight: '90vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 24px', borderBottom: `1px solid ${TLP.gray100}` }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: TLP.navy }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: TLP.gray400, lineHeight: 1 }}>×</button>
        </div>
        <div style={{ padding: '20px 24px' }}>{children}</div>
      </div>
    </div>
  );
};

const Sidebar = ({ items, active, onSelect, collapsed }) => (
  <nav style={{
    width: collapsed ? 60 : 220, background: TLP.navy, minHeight: '100vh',
    display: 'flex', flexDirection: 'column', flexShrink: 0,
    transition: 'width 0.2s',
  }}>
    {items.map(item => {
      if (item.divider) return <div key={item.id} style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '6px 0' }} />;
      const isActive = active === item.id;
      return (
        <button key={item.id} onClick={() => onSelect(item.id)} style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: collapsed ? '12px 0' : '10px 16px',
          background: isActive ? 'rgba(10,155,138,0.2)' : 'transparent',
          border: 'none', cursor: 'pointer', color: isActive ? TLP.teal : 'rgba(255,255,255,0.7)',
          fontSize: 13, fontWeight: isActive ? 700 : 500, fontFamily: 'inherit',
          borderLeft: `3px solid ${isActive ? TLP.teal : 'transparent'}`,
          transition: 'all 0.15s', justifyContent: collapsed ? 'center' : 'flex-start',
          textAlign: 'left',
        }}
          onMouseEnter={e => !isActive && (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
          onMouseLeave={e => !isActive && (e.currentTarget.style.background = 'transparent')}
        >
          <span style={{ fontSize: 16, flexShrink: 0 }}>{item.icon}</span>
          {!collapsed && <span>{item.label}</span>}
        </button>
      );
    })}
  </nav>
);

const TopBar = ({ role, user, onRoleSwitch, roles }) => (
  <div style={{
    height: 56, background: TLP.navy, display: 'flex', alignItems: 'center',
    padding: '0 20px', gap: 12, borderBottom: `1px solid rgba(255,255,255,0.1)`,
    flexShrink: 0, justifyContent: 'space-between',
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 28, height: 28, borderRadius: 6, background: TLP.teal, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🌍</div>
        <span style={{ color: '#fff', fontWeight: 800, fontSize: 15, letterSpacing: '-0.3px' }}>The Learning Planet</span>
      </div>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 8, padding: '4px 10px' }}>
        <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: 600 }}>ROLE:</span>
        <select value={role} onChange={e => onRoleSwitch(e.target.value)} style={{
          background: 'transparent', border: 'none', color: TLP.amber,
          fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', outline: 'none',
        }}>
          {roles.map(r => <option key={r.id} value={r.id} style={{ background: TLP.navy }}>{r.label}</option>)}
        </select>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Avatar name={user} size={30} color={TLP.teal} />
        <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: 600 }}>{user}</span>
      </div>
    </div>
  </div>
);

Object.assign(window, {
  TLP, PLANETS, Avatar, Badge, PlanetBadge, Card, Btn, Input, Select,
  StatCard, SectionHeader, ProgressBar, Tabs, Modal, Sidebar, TopBar,
});
